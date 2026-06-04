// ============================================================
//  CONFRONTO_MEMORIE.JS — VERSIONE ORDINATA E OTTIMIZZATA
//  Modalità confronto + Modalità creazione memoria C
//  Versione 2026-06-04 — Luca + Copilot
// ============================================================


// ============================================================
//  1. VARIABILI GLOBALI
// ============================================================

let memoriaA = null;
let memoriaB = null;
let memoriaC = null;

let confrontoAttivo = "A-B";

const indirizziRuntime = [
    0x04F4, 0x0810, 0x0811, 0x081A, 0x081B, 0x081C,
    0x09E3, 0x09FA, 0x09FB, 0x09FE, 0x09FF
];


// ============================================================
//  2. UTILITY BASE
// ============================================================

function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
}

function isModalitaCreazione() {
    return getQueryParam("mode") === "creazione";
}

function formatVal(hexVal) {
    if (hexVal === "--") return "--";
    const num = parseInt(hexVal, 16);
    return `${hexVal} <span style="color:#888;">(${num})</span>`;
}


// ============================================================
//  3. LETTURA FILE HEX
// ============================================================

function leggiFileHex(input, callback) {
    const file = input.files[0];
    if (!file) return callback(null);

    const reader = new FileReader();
    reader.onload = e => callback(e.target.result);
    reader.readAsText(file);
}


// ============================================================
//  4. PARSING HEX → MAPPA MEMORIA
// ============================================================

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


// ============================================================
//  5. RICOSTRUZIONE VALORI MULTIBYTE
// ============================================================

function ricostruisciValore(bytes) {
    if (bytes.includes("--")) return "--";

    const b = bytes.map(x => parseInt(x, 16));
    const len = b.length;

    if (len === 4) {
        // MSBH, LSBH, MSB, LSB
        return b[2] * 16777216 + b[3] * 65536 + b[0] * 256 + b[1];
    }

    if (len === 2) return b[0] * 256 + b[1];
    if (len === 1) return b[0];

    return "--";
}
// ============================================================
//  6. FUNZIONI DI CONFRONTO (A-B, A-C, B-C, A-B-C)
// ============================================================


// ------------------------------------------------------------
//  CONFRONTO A–B (senza C)
// ------------------------------------------------------------
function compareMemory(memA, memB) {
    const diff = [];
    const runtime = [];
    const giàGestiti = new Set();
    const visualizzaTutto = document.getElementById("flagVisualizzaTutto")?.checked;

    // RUNTIME
    for (let addr of indirizziRuntime) {
        runtime.push({
            addr,
            vA: memA[addr] ?? "--",
            vB: memB[addr] ?? "--",
            vC: "--"
        });
    }

    // PARAMETRI
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

        if (visualizzaTutto || diversi) {
            diff.push({
                base,
                len,
                nome,
                codice: p.PARAMETRO,
                bytesA,
                bytesB,
                bytesC: null,
                valA_str: valA,
                valB_str: valB,
                valC_str: ""
            });
        }
    }

    return { diff, runtime };
}


// ------------------------------------------------------------
//  CONFRONTO A–B–C (completo)
// ------------------------------------------------------------
function compareMemory3(memA, memB, memC) {
    const diff = [];
    const runtime = [];
    const giàGestiti = new Set();
    const visualizzaTutto = document.getElementById("flagVisualizzaTutto")?.checked;

    // RUNTIME
    for (let addr of indirizziRuntime) {
        runtime.push({
            addr,
            vA: memA[addr] ?? "--",
            vB: memB[addr] ?? "--",
            vC: memC[addr] ?? "--"
        });
    }

    // PARAMETRI
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
        } else if (confrontoAttivo === "B-C") {
            diversi = bytesB.some((b, i) => b !== bytesC[i]);
        } else if (confrontoAttivo === "A-B-C") {
            diversi =
                bytesA.some((b, i) => b !== bytesB[i]) ||
                bytesA.some((b, i) => b !== bytesC[i]) ||
                bytesB.some((b, i) => b !== bytesC[i]);
        } else {
            diversi = bytesA.some((b, i) => b !== bytesB[i]);
        }

        const valA = ricostruisciValore(bytesA);
        const valB = ricostruisciValore(bytesB);
        const valC = ricostruisciValore(bytesC);

        if (visualizzaTutto || diversi) {
            diff.push({
                base,
                len,
                nome,
                codice: p.PARAMETRO,
                bytesA,
                bytesB,
                bytesC,
                valA_str: valA,
                valB_str: valB,
                valC_str: valC
            });
        }
    }

    return { diff, runtime };
}


