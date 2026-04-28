// ======================================================================
// FILE: x2_programmatore_menu.js
// DESCRIZIONE: Logica MENU → SOTTOMENU → PARAMETRI → VALORI + DEBUG MAPPE
// AUTORE: Luca + Copilot
// DATA: 28/04/2026 – 11:40
// ======================================================================
//
// Richiede che siano già caricati:
// - x2_menu_struttura_data.js
// - x2_parametri_data.js
// - (opzionale) x2_file_parametri.js per i documenti associati
// ======================================================================

document.addEventListener("DOMContentLoaded", function () {

    const selMenu       = document.getElementById("menu");
    const selSottomenu  = document.getElementById("sottomenu");
    const selParametro  = document.getElementById("parametro");
    const selValore     = document.getElementById("tendina_valori");

    x2_popolaMenu();

    selMenu.addEventListener("change", function () {
        x2_popolaSottomenu(this.value);
    });

    selSottomenu.addEventListener("change", function () {
        x2_popolaParametri(this.value);
    });

    selParametro.addEventListener("change", function () {
        const codice = this.value;
        const param = x2_parametri.find(p => p.PARAMETRO === codice);
        if (param) {
            x2_mostraInfoParametro(param);
            x2_popolaValori(param);
        }
    });
});

// ======================================================================
// MENU
// ======================================================================

function x2_popolaMenu() {
    const selMenu = document.getElementById("menu");
    selMenu.innerHTML = "";

    const visti = new Set();

    x2_menu_struttura_data.forEach(riga => {
        const cod = String(riga.cod__menu).split(".")[0];
        if (!visti.has(cod)) {
            visti.add(cod);

            const opt = document.createElement("option");
            opt.value = cod;
            opt.textContent = riga.menu;
            selMenu.appendChild(opt);
        }
    });

    if (selMenu.options.length > 0) {
        selMenu.selectedIndex = 0;
        x2_popolaSottomenu(selMenu.value);
    }
}

// ======================================================================
// SOTTOMENU
// ======================================================================

function x2_popolaSottomenu(codMenu) {
    const selSottomenu = document.getElementById("sottomenu");
    selSottomenu.innerHTML = "";

    const lista = x2_menu_struttura_data.filter(riga => {
        return String(riga.cod__menu).startsWith(codMenu + ".");
    });

    lista.forEach(riga => {
        const opt = document.createElement("option");
        opt.value = riga.cod__menu;
        opt.textContent = riga.sottomenu;
        selSottomenu.appendChild(opt);
    });

    if (selSottomenu.options.length > 0) {
        selSottomenu.selectedIndex = 0;
        x2_popolaParametri(selSottomenu.value);
    } else {
        x2_svuotaParametri();
    }
}

// ======================================================================
// PARAMETRI
// ======================================================================

function x2_svuotaParametri() {
    document.getElementById("parametro").innerHTML = "";
    document.getElementById("info_parametro").innerHTML = "";
}

// ======================================================================
// PARAMETRI → POPOLA
// ======================================================================

function x2_popolaParametri(codMenuCompleto) {
    const selParametro = document.getElementById("parametro");
    const selValore    = document.getElementById("tendina_valori");
    const boxInfo      = document.getElementById("info_parametro");

    selParametro.innerHTML = "";
    selValore.innerHTML    = "";
    boxInfo.innerHTML      = "";

    const prefisso = codMenuCompleto + ".";

    let lista = x2_parametri.filter(p => {
        return p.PARAMETRO && p.PARAMETRO.startsWith(prefisso);
    });

    if (lista.length === 0) {
        const menu = codMenuCompleto.split(".")[0];
        lista = x2_parametri.filter(p => p.PARAMETRO.startsWith(menu + "."));
    }

    lista.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p.PARAMETRO;
        opt.textContent = p.PARAMETRO + " – " + (p.DESCRIZIONE || "");
        selParametro.appendChild(opt);
    });

    if (lista.length > 0) {
        selParametro.selectedIndex = 0;
        const primo = lista[0];

        x2_mostraInfoParametro(primo);
        x2_popolaValori(primo);

        document.getElementById("codice_parametro").value      = primo.PARAMETRO || "";
        document.getElementById("descrizione_parametro").value = primo.DESCRIZIONE || "";
    }
}

