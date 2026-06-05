// ======================================================
// CREA_MEMORIA.JS – VERSIONE COMPLETA
// Replica IDENTICA del comportamento Git di confronto_memorie
// ======================================================

// Memorie
let memoriaA = null;
let memoriaB = null;

// Slot attivo (A o B)
let slotCorrente = null;

// ------------------------------------------------------
// 1) APRI POPUP GIT
// ------------------------------------------------------
function selezionaSlot(slot) {
    slotCorrente = slot;
    document.getElementById("gitPopup").style.display = "flex";
    caricaListaGit();
}

// ------------------------------------------------------
// 2) CHIUDI POPUP
// ------------------------------------------------------
document.getElementById("btnChiudiGit").onclick = function () {
    document.getElementById("gitPopup").style.display = "none";
};

// ------------------------------------------------------
// 3) CARICA LISTA FILE DA GITHUB (IDENTICO A CONFRONTO)
// ------------------------------------------------------
function caricaListaGit() {

    fetch("https://api.github.com/repos/balza1979/progetto_x2/contents/hex")
        .then(r => r.json())
        .then(files => {

            const list = document.getElementById("gitList");
            list.innerHTML = "";

            files.forEach(f => {
                if (f.name.toLowerCase().endsWith(".hex")) {

                    const div = document.createElement("div");
                    div.className = "git-item";
                    div.textContent = f.name;

                    div.onclick = function () {
                        selezionaFileGit(f.name);
                    };

                    list.appendChild(div);
                }
            });
        });
}

// ------------------------------------------------------
// 4) SELEZIONA FILE GIT → ASSEGNA A SLOT
// ------------------------------------------------------
function selezionaFileGit(nomeFile) {

    const url = "https://raw.githubusercontent.com/balza1979/progetto_x2/main/hex/" + nomeFile;

    fetch(url)
        .then(r => r.text())
        .then(hexText => {

            const mem = hexToMemoryMap(hexText);

            if (slotCorrente === "A") {
                memoriaA = mem;
                document.getElementById("labelFileA").textContent = "FILE A: " + nomeFile;
                document.getElementById("fileA").value = "";
            }

            if (slotCorrente === "B") {
                memoriaB = mem;
                document.getElementById("labelFileB").textContent = "FILE B: " + nomeFile;
                document.getElementById("fileB").value = "";
            }

            aggiornaBloccoCreazione();
            document.getElementById("gitPopup").style.display = "none";
        });
}

// ------------------------------------------------------
// 5) HEX → MAPPA MEMORIA
// ------------------------------------------------------
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

// ------------------------------------------------------
// 6) MOSTRA BLOCCO CREAZIONE SOLO SE A E B PRESENTI
// ------------------------------------------------------
function aggiornaBloccoCreazione() {
    const blocco = document.getElementById("crea-memoria-container");

    if (memoriaA && memoriaB) {
        blocco.style.display = "block";
    } else {
        blocco.style.display = "none";
    }
}

// ------------------------------------------------------
// 7) CREA MEMORIA C (placeholder)
// ------------------------------------------------------
function creaMemoriaC() {
    const nome = document.getElementById("nomeC").value.trim();
    if (!nome) {
        alert("Inserisci un nome per la memoria C");
        return;
    }

    alert("Memoria C creata (funzione da completare)");
}
