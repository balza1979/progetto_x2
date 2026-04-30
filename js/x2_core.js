/* ============================================================
   X2 CORE — COMPATIBILE CON MAPPA X1 (Q,R,S,T,U,V)
   ============================================================ */

const X2_CORE = {

    // ------------------------------------------------------------
    // Carica JSON (SPECIFICO o ELENCO COMUNE)
    // ------------------------------------------------------------
    caricaJSON(nome, callback) {
        fetch("json_tendine/" + nome + ".json")
            .then(r => r.json())
            .then(data => callback(data))
            .catch(err => callback({ tipo: "NONE" }));
    },

    // ------------------------------------------------------------
    // Interpreta il tipo del parametro dalla MAPPA X1
    // ------------------------------------------------------------
    getTipoParametro(param) {

        const tipo = (param["TIPO ELENCO"] || "").trim().toUpperCase();

        if (tipo === "ELENCO_PREDEFINITO") return "ELENCO";
        if (tipo === "RANGE") return "NUM";
        if (tipo === "TESTO") return "TEXT";
        if (tipo === "BOOL") return "BOOL";

        return "NONE";
    },

    // ------------------------------------------------------------
    // Restituisce i valori del parametro (logica MASTER X1)
    // ------------------------------------------------------------
    getValori(param, callback) {

        const tipo = this.getTipoParametro(param);

        // NUMERICO (RANGE)
        if (tipo === "NUM") {
            return callback({
                tipo: "NUM",
                min: param.MIN,
                max: param.MAX,
                dec: param.DECIMALI,
                unita: param.UNITA
            });
        }

        // TESTO LIBERO
        if (tipo === "TEXT") {
            return callback({ tipo: "TEXT" });
        }

        // BOOLEANO
        if (tipo === "BOOL") {
            return callback({
                tipo: "BOOL",
                valori: [
                    { id: "0", text: "No" },
                    { id: "1", text: "Sì" }
                ]
            });
        }

        // ELENCO (SPECIFICO o COMUNE)
        if (tipo === "ELENCO") {
            const nomeJSON = (param.JS_FONTE_ELENCO_VALORI || "").trim();
            if (!nomeJSON) return callback({ tipo: "NONE" });
            return this.caricaJSON(nomeJSON, callback);
        }

        // Nessun valore
        return callback({ tipo: "NONE" });
    },

    // ------------------------------------------------------------
    // Utility
    // ------------------------------------------------------------
    pulisci(v) {
        if (!v) return "";
        return String(v).trim();
    }
};
