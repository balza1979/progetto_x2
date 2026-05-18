// ============================================================
//   CONFRONTO MEMORIE X2 – Versione multi-byte + VALORE COMPLESSIVO
//   Luca + Copilot – 18/05/2026
// ============================================================

// ------------------------------------------------------------
//  LETTURA FILE HEX
// ------------------------------------------------------------
function leggiFileHex(input) {
    return new Promise((resolve) => {
        const file = input.files[0];
        if (!file) {
            resolve(null);
            return;
        }

        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.readAsText(file);
    });
}

// ------------------------------------------------------------
//  CONVERSIONE HEX → MAPPA MEMORIA
// ------------------------------------------------------------
function hexToMemoryMap(hexText) {
    if (!hexText) return {};

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

// ------------------------------------------------------------
//  FORMATTAZIONE ESA + DEC
// ------------------------------------------------------------
function formatVal(hexVal) {
    if (hexVal === "--") return "--";
    const num = parseInt(hexVal, 16);
    return `${hexVal} <span style="color:#888;">(${num})</span>`;
}

// ------------------------------------------------------------
//  RICOSTRUZIONE VALORE LITTLE-ENDIAN
// ------------------------------------------------------------
function ricostruisciValore(bytes) {
    if (bytes.every(b => b === "--")) return "--";

    let val = 0;
    for (let i = 0; i < bytes.length; i++) {
        const b = bytes[i];
        if (b === "--") return "--";
        val += parseInt(b, 16) * Math.pow(256, i);
    }
    return val;
}

// ------------------------------------------------------------
//  CONFRONTO PARAMETRI (USANDO x2_parametri)
// ------------------------------------------------------------
function confrontaMemorie(memA, memB) {
    const risultati = [];

    for (const p of x2_parametri) {
        const baseHex = p.LIBERA1;
        const lenStr = p.LIBERA4;
        const unitaRaw = p.UNITA || "";
        const nome = p.DESCRIZIONE || p.PARAMETRO || "Parametro";

        if (!baseHex || !lenStr) continue;

        const base = parseInt(baseHex, 16);
        const len = parseInt(lenStr); // 1,2,3,4

        if (isNaN(base) || isNaN(len) || len <= 0) continue;

        const unita = (unitaRaw === "/" ? "" : unitaRaw);

        const bytesA = [];
        const bytesB = [];

        for (let i = 0; i < len; i++) {
            const addr = base + i;
            bytesA.push(memA[addr] ?? "--");
            bytesB.push(memB[addr] ?? "--");
        }

        // Se entrambe le memorie non hanno nessun byte → salta
        if (bytesA.every(b => b === "--") && bytesB.every(b => b === "--")) continue;

        const diversiByte = bytesA.some((b, i) => b !== bytesB[i]);

        const valA = ricostruisciValore(bytesA);
        const valB = ricostruisciValore(bytesB);

        const diversiValore = valA !== valB;

        // Se tutto identico → non mostrare
        if (!diversiByte && !diversiValore) continue;

        const valA_str = (valA === "--")
            ? "--"
            : (unita ? `${valA} ${unita}` : `${valA}`);

        const valB_str = (valB === "--")
            ? "--"
            : (unita ? `${valB} ${unita}` : `${valB}`);

        risultati.push({
            base,
            len,
            nome,
            bytesA,
            bytesB,
            valA_str,
            valB_str
        });
    }

    // Ordina per indirizzo base
    risultati.sort((a, b) => a.base - b.base);

    return risultati;
}

// ------------------------------------------------------------
//  RENDER RISULTATI IN HTML
// ------------------------------------------------------------
function renderRisultati(dati) {
    const container = document.getElementById("risultati");
    container.innerHTML = "";

    if (!dati || dati.length === 0) {
        container.innerHTML = `
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
        return;
    }

    let html = `
        <h3>DIFFERENZE PARAMETRI (con VALORE COMPLESSIVO)</h3>
        <table>
            <tr>
                <th>Indirizzo</th>
                <th>Valore 1</th>
                <th>Valore 2</th>
                <th>Parametro</th>
                <th>VALORE COMPLESSIVO</th>
            </tr>
    `;

    for (const r of dati) {
        for (let i = 0; i < r.len; i++) {
            const addr = (r.base + i).toString(16).toUpperCase().padStart(4, "0");
            const v1 = r.bytesA[i] ?? "--";
            const v2 = r.bytesB[i] ?? "--";

            html += `<tr class="param-row">`;

            html += `<td>0x${addr}</td>`;
            html += `<td>${formatVal(v1)}</td>`;
            html += `<td>${formatVal(v2)}</td>`;
            html += `<td>${r.nome}</td>`;

            if (i === 0) {
                html += `
                    <td rowspan="${r.len}" style="text-align:center;">
                        <div><b>A:</b> ${r.valA_str}</div>
                        <div><b>B:</b> ${r.valB_str}</div>
                    </td>
                `;
            }

            html += `</tr>`;
        }
    }

    html += `</table>`;

    container.innerHTML = html;
}

// ------------------------------------------------------------
//  FUNZIONE CHIAMATA DAL BOTTONE HTML
// ------------------------------------------------------------
async function avviaConfronto() {
    const input1 = document.getElementById("file1");
    const input2 = document.getElementById("file2");

    const hex1 = await leggiFileHex(input1);
    const hex2 = await leggiFileHex(input2);

    if (!hex1 || !hex2) {
        alert("Seleziona entrambi i file HEX prima di avviare il confronto.");
        return;
    }

    const memA = hexToMemoryMap(hex1);
    const memB = hexToMemoryMap(hex2);

    const dati = confrontaMemorie(memA, memB);

    renderRisultati(dati);
}

// ============================================================
//  FINE FILE
// ============================================================
