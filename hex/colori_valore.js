function aggiornaColoreValore(indirizzo) {

    if (indirizzo == null || isNaN(indirizzo)) return;

    const campo = document.getElementById("tendina_valori");
    if (!campo) return;

    // A (default)
    let byteA = null;
    if (ultimoParametro) {
        byteA = parseInt(
            ultimoParametro.VALORE_DEFAULT ?? ultimoParametro.VALORE,
            16
        ).toString(16).toUpperCase().padStart(2, "0");
    }

    // B (memoria B)
    let byteB = null;
    if (memB && memB[indirizzo] != null) {
        byteB = memB[indirizzo].toString(16).toUpperCase().padStart(2, "0");
    }

    // C (memoria C)
    let byteC = null;
    if (memC && memC[indirizzo] != null) {
        byteC = memC[indirizzo].toString(16).toUpperCase().padStart(2, "0");
    }

    // CAMPO (valore selezionato nella tendina)
    const byteCampo = parseInt(campo.value, 16)
        .toString(16).toUpperCase().padStart(2, "0");

    // ============================
    // COLORI
    // ============================

    // C mancante → VERDE
    if (!byteC) {
        campo.style.backgroundColor = "#006600";
        campo.style.color = "white";
        return;
    }

    // CAMPO ≠ C → ROSSO
    if (byteCampo !== byteC) {
        campo.style.backgroundColor = "#990000";
        campo.style.color = "white";
        return;
    }

    // CAMPO = C ma C ≠ A → GIALLO
    if (byteA && byteC !== byteA) {
        campo.style.backgroundColor = "#CCAA00";
        campo.style.color = "black";
        return;
    }

    // Tutto uguale → VERDE
    campo.style.backgroundColor = "#006600";
    campo.style.color = "white";
}
