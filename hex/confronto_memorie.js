// ============================================================
//  FUNZIONI BASE
// ============================================================

// Indirizzi runtime non programmabili
const indirizziRuntime = [
    0x04F4, 0x0810, 0x0811, 0x081A, 0x081B, 0x081C,
    0x09E3, 0x09FA, 0x09FB, 0x09FE, 0x09FF
];

// Formattazione HEX + DEC
function formatVal(hexVal) {
    if (hexVal === "--") return "--";
    const num = parseInt(hexVal, 16);
    return `${hexVal} <span style="color:#888;">(${num})</span>`;
}

// Lettura file HEX
function leggiFileHex(input, callback) {
    const file = input.files[0];
    if (!file) return callback(null);

    const reader = new FileReader();
    reader.onload = e => callback(e.target.result);
    reader.readAsText(file);
}

// Conversione HEX → mappa memoria
function hexToMemoryMap(hexText) {
    const lines = hexText.split(/\r?\n/);
    const mem = {};

    for (let line of lines) {
        if (!line.startsWith(":")) continue;

        const byteCount = parseInt(line.substr(1, 2), 16);
        const address = parseInt(line.substr(3, 4), 16);
        const recordType = parseInt(line.substr(7, 2), 16);

        if (recordType !== 0) continue;

        for (let i = 0; i < byteCount; i++) {
            const byteHex = line.substr(9 + i * 2, 2).toUpperCase();
            mem[address + i] = byteHex;
        }
    }

    return mem;
}

// Ricostruzione valore (1, 2, 4 byte)
function ricostruisciValore(bytes) {

    if (bytes.includes("--")) return "--";

    const b = bytes.map(x => parseInt(x, 16));
    const len = b.length;

    if (len === 4) {
        const LSB = b[1];
        const MSB = b[0];
        const LSBH = b[3];
        const MSBH = b[2];
        return MSBH * 16777216 + LSBH * 65536 + MSB * 256 + LSB;
    }

    if (len === 2) {
        return b[0] * 256 + b[1];
    }

    if (len === 1) {
        return b[0];
    }

    return "--";
}

// Mappa indirizzo → parametro
function buildAddressToParamMap() {
    const map = {};

    for (let p of x2_parametri) {
        const base = parseInt(p.LIBERA1, 16);
        const len = parseInt(p.LIBERA4);

        if (isNaN(base) || isNaN(len)) continue;

        for (let i = 0; i < len; i++) {
            map[base + i] = {
                codice: p.PARAMETRO,
                descrizione: p.DESCRIZIONE
            };
        }
    }

    return map;
}

// ============================================================
//  CONFRONTO MEMORIA
// ============================================================

function compareMemory(memA, memB, addrMap) {

    const diff = [];
    const runtime = [];
    const giàGestiti = new Set();

    // RUNTIME
    for (let addr of indirizziRuntime) {
        runtime.push({
            addr,
            v1: memA[addr] ?? "--",
            v2: memB[addr] ?? "--"
        });
    }

    // PARAMETRI
    for (const p of x2_parametri) {

        const base = parseInt(p.LIBERA1, 16);
        const len = parseInt(p.LIBERA4);
        const unita = (p.UNITA === "/" ? "" : p.UNITA);
        const nome = p.DESCRIZIONE || p.PARAMETRO;

        if (isNaN(base) || isNaN(len)) continue;

        if (giàGestiti.has(base)) continue;
        for (let i = 0; i < len; i++) giàGestiti.add(base + i);

        const bytesA = [];
        const bytesB = [];

        for (let i = 0; i < len; i++) {
            const a = base + i;
            bytesA.push(memA[a] ?? "--");
            bytesB.push(memB[a] ?? "--");
        }

        const diversi = bytesA.some((b, i) => b !== bytesB[i]);

        const valA = ricostruisciValore(bytesA);
        const valB = ricostruisciValore(bytesB);

        const valA_str = (valA === "--") ? "--" : (unita ? `${valA} ${unita}` : `${valA}`);
        const valB_str = (valB === "--") ? "--" : (unita ? `${valB} ${unita}` : `${valB}`);

        if (diversi || valA !== valB) {
            diff.push({
                base,
                len,
                nome,
                codice: p.PARAMETRO,
                bytesA,
                bytesB,
                valA_str,
                valB_str
            });
        }
    }

    return { diff, runtime };
}

// ============================================================
//  RENDER RISULTATI
// ============================================================

