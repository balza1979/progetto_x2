// ============================================================
// CREA_MEMORIA.JS V1.0 – Pagina dedicata alla creazione Memoria C
// Versione 2026-06-05 10:15
// ============================================================

// ------------------------------------------------------------
// VARIABILI BASE
// ------------------------------------------------------------
let memoriaA = null;
let memoriaB = null;

// ------------------------------------------------------------
// UTILITY BASE
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

function fakeFile(nome, contenuto) {
    const blob = new Blob([contenuto], { type: "text/plain" });
    const file = new File([blob], nome, { type: "text/plain" });

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    return dataTransfer.files;
}

// ------------------------------------------------------------
// BLOCCO CREAZIONE – VISIBILITÀ
// ------------------------------------------------------------
function aggiornaBloccoCreazione() {
    const blocco = document.getElementById("crea-memoria-container");
    if (!blocco) return;

    const hexA = localStorage.getItem("memA_hex");
    const hexB = localStorage.getItem("memB_hex");

    const infoA = document.getElementById("info-memoria-a");
    const infoB = document.getElementById("info-memoria-b");

    if (infoA) infoA.textContent = hexA ? "caricata" : "non caricata";
    if (infoB) infoB.textContent = hexB ? "caricata" : "non caricata";

    if (hexA && hexB) {
        blocco.style.display = "block";
    } else {
        blocco.style.display = "none";
    }
}

// ------------------------------------------------------------
// CARICAMENTO AUTOMATICO DA LOCALSTORAGE ALL'APERTURA
// ------------------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
    const hexA = localStorage.getItem("memA_hex");
    const nomeA = localStorage.getItem("memA_nome");

    const hexB = localStorage.getItem("memB_hex");
    const nomeB = localStorage.getItem("memB_nome");

    // Ricostruisci A
    if (hexA) {
        memoriaA = hexToMemoryMap(hexA);

        const fakeA = fakeFile(nomeA || "FILE_A.hex", hexA);
        const inputA = document.getElementById("file1");
        if (inputA) inputA.files = fakeA;

        const lblA = document.getElementById("labelFileA");
        if (lblA) lblA.textContent = `FILE A: ${nomeA || "memA_hex"}`;
    }

    // Ricostruisci B
    if (hexB) {
        memoriaB = hexToMemoryMap(hexB);

        const fakeB = fakeFile(nomeB || "FILE_B.hex", hexB);
        const inputB = document.getElementById("file2");
        if (inputB) inputB.files = fakeB;

        const lblB = document.getElementById("labelFileB");
        if (lblB) lblB.textContent = `FILE B: ${nomeB || "memB_hex"}`;
    }

    aggiornaBloccoCreazione();
});

// ------------------------------------------------------------
// PATCH – Salvataggio FILE A + refresh blocco
// ------------------------------------------------------------
function onFileA_Change() {
    document.getElementById("labelFileA").innerText = "FILE A (locale)";

    const inputA = document.getElementById("file1");
    if (!inputA.files[0]) return;

    leggiFileHex(inputA, hexA => {
        if (!hexA) return;

        localStorage.setItem("memA_hex", hexA);
        localStorage.setItem("memA_nome", inputA.files[0].name);

        aggiornaBloccoCreazione();
    });
}

// ------------------------------------------------------------
// PATCH – Salvataggio FILE B + refresh blocco
// ------------------------------------------------------------
function onFileB_Change() {
    document.getElementById("labelFileB").innerText = "FILE B (locale)";

    const inputB = document.getElementById("file2");
    if (!inputB.files[0]) return;

    leggiFileHex(inputB, hexB => {
        if (!hexB) return;

        localStorage.setItem("memB_hex", hexB);
        localStorage.setItem("memB_nome", inputB.files[0].name);

        aggiornaBloccoCreazione();
    });
}

