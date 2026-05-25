// ============================================================
//  CONFRONTO_MEMORIE.JS – VERSIONE 25/05/2026
// ============================================================

// ------------------------------------------------------------
//  VARIABILI BASE
// ------------------------------------------------------------
let memoriaA = null;
let memoriaB = null;
let memoriaC = null;

let confrontoAttivo = "A-B";

const indirizziRuntime = [
    0x04F4, 0x0810, 0x0811, 0x081A, 0x081B, 0x081C,
    0x09E3, 0x09FA, 0x09FB, 0x09FE, 0x09FF
];

// ------------------------------------------------------------
//  UTILITY BASE
// ------------------------------------------------------------
function apriErrori() {
    window.location.href = "errori_x2.html";
}

function formatVal(hexVal) {
    if (hexVal === "--") return "--";
    const num = parseInt(hexVal, 16);
    return `${hexVal} <span style="color:#888;">(${num})</span>`;
}

function leggiFileHex(input, callback) {
    const file = input.files[0];
    if (!file) return callback(null);

    const reader = new FileReader();
    reader.onload = e => callback(e.target.result);
    reader.readAsText(file);
}

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

    if (len === 2) return b[0] * 256 + b[1];
    if (len === 1) return b[0];

    return "--";
}

// ------------------------------------------------------------
//  CERCA IMPOSTAZIONE NEL JSON (con cache)
// ------------------------------------------------------------
const tendineCache = {};

async function x2_trovaImpostazione(parametroCodice, valore) {
    // Se il JSON è già in cache → uso quello
    if (tendineCache[parametroCodice]) {
        const data = tendineCache[parametroCodice];
        const voce = data.valori.find(v => v.id === valore);
        return voce ? voce.text : "—";
    }

    // Altrimenti scarico e salvo in cache
    try {
        const url = "/progetto_x2/json_tendine/" + parametroCodice + ".json";
        const r = await fetch(url);
        if (!r.ok) return "—";
        const data = await r.json();
        tendineCache[parametroCodice] = data; // salvo in cache
        const voce = data.valori.find(v => v.id === valore);
        return voce ? voce.text : "—";
    } catch {
        return "—";
    }
}


// ------------------------------------------------------------
//  CONFRONTO A–B
// ------------------------------------------------------------
function compareMemory(memA, memB) {

    const diff = [];
    const runtime = [];
    const giàGestiti = new Set();
    const visualizzaTutto = document.getElementById("flagVisualizzaTutto")?.checked;

    for (let addr of indirizziRuntime) {
        runtime.push({
            addr,
            vA: memA[addr] ?? "--",
            vB: memB[addr] ?? "--",
            vC: "--"
        });
    }

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

        if (visualizzaTutto || diversi || valA !== valB) {
            diff.push({
                base,
                len,
                nome,
                codice: p.PARAMETRO,
                bytesA,
                bytesB,
                bytesC: null,
                valA_str,
                valB_str,
                valC_str: ""
            });
        }
    }

    return { diff, runtime };
}

