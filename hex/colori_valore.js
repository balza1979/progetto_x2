function aggiornaColoreValore(indirizzo) {

    const campoProg = document.getElementById("tendina_valori");

    // ============================
    // CASO 1: PROGRAMMATORE X2
    // ============================
    // Se NON c'è indirizzo → siamo nel programmatore
    if (indirizzo === undefined || indirizzo === null) {
        // NON fare confronto A/B/C
        // NON toccare memoriaA/B/C
        // NON bloccare la UI
        return;
    }

    // ============================
    // CASO 2: TABELLA CONFRONTO
    // ============================
    const campoTab = document.getElementById("valoreC_" + indirizzo);
    if (campoTab && typeof memoriaC !== "undefined") {

        const valA = memoriaA?.[indirizzo];
        const valB = memoriaB?.[indirizzo];
        const valC = memoriaC?.[indirizzo];

        campoTab.style.backgroundColor = "";
        campoTab.style.color = "white";

        if (!valC || valC === "--") return;

        if (valC === valA) {
            campoTab.style.backgroundColor = "#006600"; // verde
            return;
        }

        if (valC === valB) {
            campoTab.style.backgroundColor = "#999900"; // giallo
            return;
        }

        campoTab.style.backgroundColor = "#990000"; // rosso
        return;
    }
}
