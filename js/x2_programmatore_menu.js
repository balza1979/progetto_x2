// ======================================================================
// FILE: x2_programmatore_menu.js
// DESCRIZIONE: Logica MENU  → SOTTOMENU → PARAMETRI → VALORI + DEBUG MAPPE
// AUTORE: Luca + Copilot
// DATA: 28/04/2026 – 11:40
// ======================================================================

// ------------------------------------------------------------
// INIZIO MODIFICA - FUNZIONI PULSANTI MENU / SOTTOMENU
// ------------------------------------------------------------
function x2_aggiornaMenuButtons(codMenu) {

    const record = x2_menu_struttura_data.find(r => r.cod__menu.startsWith(codMenu + "."));

    const pulsanti = [];
    for (let i = 1; i <= 8; i++) {
        pulsanti.push(document.getElementById("menu_btn" + i));
    }

    for (let i = 0; i < 8; i++) {
        const nomeCampo = "file" + (i + 1) + "_menu";
        const file = record ? record[nomeCampo] : "/";

        if (file && file !== "/") {
            pulsanti[i].textContent = file;
            pulsanti[i].disabled = false;
            pulsanti[i].onclick = () => window.open("img/" + file, "_blank");
        } else {
            pulsanti[i].textContent = "-";
            pulsanti[i].disabled = true;
            pulsanti[i].onclick = null;
        }
    }
}

function x2_aggiornaSottomenuButtons(codMenu, codSottomenu) {

    const codice = codMenu + "." + codSottomenu;
    const record = x2_menu_struttura_data.find(r => r.cod__menu === codice);

    const pulsanti = [];
    for (let i = 1; i <= 8; i++) {
        pulsanti.push(document.getElementById("sottomenu_btn" + i));
    }

    for (let i = 0; i < 8; i++) {
        const nomeCampo = "file" + (i + 1) + "_sottomenu";
        const file = record ? record[nomeCampo] : "/";

        if (file && file !== "/") {
            pulsanti[i].textContent = file;
            pulsanti[i].disabled = false;
            pulsanti[i].onclick = () => window.open("img/" + file, "_blank");
        } else {
            pulsanti[i].textContent = "-";
            pulsanti[i].disabled = true;
            pulsanti[i].onclick = null;
        }
    }
}
// ------------------------------------------------------------
// FINE MODIFICA - FUNZIONI PULSANTI MENU / SOTTOMENU
// ------------------------------------------------------------

document.addEventListener("DOMContentLoaded", function () {

    const selMenu       = document.getElementById("menu");
    const selSottomenu  = document.getElementById("sottomenu");
    const selParametro  = document.getElementById("parametro");
    const selValore     = document.getElementById("tendina_valori");

    x2_popolaMenu();

    selMenu.addEventListener("change", function () {
        x2_popolaSottomenu(this.value);
        selSottomenu.dispatchEvent(new Event("change"));   // ★ FIX VALORI
        x2_aggiornaMenuButtons(this.value);                // ★ PULSANTI MENU
    });

    selSottomenu.addEventListener("change", function () {
        x2_popolaParametri(this.value);
        selParametro.dispatchEvent(new Event("change"));   // ★ FIX VALORI
        x2_aggiornaSottomenuButtons(selMenu.value, this.value); // ★ PULSANTI SOTTOMENU
    });

    selParametro.addEventListener("change", function () {
        const codice = this.value;
        const param = x2_parametri.find(p => p.PARAMETRO === codice);
        if (param) {
            x2_mostraInfoParametro(param);
            x2_popolaValori(param);                        // ★ FIX VALORI
        }
    });

    // ------------------------------------------------------------
    // INIZIO MODIFICA - AGGIORNAMENTO VAL1–VAL8 AL CAMBIO VALORE
    // File: x2_programmatore_menu.js
    // Data: 2026-04-29
    // ------------------------------------------------------------

document.getElementById("tendina_valori").addEventListener("change", function () {

    const codice = document.getElementById("parametro").value;
    const param = x2_parametri.find(p => p.PARAMETRO === codice);
    if (!param) return;

    const id = this.value;

    // Caso speciale 1.0.00 → aggiorna SOLO i pulsanti
    if (param.PARAMETRO.trim() === "1.0.00") {

        x2_caricaJSON("1.0.00", function(data) {

            const lista = data.file_parametro[id];
            const pulsanti = [val1,val2,val3,val4,val5,val6,val7,val8];

            for (let i = 0; i < 8; i++) {
                if (lista && lista[i]) {
                    pulsanti[i].textContent = lista[i];
                    pulsanti[i].disabled = false;
                    pulsanti[i].onclick = () => window.open("img/" + lista[i], "_blank");
                } else {
                    pulsanti[i].textContent = "-";
                    pulsanti[i].disabled = true;
                    pulsanti[i].onclick = null;
                }
            }
        });

        return;
    }

    // Parametri normali → aggiorna valore e ricarica tendina
    param.VALORE = id;
    x2_popolaValori(param);
});

// ------------------------------------------------------------
// FINE MODIFICA
// ------------------------------------------------------------







    
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
        selMenu.dispatchEvent(new Event("change"));        // ★ FIX VALORI
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
    }
}
// ======================================================================
// PARAMETRI
// ======================================================================

