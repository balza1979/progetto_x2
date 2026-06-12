function aggiornaColoreValore() {

    if (!ultimoParametro) return;

    const indirizzo = parseInt(ultimoParametro.LIBERA1);
    if (isNaN(indirizzo)) return;

    const campo = document.getElementById("tendina_valori");
    if (!campo) return;

    const valA = String(ultimoParametro.VALORE_DEFAULT ?? ultimoParametro.VALORE)
                    .padStart(2, "0");

    const valB = ultimoParametro.VALORE_B
        ? String(ultimoParametro.VALORE_B).padStart(2, "0")
        : null;

    let valC = null;
    if (memC) {
        valC = memC[indirizzo].toString(16).toUpperCase().padStart(2, "0");
    }

    if (!valC) {
        campo.style.backgroundColor = "#006600";
        campo.style.color = "white";
        return;
    }

    if (valC === valA) {
        campo.style.backgroundColor = "#006600"; // verde
        campo.style.color = "white";
        return;
    }

    if (valB && valC === valB) {
        campo.style.backgroundColor = "#999900"; // giallo
        campo.style.color = "white";
        return;
    }

    campo.style.backgroundColor = "#990000"; // rosso
    campo.style.color = "white";
}
