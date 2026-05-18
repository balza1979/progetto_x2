// ============================================================
//   CONFRONTO MEMORIE  X2 – Versione definitiva con MULTIBYTE
//   Luca – 18/05/2026 14:50
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
    const num = parseInt(hexVal, 16);
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
            const byteHex = line.substr(9 + i * 2, 2).toUpperCase();
            mem[address + i] = byteHex;
        }
    }

    return mem;
}


// ------------------------------------------------------------
//  RICOSTRUISCI VALORE (GESTIONE SPECIALE LIVE LLI PIANI 4 BYTE)
// ------------------------------------------------------------
function ricostruisciValore(bytes) {

    // Se ci sono byte mancanti → valore non valido
    if (bytes.includes("--")) return "--";

    const len = bytes.length;

    // Converte ogni byte in numero (accetta sia "CC" che 204)
    const b = bytes.map(x => {
        if (typeof x === "number") return x;
        return parseInt(x, 16);
    });

    // -------------------------------
    // CASO 4 BYTE → LIVELLI PIANI
    // Formato X2: [00] [LSB] [MSB] [00]
    // -------------------------------
    //  if (len === 4) {
       //   const LSB = b[1];
       //   const MSB = b[2];
       //   return MSB * 256 + LSB;
    //  }

    if (len === 4) {
        const LSB = b[1];
        const MSB = b[0];
        const LSBH = b[3];
        const MSBH = b[2];
        return MSBH * 16777216 + LSBH * 65536 + MSB * 256 + LSB;
    }
    // -------------------------------
    // CASO 2 BYTE → LSB/MSB standard
    // -------------------------------
    if (len === 2) {
        const LSB = b[0];
        const MSB = b[1];
        return MSB * 256 + LSB;
    }

    // -------------------------------
    // CASO 1 BYTE
    // -------------------------------
    if (len === 1) {
        return b[0];
    }

    return "--";
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
//  CONFRONTO MEMORIA (VERSIONE MULTIBYTE)
// ------------------------------------------------------------
function compareMemory(memA, memB, addrMap) {

    const diff = [];
    const runtime = [];
    const giàGestiti = new Set();

    for (const p of x2_parametri) {

        const base = parseInt(p.LIBERA1, 16);
        const len = parseInt(p.LIBERA4);
        const unita = (p.UNITA === "/" ? "" : p.UNITA);
        const nome = p.DESCRIZIONE || p.PARAMETRO;

        if (isNaN(base) || isNaN(len)) continue;

        // Evita doppioni
        if (giàGestiti.has(base)) continue;
        for (let i = 0; i < len; i++) giàGestiti.add(base + i);

        // Leggi byte consecutivi
        const bytesA = [];
        const bytesB = [];

        for (let i = 0; i < len; i++) {
            const addr = base + i;
            bytesA.push(memA[addr] ?? "--");
            bytesB.push(memB[addr] ?? "--");
        }

        // Se entrambi vuoti → ignora
        if (bytesA.every(b => b === "--") && bytesB.every(b => b === "--")) continue;

        // Confronto byte-per-byte
        const diversi = bytesA.some((b, i) => b !== bytesB[i]);

        // Valore complessivo
        const valA = ricostruisciValore(bytesA);
        const valB = ricostruisciValore(bytesB);

        const valA_str = (valA === "--") ? "--" : (unita ? `${valA} ${unita}` : `${valA}`);
        const valB_str = (valB === "--") ? "--" : (unita ? `${valB} ${unita}` : `${valB}`);

        if (diversi || valA !== valB) {
            diff.push({
                base,
                len,
                nome,
                bytesA,
                bytesB,
                valA_str,
                valB_str
            });
        }
    }

    return { diff, runtime };
}


// ------------------------------------------------------------
//  RENDER RISULTATI (AGGIUNTO VALORE COMPLESSIVO)
// ------------------------------------------------------------
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
                    <th>Valore 1</th>
                    <th>Valore 2</th>
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
                        <td>${d.nome}</td>
                `;

                if (i === 0) {
                    html += `
                        <td rowspan="${d.len}" style="text-align:center;">
                            <b>A:</b> ${d.valA_str}<br>
                            <b>B:</b> ${d.valB_str}
                        </td>
                    `;
                }

                html += `</tr>`;
            }
        }

        html += `</table>`;
    }

    // Runtime identico al tuo
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
//  AVVIA CONFRONTO (IDENTICO AL TUO)
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
