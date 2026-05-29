// ============================================================
//  CONFRONTO_MEMORIE.JS – VERSIONE FIX DEFINITIVA 2026-05-29
// ============================================================

// =========================================
// MODALITÀ CREAZIONE
// =========================================

function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

function isModalitaCreazione() {
    return getQueryParam("mode") === "creazione";
}

document.addEventListener("DOMContentLoaded", function () {

    if (!isModalitaCreazione()) return;

    // Carica A/B da localStorage
    const hexA = localStorage.getItem("memA_hex");
    const nomeA = localStorage.getItem("memA_nome");

    const hexB = localStorage.getItem("memB_hex");
    const nomeB = localStorage.getItem("memB_nome");

    if (hexA) {
        memoriaA = hexToMemoryMap(hexA);
        const fakeA = fakeFile(nomeA || "FILE_A.hex", hexA);
        document.getElementById("file1").files = fakeA;
        document.getElementById("labelFileA").textContent = `FILE A: ${nomeA}`;
    }

    if (hexB) {
        memoriaB = hexToMemoryMap(hexB);
        const fakeB = fakeFile(nomeB || "FILE_B.hex", hexB);
        document.getElementById("file2").files = fakeB;
        document.getElementById("labelFileB").textContent = `FILE B: ${nomeB}`;
    }

    aggiornaBloccoCreazione();
});


// =========================================
// SETUP MODALITÀ CREAZIONE
// =========================================

function setupModalitaCreazione() {

    if (!isModalitaCreazione()) return;

    // NASCONDI FILE C NORMALE
    const bloccoC_normale = document.querySelector('#labelFileC')?.closest('.file-block');
    if (bloccoC_normale) bloccoC_normale.style.display = "none";

    // Nascondi pulsanti confronto
    ["btnAB", "btnAC", "btnBC", "btnABC"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = "none";
    });

    // Nascondi filtri
    ["flagVisualizzaTutto", "columnFilters"].forEach(id => {
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

    // Nascondi label “visualizza tutti”
    const lbl = document.getElementById("lblVisualizzaTutti");
    if (lbl) lbl.style.display = "none";

    // NASCONDI SOLO I PULSANTI CHE DEVONO DAVVERO SPARIRE
    document.querySelectorAll("button").forEach(btn => {
        const id = btn.id;

        if (id === "btnAB" ||
            id === "btnAC" ||
            id === "btnBC" ||
            id === "btnABC" ||
            id === "btnChiudiGit" ||
            id === "btnConfermaGit") {

            btn.style.display = "none";
        }
    });
}

document.addEventListener("DOMContentLoaded", setupModalitaCreazione);


// =========================================
// VARIABILI BASE
// =========================================

let memoriaA = null;
let memoriaB = null;
let memoriaC = null;

let confrontoAttivo = "A-B";

const indirizziRuntime = [
    0x04F4, 0x0810, 0x0811, 0x081A, 0x081B, 0x081C,
    0x09E3, 0x09FA, 0x09FB, 0x09FE, 0x09FF
];


// =========================================
// UTILITY
// =========================================

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

function fakeFile(nome, contenuto) {
    const blob = new Blob([contenuto], { type: "text/plain" });
    const file = new File([blob], nome, { type: "text/plain" });

    const dt = new DataTransfer();
    dt.items.add(file);
    return dt.files;
}


// =========================================
// MOSTRA BLOCCO CREAZIONE SOLO QUANDO A E B CI SONO
// =========================================

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


// =========================================
// CAMBIO FILE A/B/C
// =========================================

function onFileA_Change() {
    const inputA = document.getElementById("file1");
    if (!inputA.files[0]) return;

    leggiFileHex(inputA, hexA => {
        localStorage.setItem("memA_hex", hexA);
        localStorage.setItem("memA_nome", inputA.files[0].name);
        aggiornaBloccoCreazione();
    });
}

function onFileB_Change() {
    const inputB = document.getElementById("file2");
    if (!inputB.files[0]) return;

    leggiFileHex(inputB, hexB => {
        localStorage.setItem("memB_hex", hexB);
        localStorage.setItem("memB_nome", inputB.files[0].name);
        aggiornaBloccoCreazione();
    });
}

function onFileC_Change() {
    // In modalità creazione NON serve
}


// =========================================
// RESET MEMORIE
// =========================================

function resetMemorie() {
    localStorage.removeItem("memA_hex");
    localStorage.removeItem("memA_nome");
    localStorage.removeItem("memB_hex");
    localStorage.removeItem("memB_nome");
    alert("Memorie A e B cancellate.");
}
