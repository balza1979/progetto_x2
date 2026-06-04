
// ============================================================
//  CONFRONTO_MEMORIE.JS V  –resetta pagina con alert 4 6 26 14:03 VERSIONE FIX NASCONDE CAMPI NON NECESSARI E MEMORIA C FINO A SELEZ MEMORIAB  29/05/2026 1605
// ============================================================
// =========================================
// MODALITÀ CREAZIONE MEMORIA C (attivazione)
// Versione 2026-05-29 12:25
// =========================================

function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

function isModalitaCreazione() {
    return getQueryParam("mode") === "creazione";
}

document.addEventListener("DOMContentLoaded", function () {
    if (isModalitaCreazione()) {
		
		/* ===== INIZIO MODIFICA 2026-06-04 13:55 – Reset memorie + reload pagina ===== */
const haMemorieSalvate =
    localStorage.getItem("memA_hex") ||
    localStorage.getItem("memB_hex") ||
    localStorage.getItem("memC_hex");

if (haMemorieSalvate) {
    resetMemorie();        // reset con alert
    location.reload();     // ricarica la pagina
    return;                // FERMA l'esecuzione del blocco
}
/* ===== FINE MODIFICA 2026-06-04 13:55 – Reset memorie + reload pagina ===== */

		
		
		
        const blocco = document.getElementById("crea-memoria-container");
        if (blocco) blocco.style.display = "block";

        // Carica A/B da localStorage (solo visualizzazione)

		/* ===== INIZIO MODIFICA 2026-05-29 16:05 – Loader A/B da localStorage ===== */

const hexA = localStorage.getItem("memA_hex");
const nomeA = localStorage.getItem("memA_nome");

const hexB = localStorage.getItem("memB_hex");
const nomeB = localStorage.getItem("memB_nome");

// Se esiste A → ricostruisci memoriaA + fake file + label
if (hexA) {
    memoriaA = hexToMemoryMap(hexA);

    const fakeA = fakeFile(nomeA || "FILE_A.hex", hexA);
    const inputA = document.getElementById("file1");
    if (inputA) inputA.files = fakeA;

    const lblA = document.getElementById("labelFileA");
    if (lblA) lblA.textContent = `FILE A: ${nomeA}`;
}

// Se esiste B → ricostruisci memoriaB + fake file + label
if (hexB) {
    memoriaB = hexToMemoryMap(hexB);

    const fakeB = fakeFile(nomeB || "FILE_B.hex", hexB);
    const inputB = document.getElementById("file2");
    if (inputB) inputB.files = fakeB;

    const lblB = document.getElementById("labelFileB");
    if (lblB) lblB.textContent = `FILE B: ${nomeB}`;
}

/* ===== FINE MODIFICA 2026-05-29 16:05 – Loader A/B da localStorage ===== */

/* ===== INIZIO MODIFICA 2026-05-29 16:12 – Mostra blocco creazione solo se A e B presenti ===== */

const bloccoCreazione = document.getElementById("crea-memoria-container");

if (bloccoCreazione) {
    if (hexA && hexB) {
        // A e B presenti → mostra blocco
        bloccoCreazione.style.display = "block";
    } else {
        // Mancano A o B → nascondi blocco
        bloccoCreazione.style.display = "none";
    }
}

/* ===== FINE MODIFICA 2026-05-29 16:12 – Mostra blocco creazione solo se A e B presenti ===== */

		
        if (window.memorieABC) {
            memorieABC.carica();
            const A = memorieABC.getA();
            const B = memorieABC.getB();

            const infoA = document.getElementById("info-memoria-a");
            const infoB = document.getElementById("info-memoria-b");

            if (infoA) infoA.textContent = A ? "caricata" : "non caricata";
            if (infoB) infoB.textContent = B ? "caricata" : "non caricata";
        }
    }
});
// =========================================
// PASSO A.3 – Disabilita caricamento A/B/C in modalità creazione
// Versione 2026-05-29 12:30
// =========================================

