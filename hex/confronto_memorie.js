// ============================================================
//   CONFRONTO MEMORIE X2 – Versione completa
//   Luca – 14/05/2026 16:34
// ============================================================


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
//  (usa LIBERA1 = indirizzo, LIBERA2 = bytes)
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

    const allAddrs = new Set([
        ...Object.keys(memA).map(Number),
        ...Object.keys(memB).map(Number)
    ]);

    for (let addr of allAddrs) {
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

    return diff;
}


// ------------------------------------------------------------
//  RENDER RISULTATI
// ------------------------------------------------------------
function renderResults(lista) {

    // Ordina: prima parametri noti, poi non previsti
    lista.sort((a, b) => {
        if (a.param && !b.param) return -1;
        if (!a.param && b.param) return 1;
        return a.addr - b.addr;
    });

    let html = `
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
                <td>${d.v1}</td>
                <td>${d.v2}</td>
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

    document.getElementById("risultati").innerHTML = html;
}


// ------------------------------------------------------------
//  AVVIA CONFRONTO (sempre da zero)
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

            const diff = compareMemory(mem1, mem2, addrMap);

            renderResults(diff);
        });
    });
}
