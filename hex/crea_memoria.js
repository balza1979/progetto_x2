// CREA_MEMORIA.JS – versione base con tendina Git moderna
// 06/06/2026 10:30 – Luca / Copilot

// ------------------------------------------------------------
// VARIABILI BASE
// ------------------------------------------------------------
let memoriaA = null;
let memoriaB = null;
let memoriaC = null;

// ------------------------------------------------------------
// UTILITY: lettura file HEX
// (serve anche a memorie_tipo.js → hexToMemoryMap)
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
// LOG / PLACEHOLDER OPERATIVO
// ------------------------------------------------------------
const logDiv = document.getElementById("log");
function log(msg) {
    if (!logDiv) return;
    logDiv.textContent += msg + "\n";
}

// ------------------------------------------------------------
// RIPRISTINO DA LOCALSTORAGE ALL'APERTURA
// ------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    const hexA = localStorage.getItem("memA_hex");
    const nomeA = localStorage.getItem("memA_nome");

    const hexB = localStorage.getItem("memB_hex");
    const nomeB = localStorage.getItem("memB_nome");

    const hexC = localStorage.getItem("memC_hex");
    const nomeC = localStorage.getItem("memC_nome");

    // A
    if (hexA) {
        memoriaA = hexToMemoryMap(hexA);
        const fakeA = fakeFile(nomeA || "FILE_A.hex", hexA);
        const inputA = document.getElementById("file1");
        if (inputA) inputA.files = fakeA;

        const lblA = document.getElementById("labelFileA");
        if (lblA) lblA.textContent = `FILE A: ${nomeA || "Git_A.hex"}`;
    }

    // B
    if (hexB) {
        memoriaB = hexToMemoryMap(hexB);
        const fakeB = fakeFile(nomeB || "FILE_B.hex", hexB);
        const inputB = document.getElementById("file2");
        if (inputB) inputB.files = fakeB;

        const lblB = document.getElementById("labelFileB");
        if (lblB) lblB.textContent = `FILE B: ${nomeB || "Git_B.hex"}`;
    }

    // C (solo visualizzazione, per ora)
    if (hexC) {
        memoriaC = hexToMemoryMap(hexC);
        const fakeC = fakeFile(nomeC || "FILE_C.hex", hexC);
        const inputC = document.getElementById("file3");
        if (inputC) inputC.files = fakeC;

        const lblC = document.getElementById("labelFileC");
        if (lblC) lblC.textContent = `FILE C: ${nomeC || "Git_C.hex"}`;
    }

    aggiornaBloccoCreazione();
});

// ------------------------------------------------------------
// GESTIONE CAMBI FILE LOCALI
// ------------------------------------------------------------
function onFileA_Change() {
    const inputA = document.getElementById("file1");
    const lblA = document.getElementById("labelFileA");

    if (lblA) lblA.textContent = "FILE A (locale)";

    if (!inputA.files[0]) {
        localStorage.removeItem("memA_hex");
        localStorage.removeItem("memA_nome");
        memoriaA = null;
        aggiornaBloccoCreazione();
        return;
    }

    leggiFileHex(inputA, hexA => {
        if (!hexA) return;

        memoriaA = hexToMemoryMap(hexA);
        localStorage.setItem("memA_hex", hexA);
        localStorage.setItem("memA_nome", inputA.files[0].name);

        aggiornaBloccoCreazione();
    });
}

function onFileB_Change() {
    const inputB = document.getElementById("file2");
    const lblB = document.getElementById("labelFileB");

    if (lblB) lblB.textContent = "FILE B (locale)";

    if (!inputB.files[0]) {
        localStorage.removeItem("memB_hex");
        localStorage.removeItem("memB_nome");
        memoriaB = null;
        aggiornaBloccoCreazione();
        return;
    }

    leggiFileHex(inputB, hexB => {
        if (!hexB) return;

        memoriaB = hexToMemoryMap(hexB);
        localStorage.setItem("memB_hex", hexB);
        localStorage.setItem("memB_nome", inputB.files[0].name);

        aggiornaBloccoCreazione();
    });
}

function onFileC_Change() {
    const inputC = document.getElementById("file3");
    const lblC = document.getElementById("labelFileC");

    if (lblC) lblC.textContent = "FILE C (locale)";

    if (!inputC.files[0]) {
        localStorage.removeItem("memC_hex");
        localStorage.removeItem("memC_nome");
        memoriaC = null;
        return;
    }

    leggiFileHex(inputC, hexC => {
        if (!hexC) return;

        memoriaC = hexToMemoryMap(hexC);
        localStorage.setItem("memC_hex", hexC);
        localStorage.setItem("memC_nome", inputC.files[0].name);
    });
}

// ------------------------------------------------------------
// BLOCCO CREAZIONE: VISIBILITÀ
// ------------------------------------------------------------
function aggiornaBloccoCreazione() {
    const blocco = document.getElementById("crea-memoria-container");
    const bloccoC = document.getElementById("fileC-block");

    const hexA = localStorage.getItem("memA_hex");
    const hexB = localStorage.getItem("memB_hex");

    if (!blocco) return;

    if (hexA && hexB) {
        blocco.style.display = "block";
        if (bloccoC) bloccoC.style.display = "block";
    } else {
        blocco.style.display = "none";
        if (bloccoC) bloccoC.style.display = "none";
    }
}

// ------------------------------------------------------------
// RESET COMPLETO (se ti serve in futuro)
// ------------------------------------------------------------
function resetCreazione() {
    localStorage.removeItem("memA_hex");
    localStorage.removeItem("memB_hex");
    localStorage.removeItem("memC_hex");

    localStorage.removeItem("memA_nome");
    localStorage.removeItem("memB_nome");
    localStorage.removeItem("memC_nome");

    location.reload();
}

// ------------------------------------------------------------
// PLACEHOLDER GENERAZIONE C (operativa da fare dopo)
// ------------------------------------------------------------
const btnGeneraC = document.getElementById("btnGeneraC");
if (btnGeneraC) {
    btnGeneraC.addEventListener("click", () => {
        logDiv.textContent = "";
        log("Placeholder: qui inseriamo la logica per generare la memoria C.");
        log("Useremo x2_parametri_data.js e la stessa logica di scrittura parametri di hex_generator.html.");
    });
}
