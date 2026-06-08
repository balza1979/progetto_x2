/* ============================================================
   x2_memoriaC_loader.js
   Versione: 2.3 — 08/06/2026 12:45
   STEP 1 FIX: Memoria C modificata resta in RAM
   ============================================================ */

let memC_modificata = null;

/* ------------------------------------------------------------
   1) Controllo esistenza Memoria C
   ------------------------------------------------------------ */
function checkMemoriaC() {
    return localStorage.getItem("memC_hex") !== null;
}

/* ------------------------------------------------------------
   2) Intel‑HEX → mappa {indirizzo: "HH"}
   ------------------------------------------------------------ */
function intelHexToMemoryMap(hexText) {
    const lines = hexText.split(/\r?\n/);
    const mem = {};

    for (let line of lines) {
        if (!line.startsWith(":")) continue;

        const byteCount  = parseInt(line.substr(1, 2), 16);
        const address    = parseInt(line.substr(3, 4), 16);
        const recordType = parseInt(line.substr(7, 2), 16);

        if (recordType !== 0) continue;

        for (let i = 0; i < byteCount; i++) {
            const byteHex = line.substr(9 + i * 2, 2).toUpperCase();
            mem[address + i] = byteHex;
        }
    }

    return mem;
}

/* ------------------------------------------------------------
   3) Carica Memoria C → memC_modificata
   ------------------------------------------------------------ */
function loadMemoriaC() {
    const hexText = localStorage.getItem("memC_hex");
    if (!hexText) return null;

    memC_modificata = intelHexToMemoryMap(hexText);
    return memC_modificata;
}

/* ------------------------------------------------------------
   4) Legge un byte da Memoria C modificata
   ------------------------------------------------------------ */
function getByteFromC(indirizzo) {
    if (!memC_modificata) return 0;

    const hex = memC_modificata[indirizzo] || "00";
    return parseInt(hex, 16);
}

/* ------------------------------------------------------------
   5) Converte byte → valore leggibile
   ------------------------------------------------------------ */
function convertValueFromByte(param, byte) {

    if (param.tipo === "enum") return param.enum[byte] ?? "??";
    if (param.tipo === "bool") return byte === 1 ? "ON" : "OFF";
    if (param.tipo === "num")  return byte;

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

    if (param.tipo === "bool") return nuovoValore === "ON" ? 1 : 0;
    if (param.tipo === "num")  return Number(nuovoValore);

    return 0;
}

/* ------------------------------------------------------------
   7) Applica valori da Memoria C modificata
   ------------------------------------------------------------ */
function applyValuesFromC() {
    if (!checkMemoriaC()) return;

    // 🔥 NON ricaricare la C originale
    if (!memC_modificata) loadMemoriaC();

    x2_parametri.forEach(param => {

        const indirizzo = parseInt(param.LIBERA1);

        const byte   = getByteFromC(indirizzo);
        const valore = convertValueFromByte(param, byte);

        param.VALORE = valore;

        const el = document.getElementById(param.id_valore);
        if (el) el.value = valore;
    });
}

/* ------------------------------------------------------------
   8) Aggiorna Memoria C modificata
   ------------------------------------------------------------ */
function updateMemoriaC(param, nuovoValore) {

    if (!memC_modificata) return;

    const nuovoByte = convertValueToByte(param, nuovoValore);
    const indirizzo = parseInt(param.LIBERA1);

    memC_modificata[indirizzo] =
        nuovoByte.toString(16).padStart(2, "0").toUpperCase();

    param.VALORE = nuovoValore;
}

/* ------------------------------------------------------------
   9) Eventi UI
   ------------------------------------------------------------ */
function hookUIevents() {

    x2_parametri.forEach(param => {
        const el = document.getElementById(param.id_valore);
        if (!el) return;

        el.addEventListener("change", () => {
            const nuovoValore = el.value;
            updateMemoriaC(param, nuovoValore);
        });
    });
}

/* ------------------------------------------------------------
   10) Inizializzazione
   ------------------------------------------------------------ */
function initMemoriaC() {
    if (!checkMemoriaC()) return;

    loadMemoriaC();
    applyValuesFromC();
    hookUIevents();
}

document.addEventListener("DOMContentLoaded", initMemoriaC);
