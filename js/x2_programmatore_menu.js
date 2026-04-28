// ======================================================================
// FILE: x1_programmatore_menu.js
// DESCRIZIONE: Logica MENU → SOTTOMENU → PARAMETRI → VALORI + DEBUG MAPPE
// AUTORE: Luca + Copilot
// DATA: 28/04/2026 – 11:40
// ======================================================================
//
// Richiede che siano già caricati:
// - x1_menu_struttura_data.js
// - x1_parametri_data.js
// - (opzionale) x1_file_parametri.js per i documenti associati
// ======================================================================

document.addEventListener("DOMContentLoaded", function () {

    const selMenu       = document.getElementById("menu");
    const selSottomenu  = document.getElementById("sottomenu");
    const selParametro  = document.getElementById("parametro");
    const selValore     = document.getElementById("tendina_valori");

    x1_popolaMenu();

    selMenu.addEventListener("change", function () {
        x1_popolaSottomenu(this.value);
    });

    selSottomenu.addEventListener("change", function () {
        x1_popolaParametri(this.value);
    });

    selParametro.addEventListener("change", function () {
        const codice = this.value;
        const param = x1_parametri.find(p => p.PARAMETRO === codice);
        if (param) {
            x1_mostraInfoParametro(param);
            x1_popolaValori(param);
        }
    });
});

// ======================================================================
// MENU
// ======================================================================

