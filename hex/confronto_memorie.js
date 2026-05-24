// ============================================================
//  FUNZIONI  BASE
// ============================================================
let memoriaA = null;
let memoriaB = null;
let memoriaC = null;

// Indirizzi runtime non programmabili
const indirizziRuntime = [
    0x04F4, 0x0810, 0x0811, 0x081A, 0x081B, 0x081C,
    0x09E3, 0x09FA, 0x09FB, 0x09FE, 0x09FF
];

function apriErrori() {
    window.location.href = "errori_x2.html";
}

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
//  CERCA IMPOSTAZIONE NEL JSON
// ============================================================

async function x2_trovaImpostazione(parametroCodice, valore) {

    return new Promise(resolve => {

        const url = "/progetto_x2/json_tendine/" + parametroCodice + ".json";

        fetch(url)
            .then(r => {
                if (!r.ok) {
                    resolve("—");
                    return null;
                }
                return r.json();
            })
            .then(data => {
                if (!data || !data.valori) {
                    resolve("—");
                    return;
                }

                const voce = data.valori.find(v => v.id === valore);
                resolve(voce ? voce.text : "—");
            })
            .catch(() => resolve("—"));
    });
}

// ============================================================
//  CONFRONTO MEMORIA (A–B)
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

        const visualizzaTutto = document.getElementById("flagVisualizzaTutto")?.checked;

        if (diversi || valA !== valB || visualizzaTutto) {
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
//  CONFRONTO MEMORIA (A–B–C)
// ============================================================

function compareMemory3(memA, memB, memC, addrMap) {

    const diff = [];
    const runtime = [];
    const giàGestiti = new Set();

    // RUNTIME A‑B‑C
    for (let addr of indirizziRuntime) {
        runtime.push({
            addr,
            vA: memA[addr] ?? "--",
            vB: memB[addr] ?? "--",
            vC: memC[addr] ?? "--"
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
        const bytesC = [];

        for (let i = 0; i < len; i++) {
            const a = base + i;
            bytesA.push(memA[a] ?? "--");
            bytesB.push(memB[a] ?? "--");
            bytesC.push(memC[a] ?? "--");
        }

        const diversi =
            bytesA.some((b, i) => b !== bytesB[i]) ||
            bytesA.some((b, i) => b !== bytesC[i]) ||
            bytesB.some((b, i) => b !== bytesC[i]);

        const valA = ricostruisciValore(bytesA);
        const valB = ricostruisciValore(bytesB);
        const valC = ricostruisciValore(bytesC);

        const valA_str = (valA === "--") ? "--" : (unita ? `${valA} ${unita}` : `${valA}`);
        const valB_str = (valB === "--") ? "--" : (unita ? `${valB} ${unita}` : `${valB}`);
        const valC_str = (valC === "--") ? "--" : (unita ? `${valC} ${unita}` : `${valC}`);

        const visualizzaTutto = document.getElementById("flagVisualizzaTutto")?.checked;

        if (diversi || visualizzaTutto) {
            diff.push({
                base,
                len,
                nome,
                codice: p.PARAMETRO,
                bytesA,
                bytesB,
                bytesC,
                valA_str,
                valB_str,
                valC_str
            });
        }
    }

    return { diff, runtime };
}

// ============================================================
//  RENDER RISULTATI
// ============================================================

async function generaTabellaConfronto(memFileA, memFileB) {
    const mem1 = typeof memFileA === "string" ? hexToMemoryMap(memFileA) : memFileA;
    const mem2 = typeof memFileB === "string" ? hexToMemoryMap(memFileB) : memFileB;
    const addrMap = buildAddressToParamMap();
    const result = compareMemory(mem1, mem2, addrMap);

    let backup = document.getElementById("risultati").innerHTML;
    renderResults(result);
    const html = document.getElementById("risultati").innerHTML;
    document.getElementById("risultati").innerHTML = backup;
    return html;
}

async function renderResults(result) {

    const lista = result.diff;
    const runtime = result.runtime;
    const isABC = (confrontoAttivo === "A-B-C");

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

        if (!isABC) {
            html += `
                <table id="tabDiff">
                    <tr>
                        <th>Indirizzo</th>
                        <th>Valore File ${confrontoAttivo.split("-")[0]}</th>
                        <th>Valore File ${confrontoAttivo.split("-")[1]}</th>
                        <th>Parametro</th>
                        <th>Valore complessivo</th>
                        <th>Impostazione</th>
                    </tr>
            `;
        } else {
            html += `
                <table id="tabDiff">
                    <tr>
                        <th>Indirizzo</th>
                        <th>Valore File A</th>
                        <th>Valore File B</th>
                        <th>Valore File C</th>
                        <th>Parametro</th>
                        <th>Valore complessivo</th>
                        <th>Impostazione</th>
                    </tr>
            `;
        }

        for (let d of lista) {

            for (let i = 0; i < d.len; i++) {

                if (!isABC) {

                    html += `
                        <tr class="param-row" ${i === 0 ? `
                            data-codice="${d.codice}"
                            data-valA="${d.bytesA[0]}"
                            data-valB="${d.bytesB[0]}"
                        ` : ""}>
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
                            <td rowspan="${d.len}" class="col-impostazione">…</td>
                        `;
                    }

                    html += `</tr>`;

                } else {

                    html += `
                        <tr class="param-row" ${i === 0 ? `
                            data-codice="${d.codice}"
                            data-valA="${d.bytesA[0]}"
                            data-valB="${d.bytesB[0]}"
                            data-valC="${d.bytesC[0]}"
                        ` : ""}>
                            <td>0x${(d.base + i).toString(16).padStart(4,"0").toUpperCase()}</td>
                            <td>${formatVal(d.bytesA[i])}</td>
                            <td>${formatVal(d.bytesB[i])}</td>
                            <td>${formatVal(d.bytesC[i])}</td>
                            <td>${d.codice} – ${d.nome}</td>
                    `;

                    if (i === 0) {
                        html += `
                            <td rowspan="${d.len}" style="text-align:center;">
                                <b>A:</b> ${d.valA_str}<br>
                                <b>B:</b> ${d.valB_str}<br>
                                <b>C:</b> ${d.valC_str}
                            </td>
                            <td rowspan="${d.len}" class="col-impostazione-abc">…</td>
                        `;
                    }

                    html += `</tr>`;
                }
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
                    ${!isABC ? `
                        <th>Valore File ${confrontoAttivo.split("-")[0]}</th>
                        <th>Valore File ${confrontoAttivo.split("-")[1]}</th>
                    ` : `
                        <th>Valore File A</th>
                        <th>Valore File B</th>
                        <th>Valore File C</th>
                    `}
                    <th>Note</th>
                </tr>
    `;

    for (let r of runtime) {
        html += `
            <tr class="runtime">
                <td>0x${r.addr.toString(16).padStart(4, "0").toUpperCase()}</td>
                ${!isABC ? `
                    <td>${formatVal(r.v1)}</td>
                    <td>${formatVal(r.v2)}</td>
                ` : `
                    <td>${formatVal(r.vA)}</td>
                    <td>${formatVal(r.vB)}</td>
                    <td>${formatVal(r.vC)}</td>
                `}
                <td>Runtime – non programmabile</td>
            </tr>
        `;
    }

    html += `
            </table>
        </div>
    `;

    document.getElementById("risultati").innerHTML = html;

    // IMPOSTAZIONI
    const righe = document.querySelectorAll("#tabDiff tr.param-row[data-codice]");

    if (!isABC) {

        for (let r of righe) {

            const codice = r.dataset.codice;

            let valA = r.dataset.valA;
            if (!valA || valA === "--") valA = null;

            let valB = r.dataset.valB;
            if (!valB || valB === "--") valB = null;

            let impA = "—";
            if (valA) impA = await x2_trovaImpostazione(codice, valA);

            let impB = "—";
            if (valB) impB = await x2_trovaImpostazione(codice, valB);

            const cella = r.querySelector(".col-impostazione");
            if (cella) {
                cella.innerHTML = `
                    <b>${confrontoAttivo.split("-")[0]}:</b> ${impA}<br>
                    <b>${confrontoAttivo.split("-")[1]}:</b> ${impB}
                `;
            }
        }

    } else {

        for (let r of righe) {

            const codice = r.dataset.codice;

            let valA = r.dataset.valA;
            if (!valA || valA === "--") valA = null;

            let valB = r.dataset.valB;
            if (!valB || valB === "--") valB = null;

            let valC = r.dataset.valC;
            if (!valC || valC === "--") valC = null;

            let impA = "—";
            if (valA) impA = await x2_trovaImpostazione(codice, valA);

            let impB = "—";
            if (valB) impB = await x2_trovaImpostazione(codice, valB);

            let impC = "—";
            if (valC) impC = await x2_trovaImpostazione(codice, valC);

            const cella = r.querySelector(".col-impostazione-abc");
            if (cella) {
                cella.innerHTML = `
                    <b>A:</b> ${impA}<br>
                    <b>B:</b> ${impB}<br>
                    <b>C:</b> ${impC}
                `;
            }
        }
    }

    // toggle runtime
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

    applyColumnFilters();
}

// ============================================================
//  FUNZIONI DI CONFRONTO
// ============================================================

let confrontoAttivo = "A-B";

function confronta(memFileA, memFileB) {

    const mem1 = typeof memFileA === "string"
        ? hexToMemoryMap(memFileA)
        : memFileA;

    const mem2 = typeof memFileB === "string"
        ? hexToMemoryMap(memFileB)
        : memFileB;

    const addrMap = buildAddressToParamMap();
    const result = compareMemory(mem1, mem2, addrMap);
    renderResults(result);
}

function confrontaAB() {
    evidenziaPulsante("btnAB");
    confrontoAttivo = "A-B";

    const f1 = document.getElementById("file1");
    const f2 = document.getElementById("file2");

    if (!f2.files[0]) {
        return alert("Seleziona File B");
    }

    if (!f1.files[0] && memoriaA) {
        leggiFileHex(f2, hexB => confronta(memoriaA, hexB));
        return;
    }

    if (f1.files[0]) {
        leggiFileHex(f1, hexA => leggiFileHex(f2, hexB => confronta(hexA, hexB)));
        return;
    }

    alert("Seleziona File A oppure usa la memoria DEFAULT");
}

function confrontaAC() {
    evidenziaPulsante("btnAC");
    confrontoAttivo = "A-C";

    const f1 = document.getElementById("file1");
    const f3 = document.getElementById("file3");

    if (!f3.files[0]) {
        return alert("Seleziona File C");
    }

    if (!f1.files[0] && memoriaA) {
        leggiFileHex(f3, hexC => confronta(memoriaA, hexC));
        return;
    }

    if (f1.files[0]) {
        leggiFileHex(f1, hexA => leggiFileHex(f3, hexC => confronta(hexA, hexC)));
        return;
    }

    alert("Seleziona File A oppure usa la memoria DEFAULT");
}

function confrontaBC() {
    evidenziaPulsante("btnBC");
    confrontoAttivo = "B-C";
    const f2 = document.getElementById("file2");
    const f3 = document.getElementById("file3");
    if (!f2.files[0] || !f3.files[0]) return alert("Seleziona File B e File C");
    leggiFileHex(f2, hexB => leggiFileHex(f3, hexC => confronta(hexB, hexC)));
}

async function confrontaABC() {
    evidenziaPulsante("btnABC");
    confrontoAttivo = "A-B-C";

    const f1 = document.getElementById("file1");
    const f2 = document.getElementById("file2");
    const f3 = document.getElementById("file3");

    if (!f2.files[0] || !f3.files[0]) {
        return alert("Seleziona File B e File C");
    }

    let sorgenteA;
    if (f1.files[0]) {
        sorgenteA = new Promise(res => leggiFileHex(f1, hexA => res(hexA)));
    } else if (memoriaA) {
        sorgenteA = Promise.resolve(memoriaA);
    } else {
        alert("Seleziona File A oppure usa la memoria DEFAULT");
        return;
    }

    const sorgenteB = new Promise(res => leggiFileHex(f2, hexB => res(hexB)));
    const sorgenteC = new Promise(res => leggiFileHex(f3, hexC => res(hexC)));

    const [memA, memB, memC] = await Promise.all([sorgenteA, sorgenteB, sorgenteC]);

    const mA = typeof memA === "string" ? hexToMemoryMap(memA) : memA;
    const mB = typeof memB === "string" ? hexToMemoryMap(memB) : memB;
    const mC = typeof memC === "string" ? hexToMemoryMap(memC) : memC;

    const addrMap = buildAddressToParamMap();
    const result = compareMemory3(mA, mB, mC, addrMap);
    renderResults(result);
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
}

function evidenziaPulsante(idAttivo) {
    const ids = ["btnAB", "btnAC", "btnBC", "btnABC"];

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

// ============================================================
//  SALVATAGGIO FILE A/B/C IN LOCALSTORAGE
// ============================================================
function salvaFile(lettera, input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
        localStorage.setItem("X2_FILE_" + lettera, e.target.result);
        localStorage.setItem("X2_FILE_" + lettera + "_NAME", file.name);

        // [24/05/2026] Se l’utente seleziona FILE A, togliamo “DEFAULT”
        if (lettera === "A") {
            const lbl = document.getElementById("labelFileA");
            if (lbl) lbl.textContent = "FILE A";
        }
    };
    reader.readAsText(file);
}

// [24/05/2026 16:20] Caricamento automatico memoria polli in memoriaA
document.addEventListener("DOMContentLoaded", () => {
    const urlPolli = "https://raw.githubusercontent.com/balza1979/progetto_x2/main/Memorie/def_polli_b335f_ver1.HEX";

    fetch(urlPolli)
        .then(r => r.text())
        .then(text => {
            memoriaA = hexToMemoryMap(text);
            console.log("Memoria polli caricata automaticamente");
        })
        .catch(err => console.error("Errore caricamento polli:", err));
});