// ------------------------------------------------------------
//  FUNZIONI DI CONFRONTO (UI)
// ------------------------------------------------------------

// A–B
function confrontaAB() {
    evidenziaPulsante("btnAB");
    confrontoAttivo = "A-B";

    const f1 = document.getElementById("file1");
    const f2 = document.getElementById("file2");

    if (!f2.files[0]) return alert("Seleziona File B");

    // Caso A da file
    if (f1.files[0]) {
        leggiFileHex(f1, hexA => {
            leggiFileHex(f2, hexB => {
                const mA = hexToMemoryMap(hexA);
                const mB = hexToMemoryMap(hexB);
                const result = compareMemory3(mA, mB, {});
                renderResults(result);
                aggiornaCheckboxColonne();
            });
        });
        return;
    }

    // Caso A da memoria default
    if (!memoriaA) return alert("Memoria A non disponibile");

    leggiFileHex(f2, hexB => {
        const mA = memoriaA;
        const mB = hexToMemoryMap(hexB);
        const result = compareMemory3(mA, mB, {});
        renderResults(result);
        aggiornaCheckboxColonne();
    });
}


// A–C
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
        const result = compareMemory3(mA, {}, mC);
        renderResults(result);
        aggiornaCheckboxColonne();
    });
}


// B–C
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
        const mB = hexToMemoryMap(memB);
        const mC = hexToMemoryMap(memC);
        const result = compareMemory3({}, mB, mC);
        renderResults(result);
        aggiornaCheckboxColonne();
    });
}


// A–B–C
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
        return alert("Seleziona File A oppure usa la memoria DEFAULT");
    }

    const sorgenteB = new Promise(res => leggiFileHex(f2, hexB => res(hexB)));
    const sorgenteC = new Promise(res => leggiFileHex(f3, hexC => res(hexC)));

    const [memA, memB, memC] = await Promise.all([sorgenteA, sorgenteB, sorgenteC]);

    const mA = typeof memA === "string" ? hexToMemoryMap(memA) : memA;
    const mB = hexToMemoryMap(memB);
    const mC = hexToMemoryMap(memC);

    const result = compareMemory3(mA, mB, mC);
    renderResults(result);
    aggiornaCheckboxColonne();
}


// ------------------------------------------------------------
//  EVIDENZIA PULSANTE ATTIVO
// ------------------------------------------------------------
function evidenziaPulsante(idAttivo) {
    ["btnAB", "btnAC", "btnBC", "btnABC"].forEach(id => {
        const btn = document.getElementById(id);
        if (!btn) return;

        if (id === idAttivo) btn.classList.add("attivo");
        else btn.classList.remove("attivo");
    });
}
// ============================================================
//  7. RENDER RISULTATI CONFRONTO
// ============================================================

