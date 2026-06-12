function aggiornaColoreValore() {

    if (!ultimoParametro) return;

    const indirizzo = parseInt(ultimoParametro.LIBERA1);
    if (isNaN(indirizzo)) return;

    // CAMPO CORRETTO: tendina oppure wrapper del MIN_MAX
    const campo =
        document.getElementById("tendina_valori") ||
        document.getElementById("input_minmax")?.parentNode;

    if (!campo) return;

    const valA = toHex2(ultimoParametro.VALORE_DEFAULT ?? ultimoParametro.VALORE);
    const valB = ultimoParametro.VALORE_B ? toHex2(ultimoParametro.VALORE_B) : null;
    const valC = memC ? toHex2(memC[indirizzo]) : null;

    if (!valC || valC === valA) {
        campo.style.backgroundColor = "#006600";
        campo.style.color = "white";
        return;
    }

    if (valB && valC === valB) {
        campo.style.backgroundColor = "#999900";
        campo.style.color = "white";
        return;
    }

    campo.style.backgroundColor = "#990000";
    campo.style.color = "white";
}
