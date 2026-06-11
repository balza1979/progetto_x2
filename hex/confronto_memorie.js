/* ===== CONFRONTO_MEMORIE.JS – SOLO CONFRONTO – PARTE 1/3 ===== */
/* Versione 2026-06-11 13:05 */

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
//  CONFRONTO A–B–C (LOGICA COMPLETA DIFFERENZE)
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

/* ===== FINE PARTE 1/3 ===== */
/* ===== CONFRONTO_MEMORIE.JS – SOLO CONFRONTO – PARTE 2/3 ===== */
/* Versione 2026-06-11 13:10 */

// ------------------------------------------------------------
//  FUNZIONI DI CONFRONTO (AB / AC / BC / ABC)
// ------------------------------------------------------------
function confrontaAB() {
    evidenziaPulsante("btnAB");
    confrontoAttivo = "A-B";

    const f1 = document.getElementById("file1");
    const f2 = document.getElementById("file2");

    if (!f2.files[0] && !memoriaB) {
        alert("Seleziona File B");
        return;
    }

    // A: file o memoria salvata
    let sorgenteA;
    if (f1.files[0]) {
        sorgenteA = new Promise(res => leggiFileHex(f1, hexA => res(hexA)));
    } else if (memoriaA) {
        sorgenteA = Promise.resolve(memoriaA);
    } else {
        alert("Seleziona File A oppure usa la memoria DEFAULT");
        return;
    }

    // B: file o memoria salvata
    let sorgenteB;
    if (f2.files[0]) {
        sorgenteB = new Promise(res => leggiFileHex(f2, hexB => res(hexB)));
    } else if (memoriaB) {
        sorgenteB = Promise.resolve(memoriaB);
    } else {
        alert("Seleziona File B");
        return;
    }

    Promise.all([sorgenteA, sorgenteB]).then(([memA, memB]) => {
        const mA = typeof memA === "string" ? hexToMemoryMap(memA) : memA;
        const mB = typeof memB === "string" ? hexToMemoryMap(memB) : memB;
        const mC = {}; // C non usata

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

    if (!f3.files[0] && !memoriaC) {
        alert("Seleziona File C");
        return;
    }

    let sorgenteA;
    if (f1.files[0]) {
        sorgenteA = new Promise(res => leggiFileHex(f1, hexA => res(hexA)));
    } else if (memoriaA) {
        sorgenteA = Promise.resolve(memoriaA);
    } else {
        alert("Seleziona File A oppure usa la memoria DEFAULT");
        return;
    }

    let sorgenteC;
    if (f3.files[0]) {
        sorgenteC = new Promise(res => leggiFileHex(f3, hexC => res(hexC)));
    } else {
        sorgenteC = Promise.resolve(memoriaC);
    }

    Promise.all([sorgenteA, sorgenteC]).then(([memA, memC]) => {
        const mA = typeof memA === "string" ? hexToMemoryMap(memA) : memA;
        const mC = typeof memC === "string" ? hexToMemoryMap(memC) : memC;
        const mB = {}; // B non usata

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

    if (!f2.files[0] && !memoriaB) return alert("Seleziona File B");
    if (!f3.files[0] && !memoriaC) return alert("Seleziona File C");

    let sorgenteB = f2.files[0]
        ? new Promise(res => leggiFileHex(f2, hexB => res(hexB)))
        : Promise.resolve(memoriaB);

    let sorgenteC = f3.files[0]
        ? new Promise(res => leggiFileHex(f3, hexC => res(hexC)))
        : Promise.resolve(memoriaC);

    Promise.all([sorgenteB, sorgenteC]).then(([memB, memC]) => {
        const mB = typeof memB === "string" ? hexToMemoryMap(memB) : memB;
        const mC = typeof memC === "string" ? hexToMemoryMap(memC) : memC;
        const mA = {}; // A non usata

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

    if (!f2.files[0] && !memoriaB) return alert("Seleziona File B");
    if (!f3.files[0] && !memoriaC) return alert("Seleziona File C");

    let sorgenteA = f1.files[0]
        ? new Promise(res => leggiFileHex(f1, hexA => res(hexA)))
        : Promise.resolve(memoriaA);

    let sorgenteB = f2.files[0]
        ? new Promise(res => leggiFileHex(f2, hexB => res(hexB)))
        : Promise.resolve(memoriaB);

    let sorgenteC = f3.files[0]
        ? new Promise(res => leggiFileHex(f3, hexC => res(hexC)))
        : Promise.resolve(memoriaC);

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

        if (id === idAttivo) btn.classList.add("attivo");
        else btn.classList.remove("attivo");
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

    const lblA = chkA.closest("label");
    const lblB = chkB.closest("label");
    const lblC = chkC.closest("label");

    // Default: mostro tutte le label
    if (lblA) lblA.style.display = "";
    if (lblB) lblB.style.display = "";
    if (lblC) lblC.style.display = "";

    if (confrontoAttivo === "A-B") {
        chkA.checked = true;
        chkB.checked = true;
        chkC.checked = false;
        if (lblC) lblC.style.display = "none";   // nascondi filtro C
    }

    if (confrontoAttivo === "A-C") {
        chkA.checked = true;
        chkB.checked = false;
        chkC.checked = true;
        if (lblB) lblB.style.display = "none";   // nascondi filtro B
    }

    if (confrontoAttivo === "B-C") {
        chkA.checked = false;
        chkB.checked = true;
        chkC.checked = true;
        if (lblA) lblA.style.display = "none";   // nascondi filtro A
    }

    if (confrontoAttivo === "A-B-C") {
        chkA.checked = true;
        chkB.checked = true;
        chkC.checked = true;
        // tutti i filtri visibili
    }

    applyColumnFilters();
}

/* ===== FINE PARTE 2/3 ===== */
/* ===== CONFRONTO_MEMORIE.JS – SOLO CONFRONTO – PARTE 3/3 ===== */
/* Versione 2026-06-11 13:15 */

// ------------------------------------------------------------
//  CARICAMENTO AUTOMATICO: LOCALSTORAGE → POLLI FALLBACK
// ------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {

    const hexA = localStorage.getItem("memA_hex");
    const hexB = localStorage.getItem("memB_hex");
    const hexC = localStorage.getItem("memC_hex");

    const nomeA = localStorage.getItem("memA_nome");
    const nomeB = localStorage.getItem("memB_nome");
    const nomeC = localStorage.getItem("memC_nome");

    let haLocal = false;

    if (hexA) {
        memoriaA = hexToMemoryMap(hexA);
        haLocal = true;
        const lblA = document.getElementById("labelFileA");
        if (lblA) lblA.textContent = `FILE A (salvato: ${nomeA})`;
    }

    if (hexB) {
        memoriaB = hexToMemoryMap(hexB);
        haLocal = true;
        const lblB = document.getElementById("labelFileB");
        if (lblB) lblB.textContent = `FILE B (salvato: ${nomeB})`;
    }

    if (hexC) {
        memoriaC = hexToMemoryMap(hexC);
        haLocal = true;
        const lblC = document.getElementById("labelFileC");
        if (lblC) lblC.textContent = `FILE C (salvato: ${nomeC})`;
    }

    if (haLocal) {
        console.log("Uso memorie da localStorage, nessun fallback polli.");
        return;
    }

    // FALLBACK POLLI → SOLO SE NON ESISTE NULLA
    const urlPolli =
        "https://raw.githubusercontent.com/balza1979/progetto_x2/main/Memorie/def_polli_b335f_ver1.HEX";

    fetch(urlPolli)
        .then(r => r.text())
        .then(text => {
            memoriaA = hexToMemoryMap(text);
            console.log("Caricata memoria POLLI come default A");
        })
        .catch(err => console.error("Errore caricamento polli:", err));
});

// ------------------------------------------------------------
//  GIT LOADER (A / B / C)
// ------------------------------------------------------------
function caricaDaGit(slot) {

    const url =
        "https://raw.githubusercontent.com/balza1979/progetto_x2/main/hex/polli.hex";

    fetch(url)
        .then(r => r.arrayBuffer())
        .then(buffer => {
            const bytes = new Uint8Array(buffer);
            const isHex = (bytes[0] === 58);

            let mem;
            let hexText = null;

            if (isHex) {
                hexText = new TextDecoder().decode(bytes);
                mem = hexToMemoryMap(hexText);
            } else {
                mem = binToMemoryMap(bytes);
            }

            if (slot === "A") {
                memoriaA = mem;
                if (hexText) {
                    localStorage.setItem("memA_hex", hexText);
                    localStorage.setItem("memA_nome", "Git_A.hex");
                }
                document.getElementById("labelFileA").innerText = "FILE A (Git)";
            }

            if (slot === "B") {
                memoriaB = mem;
                if (hexText) {
                    localStorage.setItem("memB_hex", hexText);
                    localStorage.setItem("memB_nome", "Git_B.hex");
                }
                document.getElementById("labelFileB").innerText = "FILE B (Git)";
            }

            if (slot === "C") {
                memoriaC = mem;
                if (hexText) {
                    localStorage.setItem("memC_hex", hexText);
                    localStorage.setItem("memC_nome", "Git_C.hex");
                }
                document.getElementById("labelFileC").innerText = "FILE C (Git)";
            }

            resetConfronto();
            alert(`File Git caricato in ${slot}`);
        })
        .catch(err => {
            console.error("Errore Git:", err);
            alert("Errore nel caricamento del file da Git");
        });
}

function binToMemoryMap(bytes) {
    const mem = {};
    for (let i = 0; i < bytes.length; i++) {
        mem[i] = bytes[i].toString(16).padStart(2, "0").toUpperCase();
    }
    return mem;
}

// ------------------------------------------------------------
//  RESET CONFRONTO
// ------------------------------------------------------------
function resetConfronto() {
    confrontoAttivo = null;

    const ids = ["btnAB", "btnAC", "btnBC", "btnABC"];
    ids.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.classList.remove("attivo");
    });

    const div = document.getElementById("risultati");
    if (div) div.innerHTML = "";
}

// ------------------------------------------------------------
//  FILE CHANGE (A / B / C)
// ------------------------------------------------------------
function onFileA_Change() {
    resetConfronto();

    const inputA = document.getElementById("file1");
    if (!inputA.files[0]) return;

    leggiFileHex(inputA, hexA => {
        if (!hexA) return;

        localStorage.setItem("memA_hex", hexA);
        localStorage.setItem("memA_nome", inputA.files[0].name);

        memoriaA = hexToMemoryMap(hexA);
        document.getElementById("labelFileA").innerText = "FILE A (locale)";
    });
}

function onFileB_Change() {
    resetConfronto();

    const inputB = document.getElementById("file2");
    if (!inputB.files[0]) return;

    leggiFileHex(inputB, hexB => {
        if (!hexB) return;

        localStorage.setItem("memB_hex", hexB);
        localStorage.setItem("memB_nome", inputB.files[0].name);

        memoriaB = hexToMemoryMap(hexB);
        document.getElementById("labelFileB").innerText = "FILE B (locale)";
    });
}

function onFileC_Change() {
    resetConfronto();

    const inputC = document.getElementById("file3");
    if (!inputC.files[0]) return;

    leggiFileHex(inputC, hexC => {
        if (!hexC) return;

        localStorage.setItem("memC_hex", hexC);
        localStorage.setItem("memC_nome", inputC.files[0].name);

        memoriaC = hexToMemoryMap(hexC);
        document.getElementById("labelFileC").innerText = "FILE C (locale)";
    });
}

/* ===== FINE PARTE 3/3 ===== */
