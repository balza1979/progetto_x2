// ============================================================
//  COLORAZIONE DINAMICA VALORE C IN BASE A MEMORIA A/B
//  Versione 2026-06-11 15:30
// ============================================================

function aggiornaColoreValore(indirizzo) {

    if (!memoriaC || !memoriaA || !memoriaB) return;

    const valA = memoriaA[indirizzo];
    const valB = memoriaB[indirizzo];
    const valC = memoriaC[indirizzo];

    const campo = document.getElementById("valoreC_" + indirizzo);
    if (!campo) return;

    // Reset colore
    campo.style.backgroundColor = "";
    campo.style.color = "white";

    // Se C non esiste → niente colore
    if (!valC || valC === "--") return;

    // ---- REGOLE COLORI ----

    if (valC === valA) {
        campo.style.backgroundColor = "#006600"; // verde
        return;
    }

    if (valC === valB) {
        campo.style.backgroundColor = "#999900"; // giallo
        return;
    }

    // Diverso da A e da B → rosso
    campo.style.backgroundColor = "#990000"; // rosso
}
