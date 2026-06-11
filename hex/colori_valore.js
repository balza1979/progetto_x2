/* === colori_valore.js — VERSIONE CORRETTA === */

function aggiornaColoreValore(indirizzo) {

    const campoProg = document.getElementById("tendina_valori");
    const campoTab  = document.getElementById("valoreC_" + indirizzo);

    // Se non ho memorie → verde
    if (!memoriaA || !memoriaB || !memoriaC) {
        if (campoProg) campoProg.style.backgroundColor = "#006600";
        if (campoTab)  campoTab.style.backgroundColor  = "#006600";
        return;
    }

    const valA = memoriaA[indirizzo];
    const valB = memoriaB[indirizzo];
    const valC = memoriaC[indirizzo];

    function colora(el) {
        if (!el) return;

        // C = A → VERDE
        if (valC === valA) {
            el.style.backgroundColor = "#006600";
            el.style.color = "white";
            return;
        }

        // C = B → GIALLO
        if (valC === valB) {
            el.style.backgroundColor = "#999900";
            el.style.color = "white";
            return;
        }

        // C ≠ A e C ≠ B → ROSSO
        el.style.backgroundColor = "#990000";
        el.style.color = "white";
    }

    colora(campoProg);
    colora(campoTab);
}

/* === FINE === */