function disabilitaCaricamentoABC() {
    if (!isModalitaCreazione()) return;

    // Disabilita SOLO FILE C
    const fileC = document.getElementById("file3");
    if (fileC) {
        fileC.disabled = true;
        fileC.style.opacity = "0.4";
        fileC.style.pointerEvents = "none";
    }

    // Disabilita SOLO pulsanti Git di C
    const btnGitC = document.querySelector('button[data-slot="C"]');
    if (btnGitC) {
        btnGitC.disabled = true;
        btnGitC.style.opacity = "0.4";
        btnGitC.style.pointerEvents = "none";
    }

    // NON toccare A e B
}

// =========================================
// PASSO A.4.0 – Gestione UI Creazione Memoria
// Versione 2026-05-29 13:50
// =========================================

function setupModalitaCreazione() {
    if (!isModalitaCreazione()) return;

    // 1) Nascondi completamente il blocco FILE C
const bloccoC = document.querySelector('#labelFileC')?.closest('.file-block');
if (bloccoC) bloccoC.style.display = "none";


    // 2) Nascondi pulsanti confronto
    ["btnAB", "btnAC", "btnBC", "btnABC"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = "none";
    });

    // 3) Nascondi filtri e opzioni
    ["flagVisualizzaTutto", "columnFilters"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = "none";
    });

 // 4) Nascondi SOLO il vecchio popup Git
["gitPopup", "btnChiudiGit", "btnConfermaGit"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
});

// NON nascondere gitList → serve per la tendina moderna


    // 5) Nascondi tabella risultati
    document.querySelectorAll("table").forEach(t => {
        t.style.display = "none";
    });



	// 8) Nascondi la label "Visualizza TUTTI i parametri"
const lbl = document.getElementById("lblVisualizzaTutti");
if (lbl) lbl.style.display = "none";


	
		// 5.1) Nascondi pulsanti extra: "Visualizza errori registrati" e "Visualizza tutti parametri"
		document.querySelectorAll("button").forEach(btn => {
		    const t = btn.textContent.toLowerCase();
		
		    if (t.includes("errori") || t.includes("visualizza") || t.includes("parametri")) {
		        btn.style.display = "none";
		    }
		});


	
    // 6) Nascondi il blocco creazione finché B non è caricato
    // const blocco = document.getElementById("crea-memoria-container");
   //  if (blocco) blocco.style.display = "none";

    // 7) Quando B viene caricato → mostra blocco creazione
   /* ===== DISATTIVATO 2026-05-29 17:12 – rompe la modalità creazione =====
const oldOnFileB = onFileB_Change;
onFileB_Change = function (...args) {
    oldOnFileB.apply(this, args);

    const B = memorieABC.getB();
    if (B) {
        const blocco = document.getElementById("crea-memoria-container");
        if (blocco) blocco.style.display = "block";
    }
};
===== FINE DISATTIVATO ===== */

}

