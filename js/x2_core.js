/* ============================================================
   X2 CORE — COMPATIBILE CON x2_parametri_data.js
   ============================================================ */

const X2_CORE = {

    /* ---------------------------------------------------------
       CARICA JSON (SPECIFICO o COMUNE)
       --------------------------------------------------------- */
    caricaJSON(nome, callback) {
        fetch("json_tendine/" + nome + ".json")
            .then(r => r.json())
            .then(data => callback(data))
            .catch(err => callback({ tipo: "NONE" }));
    },

    /* ---------------------------------------------------------
       DETERMINA IL TIPO DEL PARAMETRO
       --------------------------------------------------------- */
    getTipoParametro(param) {

        // ATTENZIONE: nel tuo file è "TIPO ELENCO" con spazio
        const tipo = (param["TIPO ELENCO"] || "").trim().toUpperCase();

        if (tipo === "ELENCO_PREDEFINITO") return "ELENCO";
        if (tipo === "RANGE") return "NUM";
        if (tipo === "TESTO") return "TEXT";
        if (tipo === "BOOL") return "BOOL";

        return "NONE";
    },

    /* ---------------------------------------------------------
       OTTIENE I VALORI DEL PARAMETRO
       --------------------------------------------------------- */
    getValori(param, callback) {

        const tipo = this.getTipoParametro(param);

        /* ---------------- NUMERICO ---------------- */
        if (tipo === "NUM") {
            return callback({
                tipo: "NUM",
                min: param.MIN,
                max: param.MAX,
                dec: param.DECIMALI,
                unita: param.UNITA
            });
        }

        /* ---------------- TESTO ---------------- */
        if (tipo === "TEXT") {
            return callback({ tipo: "TEXT" });
        }

        /* ---------------- BOOLEANO ---------------- */
        if (tipo === "BOOL") {
            return callback({
                tipo: "BOOL",
                valori: [
                    { id: "0", text: "No" },
                    { id: "1", text: "Sì" }
                ]
            });
        }

        /* ---------------- ELENCO (SPECIFICO o COMUNE) ---------------- */
        if (tipo === "ELENCO") {

            let nomeJSON = (param.JS_FONTE_ELENCO_VALORI || "").trim();

            // ⭐ Se scrivi "parametro", usa automaticamente <PARAMETRO>.json
            if (nomeJSON.toLowerCase() === "parametro") {
                nomeJSON = param.PARAMETRO;
            }

            if (!nomeJSON) return callback({ tipo: "NONE" });

            return this.caricaJSON(nomeJSON, callback);
        }

        /* ---------------- NESSUN VALORE ---------------- */
        return callback({ tipo: "NONE" });
    },

    /* ---------------------------------------------------------
       UTILITY
       --------------------------------------------------------- */
    pulisci(v) {
        if (!v) return "";
        return String(v).trim();
    }
};
