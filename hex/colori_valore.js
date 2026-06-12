function aggiornaColoreValore() {

    if (!ultimoParametro) return;

    const indirizzo = parseInt(ultimoParametro.LIBERA1);
    if (isNaN(indirizzo)) return;

    const campo =
        document.getElementById("tendina_valori") ||
        document.getElementById("input_minmax");

    if (!campo) return;

    const valA = toHex2(ultimoParametro.VALORE_DEFAULT ?? ultimoParametro.VALORE);
    const valB = ultimoParametro.VALORE_B ? toHex2(ultimoParametro.VALORE_B) : null;
    const valC = memC ? toHex2(memC[indirizzo]) : null;

    if (!valC || valC === valA) {
        campo.style.setProperty("background-color", "#006600", "important");
        campo.style.setProperty("color", "white", "important");
        return;
    }

    if (valB && valC === valB) {
        campo.style.setProperty("background-color", "#999900", "important");
        campo.style.setProperty("color", "white", "important");
        return;
    }

    campo.style.setProperty("background-color", "#990000", "important");
    campo.style.setProperty("color", "white", "important");
}
