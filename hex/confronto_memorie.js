// ============================================================
//  BLOCCO 1/6 — FUNZIONI BASE
//  Luca – 20/05/2026 09:50
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

    // 4 BYTE formato X2
    if (len === 4) {
        const LSB = b[1];
        const MSB = b[0];
        const LSBH = b[3];
        const MSBH = b[2];
        return MSBH * 16777216 + LSBH * 65536 + MSB * 256 + LSB;
    }

    // 2 BYTE — CORRETTO (MSB * 256 + LSB)
    if (len === 2) {
        return b[0] * 256 + b[1];
    }

    // 1 BYTE
    if (len === 1) {
        return b[0];
    }

    return "--";
}

// Mappa indirizzo → parametro
function buildAddressToParamMap() {
    const map = {};

// ============================================================
//  BLOCCO 2/6 — CONFRONTO MEMORIA
//  Luca – 20/05/2026 09:55
// ============================================================

function compareMemory(memA, memB, addrMap) {

    const diff = [];
    const runtime = [];
    const giàGestiti = new Set();

    // 1) RUNTIME NON PROGRAMMABILI
    for (let addr of indirizziRuntime) {
        const v1 = memA[addr] ?? "--";
        const v2 = memB[addr] ?? "--";

        runtime.push({
            addr,
            v1,
            v2
        });
    }

    // 2) PARAMETRI PROGRAMMABILI
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
//  BLOCCO 3/6 — RENDER RISULTATI (DIFFERENZE + RUNTIME)
//  Luca – 20/05/2026 10:00
// ============================================================

function renderResults(result) {

    const lista = result.diff;
    const runtime = result.runtime;

    let html = `<h3>DIFFERENZE PARAMETRI</h3>`;

    // ------------------------------------------------------------
    //  SE NON CI SONO DIFFERENZE
    // ------------------------------------------------------------
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

        // ------------------------------------------------------------
        //  TABELLA DIFFERENZE
        // ------------------------------------------------------------
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

    // ------------------------------------------------------------
    //  BLOCCO RUNTIME
    // ------------------------------------------------------------
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

    // ------------------------------------------------------------
    //  INSERIMENTO HTML
    // ------------------------------------------------------------
    document.getElementById("risultati").innerHTML = html;

    // ------------------------------------------------------------
    //  LISTENER MOSTRA/NASCONDI RUNTIME
    // ------------------------------------------------------------
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
}
// ============================================================
//  BLOCCO 4/6 — FUNZIONI DI CONFRONTO
//  Luca – 20/05/2026 10:05
// ============================================================

// Confronto classico (file1 vs file2)
function avviaConfronto() {

    document.getElementById("risultati").innerHTML = "";

    const f1 = document.getElementById("file1");
    const f2 = document.getElementById("file2");

    if (!f1.files[0] || !f2.files[0]) {
        alert("Seleziona entrambi i file HEX");
        return;
    }

    leggiFileHex(f1, hex1 => {
        if (!hex1) {
            alert("Errore lettura file 1");
            return;
        }

        leggiFileHex(f2, hex2 => {
            if (!hex2) {
                alert("Errore lettura file 2");
                return;
            }

            const mem1 = hexToMemoryMap(hex1);
            const mem2 = hexToMemoryMap(hex2);

            const addrMap = buildAddressToParamMap();

            const result = compareMemory(mem1, mem2, addrMap);

            renderResults(result);
        });
    });
}

// ------------------------------------------------------------
//  FUNZIONE GENERICA DI CONFRONTO
// ------------------------------------------------------------
function confronta(memFileA, memFileB) {

    const mem1 = hexToMemoryMap(memFileA);
    const mem2 = hexToMemoryMap(memFileB);

    const addrMap = buildAddressToParamMap();
    const result = compareMemory(mem1, mem2, addrMap);

    renderResults(result);
}

// ------------------------------------------------------------
//  CONFRONTO A–B
// ------------------------------------------------------------
function confrontaAB() {

    confrontoAttivo = "A-B";

    const f1 = document.getElementById("file1");
    const f2 = document.getElementById("file2");

    if (!f1.files[0] || !f2.files[0]) {
        alert("Seleziona File A e File B");
        return;
    }

    leggiFileHex(f1, hexA => {
        leggiFileHex(f2, hexB => {
            confronta(hexA, hexB);
        });
    });
}

// ------------------------------------------------------------
//  CONFRONTO A–C
// ------------------------------------------------------------
function confrontaAC() {

    confrontoAttivo = "A-C";

    const f1 = document.getElementById("file1");
    const f3 = document.getElementById("file3");

    if (!f1.files[0] || !f3.files[0]) {
        alert("Seleziona File A e File C");
        return;
    }

    leggiFileHex(f1, hexA => {
        leggiFileHex(f3, hexC => {
            confronta(hexA, hexC);
        });
    });
}

// ------------------------------------------------------------
//  CONFRONTO B–C
// ------------------------------------------------------------
function confrontaBC() {

    confrontoAttivo = "B-C";

    const f2 = document.getElementById("file2");
    const f3 = document.getElementById("file3");

    if (!f2.files[0] || !f3.files[0]) {
        alert("Seleziona File B e File C");
        return;
    }

    leggiFileHex(f2, hexB => {
        leggiFileHex(f3, hexC => {
            confronta(hexB, hexC);
        });
    });
}

// ============================================================
//  BLOCCO 5/6 — VARIABILI GLOBALI E STATO
//  Luca – 20/05/2026 10:10
// ============================================================

// Stato del confronto attivo (A-B, A-C, B-C)
let confrontoAttivo = "A-B";

// Array parametri X2 (deve essere già definito nel tuo progetto)
// Qui NON lo riscrivo perché è enorme e già presente nel tuo file.

// Nota: questo blocco serve solo a definire lo stato globale
// che viene letto da renderResults() per mostrare:
// "Valore File A" / "Valore File B" / "Valore File C"



// ============================================================
//  BLOCCO 6/6 — UTILITY FINALI
//  Luca – 20/05/2026 10:15
// ============================================================

// Utility per convertire un numero in HEX a 4 cifre
function toHex4(n) {
    return "0x" + n.toString(16).padStart(4, "0").toUpperCase();
}

// Utility per verificare se un valore è numerico
function isNumber(x) {
    return typeof x === "number" && !isNaN(x);
}

// (Opzionale) Log di debug
function debugLog(msg) {
    // console.log("[DEBUG]", msg);
}

// Fine file JS
// ============================================================