// ======================================================================
// INFO PARAMETRO
// ======================================================================

function x2_mostraInfoParametro(param) {
    const box = document.getElementById("info_parametro");

    box.innerHTML = `
        <b>Codice:</b> ${param.PARAMETRO}<br>
        <b>Descrizione:</b> ${param.DESCRIZIONE}<br>
        <b>Valore grezzo:</b> ${x2_pulisciValore(param.VALORE)}
    `;

    document.getElementById("codice_parametro").value      = param.PARAMETRO || "";
    document.getElementById("descrizione_parametro").value = param.DESCRIZIONE || "";
}

// ======================================================================
// VALORI
// ======================================================================

function x2_pulisciValore(v) {
    if (!v) return "";
    return String(v).trim();
}

// ------------------------------------------------------------
// INIZIO MODIFICA - INSERIMENTO LOADER JSON
// File: /js/x2_programmatore_menu.js
// Data: 2026-04-28
// Ora: 16:05
// Motivo: aggiunta funzione mancante per caricare i JSON X2
// ------------------------------------------------------------

function x2_caricaJSON(nomeFile, callback) {

    fetch("json_tendine/" + nomeFile + ".json")
        .then(response => {
            if (!response.ok) {
                throw new Error("Errore fetch JSON: " + nomeFile);
            }
            return response.json();
        })
        .then(data => {
            callback(data);
        })
        .catch(err => {
            console.error("Errore:", err);
        });
}

// ------------------------------------------------------------
// FINE MODIFICA
// ------------------------------------------------------------


function x2_popolaValori(param) {
  

    console.log("PARAM:", param.PARAMETRO, "VALORE:", param.VALORE);

    const tendina = document.getElementById("tendina_valori");
    tendina.innerHTML = "";

    // 1) Caso speciale: parametro 1.0.00
/* ============================
   INIZIO MODIFICA 28/04/2026 17:13
   Gestione nuovo JSON con {id, text}
   ============================ */

if (param.PARAMETRO === "1.0.00") {

    const tendina = document.getElementById("tendina_valori");
    tendina.innerHTML = "";

    x2_caricaJSON("1.0.00", function(data) {

        // 1) Popola tendina con ID + testo
        data.valori.forEach(voce => {
            const opt = document.createElement("option");
            opt.value = voce.id;          
           opt.textContent = "\"" + voce.id + "\" " + voce.text;

            tendina.appendChild(opt);
        });

        // 2) Seleziona il valore attuale
        const id = x2_pulisciValore(param.VALORE);

        for (let i = 0; i < tendina.options.length; i++) {
            if (tendina.options[i].value === id) {
                tendina.selectedIndex = i;
                break;
            }
        }

    /* ============================
   INIZIO MODIFICA 28/04/2026 17:26
   Aggiornamento pulsanti VAL1–VAL8
   ============================ */

const pulsanti = [
    document.getElementById("val1"),
    document.getElementById("val2"),
    document.getElementById("val3"),
    document.getElementById("val4"),
    document.getElementById("val5"),
    document.getElementById("val6"),
    document.getElementById("val7"),
    document.getElementById("val8")
];

// Popola testo pulsanti
for (let i = 0; i < 8; i++) {
    if (lista && lista[i]) {
        pulsanti[i].textContent = lista[i];   // es: "1.JPG"
        pulsanti[i].disabled = false;

        // click → apre immagine
        pulsanti[i].onclick = function () {
            const url = "img/" + lista[i];
            window.open(url, "_blank");
        };

    } else {
        pulsanti[i].textContent = "-";
        pulsanti[i].disabled = true;
        pulsanti[i].onclick = null;
    }
}

/* ============================
   FINE MODIFICA 28/04/2026 17:26
   ============================ */


        // 4) Campi numerici non applicabili
        document.getElementById("unita_misura").value = "/";
        document.getElementById("val_min").value = "/";
        document.getElementById("val_max").value = "/";
    });

    return;
}

/* ============================
   FINE MODIFICA 28/04/2026 17:13
   ============================ */



    // 2) Caso speciale: parametro 1.0.01
    if (param.PARAMETRO === "1.0.01") {

        tendina.innerHTML = "";

        x2_param_1_0_01.forEach(voce => {
            const opt = document.createElement("option");
            const pulita = x2_pulisciValore(voce);
            opt.value = pulita;
            opt.textContent = pulita;
            tendina.appendChild(opt);
        });

        const id = x2_pulisciValore(param.VALORE);
        for (let i = 0; i < tendina.options.length; i++) {
            if (tendina.options[i].textContent.includes(id)) {
                tendina.selectedIndex = i;
                break;
            }
        }

        document.getElementById("unita_misura").value = "/";
        document.getElementById("val_min").value      = "/";
        document.getElementById("val_max").value      = "/";

        return;
    }

    // 3) Metodo standard per gli altri parametri
    const raw = param.VALORE || "";
    if (!raw) return;

    const parti = raw.split(";").map(v => v.trim()).filter(v => v !== "");

    parti.forEach(voce => {
        const opt = document.createElement("option");
        const pulita = x2_pulisciValore(voce);
        opt.value = pulita;
        opt.textContent = pulita;
        tendina.appendChild(opt);
    });

    document.getElementById("unita_misura").value = "";
    document.getElementById("val_min").value      = "";
    document.getElementById("val_max").value      = "";
}

