// ======================================================================
// FILE: js/x2_loader.js
// PERCORSO: progetto_x2/js/x2_loader.js
// DATA: 30/04/2026
// ORA: 11:35
// DESCRIZIONE:
// - Ripristinata funzione x2_caricaJSON()
// - Gestione errori fetch JSON
// - Percorso json_tendine/<nome>.json
// - FIX: rimuove eventuale ".json" doppio
// ======================================================================

// … codice loader …

function x2_caricaJSON(nomeFile, callback) {

    // Se il nome contiene già ".json", lo rimuovo
    // così evitiamo ".json.json"
    if (nomeFile.endsWith(".json")) {
        nomeFile = nomeFile.slice(0, -5);
    }

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
