// ======================================================================
// FILE: x2_debug.js
// DESCRIZIONE: Mappe debug + mouseover per Programmatore X2
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