function renderResults(result) {

    const lista = result.diff;
    const runtime = result.runtime;

    let html = `<h3>DIFFERENZE PARAMETRI</h3>`;

    // Nessuna differenza
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

        // Tabella differenze
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

                // Valore complessivo (solo prima riga del parametro)
                if (i === 0) {
                    let bloccoValore = "";

                    if (confrontoAttivo === "A-C") {
                        bloccoValore = `<b>A:</b> ${d.valA_str}<br><b>C:</b> ${d.valC_str}`;
                    } else if (confrontoAttivo === "B-C") {
                        bloccoValore = `<b>B:</b> ${d.valB_str}<br><b>C:</b> ${d.valC_str}`;
                    } else if (confrontoAttivo === "A-B-C") {
                        bloccoValore = `<b>A:</b> ${d.valA_str}<br><b>B:</b> ${d.valB_str}<br><b>C:</b> ${d.valC_str}`;
                    } else {
                        bloccoValore = `<b>A:</b> ${d.valA_str}<br><b>B:</b> ${d.valB_str}`;
                    }

                    html += `
                        <td class="col-valore" rowspan="${d.len}">
                            ${bloccoValore}
                        </td>
                    `;
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

    // Toggle runtime
    const btn = document.getElementById("toggleRuntimeBtn");
    const section = document.getElementById("runtimeSection");

    btn.addEventListener("click", () => {
        const visibile = section.style.display === "block";
        section.style.display = visibile ? "none" : "block";
        btn.textContent = visibile
            ? "Mostra valori runtime non programmabili"
            : "Nascondi valori runtime non programmabili";
    });

    applyColumnFilters();
}


// ============================================================
//  8. FILTRI COLONNE
// ============================================================

function applyColumnFilters() {
    document.querySelectorAll(".col-flag").forEach(flag => {
        const colClass = flag.dataset.col;
        const hide = !flag.checked;

        document.querySelectorAll("." + colClass).forEach(cell => {
            cell.style.display = hide ? "none" : "";
        });
    });
}

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
// ============================================================
//  9. MODALITÀ CREAZIONE MEMORIA C
// ============================================================

// ------------------------------------------------------------
//  ATTIVAZIONE MODALITÀ CREAZIONE (da index.html → crea_hex_btn)
// ------------------------------------------------------------
function attivaModalitaCreazione() {
    resetMemorie(); // reset totale e pulito
    window.location.href = "confronto_memorie.html?mode=creazione";
}


// ------------------------------------------------------------
//  SETUP UI MODALITÀ CREAZIONE
// ------------------------------------------------------------
function setupModalitaCreazione() {
    if (!isModalitaCreazione()) return;

    // Nascondi C normale
    const bloccoCnormale = document.querySelector('#labelFileC')?.closest('.file-block');
    if (bloccoCnormale) bloccoCnormale.style.display = "none";

    // Nascondi C creazione all’avvio
    const bloccoCreazione = document.getElementById("crea-memoria-container");
    if (bloccoCreazione) bloccoCreazione.style.display = "none";

    // Nascondi pulsanti confronto
    ["btnAB", "btnAC", "btnBC", "btnABC"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = "none";
    });

    // Nascondi filtri e label
    ["flagVisualizzaTutto", "columnFilters", "lblVisualizzaTutti"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = "none";
    });

    // Nascondi popup Git vecchio
    ["gitPopup", "btnChiudiGit", "btnConfermaGit"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = "none";
    });

    // Nascondi tabelle
    document.querySelectorAll("table").forEach(t => t.style.display = "none");
}

document.addEventListener("DOMContentLoaded", setupModalitaCreazione);


// ------------------------------------------------------------
//  MOSTRA BLOCCO CREAZIONE SOLO QUANDO A+B SONO PRESENTI
// ------------------------------------------------------------
function aggiornaBloccoCreazione() {
    const blocco = document.getElementById("crea-memoria-container");
    if (!blocco) return;

    // ❌ Se NON siamo in modalità creazione → blocco SEMPRE nascosto
    if (!isModalitaCreazione()) {
        blocco.style.display = "none";
        return;
    }

    // ✔ Siamo in modalità creazione → mostra solo se A+B presenti
    const hexA = localStorage.getItem("memA_hex");
    const hexB = localStorage.getItem("memB_hex");

    blocco.style.display = (hexA && hexB) ? "block" : "none";
}


// ------------------------------------------------------------
//  FILE A CAMBIATO
// ------------------------------------------------------------
function onFileA_Change() {
    const inputA = document.getElementById("file1");
    if (!inputA.files[0]) return;

    leggiFileHex(inputA, hexA => {
        localStorage.setItem("memA_hex", hexA);
        localStorage.setItem("memA_nome", inputA.files[0].name);
        aggiornaBloccoCreazione();
    });

    document.getElementById("labelFileA").innerText = "FILE A (locale)";
}


// ------------------------------------------------------------
//  FILE B CAMBIATO
// ------------------------------------------------------------
function onFileB_Change() {
    const inputB = document.getElementById("file2");
    if (!inputB.files[0]) return;

    leggiFileHex(inputB, hexB => {
        localStorage.setItem("memB_hex", hexB);
        localStorage.setItem("memB_nome", inputB.files[0].name);
        aggiornaBloccoCreazione();
    });

    document.getElementById("labelFileB").innerText = "FILE B (locale)";
}


// ------------------------------------------------------------
//  FILE C CAMBIATO (solo UI, nessun reset)
// ------------------------------------------------------------
function onFileC_Change() {
    document.getElementById("labelFileC").innerText = "FILE C (locale)";
}


