// ===============================================================
// CONFRONTO MEMORIE X2 - Versione completa
// Autore: Copilot + Luca
// Data: 18/05/2026 - 14:06
// ===============================================================

// ===============================================================
// FUNZIONE PRINCIPALE
// ===============================================================
function confrontaMemorie(memA, memB, tabellaParametri) {
    const risultati = [];
    const runtime = [];

    // Creiamo una mappa indirizzo → valore memoria A/B
    const mapA = creaMappa(memA);
    const mapB = creaMappa(memB);

    // Cicliamo tutti i parametri della tabella
    for (const p of tabellaParametri) {
        const base = parseInt(p.LIBERA1, 16);
        const len = parseInt(p.LIBERA4); // 1,2,3,4 byte
        const unita = (p.UNITA && p.UNITA !== "/") ? p.UNITA : "";
        const nome = p.NOME || p.PARAMETRO || "Parametro";

        // Lettura byte consecutivi
        const bytesA = [];
        const bytesB = [];

        for (let i = 0; i < len; i++) {
            const addr = base + i;
            bytesA.push(mapA[addr] ?? "--");
            bytesB.push(mapB[addr] ?? "--");
        }

        // Se tutti i byte sono "--", parametro non presente → skip
        if (bytesA.every(b => b === "--") && bytesB.every(b => b === "--")) continue;

        // Confronto byte-per-byte
        const diversi = bytesA.some((b, i) => b !== bytesB[i]);

        // Ricostruzione valore complessivo
        const valA = ricostruisciValore(bytesA);
        const valB = ricostruisciValore(bytesB);

        const valA_str = unita ? `${valA} ${unita}` : `${valA}`;
        const valB_str = unita ? `${valB} ${unita}` : `${valB}`;

        // Se tutti uguali → non mostrare
        if (!diversi && valA === valB) continue;

        // Se parametro runtime → lo mettiamo nella sezione runtime
        if (p.RUNTIME === "1") {
            runtime.push({
                base, len, nome, bytesA, bytesB, valA_str, valB_str
            });
            continue;
        }

        // Parametro normale → aggiungiamo al risultato
        risultati.push({
            base, len, nome, bytesA, bytesB, valA_str, valB_str
        });
    }

    return { risultati, runtime };
}

// ===============================================================
// CREA MAPPA INDIRIZZO → VALORE
// ===============================================================
function creaMappa(mem) {
    const m = {};
    for (const riga of mem) {
        const addr = parseInt(riga.addr, 16);
        m[addr] = riga.val;
    }
    return m;
}

// ===============================================================
// RICOSTRUZIONE VALORE LITTLE-ENDIAN
// ===============================================================
function ricostruisciValore(bytes) {
    let val = 0;
    for (let i = 0; i < bytes.length; i++) {
        const b = bytes[i];
        if (b === "--") return "--";
        val += parseInt(b, 16) * Math.pow(256, i);
    }
    return val;
}

// ===============================================================
// RENDER RISULTATI IN HTML
// ===============================================================
function renderRisultati(dati, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    if (dati.length === 0) {
        container.innerHTML = "<p>Nessuna differenza trovata.</p>";
        return;
    }

    const table = document.createElement("table");
    table.className = "tabellaConfronto";

    // Header
    table.innerHTML = `
        <tr>
            <th>Indirizzo</th>
            <th>Byte A</th>
            <th>Byte B</th>
            <th>Parametro</th>
            <th>VALORE COMPLESSIVO</th>
        </tr>
    `;

    // Righe
    for (const r of dati) {
        for (let i = 0; i < r.len; i++) {
            const tr = document.createElement("tr");
            const addr = (r.base + i).toString(16).toUpperCase().padStart(4, "0");

            tr.innerHTML = `
                <td>0x${addr}</td>
                <td>${r.bytesA[i]} (${r.bytesA[i] === "--" ? "--" : parseInt(r.bytesA[i], 16)})</td>
                <td>${r.bytesB[i]} (${r.bytesB[i] === "--" ? "--" : parseInt(r.bytesB[i], 16)})</td>
                <td>${r.nome}</td>
            `;

            // Cella unica VALORE COMPLESSIVO
            if (i === 0) {
                const td = document.createElement("td");
                td.rowSpan = r.len;
                td.style.textAlign = "center";
                td.innerHTML = `
                    <div><b>A:</b> ${r.valA_str}</div>
                    <div><b>B:</b> ${r.valB_str}</div>
                `;
                tr.appendChild(td);
            }

            table.appendChild(tr);
        }
    }

    container.appendChild(table);
}

// ===============================================================
// FINE FILE
// ===============================================================