// ======================================================================
// NAVIGAZIONE PARAMETRI (UP / DOWN)
// ======================================================================

document.getElementById("parametro_up").addEventListener("click", () => {
    const sel = document.getElementById("parametro");
    if (sel.selectedIndex > 0) {
        sel.selectedIndex--;
        const param = x2_parametri.find(p => p.PARAMETRO === sel.value);
        if (param) {
            x2_mostraInfoParametro(param);
            x2_popolaValori(param);
        }
    }
});

document.getElementById("parametro_down").addEventListener("click", () => {
    const sel = document.getElementById("parametro");
    if (sel.selectedIndex < sel.options.length - 1) {
        sel.selectedIndex++;
        const param = x2_parametri.find(p => p.PARAMETRO === sel.value);
        if (param) {
            x2_mostraInfoParametro(param);
            x2_popolaValori(param);
        }
    }
});

// ======================================================================
// DEBUG: MAPPA FILE + MAPPA COLONNE + MOUSEOVER
// ======================================================================

/* =========================================================
BLOCCO: MAPPE DEBUG PROGRAMMATORE X2
VERSIONE: 28/04/2026 – 11:40
========================================================= */

// Mappa file (puoi estenderla con i tuoi nomi reali)
const mappaFile = {
    // Esempi tipici:
    "menu":              "x2_programmatore_menu.js",
    "sottomenu":         "x2_programmatore_menu.js",
    "parametro":         "x2_programmatore_menu.js",
    "tendina_valori":    "x2_programmatore_menu.js",

    "codice_parametro":      "x2_programmatore_menu.js",
    "descrizione_parametro": "x2_programmatore_menu.js",
    "unita_misura":          "x2_programmatore_menu.js",
    "val_min":               "x2_programmatore_menu.js",
    "val_max":               "x2_programmatore_menu.js",

    // Bottoni documenti parametro
    "btn_file1_parametro": "x2_parametri_data.js",
    "btn_file2_parametro": "x2_parametri_data.js",
    "btn_file3_parametro": "x2_parametri_data.js",
    "btn_file4_parametro": "x2_parametri_data.js",
    "btn_file5_parametro": "x2_parametri_data.js",
    "btn_file6_parametro": "x2_parametri_data.js",
    "btn_file7_parametro": "x2_parametri_data.js",
    "btn_file8_parametro": "x2_parametri_data.js"
};