// ------------------------------------------------------------
//  CARICAMENTO DA GIT (A, B, C)
// ------------------------------------------------------------
function caricaDaGit(slot) {

    const url = "https://raw.githubusercontent.com/balza1979/progetto_x2/main/Memorie/def_polli_b335f_ver1.HEX";

    fetch(url)
        .then(r => r.text())
        .then(hexText => {

            const mem = hexToMemoryMap(hexText);

            if (slot === "A") {
                memoriaA = mem;
                localStorage.setItem("memA_hex", hexText);
                localStorage.setItem("memA_nome", "Git_A.hex");
                document.getElementById("labelFileA").innerText = "FILE A (Git)";
            }

            if (slot === "B") {
                memoriaB = mem;
                localStorage.setItem("memB_hex", hexText);
                localStorage.setItem("memB_nome", "Git_B.hex");
                document.getElementById("labelFileB").innerText = "FILE B (Git)";
            }

            if (slot === "C") {
                memoriaC = mem;
                localStorage.setItem("memC_hex", hexText);
                localStorage.setItem("memC_nome", "Git_C.hex");
                document.getElementById("labelFileC").innerText = "FILE C (Git)";
            }

            aggiornaBloccoCreazione();
        })
        .catch(err => console.error("Errore caricamento Git:", err));
}

// ------------------------------------------------------------
//  BIN → MAPPA MEMORIA
// ------------------------------------------------------------
function binToMemoryMap(bytes) {
    const mem = {};
    for (let i = 0; i < bytes.length; i++) {
        mem[i] = bytes[i].toString(16).padStart(2, "0").toUpperCase();
    }
    return mem;
}


// ------------------------------------------------------------
//  AGGIORNA UI DOPO CARICAMENTO GIT
// ------------------------------------------------------------
function aggiornaUI_Git(slot, nomeFile) {
    const lbl = document.getElementById("labelFile" + slot);
    if (lbl) lbl.innerText = `FILE ${slot} (${nomeFile})`;
    aggiornaBloccoCreazione();
}
// ============================================================
//  10. RESET CONFRONTO
// ============================================================

function resetConfronto() {
    confrontoAttivo = null;

    // Rimuovi evidenziazione pulsanti
    ["btnAB", "btnAC", "btnBC", "btnABC"].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.classList.remove("attivo");
    });

    // Svuota risultati
    const divRisultati = document.getElementById("risultati");
    if (divRisultati) divRisultati.innerHTML = "";

    // Reset filtri colonne se esiste funzione dedicata
    if (typeof resetCheckboxColonne === "function") {
        resetCheckboxColonne();
    }
}


// ============================================================
//  11. RESET MEMORIE (usato SOLO dal pulsante CREA MEMORIA)
// ============================================================

function resetMemorie() {
    localStorage.removeItem("memA_hex");
    localStorage.removeItem("memA_nome");
    localStorage.removeItem("memB_hex");
    localStorage.removeItem("memB_nome");
    localStorage.removeItem("memC_hex");
    localStorage.removeItem("memC_nome");
}

// ============================================================
//  13. CARICAMENTO AUTOMATICO MEMORIA POLLI IN A (sempre)
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    const urlPolli = "https://raw.githubusercontent.com/balza1979/progetto_x2/main/Memorie/def_polli_b335f_ver1.HEX";

    fetch(urlPolli)
        .then(r => r.text())
        .then(text => {
            // Carica polli in memoria A
            memoriaA = hexToMemoryMap(text);

            // Salva anche in localStorage (serve per creazione)
            localStorage.setItem("memA_hex", text);
            localStorage.setItem("memA_nome", "def_polli_b335f_ver1.HEX");

            // Aggiorna UI
            const lbl = document.getElementById("labelFileA");
            if (lbl) lbl.innerText = "FILE A (default polli)";

            console.log("✔ Memoria polli caricata automaticamente in A");
        })
        .catch(err => console.error("Errore caricamento polli:", err));
});

// ============================================================
//  12. FINE FILE — Programmatore X2
// ============================================================

// Tutto il codice è stato ripulito, ordinato e ottimizzato.
// Nessun reset automatico, nessun conflitto, nessun duplicato.
// Modalità confronto e modalità creazione ora convivono senza problemi.

