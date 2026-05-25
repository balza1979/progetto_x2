// ============================================================
//  CONFRONTO_MEMORIE.JS – VERSIONE 25/05/2026 (CORRETTA)
// ============================================================

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
function apriErrori() { window.location.href = "errori_x2.html"; }

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
    if (!bytes || bytes.includes("--")) return "--";
    const b = bytes.map(x => parseInt(x, 16));
    if (b.length === 4) return b[2]*16777216 + b[3]*65536 + b[0]*256 + b[1];
    if (b.length === 2) return b[0]*256 + b[1];
    if (b.length === 1) return b[0];
    return "--";
}

// ------------------------------------------------------------
//  CERCA IMPOSTAZIONE NEL JSON
// ------------------------------------------------------------
async function x2_trovaImpostazione(parametroCodice, valore) {
    return new Promise(resolve => {
        if (valore === null || valore === undefined || valore === "--") { resolve("—"); return; }
        const url = "/progetto_x2/json_tendine/" + parametroCodice + ".json";
        fetch(url)
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (!data || !data.valori) { resolve("—"); return; }
                const voce = data.valori.find(v => v.id == valore);
                resolve(voce ? voce.text : "—");
            })
            .catch(() => resolve("—"));
    });
}

// ------------------------------------------------------------
//  CONFRONTO A–B (2 MEMORIE)
// ------------------------------------------------------------
function compareMemory(memA, memB) {
    const diff = [], runtime = [], giàGestiti = new Set();
    const visualizzaTutto = document.getElementById("flagVisualizzaTutto")?.checked;
    for (let addr of indirizziRuntime) runtime.push({addr,vA:memA[addr]??"--",vB:memB[addr]??"--",vC:"--"});
    for (const p of x2_parametri) {
        const base = parseInt(p.LIBERA1,16), len = parseInt(p.LIBERA4);
        if (isNaN(base)||isNaN(len)||giàGestiti.has(base)) continue;
        for (let i=0;i<len;i++) giàGestiti.add(base+i);
        const bytesA=[],bytesB=[];
        for (let i=0;i<len;i++){const a=base+i;bytesA.push(memA[a]??"--");bytesB.push(memB[a]??"--");}
        const diversi=bytesA.some((b,i)=>b!==bytesB[i]);
        const valA=ricostruisciValore(bytesA), valB=ricostruisciValore(bytesB);
        if (visualizzaTutto||diversi||valA!==valB) diff.push({base,len,nome:p.DESCRIZIONE||p.PARAMETRO,codice:p.PARAMETRO,bytesA,bytesB,bytesC:null,valA_str:valA,valB_str:valB,valC_str:""});
    }
    return {diff,runtime};
}

// ===== BLOCCO 1 FINITO =====
// ------------------------------------------------------------
//  CONFRONTO A–B–C (3 MEMORIE)
// ------------------------------------------------------------
function compareMemory3(memA, memB, memC) {
    const diff = [], runtime = [], giàGestiti = new Set();
    const visualizzaTutto = document.getElementById("flagVisualizzaTutto")?.checked;
    for (let addr of indirizziRuntime) runtime.push({addr,vA:memA[addr]??"--",vB:memB[addr]??"--",vC:memC[addr]??"--"});
    for (const p of x2_parametri) {
        const base=parseInt(p.LIBERA1,16), len=parseInt(p.LIBERA4);
        if (isNaN(base)||isNaN(len)||giàGestiti.has(base)) continue;
        for (let i=0;i<len;i++) giàGestiti.add(base+i);
        const bytesA=[],bytesB=[],bytesC=[];
        for (let i=0;i<len;i++){const a=base+i;bytesA.push(memA[a]??"--");bytesB.push(memB[a]??"--");bytesC.push(memC[a]??"--");}
        const diversi=bytesA.some((b,i)=>b!==bytesB[i])||bytesA.some((b,i)=>b!==bytesC[i])||bytesB.some((b,i)=>b!==bytesC[i]);
        const valA=ricostruisciValore(bytesA), valB=ricostruisciValore(bytesB), valC=ricostruisciValore(bytesC);
        if (visualizzaTutto||diversi||valA!==valB||valA!==valC||valB!==valC) diff.push({base,len,nome:p.DESCRIZIONE||p.PARAMETRO,codice:p.PARAMETRO,bytesA,bytesB,bytesC,valA_str:valA,valB_str:valB,valC_str:valC});
    }
    return {diff,runtime};
}