function x2_svuotaParametri() {
    document.getElementById("parametro").innerHTML = "";
    document.getElementById("info_parametro").innerHTML = "";
}

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

// ======================================================================
// LOADER JSON
// ======================================================================

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
// ======================================================================
// x2_popolaValori — FIXATA PER FAR FUNZIONARE I VALORI
// ======================================================================

function x2_popolaValori(param) {

    const tendina = document.getElementById("tendina_valori");
    tendina.innerHTML = "";
    
    // ------------------------------------------------------------
    // INIZIO MODIFICA - RESET PULSANTI AD OGNI CAMBIO PARAMETRO/VALORE
    // File: x2_programmatore_menu.js
    // Data: 2026-04-29
    // Motivo: evitare che i pulsanti mostrino file del parametro precedente
    // ------------------------------------------------------------

    const pulsantiReset = [val1,val2,val3,val4,val5,val6,val7,val8];
    for (let i = 0; i < 8; i++) {
        pulsantiReset[i].textContent = "-";
        pulsantiReset[i].disabled = true;
        pulsantiReset[i].onclick = null;
    }

    // ------------------------------------------------------------
    // FINE MODIFICA
    // ------------------------------------------------------------

    // ============================================================
    // CASO SPECIALE 1.0.00 (JSON)
    // ============================================================

    if (param.PARAMETRO.trim() === "1.0.00") {

        x2_caricaJSON("1.0.00", function(data) {

            // 1) Popola tendina con ID + testo
            data.valori.forEach(voce => {
                const opt = document.createElement("option");
                opt.value = voce.id;
                opt.textContent = "\"" + voce.id + "\" " + voce.text;
                tendina.appendChild(opt);
            });

            // 2) Imposta valore attuale
            const valorePulito = param.VALORE.toString().trim().padStart(2, "0");
            tendina.value = valorePulito;

            // 3) Lista immagini
            const lista = data.file_parametro[valorePulito];

            // 4) Pulsanti VAL1–VAL8
            const pulsanti = [val1,val2,val3,val4,val5,val6,val7,val8];

            for (let i = 0; i < 8; i++) {
                if (lista && lista[i]) {
                    pulsanti[i].textContent = lista[i];
                    pulsanti[i].disabled = false;
                    pulsanti[i].onclick = () => window.open("img/" + lista[i], "_blank");
                } else {
                    pulsanti[i].textContent = "-";
                    pulsanti[i].disabled = true;
                    pulsanti[i].onclick = null;
                }
            }

            // 5) Campi numerici non applicabili
            unita_misura.value = "/";
            val_min.value = "/";
            val_max.value = "/";
        });

        return;
    }

    // ============================================================
    // CASO SPECIALE 1.0.01
    // ============================================================

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

        unita_misura.value = "/";
        val_min.value      = "/";
        val_max.value      = "/";

        return;
    }

    // ============================================================
    // METODO STANDARD
    // ============================================================

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

    unita_misura.value = "";
    val_min.value      = "";
    val_max.value      = "";
}

// ======================================================================
// NAVIGAZIONE PARAMETRI
// ======================================================================

parametro_up.addEventListener("click", () => {
    const sel = parametro;
    if (sel.selectedIndex > 0) {
        sel.selectedIndex--;
        sel.dispatchEvent(new Event("change"));
    }
});

parametro_down.addEventListener("click", () => {
    const sel = parametro;
    if (sel.selectedIndex < sel.options.length - 1) {
        sel.selectedIndex++;
        sel.dispatchEvent(new Event("change"));
    }
});
// ======================================================================
// DEBUG MAPPE (identico alla tua versione originale)
// ======================================================================

const mappaFile = {
    "menu": "x2_programmatore_menu.js",
    "sottomenu": "x2_programmatore_menu.js",
    "parametro": "x2_programmatore_menu.js",
    "tendina_valori": "x2_programmatore_menu.js",

    "codice_parametro": "x2_programmatore_menu.js",
    "descrizione_parametro": "x2_programmatore_menu.js",
    "unita_misura": "x2_programmatore_menu.js",
    "val_min": "x2_programmatore_menu.js",
    "val_max": "x2_programmatore_menu.js",

    "btn_file1_parametro": "x2_parametri_data.js",
    "btn_file2_parametro": "x2_parametri_data.js",
    "btn_file3_parametro": "x2_parametri_data.js",
    "btn_file4_parametro": "x2_parametri_data.js",
    "btn_file5_parametro": "x2_parametri_data.js",
    "btn_file6_parametro": "x2_parametri_data.js",
    "btn_file7_parametro": "x2_parametri_data.js",
    "btn_file8_parametro": "x2_parametri_data.js"
};

