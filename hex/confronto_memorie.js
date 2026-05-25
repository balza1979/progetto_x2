// ============================================================
//  VARIABILI GLOBALI
// ============================================================
let memA = {};
let memB = {};
let memC = {};
let confrontoAttivo = "A-B";


// ============================================================
//  LETTURA FILE HEX
// ============================================================
function salvaFile(lettera, input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        const lines = reader.result.split(/\r?\n/);
        const mem = {};

        for (let line of lines) {
            if (!line.startsWith(":")) continue;

            const byteCount = parseInt(line.substr(1, 2), 16);
            const address = parseInt(line.substr(3, 4), 16);
            const recordType = parseInt(line.substr(7, 2), 16);

            if (recordType !== 0) continue;

            let idx = 9;
            for (let i = 0; i < byteCount; i++) {
                const val = parseInt(line.substr(idx, 2), 16);
                mem[address + i] = val;
                idx += 2;
            }
        }

        if (lettera === "A") memA = mem;
        if (lettera === "B") memB = mem;
        if (lettera === "C") memC = mem;
    };

    reader.readAsText(file);
}


// ============================================================
//  FUNZIONI DI CONFRONTO
// ============================================================
function confrontaAB() {
    confrontoAttivo = "A-B";
    aggiornaConfronto();
}

function confrontaAC() {
    confrontoAttivo = "A-C";
    aggiornaConfronto();
}

function confrontaBC() {
    confrontoAttivo = "B-C";
    aggiornaConfronto();
}

function confrontaABC() {
    confrontoAttivo = "A-B-C";
    aggiornaConfronto();
}


// ============================================================
//  UTILITY
// ============================================================
function ricostruisciValore(bytes) {
    if (!bytes || bytes.includes("--")) return "--";
    let val = 0;
    for (let b of bytes) val = (val << 8) + b;
    return val;
}

function formatVal(v) {
    if (v === "--") return "--";
    return v.toString(16).padStart(2, "0").toUpperCase();
}


// ============================================================
//  CONFRONTO MEMORIE
// ============================================================
function compareMemory3(memA, memB, memC) {

    const diff = [];
    const flagChecked = document.getElementById("flagVisualizzaTutto").checked;

    for (let codice in x2_parametri_data) {

        const p = x2_parametri_data[codice];

        const bytesA = [];
        const bytesB = [];
        const bytesC = [];

        for (let i = 0; i < p.len; i++) {
            bytesA.push(memA[p.base + i] ?? "--");
            bytesB.push(memB[p.base + i] ?? "--");
            bytesC.push(memC[p.base + i] ?? "--");
        }

        const valA = ricostruisciValore(bytesA);
        const valB = ricostruisciValore(bytesB);
        const valC = ricostruisciValore(bytesC);

        let diverso = false;

        if (confrontoAttivo === "A-B") diverso = (valA !== valB);
        if (confrontoAttivo === "A-C") diverso = (valA !== valC);
        if (confrontoAttivo === "B-C") diverso = (valB !== valC);
        if (confrontoAttivo === "A-B-C") diverso = (valA !== valB || valA !== valC || valB !== valC);

        if (
            (confrontoAttivo === "A-B" && diverso) ||
            ((confrontoAttivo !== "A-B") && (diverso || flagChecked))
        ) {
            diff.push({
                codice,
                nome: p.nome,
                base: p.base,
                len: p.len,
                bytesA,
                bytesB,
                bytesC,
                valA_str: valA,
                valB_str: valB,
                valC_str: valC
            });
        }
    }

    return { diff };
}


// ============================================================
//  AGGIORNA CONFRONTO
// ============================================================
function aggiornaConfronto() {
    const result = compareMemory3(memA, memB, memC);
    renderResults(result);
}


// ============================================================
//  RENDER RISULTATI
// ============================================================
function renderResults(result) {

    const lista = result.diff;

    let html = `<h3>DIFFERENZE PARAMETRI</h3>`;

    if (lista.length === 0) {
        html += `<div style="padding:10px; background:#113311; border:1px solid #44aa44;">Nessuna differenza.</div>`;
    } else {

        html += `
        <table id="tabDiff">
            <tr>
                <th class="col-indirizzo">Indirizzo</th>
                <th class="col-valA">Valore A</th>
                <th class="col-valB">Valore B</th>
                <th class="col-valC">Valore C</th>
                <th class="col-parametro">Parametro</th>
                <th class="col-valore">Valore complessivo</th>
            </tr>
        `;

        for (let d of lista) {
            for (let i = 0; i < d.len; i++) {

                html += `
                <tr class="param-row" ${i === 0 ? `
                    data-codice="${d.codice}"
                    data-valA="${d.bytesA[0]}"
                    data-valB="${d.bytesB[0]}"
                    data-valC="${d.bytesC[0]}"
                ` : ""}>
                    <td class="col-indirizzo">0x${(d.base + i).toString(16).padStart(4,"0").toUpperCase()}</td>
                    <td class="col-valA">${formatVal(d.bytesA[i])}</td>
                    <td class="col-valB">${formatVal(d.bytesB[i])}</td>
                    <td class="col-valC">${formatVal(d.bytesC[i])}</td>
                    <td class="col-parametro">${d.codice} – ${d.nome}</td>
                `;

                if (i === 0) {
                    if (confrontoAttivo === "A-C") {
                        html += `<td class="col-valore" rowspan="${d.len}">
                            A: ${d.valA_str}<br>C: ${d.valC_str}
                        </td>`;
                    } else if (confrontoAttivo === "B-C") {
                        html += `<td class="col-valore" rowspan="${d.len}">
                            B: ${d.valB_str}<br>C: ${d.valC_str}
                        </td>`;
                    } else if (confrontoAttivo === "A-B-C") {
                        html += `<td class="col-valore" rowspan="${d.len}">
                            A: ${d.valA_str}<br>B: ${d.valB_str}<br>C: ${d.valC_str}
                        </td>`;
                    } else {
                        html += `<td class="col-valore" rowspan="${d.len}">
                            A: ${d.valA_str}<br>B: ${d.valB_str}
                        </td>`;
                    }
                }

                html += `</tr>`;
            }
        }

        html += `</table>`;
    }

    document.getElementById("risultati").innerHTML = html;
}
