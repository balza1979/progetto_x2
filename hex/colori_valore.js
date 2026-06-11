function aggiornaColoreValore(indirizzo) {

    const campoProg = document.getElementById("tendina_valori");
    const campoTab  = document.getElementById("valoreC_" + indirizzo);

    // Se non ho memoria C → verde fisso
    if (!memoriaC) {
        if (campoProg) campoProg.style.backgroundColor = "#006600";
        if (campoTab)  campoTab.style.backgroundColor  = "#006600";
        return;
    }

    const valA = memoriaA?.[indirizzo];
    const valB = memoriaB?.[indirizzo];
    const valC = memoriaC?.[indirizzo];

    // Funzione helper per colorare un elemento
    function colora(el) {
        if (!el) return;

        if (!valC || valC === "--") {
            el.style.backgroundColor = "#006600"; // verde default
            return;
        }

        if (valC === valA) {
            el.style.backgroundColor = "#006600"; // verde
            return;
        }

        if (valC === valB) {
            el.style.backgroundColor = "#999900"; // giallo
            return;
        }

        el.style.backgroundColor = "#990000"; // rosso
    }

    colora(campoProg);
    colora(campoTab);
}