// ------------------------------------------------------------
// CARICA DA GIT (SLOT A / B) – SALVATAGGIO IN LOCALSTORAGE
// ------------------------------------------------------------
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
                console.log(`Caricato HEX da Git in ${slot}`);
            } else {
                mem = binToMemoryMap(bytes);
                console.log(`Caricato BIN da Git in ${slot}`);
            }

            if (slot === "A") {
                memoriaA = mem;
                const inputA = document.getElementById("file1");
                if (inputA) inputA.value = "";

                if (hexText) {
                    localStorage.setItem("memA_hex", hexText);
                    localStorage.setItem("memA_nome", "Git_A.hex");
                }
            }

            if (slot === "B") {
                memoriaB = mem;
                const inputB = document.getElementById("file2");
                if (inputB) inputB.value = "";

                if (hexText) {
                    localStorage.setItem("memB_hex", hexText);
                    localStorage.setItem("memB_nome", "Git_B.hex");
                }
            }

            aggiornaBloccoCreazione();

            const lbl = document.getElementById("labelFile" + slot);
            if (lbl) lbl.innerText = `FILE ${slot} (caricato da Git)`;

            alert(`File Git caricato in ${slot}`);
        })
        .catch(err => {
            console.error("Errore Git:", err);
            alert("Errore nel caricamento del file da Git");
        });
}

function binToMemoryMap(bytes) {
    const mem = {};
    for (let i = 0; i < bytes.length; i++) {
        mem[i] = bytes[i].toString(16).padStart(2, "0").toUpperCase();
    }
    return mem;
}

// ------------------------------------------------------------
// SELETTORE GIT MODERNO – SLOT A/B
// ------------------------------------------------------------
let slotCorrente = null;

function selezionaSlot(slot) {
    slotCorrente = slot;
    const selettore = document.getElementById("selettoreGit");
    const lista = document.getElementById("gitList");
    const btnConferma = document.getElementById("btnConfermaGit");

    if (!selettore || !lista || !btnConferma) return;

    selettore.style.display = "block";
    lista.innerHTML = "";

    // Qui puoi popolare la lista con i tuoi file Git reali
    const item = document.createElement("div");
    item.className = "git-item";
    item.textContent = "polli.hex (Git)";
    item.onclick = function () {
        btnConferma.style.display = "block";
    };
    lista.appendChild(item);
}

document.getElementById("btnChiudiGitList").addEventListener("click", function () {
    const selettore = document.getElementById("selettoreGit");
    if (selettore) selettore.style.display = "none";
});

document.getElementById("btnConfermaGit").addEventListener("click", function () {
    const selettore = document.getElementById("selettoreGit");
    if (selettore) selettore.style.display = "none";

    if (slotCorrente) {
        caricaDaGit(slotCorrente);
    }
});

// ------------------------------------------------------------
// RESET COMPLETO MODALITÀ CREAZIONE
// ------------------------------------------------------------
function resetCreazione() {
    if (sessionStorage.getItem("creazione_resettata") === "1") {
        return;
    }
    sessionStorage.setItem("creazione_resettata", "1");

    localStorage.removeItem("memA_hex");
    localStorage.removeItem("memB_hex");
    localStorage.removeItem("memC_hex");

    localStorage.removeItem("memA_nome");
    localStorage.removeItem("memB_nome");
    localStorage.removeItem("memC_nome");

    localStorage.removeItem("creazione_attiva");

    location.reload();
}

// ------------------------------------------------------------
// GESTIONE NOME MEMORIA C (solo placeholder, logica da definire)
// ------------------------------------------------------------
document.getElementById("btn-conferma-nome-c").addEventListener("click", function () {
    const nomeC = document.getElementById("nome-memoria-c").value.trim();
    if (!nomeC) {
        alert("Inserisci un nome per la nuova Memoria C");
        return;
    }

    // Qui potrai aggiungere la logica reale di creazione/salvataggio Memoria C
    alert(`Nome Memoria C confermato: ${nomeC}`);
});
