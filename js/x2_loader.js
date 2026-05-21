// ======================================================================
// FILE: js/x2_loader.js
// PERCORSO: progetto_x2/js/x2_loader.js
// DATA: 30/04/2026
// ORA: 11:35
// DESCRIZIONE:
// - Ripristinata funzione x2_caricaJSON()
// - Gestione errori fetch JSON
// - Percorso json_tendine/<nome>.json
// - FIX: nomeFile ora è usato così com'è (niente .json aggiunto)
// ======================================================================

// … codice loader …

function x2_caricaJSON(nomeFile, callback) {

    // ⚠️ IMPORTANTE:
    // nomeFile DEVE essere già senza estensione
    // esempio: "2.2.xx" → apre "json_tendine/2.2.xx.json"

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