// ------------------------------------------------------------
//  CONFRONTO MEMORIE (A-B, A-C, B-C, A-B-C)
// ------------------------------------------------------------
function compareMemory3(memA, memB, memC) {
    const diff = [];
    const runtime = [];

    // Leggi il flag (true/false)
    const flagChecked = document.getElementById("flagVisualizzaTutto")?.checked ?? false;

    // RUNTIME
    for (let addr of indirizziRuntime) {
        runtime.push({
            addr,
            vA: memA[addr] ?? "--",
            vB: memB[addr] ?? "--",
            vC: memC[addr] ?? "--"
        });
    }

    // DIFFERENZE
    for (let codice in x2_parametri_data) {
        const p = x2_parametri_data[codice];
        const bytesA = [];
        const bytesB = [];
        const bytesC = [];
        for (let i = 0; i < p.len; i++) {
            bytesA.push(memA[p.base + i] ?? "--");
            bytesB.push(memB[p.base + i] ?? "--");
            bytesC.push(memC ? (memC[p.base + i] ?? "--") : null);
        }

        const valA_str = ricostruisciValore(bytesA);
        const valB_str = ricostruisciValore(bytesB);
        const valC_str = memC ? ricostruisciValore(bytesC) : null;

        let diverso = false;
        if (confrontoAttivo === "A-B" && valA_str !== valB_str) diverso = true;
        if (confrontoAttivo === "A-C" && valA_str !== valC_str) diverso = true;
        if (confrontoAttivo === "B-C" && valB_str !== valC_str) diverso = true;
        if (confrontoAttivo === "A-B-C" && (valA_str !== valB_str || valA_str !== valC_str || valB_str !== valC_str)) diverso = true;

        // Regole finali:
        // - A-B → mostra solo se diverso
        // - A-C / B-C / A-B-C → mostra se diverso, oppure se flag attivo
        if (
            (confrontoAttivo === "A-B" && diverso) ||
            ((confrontoAttivo === "A-C" || confrontoAttivo === "B-C" || confrontoAttivo === "A-B-C") && (diverso || flagChecked))
        ) {
            diff.push({
                codice,
                nome: p.nome,
                base: p.base,
                len: p.len,
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

// ------------------------------------------------------------
// ------------------------------------------------------------
//  RENDER RISULTATI 
// ------------------------------------------------------------
async function renderResults(result) {

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
                        data-valC="${d.bytesC ? d.bytesC[0] : ""}"
                    ` : ""}>
                        <td class="col-indirizzo">0x${(d.base + i).toString(16).padStart(4,"0").toUpperCase()}</td>
                        <td class="col-valA">${formatVal(d.bytesA[i])}</td>
                        <td class="col-valB">${formatVal(d.bytesB[i])}</td>
                        <td class="col-valC">${d.bytesC ? formatVal(d.bytesC[i]) : "--"}</td>
                        <td class="col-parametro">${d.codice} – ${d.nome}</td>
                `;

                if (i === 0) {
                    if (confrontoAttivo === "A-C") {
                        html += `<td class="col-valore" rowspan="${d.len}">
                            <b>A:</b> ${d.valA_str}<br><b>C:</b> ${d.valC_str}
                        </td>`;
                    } else if (confrontoAttivo === "B-C") {
                        html += `<td class="col-valore" rowspan="${d.len}">
                            <b>B:</b> ${d.valB_str}<br><b>C:</b> ${d.valC_str}
                        </td>`;
                    } else if (confrontoAttivo === "A-B-C") {
                        html += `<td class="col-valore" rowspan="${d.len}">
                            <b>A:</b> ${d.valA_str}<br><b>B:</b> ${d.valB_str}<br><b>C:</b> ${d.valC_str}
                        </td>`;
                    } else { // default A-B
                        html += `<td class="col-valore" rowspan="${d.len}">
                            <b>A:</b> ${d.valA_str}<br><b>B:</b> ${d.valB_str}
                        </td>`;
                    }
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
                    <th>Valore A</th>
                    <th>Valore B</th>
                    <th>Valore C</th>
                    <th>Note</th>
                </tr>
    `;

    for (let r of runtime) {
        html += `
            <tr class="runtime">
                <td>0x${r.addr.toString(16).padStart(4, "0").toUpperCase()}</td>
                <td>${formatVal(r.vA)}</td>
                <td>${formatVal(r.vB)}</td>
                <td>${formatVal(r.vC)}</td>
                <td>Runtime – non programmabile</td>
            </tr>
        `;
    }

    html += `
            </table>
        </div>
    `;

    document.getElementById("risultati").innerHTML = html;

    // ➜ Evento click su ogni parametro
    document.querySelectorAll("#tabDiff tr.param-row").forEach(riga => {
        riga.addEventListener("click", async () => {
            const codice = riga.dataset.codice;
            const valA = riga.dataset.valA;
            const valB = riga.dataset.valB;
            const valC = riga.dataset.valC;

            const impA = valA ? await x2_trovaImpostazione(codice, valA) : "—";
            const impB = valB ? await x2_trovaImpostazione(codice, valB) : "—";
            const impC = valC ? await x2_trovaImpostazione(codice, valC) : "—";

            alert(`Parametro ${codice}\n\nA = ${valA} → ${impA}\nB = ${valB} → ${impB}\nC = ${valC} → ${impC}`);
        });
    });

    // Toggle runtime
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

    // Applica i filtri checkbox
    applyColumnFilters();
}

function confronta(memFileA, memFileB) {
    const mem1 = typeof memFileA === "string" ? hexToMemoryMap(memFileA) : memFileA;
    const mem2 = typeof memFileB === "string" ? hexToMemoryMap(memFileB) : memFileB;

    const result = compareMemory(mem1, mem2);
    renderResults(result);
}

// ------------------------------------------------------------
//  FUNZIONI DI CONFRONTO
// ------------------------------------------------------------

function confrontaAB() {
    evidenziaPulsante("btnAB");
    confrontoAttivo = "A-B";

    const f1 = document.getElementById("file1");
    const f2 = document.getElementById("file2");

    if (!f2.files[0]) return alert("Seleziona File B");

    if (!f1.files[0] && memoriaA) {
        leggiFileHex(f2, hexB => {
            confronta(memoriaA, hexB);
            aggiornaCheckboxColonne();
        });
        return;
    }

    if (f1.files[0]) {
        leggiFileHex(f1, hexA => leggiFileHex(f2, hexB => {
            confronta(hexA, hexB);
            aggiornaCheckboxColonne();
        }));
        return;
    }

    alert("Seleziona File A oppure usa la memoria DEFAULT");
}


function confrontaAC() {
    evidenziaPulsante("btnAC");
    confrontoAttivo = "A-C";

    const f1 = document.getElementById("file1");
    const f3 = document.getElementById("file3");

    if (!f3.files[0]) return alert("Seleziona File C");

    let sorgenteA;

    if (f1.files[0]) {
        sorgenteA = new Promise(res => leggiFileHex(f1, hexA => res(hexA)));
    } else if (memoriaA) {
        sorgenteA = Promise.resolve(memoriaA);
    } else {
        return alert("Seleziona File A oppure usa la memoria DEFAULT");
    }

    const sorgenteC = new Promise(res => leggiFileHex(f3, hexC => res(hexC)));

    Promise.all([sorgenteA, sorgenteC]).then(([memA, memC]) => {

        const mA = typeof memA === "string" ? hexToMemoryMap(memA) : memA;
        const mC = typeof memC === "string" ? hexToMemoryMap(memC) : memC;

        // B NON ESISTE → PASSIAMO UN OGGETTO VUOTO
        const mB = {};

        const result = compareMemory3(mA, mB, mC);
        renderResults(result);
        aggiornaCheckboxColonne();
    });
}

function confrontaBC() {
    evidenziaPulsante("btnBC");
    confrontoAttivo = "B-C";

    const f2 = document.getElementById("file2");
    const f3 = document.getElementById("file3");

    if (!f2.files[0] || !f3.files[0]) {
        return alert("Seleziona File B e File C");
    }

    const sorgenteB = new Promise(res => leggiFileHex(f2, hexB => res(hexB)));
    const sorgenteC = new Promise(res => leggiFileHex(f3, hexC => res(hexC)));

    Promise.all([sorgenteB, sorgenteC]).then(([memB, memC]) => {

        const mB = typeof memB === "string" ? hexToMemoryMap(memB) : memB;
        const mC = typeof memC === "string" ? hexToMemoryMap(memC) : memC;

        // A NON ESISTE → PASSIAMO UN OGGETTO VUOTO
        const mA = {};

        const result = compareMemory3(mA, mB, mC);
        renderResults(result);
        aggiornaCheckboxColonne();
    });
}


async function confrontaABC() {
    evidenziaPulsante("btnABC");
    confrontoAttivo = "A-B-C";

    const f1 = document.getElementById("file1");
    const f2 = document.getElementById("file2");
    const f3 = document.getElementById("file3");

    if (!f2.files[0] || !f3.files[0]) return alert("Seleziona File B e File C");

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

    const result = compareMemory3(mA, mB, mC);
    renderResults(result);
    aggiornaCheckboxColonne();
}


// ------------------------------------------------------------
//  EVIDENZIA PULSANTE
// ------------------------------------------------------------
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

// ------------------------------------------------------------
//  TOGGLE COLONNA C
// ------------------------------------------------------------
function toggleColonnaC() {
    const celleC = document.querySelectorAll(".col-valC");
    if (!celleC.length) return;

    const hidden = Array.from(celleC).every(c => c.style.display === "none");
    const nuovoDisplay = hidden ? "" : "none";

    celleC.forEach(c => c.style.display = nuovoDisplay);
}

// ------------------------------------------------------------
//  SALVATAGGIO FILE A/B/C IN LOCALSTORAGE
// ------------------------------------------------------------
function salvaFile(lettera, input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
        localStorage.setItem("X2_FILE_" + lettera, e.target.result);
        localStorage.setItem("X2_FILE_" + lettera + "_NAME", file.name);

        if (lettera === "A") {
            const lbl = document.getElementById("labelFileA");
            if (lbl) lbl.textContent = "FILE A";
        }
    };
    reader.readAsText(file);
}

// ------------------------------------------------------------
//  APPLY COLUMN FILTERS (usa le classi, non gli indici)
// ------------------------------------------------------------
function applyColumnFilters() {
    document.querySelectorAll(".col-flag").forEach(flag => {
        const colClass = flag.dataset.col;
        const hide = !flag.checked;

        document.querySelectorAll("." + colClass).forEach(cell => {
            cell.style.display = hide ? "none" : "";
        });
    });
}

// ------------------------------------------------------------
//  AGGIORNA CHECK
// ------------------------------------------------------------
function aggiornaCheckboxColonne() {

    const chkA = document.querySelector('input[data-col="col-valA"]');
    const chkB = document.querySelector('input[data-col="col-valB"]');
    const chkC = document.querySelector('input[data-col="col-valC"]');

    if (!chkA || !chkB || !chkC) return;

    if (confrontoAttivo === "A-B") {
        chkA.checked = true;
        chkB.checked = true;
        chkC.checked = false;
    }

    if (confrontoAttivo === "A-C") {
        chkA.checked = true;
        chkB.checked = false;
        chkC.checked = true;
    }

    if (confrontoAttivo === "B-C") {
        chkA.checked = false;
        chkB.checked = true;
        chkC.checked = true;
    }

    if (confrontoAttivo === "A-B-C") {
        chkA.checked = true;
        chkB.checked = true;
        chkC.checked = true;
    }

    applyColumnFilters();
}

// ------------------------------------------------------------
//  CARICAMENTO AUTOMATICO MEMORIA POLLI IN A
// ------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    const urlPolli = "https://raw.githubusercontent.com/balza1979/progetto_x2/main/Memorie/def_polli_b335f_ver1.HEX";

    fetch(urlPolli)
        .then(r => r.text())
        .then(text => {
            memoriaA = hexToMemoryMap(text);
            console.log("Memoria polli caricata automaticamente in A");
        })
        .catch(err => console.error("Errore caricamento polli:", err));
});
