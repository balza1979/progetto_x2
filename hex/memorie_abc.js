// ======================================================
// memorie_abc.js
// Gestione Memorie A / B / C tramite localStorage
// Versione: 2026-05-29 12:00
// ======================================================

// ------------------------------
// STRUTTURE IN MEMORIA
// ------------------------------
let memoriaA = null;
let memoriaB = null;
let memoriaC = null;

// ------------------------------
// SALVATAGGIO IN LOCAL STORAGE
// ------------------------------
function salvaInLocalStorage() {
    localStorage.setItem("memoriaA", JSON.stringify(memoriaA));
    localStorage.setItem("memoriaB", JSON.stringify(memoriaB));
    localStorage.setItem("memoriaC", JSON.stringify(memoriaC));
}

// ------------------------------
// LETTURA DA LOCAL STORAGE
// ------------------------------
function caricaDaLocalStorage() {
    memoriaA = JSON.parse(localStorage.getItem("memoriaA"));
    memoriaB = JSON.parse(localStorage.getItem("memoriaB"));
    memoriaC = JSON.parse(localStorage.getItem("memoriaC"));
}

// ------------------------------
// SETTER
// ------------------------------
function setMemoriaA(jsonData) {
    memoriaA = JSON.parse(JSON.stringify(jsonData));
    memoriaB = null;
    memoriaC = null;
    salvaInLocalStorage();
}

function setMemoriaB() {
    if (!memoriaA) return false;
    memoriaB = JSON.parse(JSON.stringify(memoriaA));
    memoriaC = null;
    salvaInLocalStorage();
    return true;
}

function setMemoriaC(nomeFile) {
    if (!memoriaB) return false;
    memoriaC = {
        nome: nomeFile,
        dati: JSON.parse(JSON.stringify(memoriaB))
    };
    salvaInLocalStorage();
    return true;
}

// ------------------------------
// GETTER
// ------------------------------
function getMemoriaA() { return memoriaA; }
function getMemoriaB() { return memoriaB; }
function getMemoriaC() { return memoriaC; }

// ------------------------------
// RESET COMPLETO
// ------------------------------
function resetMemorie() {
    memoriaA = null;
    memoriaB = null;
    memoriaC = null;
    localStorage.removeItem("memoriaA");
    localStorage.removeItem("memoriaB");
    localStorage.removeItem("memoriaC");
}

// ------------------------------
// ESPORTAZIONE FUNZIONI
// ------------------------------
const memorieABC = {
    setA: setMemoriaA,
    setB: setMemoriaB,
    setC: setMemoriaC,
    getA: getMemoriaA,
    getB: getMemoriaB,
    getC: getMemoriaC,
    reset: resetMemorie,
    carica: caricaDaLocalStorage
};

// Disponibile globalmente
window.memorieABC = memorieABC;

// ======================================================
// FINE FILE - memorie_abc.js
// ======================================================
