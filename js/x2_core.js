/* ============================================================
   X2 CORE — LOGICA PARAMETRI / VALORI / NUMERICI / JSON
   ============================================================ */

const X2_CORE = {

    // ------------------------------------------------------------
    // Carica JSON (SPECIFICO o ELENCO COMUNE)
    // ------------------------------------------------------------
    caricaJSON(nome, callback) {
        fetch("json_tendine/" + nome + ".json")
            .then(r => r.json())
            .then(data => callback(data))
            .catch(err => console.error("Errore JSON:", nome, err));
    },

    // ------------------------------------------------------------
    // Restituisce il tipo del parametro (SPECIFICO, #elenco, *minimax…)
    // ------------------------------------------------------------
    getTipoParametro(param) {
        return (param.VALORI || "").trim();
    },

    // ------------------------------------------------------------
    // Restituisce i valori del parametro (logica MASTER)
    // ------------------------------------------------------------
    getValori(param, callback) {

        const tipo = this.getTipoParametro(param);

        // SPECIFICO → JSON dedicato
        if (tipo === "SPECIFICO") {
            return this.caricaJSON(param.PARAMETRO.trim(), callback);
        }

        // ELENCO COMUNE → JSON condiviso
        if (tipo.startsWith("#")) {
            const nome = tipo.substring(1);
            return this.caricaJSON(nome, callback);
        }

        // NUMERICO → nessun JSON
        if (tipo === "*minimax") {
            return callback({
                tipo: "NUM",
                min: param.MIN,
                max: param.MAX,
                dec: param.DEC,
                unita: param.UNITA
            });
        }

        // TESTO LIBERO
        if (tipo === "*text") {
            return callback({ tipo: "TEXT" });
        }

        // BOOLEANO
        if (tipo === "*bool") {
            return callback({
                tipo: "BOOL",
                valori: [
                    { id: "0", text: "No" },
                    { id: "1", text: "Sì" }
                ]
            });
        }

        // Default → nessun valore
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
