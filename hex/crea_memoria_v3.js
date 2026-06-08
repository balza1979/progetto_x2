/* ============================================================
   x2_memoriaC_loader.js — versione corretta per Intel‑HEX
   ============================================================ */

/* ------------------------------------------------------------
   1) Controllo esistenza Memoria C
   ------------------------------------------------------------ */
function checkMemoriaC() {
    return localStorage.getItem("memC_hex") !== null;
}

/* ------------------------------------------------------------
   2) Converte Intel‑HEX → mappa {indirizzo: byteHex}
   ------------------------------------------------------------ */
function intelHexToMemoryMap(hexText) {
    const lines = hexText.split(/\r?\n/);
    const mem = {};

    for (let line of lines) {
        if (!line.startsWith(":")) continue;

        const byteCount  = parseInt(line.substr(1, 2), 16);
        const address    = parseInt(line.substr(3, 4), 16);
        const recordType = parseInt(line.substr(7, 2), 16);

        if (recordType !== 0) continue; // solo DATA

        for (let i = 0; i < byteCount; i++) {
            const byteHex = line.substr(9 + i * 2, 2).toUpperCase();
            mem[address + i] = byteHex;
        }
    }

    return mem;
}

/* ------------------------------------------------------------
   3) Carica Memoria C dal localStorage
   ------------------------------------------------------------ */
function loadMemoriaC() {
    const hexText = localStorage.getItem("memC_hex");
    if (!hexText) return null;

    return intelHexToMemoryMap(hexText);
}

/* ------------------------------------------------------------
   4) Legge un byte da Memoria C
   ------------------------------------------------------------ */
function getByteFromC(offset, memC_map) {
    const hex = memC_map[offset] || "00";
    return parseInt(hex, 16);
}

/* ------------------------------------------------------------
   5) Converte byte → valore leggibile
   ------------------------------------------------------------ */
function convertValueFromByte(param, byte) {

    if (param.tipo === "enum") {
        return param.enum[byte] ?? "??";
    }

    if (param.tipo === "bool") {
        return byte === 1 ? "ON" : "OFF";
    }

    if (param.tipo === "num") {
        return byte;
    }

    return byte;
}

/* ------------------------------------------------------------
   6) Converte valore UI → byte
   ------------------------------------------------------------ */
function convertValueToByte(param, nuovoValore) {

    if (param.tipo === "enum") {
        const index = param.enum.indexOf(nuovoValore);
        return index >= 0 ? index : 0;
    }

    if (param.tipo === "bool") {
        return nuovoValore === "ON" ? 1 : 0;
    }

    if (param.tipo === "num") {
        return Number(nuovoValore);
    }

    return 0;
}

/* ------------------------------------------------------------
   7) Applica valori da Memoria C alla UI
   ------------------------------------------------------------ */
function applyValuesFromC() {
    if (!checkMemoriaC()) return;

    const memC_map = loadMemoriaC();
    if (!memC_map) return;

    x2_parametri.forEach(param => {
        const byte = getByteFromC(param.offset, memC_map);
        const valore = convertValueFromByte(param, byte);

        param.VALORE = valore;

        const el = document.getElementById(param.id_valore);
        if (el) el.value = valore;
    });
}

/* ------------------------------------------------------------
   8) Aggiorna Memoria C quando l’utente modifica un parametro
   ------------------------------------------------------------ */
function updateMemoriaC(param, nuovoValore) {

    const hexText = localStorage.getItem("memC_hex");
    if (!hexText) return;

    const memC_map = intelHexToMemoryMap(hexText);

    const nuovoByte = convertValueToByte(param, nuovoValore);

    memC_map[param.offset] = nuovoByte.toString(16).padStart(2, "0").toUpperCase();

    // 🔥 Ricostruzione Intel‑HEX NON implementata (non serve ora)
    // Per ora aggiorniamo solo param.VALORE
    param.VALORE = nuovoValore;
}

/* ------------------------------------------------------------
   9) Aggancia eventi UI
   ------------------------------------------------------------ */
function hookUIevents() {
    x2_parametri.forEach(param => {
        const el = document.getElementById(param.id_valore);
        if (!el) return;

        el.addEventListener("change", () => {
            updateMemoriaC(param, el.value);
        });
    });
}

/* ------------------------------------------------------------
   10) Inizializzazione
   ------------------------------------------------------------ */
function initMemoriaC() {
    if (!checkMemoriaC()) return;

    applyValuesFromC();
    hookUIevents();
}

document.addEventListener("DOMContentLoaded", initMemoriaC);
