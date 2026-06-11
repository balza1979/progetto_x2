/* ============================================================
   BLOCCO 1 – CARICAMENTO MEMORIE + FUNZIONI BASE
   Versione ripristinata e corretta – 11/06/2026 11:25
   ============================================================ */

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
//  FUNZIONE NECESSARIA (MANCAVA!)
// ------------------------------------------------------------
function ricostruisciValore(indirizzo, valoreHex) {
    if (!valoreHex || valoreHex === "--") return "--";
    const val = parseInt(valoreHex, 16);

    // indirizzi runtime → non ricostruire
    if (indirizziRuntime.includes(indirizzo)) return val;

    return val;
}

// ------------------------------------------------------------
//  HEX → MAPPA MEMORIA
// ------------------------------------------------------------
function hexToMemoryMap(hexText) {
    const lines = hexText.split(/\r?\n/);
    const mem = {};

    for (let line of lines) {
        line = line.trim();
        if (!line) continue;
        if (line.charCodeAt(0) === 0xFEFF) line = line.slice(1);
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
//  CARICAMENTO AUTOMATICO A/B/C PER CONFRONTO
// ------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {

    // se sono in modalità creazione → NON tocco nulla
    if (typeof isModalitaCreazione === "function" && isModalitaCreazione()) {
        return;
    }

    const hexA = localStorage.getItem("memA_hex");
    const hexB = localStorage.getItem("memB_hex");
    const hexC = localStorage.getItem("memC_hex");

    const nomeA = localStorage.getItem("memA_nome");
    const nomeB = localStorage.getItem("memB_nome");
    const nomeC = localStorage.getItem("memC_nome");

    // ⭐ SE A E B ESISTONO → uso SOLO quelli
    if (hexA && hexB) {

        memoriaA = hexToMemoryMap(hexA);
        memoriaB = hexToMemoryMap(hexB);

        const lblA = document.getElementById("labelFileA");
        const lblB = document.getElementById("labelFileB");
        const lblC = document.getElementById("labelFileC");

        if (lblA) lblA.textContent = "FILE A: " + (nomeA || "memoria A");
        if (lblB) lblB.textContent = "FILE B: " + (nomeB || "memoria B");

        if (hexC && nomeC && lblC) {
            memoriaC = hexToMemoryMap(hexC);
            lblC.textContent = "FILE C: " + nomeC;
        }

        console.log("CONFRONTO: uso A/B/C da localStorage");
        return;
    }

    // ⭐ ALTRIMENTI → fallback polli
    const urlPolli =
        "https://raw.githubusercontent.com/balza1979/progetto_x2/main/Memorie/def_polli_b335f_ver1.HEX";

    fetch(urlPolli)
        .then(r => r.text())
        .then(text => {
            memoriaA = hexToMemoryMap(text);
            const lblA = document.getElementById("labelFileA");
            if (lblA) lblA.textContent = "FILE A: memoria polli (default)";
            console.log("CONFRONTO: uso polli come A");
        })
        .catch(err => console.error("Errore caricamento polli:", err));
});

/* ============================================================
   FINE BLOCCO 1
   ============================================================ */




/* === INIZIO BLOCCO 2/4 ===================================== */


