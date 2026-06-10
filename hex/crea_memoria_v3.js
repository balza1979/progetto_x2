// CREA_MEMORIA.JS V3 — versione 8/6/26 11:24 resetta anche C
// Luca / Copilot

let memoriaA = null;
let memoriaB = null;

// ------------------------------------------------------------
// Utility HEX
// ------------------------------------------------------------
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

        const byteCount  = parseInt(line.substr(1, 2), 16);
        const address    = parseInt(line.substr(3, 4), 16);
        const recordType = parseInt(line.substr(7, 2), 16);

        if (recordType !== 0) continue; // solo record DATA

        for (let i = 0; i < byteCount; i++) {
            const byteHex = line.substr(9 + i * 2, 2).toUpperCase();
            mem[address + i] = byteHex;
        }
    }

    return mem;
}

// 🔥 Rendo hexToMemoryMap globale (serve a memorie_tipo.js)
window.hexToMemoryMap = hexToMemoryMap;

/* ============================================================
   Caricamento automatico Memoria A default
   ============================================================ */
async function caricaDefaultMemoriaA() {
    const nomeFile = "memoria_polli.hex";

    const urlRaw = "https://raw.githubusercontent.com/balza1979/progetto_x2/main/Memorie/" + nomeFile;

    const respRaw = await fetch(urlRaw);
    const buffer  = await respRaw.arrayBuffer();

    const hexText = new TextDecoder().decode(buffer);

    memoriaA = hexToMemoryMap(hexText);

    localStorage.setItem("memA_nome", nomeFile);
    localStorage.setItem("memA_hex", hexText);

    document.getElementById("file1").files = fakeFile(nomeFile, hexText);
    document.getElementById("labelFileA").textContent = `FILE A: ${nomeFile}`;
    document.getElementById("labelFileA").style.color = "#ff3333";
}

/* ============================================================
   LOG
   ============================================================ */
const logDiv = document.getElementById("log");
function log(msg) {
    if (logDiv) logDiv.textContent += msg + "\n";
}

/* ============================================================
   RIPRISTINO LOCALSTORAGE
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
    const hexA  = localStorage.getItem("memA_hex");
    const nomeA = localStorage.getItem("memA_nome");

    const hexB  = localStorage.getItem("memB_hex");
    const nomeB = localStorage.getItem("memB_nome");

    if (hexA) {
        memoriaA = hexToMemoryMap(hexA);
        document.getElementById("file1").files = fakeFile(nomeA, hexA);
        document.getElementById("labelFileA").textContent = `FILE A: ${nomeA}`;
    }

    if (hexB) {
        memoriaB = hexToMemoryMap(hexB);
        document.getElementById("file2").files = fakeFile(nomeB, hexB);
        document.getElementById("labelFileB").textContent = `FILE B: ${nomeB}`;
    }

    if (!localStorage.getItem("memA_hex")) {
        caricaDefaultMemoriaA();
    }

    aggiornaBloccoCreazione();
});

/* ============================================================
   CAMBIO FILE A
   ============================================================ */
function onFileA_Change() {
    const inputA = document.getElementById("file1");
    const lblA   = document.getElementById("labelFileA");

    lblA.textContent = "FILE A (locale)";

    if (!inputA.files[0]) {
        localStorage.removeItem("memA_hex");
        localStorage.removeItem("memA_nome");
        memoriaA = null;
        aggiornaBloccoCreazione();
        return;
    }

    leggiFileHex(inputA, hexA => {
        memoriaA = hexToMemoryMap(hexA);
        localStorage.setItem("memA_hex", hexA);
        localStorage.setItem("memA_nome", inputA.files[0].name);
        aggiornaBloccoCreazione();
    });
}

/* ============================================================
   CAMBIO FILE B
   ============================================================ */
function onFileB_Change() {
    const inputB = document.getElementById("file2");
    const lblB   = document.getElementById("labelFileB");

    lblB.textContent = "FILE B (locale)";

    if (!inputB.files[0]) {
        localStorage.removeItem("memB_hex");
        localStorage.removeItem("memB_nome");
        memoriaB = null;
        aggiornaBloccoCreazione();
        return;
    }

    leggiFileHex(inputB, hexB => {
        memoriaB = hexToMemoryMap(hexB);
        localStorage.setItem("memB_hex", hexB);
        localStorage.setItem("memB_nome", inputB.files[0].name);
        aggiornaBloccoCreazione();
    });
}

/* ============================================================
   MOSTRA BLOCCO CREAZIONE SOLO SE A E B ESISTONO
   ============================================================ */
function aggiornaBloccoCreazione() {
    const blocco = document.getElementById("crea-memoria-container");

    const hexA = localStorage.getItem("memA_hex");
    const hexB = localStorage.getItem("memB_hex");

    blocco.style.display = (hexA && hexB) ? "block" : "none";
}

/* ============================================================
   RESET COMPLETO MEMORIA (A, B e C)
   ============================================================ */
document.getElementById("btnResetMemoria").addEventListener("click", () => {

    // Cancella A
    localStorage.removeItem("memA_hex");
    localStorage.removeItem("memA_nome");

    // Cancella B
    localStorage.removeItem("memB_hex");
    localStorage.removeItem("memB_nome");

  // 🔥 Cancella C (mancava!)
localStorage.removeItem("memC_hex");
localStorage.removeItem("memC_nome");

// 🔥 Cancella anche i riferimenti usati da Programmatore X2
localStorage.removeItem("memoriaC");
localStorage.removeItem("nomeMemoriaC");


    // 🔥 Cancella anche la RAM usata da X2
    if (typeof memC_modificata !== "undefined") {
        memC_modificata = null;
    }

    // Ricarica A di default
    caricaDefaultMemoriaA();

    // Ricarica pagina
    location.reload();
});


/* ============================================================
   GENERAZIONE MEMORIA C
   ============================================================ */
document.getElementById("btnGeneraC").addEventListener("click", () => {
    logDiv.textContent = "";

    const nomeC = document.getElementById("nomeMemoriaC").value.trim();

    if (!nomeC) {
        log("Errore: devi inserire un nome per la memoria C.");
        return;
    }

    const hexA = localStorage.getItem("memA_hex");
    const hexB = localStorage.getItem("memB_hex");

    if (!hexA || !hexB) {
        log("Errore: FILE A e FILE B devono essere caricati prima.");
        return;
    }

    // 🔥 Memoria C = copia perfetta di B
    const memoriaC_hex = hexB;

    localStorage.setItem("memC_hex", memoriaC_hex);
localStorage.setItem("memC_nome", nomeC + ".hex");

/* 🔥 AGGIUNTA NECESSARIA PER PROGRAMMATORE X2 */
localStorage.setItem("memoriaC", memoriaC_hex);
localStorage.setItem("nomeMemoriaC", nomeC + ".hex");

log(`Memoria C creata e salvata come: ${nomeC}.hex`);


    log(`Memoria C creata e salvata come: ${nomeC}.hex`);
});
