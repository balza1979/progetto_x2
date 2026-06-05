// CREA_MEMORIA.JS – versione senza FILE C
// 06/06/2026 – Luca / Copilot

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
// LOG
// ------------------------------------------------------------
const logDiv = document.getElementById("log");
function log(msg) {
    if (logDiv) logDiv.textContent += msg + "\n";
}

// ------------------------------------------------------------
// RIPRISTINO LOCALSTORAGE
// ------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    const hexA = localStorage.getItem("memA_hex");
    const nomeA = localStorage.getItem("memA_nome");

    const hexB = localStorage.getItem("memB_hex");
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

    aggiornaBloccoCreazione();
});

// ------------------------------------------------------------
// CAMBIO FILE A
// ------------------------------------------------------------
function onFileA_Change() {
    const inputA = document.getElementById("file1");
    const lblA = document.getElementById("labelFileA");

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

// ------------------------------------------------------------
// CAMBIO FILE B
// ------------------------------------------------------------
function onFileB_Change() {
    const inputB = document.getElementById("file2");
    const lblB = document.getElementById("labelFileB");

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

// ------------------------------------------------------------
// MOSTRA BLOCCO CREAZIONE SOLO SE A E B ESISTONO
// ------------------------------------------------------------
function aggiornaBloccoCreazione() {
    const blocco = document.getElementById("crea-memoria-container");

    const hexA = localStorage.getItem("memA_hex");
    const hexB = localStorage.getItem("memB_hex");

    if (hexA && hexB) {
        blocco.style.display = "block";
    } else {
        blocco.style.display = "none";
    }
}

// ------------------------------------------------------------
// PLACEHOLDER GENERAZIONE C
// ------------------------------------------------------------
document.getElementById("btnGeneraC").addEventListener("click", () => {
    logDiv.textContent = "";
    log("Placeholder: qui generiamo la memoria C usando A e B.");
});