// ------------------------------------------------------------
//  RENDER RISULTATI
// ------------------------------------------------------------
// ------------------------------------------------------------
//  RENDER RISULTATI (corretto per A-B, A-C, B-C, A-B-C)
// ------------------------------------------------------------
async function renderResults(result) {
    const lista = result.diff;
    const runtime = result.runtime;
    let html = `<h3>DIFFERENZE PARAMETRI</h3>`;

    if (lista.length === 0) {
        html += `<div style="margin:15px;padding:12px;background:#113311;color:#88ff88;">
        ✔ I parametri risultano equivalenti.</div>`;
    } else {
        html += `<table id="tabDiff"><tr>
        <th>Indirizzo</th><th>Valore A</th><th>Valore B</th><th>Valore C</th>
        <th>Parametro</th><th>Valore complessivo</th><th>Impostazione</th></tr>`;

        for (let d of lista) {
            for (let i=0;i<d.len;i++) {
                html += `<tr><td>0x${(d.base+i).toString(16).padStart(4,"0").toUpperCase()}</td>
                <td class="col-valA">${formatVal(d.bytesA[i])}</td>
                <td class="col-valB">${formatVal(d.bytesB[i])}</td>
                <td class="col-valC">${d.bytesC?formatVal(d.bytesC[i]):"--"}</td>
                <td>${d.codice} – ${d.nome}</td>`;

                if (i===0) {
                    // --- Valore complessivo ---
                    if (confrontoAttivo === "A-C") {
                        html += `<td rowspan="${d.len}"><b>A:</b>${d.valA_str}<br><b>C:</b>${d.valC_str}</td>`;
                        html += `<td rowspan="${d.len}">${await x2_trovaImpostazione(d.codice, d.valA_str)}</td>`;
                    } else if (confrontoAttivo === "B-C") {
                        html += `<td rowspan="${d.len}"><b>B:</b>${d.valB_str}<br><b>C:</b>${d.valC_str}</td>`;
                        html += `<td rowspan="${d.len}">${await x2_trovaImpostazione(d.codice, d.valB_str)}</td>`;
                    } else if (confrontoAttivo === "A-B-C") {
                        html += `<td rowspan="${d.len}"><b>A:</b>${d.valA_str}<br><b>B:</b>${d.valB_str}<br><b>C:</b>${d.valC_str}</td>`;
                        html += `<td rowspan="${d.len}">${await x2_trovaImpostazione(d.codice, d.valA_str)}</td>`;
                    } else { // default A-B
                        html += `<td rowspan="${d.len}"><b>A:</b>${d.valA_str}<br><b>B:</b>${d.valB_str}</td>`;
                        html += `<td rowspan="${d.len}">${await x2_trovaImpostazione(d.codice, d.valA_str)}</td>`;
                    }
                }
                html += `</tr>`;
            }
        }
        html += `</table>`;
    }

    document.getElementById("risultati").innerHTML = html;
}

}

// ===== BLOCCO 2 FINITO =====
// ------------------------------------------------------------
//  FUNZIONI DI CONFRONTO
// ------------------------------------------------------------
function confronta(memFileA, memFileB) {
    const mem1 = typeof memFileA === "string" ? hexToMemoryMap(memFileA) : memFileA;
    const mem2 = typeof memFileB === "string" ? hexToMemoryMap(memFileB) : memFileB;
    const result = compareMemory(mem1, mem2);
    renderResults(result);
}

