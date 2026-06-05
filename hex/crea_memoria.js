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

// ------------------------------------------------------
// 3) CARICA LISTA FILE DA GITHUB
// ------------------------------------------------------
function caricaListaGit() {

    const url = "https://api.github.com/repos/balza1979/progetto_x2/contents/hex";

    fetch(url)
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
        })
        .catch(err => {
            console.error("Errore caricamento Git:", err);
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

