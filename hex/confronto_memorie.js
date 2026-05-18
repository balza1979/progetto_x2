// ============================================================
//   CONFRONTO MEMORIE X2 – Versione definitiva con TOGGLE + DEC
//   Luca – 18/05/2026 09:10
// ============================================================


// ------------------------------------------------------------
//  INDIRIZZI RUNTIME (NON PROGRAMMABILI)
// ------------------------------------------------------------
const indirizziRuntime = [
    0x04F4, 0x0810, 0x0811, 0x081A, 0x081B, 0x081C,
    0x09E3, 0x09FA, 0x09FB, 0x09FE, 0x09FF
];


// ------------------------------------------------------------
//  FORMATTAZIONE ESA + DEC
// ------------------------------------------------------------
function formatVal(hexVal) {
    if (hexVal === "--") return "--";

    const num = parseInt(hexVal, 16); // DEC
    return `${hexVal} <span style="color:#888;">(${num})</span>`;
}


// ------------------------------------------------------------
//  LETTURA FILE HEX
// ------------------------------------------------------------
function leggiFileHex(input, callback) {
    const file = input.files[0];
    if (!file) return callback(null);

    const reader = new FileReader();
    reader.onload = e => callback(e.target.result);
    reader.readAsText(file);
}


// ------------------------------------------------------------
//  CONVERSIONE HEX → MAPPA MEMORIA
// ------------------------------------------------------------
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
            const byteHex = line.substr(9 + i * 2, 2);
            mem[address + i] = byteHex;
        }
    }

    return mem;
}


// ------------------------------------------------------------
//  COSTRUZIONE MAPPA INDIRIZZO → PARAMETRO
// ------------------------------------------------------------
function buildAddressToParamMap() {
    const map = {};

    for (let i = 0; i < x2_parametri.length; i++) {
        const p = x2_parametri[i];

        const start = parseInt(p.LIBERA1, 16);
        const size = parseInt(p.LIBERA2);

        if (isNaN(start) || isNaN(size)) continue;

        for (let j = 0; j < size; j++) {
            map[start + j] = {
                codice: p.PARAMETRO,
                descrizione: p.DESCRIZIONE
            };
        }
    }

    return map;
}


// ------------------------------------------------------------
//  CONFRONTO MEMORIA
// ------------------------------------------------------------
function compareMemory(memA, memB, addrMap) {
    const diff = [];
    const runtime = [];

    const allAddrs = new Set([
        ...Object.keys(memA).map(Number),
        ...Object.keys(memB).map(Number)
    ]);

    for (let addr of allAddrs) {

        if (indirizziRuntime.includes(addr)) {
            runtime.push({
                addr,
                v1: memA[addr] || "--",
                v2: memB[addr] || "--"
            });
            continue;
        }

        const v1 = memA[addr] || "--";
        const v2 = memB[addr] || "--";

        if (v1 !== v2) {
            diff.push({
                addr,
                v1,
                v2,
                param: addrMap[addr] || null
            });
        }
    }

    return { diff, runtime };
}


// ------------------------------------------------------------
//  RENDER RISULTATI (con toggle runtime + messaggio equivalenza)
// ------------------------------------------------------------
function renderResults(result) {

    const lista = result.diff;
    const runtime = result.runtime;

    let html = `<h3>DIFFERENZE PARAMETRI</h3>`;

    // ⭐ SE NON CI SONO DIFFERENZE
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

        // ⭐ SE CI SONO DIFFERENZE
        lista.sort((a, b) => {
            if (a.param && !b.param) return -1;
            if (!a.param && b.param) return 1;
            return a.addr - b.addr;
        });

        html += `
            <table>
                <tr>
                    <th>Indirizzo</th>
                    <th>Valore 1</th>
                    <th>Valore 2</th>
                    <th>Parametro</th>
                </tr>
        `;

        for (let d of lista) {
            const isParam = d.param !== null;

            html += `
                <tr class="${isParam ? 'param-row' : 'diff'}">
                    <td>0x${d.addr.toString(16).padStart(4, "0").toUpperCase()}</td>
                    <td>${formatVal(d.v1)}</td>
                    <td>${formatVal(d.v2)}</td>
                    <td>
                        ${
                            isParam
                            ? `<span class="param">${d.param.codice} – ${d.param.descrizione}</span>`
                            : `<span class="nonprev">NON PREVISTO</span>`
                        }
                    </td>
                </tr>
            `;
        }

        html += `</table>`;
    }

    // ------------------------------------------------------------
    //  TOGGLE RUNTIME
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
                    <th>Valore 1</th>
                    <th>Valore 2</th>
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

    // ------------------------------------------------------------
    //  LOGICA TOGGLE
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


// ------------------------------------------------------------
//  AVVIA CONFRONTO
// ------------------------------------------------------------
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