const mappaColonne = {
    "id_descrizione_parametro": { col: "D", ref: "DESCRIZIONE" },
    "id_valore_default": { col: "G", ref: "VALORE_DEFAULT" },
    "id_descrizione_default": { col: "H", ref: "DESCRIZIONE_DEFAULT" },

    "btn_file1_parametro": { col: "I", ref: "file1_parametro" },
    "btn_file2_parametro": { col: "J", ref: "file2_parametro" },
    "btn_file3_parametro": { col: "K", ref: "file3_parametro" },
    "btn_file4_parametro": { col: "L", ref: "file4_parametro" },
    "btn_file5_parametro": { col: "M", ref: "file5_parametro" },
    "btn_file6_parametro": { col: "N", ref: "file6_parametro" },
    "btn_file7_parametro": { col: "O", ref: "file7_parametro" },
    "btn_file8_parametro": { col: "P", ref: "file8_parametro" },

    "id_min": { col: "S", ref: "MIN" },
    "id_max": { col: "T", ref: "MAX" },
    "id_unita": { col: "V", ref: "UNITA" },

    "id_pos_memoria": { col: "X", ref: "POS_MEMORIA" },
    "id_byte": { col: "Y", ref: "BYTE" },
    "id_bit": { col: "Z", ref: "BIT" },

    "id_vardato1": { col: "AA", ref: "VARDATO1" },
    "id_vardato2": { col: "AB", ref: "VARDATO2" },
    "id_vardato3": { col: "AC", ref: "VARDATO3" },

    "id_conversione": { col: "AD", ref: "CONVERSIONE" },

    "id_can1": { col: "AE", ref: "CAN1" },
    "id_can2": { col: "AF", ref: "CAN2" },
    "id_can3": { col: "AG", ref: "CAN3" },
    "id_can4": { col: "AH", ref: "CAN4" },
    "id_can5": { col: "AI", ref: "CAN5" },
    "id_can6": { col: "AJ", ref: "CAN6" },
    "id_can7": { col: "AK", ref: "CAN7" },
    "id_can8": { col: "AL", ref: "CAN8" },
    "id_can9": { col: "AM", ref: "CAN9" },
    "id_can10": { col: "AN", ref: "CAN10" },
    "id_can11": { col: "AO", ref: "CAN11" },
    "id_can12": { col: "AP", ref: "CAN12" },
    "id_can13": { col: "AQ", ref: "CAN13" },
    "id_can14": { col: "AR", ref: "CAN14" },
    "id_can15": { col: "AS", ref: "CAN15" },
    "id_can16": { col: "AT", ref: "CAN16" },

    "id_ai1": { col: "AU", ref: "INTEL_AI1" },
    "id_ai2": { col: "AV", ref: "INTEL_AI2" },
    "id_ai3": { col: "AW", ref: "INTEL_AI3" },
    "id_ai4": { col: "AX", ref: "INTEL_AI4" },
    "id_ai5": { col: "AY", ref: "INTEL_AI5" },
    "id_ai6": { col: "AZ", ref: "INTEL_AI6" },
    "id_ai7": { col: "BA", ref: "INTEL_AI7" },
    "id_ai8": { col: "BB", ref: "INTEL_AI8" },
    "id_ai9": { col: "BC", ref: "INTEL_AI9" },
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

    "id_libera1": { col: "BO", ref: "LIBERA1" },
    "id_libera2": { col: "BP", ref: "LIBERA2" },
    "id_libera3": { col: "BQ", ref: "LIBERA3" },
    "id_libera4": { col: "BR", ref: "LIBERA4" },
    "id_libera5": { col: "BS", ref: "LIBERA5" },
    "id_libera6": { col: "BT", ref: "LIBERA6" },
    "id_libera7": { col: "BU", ref: "LIBERA7" },
    "id_libera8": { col: "BV", ref: "LIBERA8" },
    "id_libera9": { col: "BW", ref: "LIBERA9" },
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

    let file = mappaFile[id] || "—";

    if (id.startsWith("btn_file")) {
        try {
            const parametro = document.getElementById("parametro")?.value;
            const valore    = document.getElementById("tendina_valori")?.value;

            if (typeof x2_file_parametri !== "undefined" && parametro && valore) {
                const files = x2_file_parametri[parametro]?.files?.[valore] || [];
                const index = parseInt(id.replace("btn_file", "").replace("_parametro", ""), 10) - 1;
                const fileAssociato = files[index];
                if (fileAssociato) file = fileAssociato;
            }
        } catch (err) {}
    }

    dbgFile.innerText = file;

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
