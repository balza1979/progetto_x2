// ======================================================================
// FILE: x2_loader.js
// DESCRIZIONE: caricamento JSON per tendine valori e parametri X2
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