function x1_popolaMenu() {
    const selMenu = document.getElementById("menu");
    selMenu.innerHTML = "";

    const visti = new Set();

    x1_menu_struttura_data.forEach(riga => {
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
        x1_popolaSottomenu(selMenu.value);
    }
}

// ======================================================================
// SOTTOMENU
// ======================================================================

function x1_popolaSottomenu(codMenu) {
    const selSottomenu = document.getElementById("sottomenu");
    selSottomenu.innerHTML = "";

    const lista = x1_menu_struttura_data.filter(riga => {
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
        x1_popolaParametri(selSottomenu.value);
    } else {
        x1_svuotaParametri();
    }
}

// ======================================================================
// PARAMETRI
// ======================================================================

function x1_svuotaParametri() {
    document.getElementById("parametro").innerHTML = "";
    document.getElementById("info_parametro").innerHTML = "";
}

// ======================================================================
// PARAMETRI → POPOLA
// ======================================================================

function x1_popolaParametri(codMenuCompleto) {
    const selParametro = document.getElementById("parametro");
    const selValore    = document.getElementById("tendina_valori");
    const boxInfo      = document.getElementById("info_parametro");

    selParametro.innerHTML = "";
    selValore.innerHTML    = "";
    boxInfo.innerHTML      = "";

    const prefisso = codMenuCompleto + ".";

    let lista = x1_parametri.filter(p => {
        return p.PARAMETRO && p.PARAMETRO.startsWith(prefisso);
    });

    if (lista.length === 0) {
        const menu = codMenuCompleto.split(".")[0];
        lista = x1_parametri.filter(p => p.PARAMETRO.startsWith(menu + "."));
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

        x1_mostraInfoParametro(primo);
        x1_popolaValori(primo);

        document.getElementById("codice_parametro").value      = primo.PARAMETRO || "";
        document.getElementById("descrizione_parametro").value = primo.DESCRIZIONE || "";
    }
}

// ======================================================================
// INFO PARAMETRO
// ======================================================================

function x1_mostraInfoParametro(param) {
    const box = document.getElementById("info_parametro");

    box.innerHTML = `
        <b>Codice:</b> ${param.PARAMETRO}<br>
        <b>Descrizione:</b> ${param.DESCRIZIONE}<br>
        <b>Valore grezzo:</b> ${x1_pulisciValore(param.VALORE)}
    `;

    document.getElementById("codice_parametro").value      = param.PARAMETRO || "";
    document.getElementById("descrizione_parametro").value = param.DESCRIZIONE || "";
}

// ======================================================================
// VALORI
// ======================================================================

function x1_pulisciValore(v) {
    if (!v) return "";
    return String(v).trim();
}

function x1_popolaValori(param) {
    console.log("PARAM:", param.PARAMETRO, "VALORE:", param.VALORE);

    const tendina = document.getElementById("tendina_valori");
    tendina.innerHTML = "";

    // 1) Caso speciale: parametro 1.0.00
    if (param.PARAMETRO === "1.0.00") {

        x1_param_1_0_00.forEach(voce => {
            const opt = document.createElement("option");
            const pulita = x1_pulisciValore(voce);
            opt.value = pulita;
            opt.textContent = pulita;
            tendina.appendChild(opt);
        });

        const id = x1_pulisciValore(param.VALORE);
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

    // 2) Caso speciale: parametro 1.0.01
    if (param.PARAMETRO === "1.0.01") {

        tendina.innerHTML = "";

        x1_param_1_0_01.forEach(voce => {
            const opt = document.createElement("option");
            const pulita = x1_pulisciValore(voce);
            opt.value = pulita;
            opt.textContent = pulita;
            tendina.appendChild(opt);
        });

        const id = x1_pulisciValore(param.VALORE);
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
        const pulita = x1_pulisciValore(voce);
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
        const param = x1_parametri.find(p => p.PARAMETRO === sel.value);
        if (param) {
            x1_mostraInfoParametro(param);
            x1_popolaValori(param);
        }
    }
});

document.getElementById("parametro_down").addEventListener("click", () => {
    const sel = document.getElementById("parametro");
    if (sel.selectedIndex < sel.options.length - 1) {
        sel.selectedIndex++;
        const param = x1_parametri.find(p => p.PARAMETRO === sel.value);
        if (param) {
            x1_mostraInfoParametro(param);
            x1_popolaValori(param);
        }
    }
});

// ======================================================================
// DEBUG: MAPPA FILE + MAPPA COLONNE + MOUSEOVER
// ======================================================================

/* =========================================================
BLOCCO: MAPPE DEBUG PROGRAMMATORE X1
VERSIONE: 28/04/2026 – 11:40
========================================================= */

// Mappa file (puoi estenderla con i tuoi nomi reali)
const mappaFile = {
    // Esempi tipici:
    "menu":              "x1_programmatore_menu.js",
    "sottomenu":         "x1_programmatore_menu.js",
    "parametro":         "x1_programmatore_menu.js",
    "tendina_valori":    "x1_programmatore_menu.js",

    "codice_parametro":      "x1_programmatore_menu.js",
    "descrizione_parametro": "x1_programmatore_menu.js",
    "unita_misura":          "x1_programmatore_menu.js",
    "val_min":               "x1_programmatore_menu.js",
    "val_max":               "x1_programmatore_menu.js",

    // Bottoni documenti parametro
    "btn_file1_parametro": "x1_parametri_data.js",
    "btn_file2_parametro": "x1_parametri_data.js",
    "btn_file3_parametro": "x1_parametri_data.js",
    "btn_file4_parametro": "x1_parametri_data.js",
    "btn_file5_parametro": "x1_parametri_data.js",
    "btn_file6_parametro": "x1_parametri_data.js",
    "btn_file7_parametro": "x1_parametri_data.js",
    "btn_file8_parametro": "x1_parametri_data.js"
};

// Mappa colonne (basata su MAPPA_X1_PARAMETRI VERS1.1.HTML)
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

    // Se è un bottone documento, prova a leggere dal tuo archivio file (se esiste)
    if (id.startsWith("btn_file")) {
        try {
            const parametro = document.getElementById("parametro")?.value;
            const valore    = document.getElementById("tendina_valori")?.value;

            if (typeof x1_file_parametri !== "undefined" && parametro && valore) {
                const files = x1_file_parametri[parametro]?.files?.[valore] || [];
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

/* ===================== FINE BLOCCO MAPPE DEBUG PROGRAMMATORE X1 ===================== */
