// CREA_MEMORIA.JS – versione stabile 05/06/2026 – Luca / Copilot

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

/* ===== Caricamento automatico DEF POLLI ===== */
async function caricaDefaultMemoriaA() {

    const urlLista = "https://api.github.com/repos/balza1979/progetto_x2/contents/Memorie";
    const resp = await fetch(urlLista);
    const lista = await resp.json();

    const filesRoot = lista.filter(x =>
        x.type === "file" &&
        (x.name.toLowerCase().endsWith(".hex") || x.name.toLowerCase().endsWith(".bin"))
    );

    if (filesRoot.length === 0) return;

    const fileDefault = filesRoot[0];
    const nomeFile = fileDefault.name;

    const urlRaw = "https://raw.githubusercontent.com/balza1979/progetto_x2/main/Memorie/" + nomeFile;

    const respRaw = await fetch(urlRaw);
    const buffer = await respRaw.arrayBuffer();
    const est = nomeFile.toLowerCase();

    let hexText = "";
    if (est.endsWith(".hex")) {
        hexText = new TextDecoder().decode(buffer);
    } else if (est.endsWith(".bin")) {
        hexText = convertiBinInHex(buffer);
    }

    memoriaA = hexToMemoryMap(hexText);

    localStorage.setItem("memA_nome", nomeFile);
    localStorage.setItem("memA_hex", hexText);

    document.getElementById("file1").files = fakeFile(nomeFile, hexText);
    document.getElementById("labelFileA").textContent = `FILE A: ${nomeFile}`;
    document.getElementById("labelFileA").style.color = "#ff3333";
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

    // Ripristino A
    if (hexA) {
        memoriaA = hexToMemoryMap(hexA);
        document.getElementById("file1").files = fakeFile(nomeA, hexA);
        document.getElementById("labelFileA").textContent = `FILE A: ${nomeA}`;
    } else {
        caricaDefaultMemoriaA(); // NON await
    }

    // Ripristino B
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
// MOSTRA BLOCCO C SOLO SE A E B ESISTONO
// ------------------------------------------------------------
function aggiornaBloccoCreazione() {
    const bloccoC = document.getElementById("crea-memoria-container");

    const hexA = localStorage.getItem("memA_hex");
    const hexB = localStorage.getItem("memB_hex");

    if (hexA && hexB) {
        bloccoC.style.display = "block";
    } else {
        bloccoC.style.display = "none";
    }
}

// ------------------------------------------------------------
// RESET COMPLETO MEMORIA
// ------------------------------------------------------------
document.getElementById("btnResetMemoria").addEventListener("click", () => {

    localStorage.removeItem("memA_hex");
    localStorage.removeItem("memA_nome");

    localStorage.removeItem("memB_hex");
    localStorage.removeItem("memB_nome");

    caricaDefaultMemoriaA();
    location.reload();
});

// ------------------------------------------------------------
// PLACEHOLDER GENERAZIONE C
// ------------------------------------------------------------
document.getElementById("btnGeneraC").addEventListener("click", () => {
    logDiv.textContent = "";
    log("Placeholder: qui generiamo la memoria C usando A e B.");
});