function renderResults(result) {

    const lista = result.diff;
    const runtime = result.runtime;

    let html = `<h3>DIFFERENZE PARAMETRI</h3>`;

    if (lista.length === 0) {

        html += `
            <div style="
                margin:15px 0;
                padding:12px;
                background:#113311;
                border:1px solid #44aa44;
                border-radius:6px;
                color:#88ff88;
                font-weight:bold;
            ">
                ✔ I parametri risultano equivalenti.<br>
                Nessuna differenza da segnalare.
            </div>
        `;

    } else {

        html += `
            <table>
                <tr>
                    <th>Indirizzo</th>
                    <th>Valore File ${confrontoAttivo.split("-")[0]}</th>
                    <th>Valore File ${confrontoAttivo.split("-")[1]}</th>
                    <th>Parametro</th>
                    <th>Valore complessivo</th>
                </tr>
        `;

        for (let d of lista) {

            for (let i = 0; i < d.len; i++) {

                html += `
                    <tr class="param-row">
                        <td>0x${(d.base + i).toString(16).padStart(4,"0").toUpperCase()}</td>
                        <td>${formatVal(d.bytesA[i])}</td>
                        <td>${formatVal(d.bytesB[i])}</td>
                        <td>${d.codice} – ${d.nome}</td>
                `;

                if (i === 0) {
                    html += `
                        <td rowspan="${d.len}" style="text-align:center;">
                            <b>${confrontoAttivo.split("-")[0]}:</b> ${d.valA_str}<br>
                            <b>${confrontoAttivo.split("-")[1]}:</b> ${d.valB_str}
                        </td>
                    `;
                }

                html += `</tr>`;
            }
        }

        html += `</table>`;
    }

    // RUNTIME
    html += `
        <h3 style="margin-top:25px;">
            <button id="toggleRuntimeBtn"
                style="padding:6px 12px; font-size:12px; cursor:pointer;">
                Mostra valori runtime non programmabili
            </button>
        </h3>

        <div id="runtimeSection" style="display:none;">
            <h3>VALORI INTERNI NON PROGRAMMABILI (RUNTIME)</h3>
            <table>
                <tr>
                    <th>Indirizzo</th>
                    <th>Valore File ${confrontoAttivo.split("-")[0]}</th>
                    <th>Valore File ${confrontoAttivo.split("-")[1]}</th>
                    <th>Note</th>
                </tr>
    `;

    for (let r of runtime) {
        html += `
            <tr class="runtime">
                <td>0x${r.addr.toString(16).padStart(4, "0").toUpperCase()}</td>
                <td>${formatVal(r.v1)}</td>
                <td>${formatVal(r.v2)}</td>
                <td>Runtime – non programmabile</td>
            </tr>
        `;
    }

    html += `
            </table>
        </div>
    `;

    document.getElementById("risultati").innerHTML = html;

    const btn = document.getElementById("toggleRuntimeBtn");
    const section = document.getElementById("runtimeSection");

 btn.addEventListener("click", () => {
    if (section.style.display === "none") {
        section.style.display = "block";
        btn.textContent = "Nascondi valori runtime non programmabili";
    } else {
        section.style.display = "none";
        btn.textContent = "Mostra valori runtime non programmabili";
    }
});

// ⭐ Applica i filtri colonne dopo aver generato la tabella
applyColumnFilters();
}

// ============================================================
//  FUNZIONI DI CONFRONTO
// ============================================================

let confrontoAttivo = "A-B";

function confronta(memFileA, memFileB) {
    const mem1 = hexToMemoryMap(memFileA);
    const mem2 = hexToMemoryMap(memFileB);
    const addrMap = buildAddressToParamMap();
    const result = compareMemory(mem1, mem2, addrMap);
    renderResults(result);
}

function confrontaAB() {
    evidenziaPulsante("btnAB");
    confrontoAttivo = "A-B";
    const f1 = document.getElementById("file1");
    const f2 = document.getElementById("file2");
    if (!f1.files[0] || !f2.files[0]) return alert("Seleziona File A e File B");
    leggiFileHex(f1, hexA => leggiFileHex(f2, hexB => confronta(hexA, hexB)));
}

function confrontaAC() {
    evidenziaPulsante("btnAC");
    confrontoAttivo = "A-C";
    const f1 = document.getElementById("file1");
    const f3 = document.getElementById("file3");
    if (!f1.files[0] || !f3.files[0]) return alert("Seleziona File A e File C");
    leggiFileHex(f1, hexA => leggiFileHex(f3, hexC => confronta(hexA, hexC)));
}

function confrontaBC() {
    evidenziaPulsante("btnBC");
    confrontoAttivo = "B-C";
    const f2 = document.getElementById("file2");
    const f3 = document.getElementById("file3");
    if (!f2.files[0] || !f3.files[0]) return alert("Seleziona File B e File C");
    leggiFileHex(f2, hexB => leggiFileHex(f3, hexC => confronta(hexB, hexC)));
}

// ============================================================
//  UTILITY FINALI
// ============================================================

function toHex4(n) {
    return "0x" + n.toString(16).padStart(4, "0").toUpperCase();
}

function isNumber(x) {
    return typeof x === "number" && !isNaN(x);
}

function debugLog(msg) {
    // console.log("[DEBUG]", msg);
}
function applyColumnFilters() {
    document.querySelectorAll(".col-flag").forEach(flag => {
        const colIndex = parseInt(flag.dataset.col);
        const hide = !flag.checked;

        document.querySelectorAll("table").forEach(table => {
            table.querySelectorAll("tr").forEach(row => {
                const cell = row.children[colIndex - 1];
                if (cell) {
                    cell.style.display = hide ? "none" : "";
                }
            });
        });
    });

function evidenziaPulsante(idAttivo) {
    const ids = ["btnAB", "btnAC", "btnBC"];

    ids.forEach(id => {
        const btn = document.getElementById(id);
        if (!btn) return;

        if (id === idAttivo) {
            btn.classList.add("attivo");
        } else {
            btn.classList.remove("attivo");
        }
    });


    
}
