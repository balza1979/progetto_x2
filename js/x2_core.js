/* ============================================================
   X2 CORE — COMPATIBILE CON x2_parametri_data.js ATTUALE
   ============================================================ */

const X2_CORE = {

    caricaJSON(nome, callback) {
        fetch("json_tendine/" + nome + ".json")
            .then(r => r.json())
            .then(data => callback(data))
            .catch(err => callback({ tipo: "NONE" }));
    },

    getTipoParametro(param) {
        const tipo = (param["TIPO ELENCO"] || "").trim().toUpperCase();

        if (tipo === "ELENCO_PREDEFINITO") return "ELENCO";
        if (tipo === "RANGE") return "NUM";
        if (tipo === "TESTO") return "TEXT";
        if (tipo === "BOOL") return "BOOL";

        return "NONE";
    },

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

        // ELENCO (SPECIFICO o COMUNE) da JS_FONTE_ELENCO_VALORI
        if (tipo === "ELENCO") {
            const nomeJSON = (param.JS_FONTE_ELENCO_VALORI || "").trim();
            if (!nomeJSON) return callback({ tipo: "NONE" });
            return this.caricaJSON(nomeJSON, callback);
        }

        return callback({ tipo: "NONE" });
    },

    pulisci(v) {
        if (!v) return "";
        return String(v).trim();
    }
};