// Mappa colonne (basata su MAPPA_X2_PARAMETRI VERS1.1.HTML)
const mappaColonne = {

    // SEZIONE 1 — IDENTIFICAZIONE PARAMETRO
    "id_descrizione_parametro": { col: "D", ref: "DESCRIZIONE" },

    // SEZIONE 2 — DEFAULT
    "id_valore_default":      { col: "G", ref: "VALORE_DEFAULT" },
    "id_descrizione_default": { col: "H", ref: "DESCRIZIONE_DEFAULT" },

    // SEZIONE 3 — DOCUMENTI DEL PARAMETRO (8 CELLE)
    "btn_file1_parametro": { col: "I", ref: "file1_parametro" },
    "btn_file2_parametro": { col: "J", ref: "file2_parametro" },
    "btn_file3_parametro": { col: "K", ref: "file3_parametro" },
    "btn_file4_parametro": { col: "L", ref: "file4_parametro" },
    "btn_file5_parametro": { col: "M", ref: "file5_parametro" },
    "btn_file6_parametro": { col: "N", ref: "file6_parametro" },
    "btn_file7_parametro": { col: "O", ref: "file7_parametro" },
    "btn_file8_parametro": { col: "P", ref: "file8_parametro" },

    // SEZIONE 4 — TIPOLOGIA PARAMETRO
    "id_min":   { col: "S", ref: "MIN" },
    "id_max":   { col: "T", ref: "MAX" },
    "id_unita": { col: "V", ref: "UNITA" },

    // SEZIONE 5 — POSIZIONE MEMORIA
    "id_pos_memoria": { col: "X", ref: "POS_MEMORIA" },
    "id_byte":        { col: "Y", ref: "BYTE" },
    "id_bit":         { col: "Z", ref: "BIT" },

    // SEZIONE 6 — VARDATO
    "id_vardato1": { col: "AA", ref: "VARDATO1" },
    "id_vardato2": { col: "AB", ref: "VARDATO2" },
    "id_vardato3": { col: "AC", ref: "VARDATO3" },

    // SEZIONE 7 — CONVERSIONE
    "id_conversione": { col: "AD", ref: "CONVERSIONE" },

    // SEZIONE 8 — CANBUS (16 CELLE)
    "id_can1":  { col: "AE", ref: "CAN1" },
    "id_can2":  { col: "AF", ref: "CAN2" },
    "id_can3":  { col: "AG", ref: "CAN3" },
    "id_can4":  { col: "AH", ref: "CAN4" },
    "id_can5":  { col: "AI", ref: "CAN5" },
    "id_can6":  { col: "AJ", ref: "CAN6" },
    "id_can7":  { col: "AK", ref: "CAN7" },
    "id_can8":  { col: "AL", ref: "CAN8" },
    "id_can9":  { col: "AM", ref: "CAN9" },
    "id_can10": { col: "AN", ref: "CAN10" },
    "id_can11": { col: "AO", ref: "CAN11" },
    "id_can12": { col: "AP", ref: "CAN12" },
    "id_can13": { col: "AQ", ref: "CAN13" },
    "id_can14": { col: "AR", ref: "CAN14" },
    "id_can15": { col: "AS", ref: "CAN15" },
    "id_can16": { col: "AT", ref: "CAN16" },

    // SEZIONE 9 — AI (20 CELLE)
    "id_ai1":  { col: "AU", ref: "INTEL_AI1" },
    "id_ai2":  { col: "AV", ref: "INTEL_AI2" },
    "id_ai3":  { col: "AW", ref: "INTEL_AI3" },
    "id_ai4":  { col: "AX", ref: "INTEL_AI4" },
    "id_ai5":  { col: "AY", ref: "INTEL_AI5" },
    "id_ai6":  { col: "AZ", ref: "INTEL_AI6" },
    "id_ai7":  { col: "BA", ref: "INTEL_AI7" },
    "id_ai8":  { col: "BB", ref: "INTEL_AI8" },
    "id_ai9":  { col: "BC", ref: "INTEL_AI9" },
    "id_ai10": { col: "BD", ref: "INTEL_AI10" },
    "id_ai11": { col: "BE", ref: "INTEL_AI11" },
    "id_ai12": { col: "BF", ref: "INTEL_AI12" },
    "id_ai13": { col: "BG", ref: "INTEL_AI13" },
    "id_ai14": { col: "BH", ref: "INTEL_AI14" },
    "id_ai15": { col: "BI", ref: "INTEL_AI15" },
    "id_ai16": { col: "BJ", ref: "INTEL_AI16" },
    "id_ai17": { col: "BK", ref: "INTEL_AI17" },
    "id_ai18": { col: "BL", ref: "INTEL_AI18" },
    "id_ai19": { col: "BM", ref: "INTEL_AI19" },
    "id_ai20": { col: "BN", ref: "INTEL_AI20" },

    // SEZIONE 10 — LIBERI (10 CELLE)
    "id_libera1":  { col: "BO", ref: "LIBERA1" },
    "id_libera2":  { col: "BP", ref: "LIBERA2" },
    "id_libera3":  { col: "BQ", ref: "LIBERA3" },
    "id_libera4":  { col: "BR", ref: "LIBERA4" },
    "id_libera5":  { col: "BS", ref: "LIBERA5" },
    "id_libera6":  { col: "BT", ref: "LIBERA6" },
    "id_libera7":  { col: "BU", ref: "LIBERA7" },
    "id_libera8":  { col: "BV", ref: "LIBERA8" },
    "id_libera9":  { col: "BW", ref: "LIBERA9" },
    "id_libera10": { col: "BX", ref: "LIBERA10" }
};

