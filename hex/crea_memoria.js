// ======================================================
// CREA_MEMORIA.JS – Versione 2026-06-05 09:20
// ======================================================

// Slot attivo (A o B)
let slotCorrente = null;

// Percorso cartella HEX su GitHub
const GIT_BASE = "https://raw.githubusercontent.com/balza1979/progetto_x2/main/hex/";

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

// ======================================================
//  CARICA FILE DA GIT – VERSIONE IDENTICA A CONFRONTO
// ======================================================

function caricaDaGit(slot) {

    const url = "https://raw.githubusercontent.com/balza1979/progetto_x2/main/hex/polli.hex";

    fetch(url)
        .then(r => r.arrayBuffer())
        .then(buffer => {
            const bytes = new Uint8Array(buffer);

            const isHex = (bytes[0] === 58); // ':' = 58

            let mem;
            let hexText = null;

            if (isHex) {
                hexText = new TextDecoder().decode(bytes);
                mem = hexToMemoryMap(hexText);
            } else {
                mem = binToMemoryMap(bytes);
            }

            // --- SLOT A ---
            if (slot === "A") {
                memoriaA = mem;
                document.getElementById("fileA").value = "";
                if (hexText) {
                    localStorage.setItem("memA_hex", hexText);
                    localStorage.setItem("memA_nome", "Git_A.hex");
                }
                aggiornaBloccoCreazione();
            }

            // --- SLOT B ---
            if (slot === "B") {
                memoriaB = mem;
                document.getElementById("fileB").value = "";
                if (hexText) {
                    localStorage.setItem("memB_hex", hexText);
                    localStorage.setItem("memB_nome", "Git_B.hex");
                }
                aggiornaBloccoCreazione();
            }

            // --- LABEL ---
            document.getElementById("labelFile" + slot).innerText =
                `FILE ${slot} (caricato da Git)`;

            alert(`File Git caricato in ${slot}`);
        })
        .catch(err => {
            console.error("Errore Git:", err);
            alert("Errore nel caricamento del file da Git");
        });
}


// ------------------------------------------------------
// 4) SELEZIONA FILE GIT → ASSEGNA A SLOT
// ------------------------------------------------------
function selezionaFileGit(nomeFile) {

    const url = GIT_BASE + nomeFile;

    if (slotCorrente === "A") {
        document.getElementById("labelFileA").textContent = "FILE A: " + nomeFile;
        document.getElementById("fileA").dataset.git = url;
    }

    if (slotCorrente === "B") {
        document.getElementById("labelFileB").textContent = "FILE B: " + nomeFile;
        document.getElementById("fileB").dataset.git = url;
    }

    document.getElementById("gitPopup").style.display = "none";
}

// ------------------------------------------------------
// 5) FILE LOCALE → aggiorna label
// ------------------------------------------------------
document.getElementById("fileA").addEventListener("change", function () {
    if (this.files.length > 0) {
        document.getElementById("labelFileA").textContent = "FILE A: " + this.files[0].name;
        delete this.dataset.git;
    }
});

document.getElementById("fileB").addEventListener("change", function () {
    if (this.files.length > 0) {
        document.getElementById("labelFileB").textContent = "FILE B: " + this.files[0].name;
        delete this.dataset.git;
    }
});

// ------------------------------------------------------
// 6) CREA MEMORIA C (placeholder)
// ------------------------------------------------------
function creaMemoriaC() {

    const nome = document.getElementById("nomeC").value.trim();
    if (!nome) {
        alert("Inserisci un nome per la memoria C");
        return;
    }

    document.getElementById("labelFileC").textContent =
        "Memoria C creata: " + nome + " (funzione da completare)";

    alert("Funzione creaMemoriaC() pronta per essere completata.");
}