document.addEventListener("DOMContentLoaded", function () {
   setupModalitaCreazione();
});






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
//  CONFRONTO A–B
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
//  CONFRONTO A–B–C (PATCH COMPLETA DIFFERENZE)
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

        // PATCH DIFFERENZE CORRETTE
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
        else { // A-B
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

// ------------------------------------------------------------
//  RENDER RISULTATI
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
                        <td class="col-valC">${formatVal(d.bytesC[i])}</td>
                        <td class="col-parametro">${d.codice} – ${d.nome}</td>
                `;

                if (i === 0) {
                    if (confrontoAttivo === "A-C") {
                        html += `
                            <td class="col-valore" rowspan="${d.len}">
                                <b>A:</b> ${d.valA_str}<br><b>C:</b> ${d.valC_str}
                            </td>
                        `;
                    } else if (confrontoAttivo === "B-C") {
                        html += `
                            <td class="col-valore" rowspan="${d.len}">
                                <b>B:</b> ${d.valB_str}<br><b>C:</b> ${d.valC_str}
                            </td>
                        `;
                    } else if (confrontoAttivo === "A-B-C") {
                        html += `
                            <td class="col-valore" rowspan="${d.len}">
                                <b>A:</b> ${d.valA_str}<br><b>B:</b> ${d.valB_str}<br><b>C:</b> ${d.valC_str}
                            </td>
                        `;
                    } else {
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
// ------------------------------------------------------------
//  FUNZIONI DI CONFRONTO (AB / AC / BC / ABC)
// ------------------------------------------------------------
function confrontaAB() {
    evidenziaPulsante("btnAB");
    confrontoAttivo = "A-B";

    const f1 = document.getElementById("file1");
    const f2 = document.getElementById("file2");

    if (!f2.files[0]) {
        alert("Seleziona File B");
        return;
    }

    // Attendi memoriaA se non è pronta
    if (!f1.files[0] && !memoriaA) {
        console.log("A non pronta, riprovo tra 300ms...");
        setTimeout(confrontaAB, 300);
        return;
    }

    // Caso 1: A viene dal file
    if (f1.files[0]) {
        leggiFileHex(f1, hexA => {
            leggiFileHex(f2, hexB => {

                const mA = hexToMemoryMap(hexA);
                const mB = hexToMemoryMap(hexB);
                const mC = {}; // C mancante

                const result = compareMemory3(mA, mB, mC);
                renderResults(result);
                aggiornaCheckboxColonne();
            });
        });
        return;
    }

    // Caso 2: A = memoria default
    const mA = (typeof memoriaA === "string")
        ? hexToMemoryMap(memoriaA)
        : memoriaA;

    leggiFileHex(f2, hexB => {
        const mB = hexToMemoryMap(hexB);
        const mC = {}; // C mancante

        const result = compareMemory3(mA, mB, mC);
        renderResults(result);
        aggiornaCheckboxColonne();
    });
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

        const mB = {}; // B mancante

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

        const mA = {}; // A mancante

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
//  FILTRI COLONNE
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




/* ===== INIZIO PATCH 2026-05-29 16:35 – Salvataggio Git in localStorage ===== */
function caricaDaGit(slot) {

    // URL del file Git (puoi cambiarlo quando vuoi)
    const url = "https://raw.githubusercontent.com/balza1979/progetto_x2/main/hex/polli.hex";

    fetch(url)
        .then(r => r.arrayBuffer())
        .then(buffer => {
            const bytes = new Uint8Array(buffer);

            const isHex = (bytes[0] === 58); // ':' = 58

            let mem;
            let hexText = null;

            if (isHex) {
                hexText = new TextDecoder().decode(bytes);
                mem = hexToMemoryMap(hexText);
                console.log(`Caricato HEX da Git in ${slot}`);
            } else {
                mem = binToMemoryMap(bytes);
                console.log(`Caricato BIN da Git in ${slot}`);
            }

            // --- SLOT A ---
 /* ===== SLOT A – PATCH COMPLETA 2026-06-04 14:13 ===== */
if (slot === "A") {

    // 1) Salva memoria in RAM
    memoriaA = mem;

    // 2) Reset input locale
    document.getElementById("file1").value = "";

    // 3) Salva in localStorage come fa il caricamento locale
    if (hexText) {
        localStorage.setItem("memA_hex", hexText);
        localStorage.setItem("memA_nome", "Git_A.hex");
    }

    // 4) Aggiorna blocco creazione (A+B → mostra C)
    aggiornaBloccoCreazione();

    // 5) Richiama la stessa funzione del caricamento locale
    if (typeof onFileA_Change === "function") {
        onFileA_Change();
    }
}


/* ===== SLOT B – PATCH COMPLETA 2026-06-04 14:13 ===== */
if (slot === "B") {

    // 1) Salva memoria in RAM
    memoriaB = mem;

    // 2) Reset input locale
    document.getElementById("file2").value = "";

    // 3) Salva in localStorage come fa il caricamento locale
    if (hexText) {
        localStorage.setItem("memB_hex", hexText);
        localStorage.setItem("memB_nome", "Git_B.hex");
    }

    // 4) Aggiorna blocco creazione (A+B → mostra C)
    aggiornaBloccoCreazione();

    // 5) Richiama la stessa funzione del caricamento locale
    if (typeof onFileB_Change === "function") {
        onFileB_Change();
    }
}


/* ===== SLOT C – PATCH COMPLETA 2026-06-04 14:14 ===== */
if (slot === "C") {

    // 1) Salva memoria in RAM
    memoriaC = mem;

    // 2) Reset input locale
    document.getElementById("file3").value = "";

    // 3) Salva in localStorage (coerente con A e B)
    if (hexText) {
        localStorage.setItem("memC_hex", hexText);
        localStorage.setItem("memC_nome", "Git_C.hex");
    }

    // 4) Aggiorna label
    document.getElementById("labelFileC").innerText = "FILE C (caricato da Git)";
}

/* ===== FINE PATCH 2026-05-29 16:35 – Salvataggio Git in localStorage ===== */


function binToMemoryMap(bytes) {
    const mem = {};
    for (let i = 0; i < bytes.length; i++) {
        mem[i] = bytes[i].toString(16).padStart(2, "0").toUpperCase();
    }
    return mem;
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


// ------------------------------------------------------------
//  INIZIO MODIFICA 2026-05-27 12:30 - resetConfronto
// ------------------------------------------------------------
function resetConfronto() {
    // Azzeriamo il tipo di confronto attivo
    confrontoAttivo = null;

    // Rimettiamo tutti i pulsanti in stato "non attivo"
    const ids = ["btnAB", "btnAC", "btnBC", "btnABC"];
    ids.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.classList.remove("attivo");
    });

    // Svuotiamo la tabella risultati (adatta l'ID se è diverso)
    const divRisultati = document.getElementById("risultati");
    if (divRisultati) {
        divRisultati.innerHTML = "";
    }

    // Se hai una funzione che gestisce le checkbox colonne, puoi resettarle qui
    if (typeof resetCheckboxColonne === "function") {
        resetCheckboxColonne();
    }
}
// ------------------------------------------------------------
//  FINE MODIFICA 2026-05-27 12:30 - resetConfronto
// ------------------------------------------------------------
/* ===== INIZIO PATCH 2026-05-29 16:50 – Funzione aggiorna blocco creazione ===== */
function aggiornaBloccoCreazione() {
    const blocco = document.getElementById("crea-memoria-container");
    if (!blocco) return;

    const hexA = localStorage.getItem("memA_hex");
    const hexB = localStorage.getItem("memB_hex");

    if (hexA && hexB) {
        blocco.style.display = "block";
    } else {
        blocco.style.display = "none";
    }
}
/* ===== FINE PATCH 2026-05-29 16:50 – Funzione aggiorna blocco creazione ===== */


/* ===== INIZIO PATCH 2026-05-29 16:52 – Salvataggio FILE A + refresh blocco ===== */
function onFileA_Change() {
    resetConfronto();
    document.getElementById("labelFileA").innerText = "FILE A (locale)";

    const inputA = document.getElementById("file1");
    if (!inputA.files[0]) return;

    leggiFileHex(inputA, hexA => {
        if (!hexA) return;

        localStorage.setItem("memA_hex", hexA);
        localStorage.setItem("memA_nome", inputA.files[0].name);

        aggiornaBloccoCreazione();   // <── QUESTA È LA CHIAVE
    });
}
/* ===== FINE PATCH 2026-05-29 16:52 – Salvataggio FILE A + refresh blocco ===== */



/* ===== INIZIO PATCH 2026-05-29 16:52 – Salvataggio FILE B + refresh blocco ===== */
function onFileB_Change() {
    resetConfronto();
    document.getElementById("labelFileB").innerText = "FILE B (locale)";

    const inputB = document.getElementById("file2");
    if (!inputB.files[0]) return;

    leggiFileHex(inputB, hexB => {
        if (!hexB) return;

        localStorage.setItem("memB_hex", hexB);
        localStorage.setItem("memB_nome", inputB.files[0].name);

        aggiornaBloccoCreazione();   // <── QUESTA È LA CHIAVE
    });
}
/* ===== FINE PATCH 2026-05-29 16:52 – Salvataggio FILE B + refresh blocco ===== */



// FILE C cambiato
function onFileC_Change() {
    resetConfronto(); // reset confronto perché C è cambiato
	document.getElementById("labelFileC").innerText = "FILE C (locale)";

}

// ------------------------------------------------------------
//  FINE MODIFICA 2026-05-27 12:50 - reset su cambio file locale
// ------------------------------------------------------------
function resetMemorie() {
    localStorage.removeItem("memA_hex");
    localStorage.removeItem("memA_nome");
    localStorage.removeItem("memB_hex");
    localStorage.removeItem("memB_nome");
    localStorage.removeItem("memC_hex");
    localStorage.removeItem("memC_nome");
    alert("Memorie A, B e C cancellate. Ricarica la pagina.");
}