function confrontaAB() {
    evidenziaPulsante("btnAB");
    confrontoAttivo = "A-B";
    const f1 = document.getElementById("file1");
    const f2 = document.getElementById("file2");
    if (!f2.files[0]) return alert("Seleziona File B");
    if (!f1.files[0] && memoriaA) {
        leggiFileHex(f2, hexB => { confronta(memoriaA, hexB); });
        return;
    }
    if (f1.files[0]) {
        leggiFileHex(f1, hexA => leggiFileHex(f2, hexB => { confronta(hexA, hexB); }));
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
        const mB = {};
        const result = compareMemory3(mA, mB, mC);
        renderResults(result);
    });
}

function confrontaBC() {
    evidenziaPulsante("btnBC");
    confrontoAttivo = "B-C";
    const f2 = document.getElementById("file2");
    const f3 = document.getElementById("file3");
    if (!f2.files[0] || !f3.files[0]) return alert("Seleziona File B e File C");
    const sorgenteB = new Promise(res => leggiFileHex(f2, hexB => res(hexB)));
    const sorgenteC = new Promise(res => leggiFileHex(f3, hexC => res(hexC)));
    Promise.all([sorgenteB, sorgenteC]).then(([memB, memC]) => {
        const mB = typeof memB === "string" ? hexToMemoryMap(memB) : memB;
        const mC = typeof memC === "string" ? hexToMemoryMap(memC) : memC;
        const mA = {};
        const result = compareMemory3(mA, mB, mC);
        renderResults(result);
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
//  GESTIONE CHECKBOX COLONNE
// ------------------------------------------------------------
function aggiornaCheckboxColonne() {
    const chkA = document.querySelector('input[data-col="col-valA"]');
    const chkB = document.querySelector('input[data-col="col-valB"]');
    const chkC = document.querySelector('input[data-col="col-valC"]');
    if (!chkA || !chkB || !chkC) { applyColumnFilters(); return; }
    if (confrontoAttivo === "A-B") { chkA.checked = true; chkB.checked = true; chkC.checked = false; }
    if (confrontoAttivo === "A-C") { chkA.checked = true; chkB.checked = false; chkC.checked = true; }
    if (confrontoAttivo === "B-C") { chkA.checked = false; chkB.checked = true; chkC.checked = true; }
    if (confrontoAttivo === "A-B-C") { chkA.checked = true; chkB.checked = true; chkC.checked = true; }
    applyColumnFilters();
}

function applyColumnFilters() {
    document.querySelectorAll(".col-flag").forEach(flag => {
        const colClass = flag.dataset.col;
        const hide = !flag.checked;
        document.querySelectorAll("." + colClass).forEach(cell => {
            cell.style.display = hide ? "none" : "";
        });
    });
}

// ===== BLOCCO 3 FINITO =====
// ------------------------------------------------------------
//  SALVATAGGIO FILE A/B/C IN LOCALSTORAGE
// ------------------------------------------------------------
function salvaFile(lettera, input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        const hexText = e.target.result;
        localStorage.setItem("memoria" + lettera, hexText);
        if (lettera === "A") memoriaA = hexToMemoryMap(hexText);
        if (lettera === "B") memoriaB = hexToMemoryMap(hexText);
        if (lettera === "C") memoriaC = hexToMemoryMap(hexText);
    };
    reader.readAsText(file);
}

// ------------------------------------------------------------
//  CARICAMENTO AUTOMATICO MEMORIA POLLI IN A
// ------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    const urlPolli = "https://raw.githubusercontent.com/balza1979/progetto_x2/main/Memorie/def_polli_b335f_ver1.HEX";
    fetch(urlPolli)
        .then(r => r.text())
        .then(text => { memoriaA = hexToMemoryMap(text); })
        .catch(err => console.error("Errore caricamento polli:", err));
});

// ===== FILE FINITO =====
