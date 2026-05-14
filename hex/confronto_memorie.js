// ======================================================
// confronto_memorie.js
// Motore confronto memorie HC64 – X2
// ======================================================

// -----------------------------
// 1) Lettura file HEX
// -----------------------------
function leggiFileHex(input, callback) {
    const file = input.files[0];
    if (!file) return callback(null);

    const reader = new FileReader();
    reader.onload = () => callback(reader.result);
    reader.readAsText(file);
}

// -----------------------------
// 2) Parser Intel HEX → mappa memoria
// -----------------------------
function hexToMemoryMap(hexString) {
    const lines = hexString.split(/\r?\n/);
    const mem = {};

    for (let line of lines) {
        if (!line.startsWith(":")) continue;

        const byteCount = parseInt(line.substr(1, 2), 16);
        const address = parseInt(line.substr(3, 4), 16);
        const recordType = parseInt(line.substr(7, 2), 16);

        if (recordType !== 0) continue; // solo record dati

        let data = line.substr(9, byteCount * 2);

        for (let i = 0; i < byteCount; i++) {
            const byteHex = data.substr(i * 2, 2);
            mem[address + i] = parseInt(byteHex, 16);
        }
    }

    return mem;
}

// -----------------------------
// 3) Mappa indirizzo → parametro
// -----------------------------
function buildAddressToParamMap() {
    const map = {};

    for (let key in PARAMETRI_DATA) {
        const p = PARAMETRI_DATA[key];
        const start = p.addr;
        const size = p.bytes;

        for (let i = 0; i < size; i++) {
            map[start + i] = key;
        }
    }

    return map;
}

// -----------------------------
// 4) Confronto byte-per-byte
// -----------------------------
function compareMemory(memA, memB, addrToParam) {
    const differenze = [];

    const maxAddr = Math.max(
        Math.max(...Object.keys(memA)),
        Math.max(...Object.keys(memB))
    );

    for (let addr = 0; addr <= maxAddr; addr++) {
        const a = memA[addr] ?? null;
        const b = memB[addr] ?? null;

        if (a !== b) {
            const param = addrToParam[addr] || null;

            differenze.push({
                addr,
                a,
                b,
                param
            });
        }
    }

    return differenze;
}

// -----------------------------
// 5) Render tabella differenze
// -----------------------------
function renderResults(lista) {
    if (lista.length === 0) {
        document.getElementById("risultati").innerHTML =
            "<h3>Nessuna differenza trovata.</h3>";
        return;
    }

    let html = `
        <table>
            <tr>
                <th>Indirizzo</th>
                <th>File 1</th>
                <th>File 2</th>
                <th>Parametro</th>
            </tr>
    `;

    for (let d of lista) {
        const hexAddr = "0x" + d.addr.toString(16).padStart(4, "0").toUpperCase();
        const valA = d.a !== null ? d.a.toString(16).padStart(2, "0").toUpperCase() : "--";
        const valB = d.b !== null ? d.b.toString(16).padStart(2, "0").toUpperCase() : "--";

        const param = d.param
            ? `<span class="param">${d.param}</span>`
            : `<span class="nonprev">NON PREVISTO</span>`;

        html += `
            <tr class="diff">
                <td>${hexAddr}</td>
                <td>${valA}</td>
                <td>${valB}</td>
                <td>${param}</td>
            </tr>
        `;
    }

    html += "</table>";

    document.getElementById("risultati").innerHTML = html;
}

// -----------------------------
// 6) Avvio confronto
// -----------------------------
function avviaConfronto() {
    const f1 = document.getElementById("file1");
    const f2 = document.getElementById("file2");

    leggiFileHex(f1, hex1 => {
        if (!hex1) {
            alert("Seleziona il primo file HEX");
            return;
        }

        leggiFileHex(f2, hex2 => {
            if (!hex2) {
                alert("Seleziona il secondo file HEX");
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