// ------------------------------------------------------------
//  FUNZIONI DI CONFRONTO A DUE MEMORIE (A-B)
// ------------------------------------------------------------
function compareMemory(memA, memB) {
    const diff = [];
    const runtime = [];
    const giàGestiti = new Set();
    const visualizzaTutto = document.getElementById("flagVisualizzaTutto")?.checked;

    // --- RUNTIME ---
    for (let addr of indirizziRuntime) {
        runtime.push({
            addr,
            vA: memA[addr] ?? "--",
            vB: memB[addr] ?? "--",
            vC: "--"
        });
    }

    // --- PARAMETRI ---
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

        if (visualizzaTutto || diversi) {
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
//  FUNZIONI DI CONFRONTO A TRE MEMORIE (A-B-C)
// ------------------------------------------------------------
function compareMemory3(memA, memB, memC) {

    const diff = [];
    const runtime = [];
    const giàGestiti = new Set();
    const visualizzaTutto = document.getElementById("flagVisualizzaTutto")?.checked;

    // --- RUNTIME ---
    for (let addr of indirizziRuntime) {
        runtime.push({
            addr,
            vA: memA[addr] ?? "--",
            vB: memB[addr] ?? "--",
            vC: memC[addr] ?? "--"
        });
    }

    // --- PARAMETRI ---
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

        let diversi = false;

        if (confrontoAttivo === "A-C") {
            diversi = bytesA.some((b, i) => b !== bytesC[i]);
        }
        else if (confrontoAttivo === "B-C") {
            diversi = bytesB.some((b, i) => b !== bytesC[i]);
        }
        else if (confrontoAttivo === "A-B-C") {
            diversi =
                bytesA.some((b, i) => b !== bytesB[i]) ||
                bytesA.some((b, i) => b !== bytesC[i]) ||
                bytesB.some((b, i) => b !== bytesC[i]);
        }
        else { // default A-B
            diversi = bytesA.some((b, i) => b !== bytesB[i]);
        }

        const valA = ricostruisciValore(bytesA);
        const valB = ricostruisciValore(bytesB);
        const valC = ricostruisciValore(bytesC);

        const valA_str = (valA === "--") ? "--" : (unita ? `${valA} ${unita}` : `${valA}`);
        const valB_str = (valB === "--") ? "--" : (unita ? `${valB} ${unita}` : `${valB}`);
        const valC_str = (valC === "--") ? "--" : (unita ? `${valC} ${unita}` : `${valC}`);

        if (visualizzaTutto || diversi) {
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


/* === FINE BLOCCO 2/4 ======================================= */
/* === INIZIO BLOCCO 3/4 ===================================== */


// ------------------------------------------------------------
//  RENDER RISULTATI (TABELLA DIFFERENZE + RUNTIME)
// ------------------------------------------------------------
function renderResults(result) {

    const lista = result.diff;
    const runtime = result.runtime;

    let html = `<h3>DIFFERENZE PARAMETRI</h3>`;

    // --- NESSUNA DIFFERENZA ---
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
    } 

    // --- CI SONO DIFFERENZE ---
    else {

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
                    <tr class="param-row">
                        <td class="col-indirizzo">0x${(d.base + i).toString(16).padStart(4,"0").toUpperCase()}</td>
                        <td class="col-valA">${formatVal(d.bytesA[i])}</td>
                        <td class="col-valB">${formatVal(d.bytesB[i])}</td>
                        <td class="col-valC">${formatVal(d.bytesC ? d.bytesC[i] : "--")}</td>
                        <td class="col-parametro">${d.codice} – ${d.nome}</td>
                `;

                // --- VALORE COMPLESSIVO (rowspan) ---
                if (i === 0) {

                    if (confrontoAttivo === "A-C") {
                        html += `
                            <td class="col-valore" rowspan="${d.len}">
                                <b>A:</b> ${d.valA_str}<br><b>C:</b> ${d.valC_str}
                            </td>
                        `;
                    }

                    else if (confrontoAttivo === "B-C") {
                        html += `
                            <td class="col-valore" rowspan="${d.len}">
                                <b>B:</b> ${d.valB_str}<br><b>C:</b> ${d.valC_str}
                            </td>
                        `;
                    }

                    else if (confrontoAttivo === "A-B-C") {
                        html += `
                            <td class="col-valore" rowspan="${d.len}">
                                <b>A:</b> ${d.valA_str}<br>
                                <b>B:</b> ${d.valB_str}<br>
                                <b>C:</b> ${d.valC_str}
                            </td>
                        `;
                    }

                    else { // A-B
                        html += `
                            <td class="col-valore" rowspan="${d.len}">
                                <b>A:</b> ${d.valA_str}<br><b>B:</b> ${d.valB_str}
                            </td>
                        `;
                    }
                }

                html += `</tr>`;
            }
        }

        html += `</table>`;
    }

    // --------------------------------------------------------
    //  SEZIONE RUNTIME
    // --------------------------------------------------------
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

    // --- TOGGLE RUNTIME ---
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


/* === FINE BLOCCO 3/4 ======================================= */
/* === INIZIO BLOCCO 4/4 ===================================== */


// ------------------------------------------------------------
//  FUNZIONI DI CONFRONTO (AB / AC / BC / ABC)
//  USANO memoriaA/B/C SE ESISTONO, ALTRIMENTI I FILE
// ------------------------------------------------------------
function confrontaAB() {
    evidenziaPulsante("btnAB");
    confrontoAttivo = "A-B";

    const f1 = document.getElementById("file1");
    const f2 = document.getElementById("file2");

    let sorgenteA = memoriaA || (f1.files[0] ? f1 : null);
    let sorgenteB = memoriaB || (f2.files[0] ? f2 : null);

    if (!sorgenteA) return alert("File A mancante");
    if (!sorgenteB) return alert("File B mancante");

    const promA = (sorgenteA === memoriaA)
        ? Promise.resolve(memoriaA)
        : new Promise(res => leggiFileHex(f1, hex => res(hexToMemoryMap(hex))));

    const promB = (sorgenteB === memoriaB)
        ? Promise.resolve(memoriaB)
        : new Promise(res => leggiFileHex(f2, hex => res(hexToMemoryMap(hex))));

    Promise.all([promA, promB]).then(([memA, memB]) => {
        renderResults(compareMemory(memA, memB));
    });
}


function confrontaAC() {
    evidenziaPulsante("btnAC");
    confrontoAttivo = "A-C";

    const f1 = document.getElementById("file1");
    const f3 = document.getElementById("file3");

    let sorgenteA = memoriaA || (f1.files[0] ? f1 : null);
    let sorgenteC = memoriaC || (f3.files[0] ? f3 : null);

    if (!sorgenteA) return alert("File A mancante");
    if (!sorgenteC) return alert("File C mancante");

    const promA = (sorgenteA === memoriaA)
        ? Promise.resolve(memoriaA)
        : new Promise(res => leggiFileHex(f1, hex => res(hexToMemoryMap(hex))));

    const promC = (sorgenteC === memoriaC)
        ? Promise.resolve(memoriaC)
        : new Promise(res => leggiFileHex(f3, hex => res(hexToMemoryMap(hex))));

    Promise.all([promA, promC]).then(([memA, memC]) => {
        renderResults(compareMemory3(memA, {}, memC));
    });
}


function confrontaBC() {
    evidenziaPulsante("btnBC");
    confrontoAttivo = "B-C";

    const f2 = document.getElementById("file2");
    const f3 = document.getElementById("file3");

    let sorgenteB = memoriaB || (f2.files[0] ? f2 : null);
    let sorgenteC = memoriaC || (f3.files[0] ? f3 : null);

    if (!sorgenteB) return alert("File B mancante");
    if (!sorgenteC) return alert("File C mancante");

    const promB = (sorgenteB === memoriaB)
        ? Promise.resolve(memoriaB)
        : new Promise(res => leggiFileHex(f2, hex => res(hexToMemoryMap(hex))));

    const promC = (sorgenteC === memoriaC)
        ? Promise.resolve(memoriaC)
        : new Promise(res => leggiFileHex(f3, hex => res(hexToMemoryMap(hex))));

    Promise.all([promB, promC]).then(([memB, memC]) => {
        renderResults(compareMemory3({}, memB, memC));
    });
}


function confrontaABC() {
    evidenziaPulsante("btnABC");
    confrontoAttivo = "A-B-C";

    const f1 = document.getElementById("file1");
    const f2 = document.getElementById("file2");
    const f3 = document.getElementById("file3");

    let sorgenteA = memoriaA || (f1.files[0] ? f1 : null);
    let sorgenteB = memoriaB || (f2.files[0] ? f2 : null);
    let sorgenteC = memoriaC || (f3.files[0] ? f3 : null);

    if (!sorgenteA) return alert("File A mancante");
    if (!sorgenteB) return alert("File B mancante");
    if (!sorgenteC) return alert("File C mancante");

    const promA = (sorgenteA === memoriaA)
        ? Promise.resolve(memoriaA)
        : new Promise(res => leggiFileHex(f1, hex => res(hexToMemoryMap(hex))));

    const promB = (sorgenteB === memoriaB)
        ? Promise.resolve(memoriaB)
        : new Promise(res => leggiFileHex(f2, hex => res(hexToMemoryMap(hex))));

    const promC = (sorgenteC === memoriaC)
        ? Promise.resolve(memoriaC)
        : new Promise(res => leggiFileHex(f3, hex => res(hexToMemoryMap(hex))));

    Promise.all([promA, promB, promC]).then(([memA, memB, memC]) => {
        renderResults(compareMemory3(memA, memB, memC));
    });
}



// ------------------------------------------------------------
//  EVIDENZIA PULSANTE ATTIVO
// ------------------------------------------------------------
function evidenziaPulsante(id) {
    ["btnAB", "btnAC", "btnBC", "btnABC"].forEach(btn => {
        document.getElementById(btn).classList.remove("attivo");
    });
    document.getElementById(id).classList.add("attivo");
}



// ------------------------------------------------------------
//  FILTRI COLONNE
// ------------------------------------------------------------
function applyColumnFilters() {
    const showA = document.getElementById("chkA")?.checked ?? true;
    const showB = document.getElementById("chkB")?.checked ?? true;
    const showC = document.getElementById("chkC")?.checked ?? true;

    document.querySelectorAll(".col-valA").forEach(c => c.style.display = showA ? "" : "none");
    document.querySelectorAll(".col-valB").forEach(c => c.style.display = showB ? "" : "none");
    document.querySelectorAll(".col-valC").forEach(c => c.style.display = showC ? "" : "none");
}



// ------------------------------------------------------------
//  EVENTI CAMBIO FILE (A/B/C)
// ------------------------------------------------------------
function onFileA_Change() {
    const inputA = document.getElementById("file1");
    if (!inputA.files[0]) return;

    leggiFileHex(inputA, hex => {
        memoriaA = hexToMemoryMap(hex);
        localStorage.setItem("memA_hex", hex);
        localStorage.setItem("memA_nome", inputA.files[0].name);
        document.getElementById("labelFileA").textContent = "FILE A: " + inputA.files[0].name;
    });
}

function onFileB_Change() {
    const inputB = document.getElementById("file2");
    if (!inputB.files[0]) return;

    leggiFileHex(inputB, hex => {
        memoriaB = hexToMemoryMap(hex);
        localStorage.setItem("memB_hex", hex);
        localStorage.setItem("memB_nome", inputB.files[0].name);
        document.getElementById("labelFileB").textContent = "FILE B: " + inputB.files[0].name;
    });
}

function onFileC_Change() {
    const inputC = document.getElementById("file3");
    if (!inputC.files[0]) return;

    leggiFileHex(inputC, hex => {
        memoriaC = hexToMemoryMap(hex);
        localStorage.setItem("memC_hex", hex);
        localStorage.setItem("memC_nome", inputC.files[0].name);
        document.getElementById("labelFileC").textContent = "FILE C: " + inputC.files[0].name;
    });
}


/* === FINE BLOCCO 4/4 ======================================= */