// ======================================================================
// MOUSEOVER DEBUG
// ======================================================================

document.addEventListener("mouseover", function (e) {
    const el = e.target;
    const id = el.id;
    if (!id) return;

    const dbgId   = document.getElementById("dbg_id");
    const dbgFile = document.getElementById("dbg_file");
    const dbgCol  = document.getElementById("dbg_col");
    const dbgRol  = document.getElementById("dbg_ruolo");

    if (!dbgId || !dbgFile || !dbgCol || !dbgRol) return;

    dbgId.innerText = id;

    // FILE
    let file = mappaFile[id] || "—";

    // Se è un bottone documento, prova a leggere dal tuo  ar chivio file (se esiste)
    if (id.startsWith("btn_file")) {
        try {
            const parametro = document.getElementById("parametro")?.value;
            const valore    = document.getElementById("tendina_valori")?.value;

            if (typeof x2_file_parametri !== "undefined" && parametro && valore) {
                const files = x2_file_parametri[parametro]?.files?.[valore] || [];
                const index = parseInt(id.replace("btn_file", "").replace("_parametro", ""), 10) - 1;
                const fileAssociato = files[index];
                if (fileAssociato) {
                    file = fileAssociato;
                }
            }
        } catch (err) {
            // niente log qui, debug silenzioso
        }
    }

    dbgFile.innerText = file;

    // COLONNA
    const infoCol = mappaColonne[id];
    if (infoCol) {
        dbgCol.innerText = infoCol.col;
        dbgRol.innerText = infoCol.ref;
    } else {
        dbgCol.innerText = "—";
        dbgRol.innerText = "—";
    }
});

/* ===================== FINE BLOCCO MAPPE DEBUG PROGRAMMATORE X2 ===================== */
