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

    // B
    let byteB = null;
    if (memB && memB[indirizzo] != null) {
        byteB = memB[indirizzo].toString(16).toUpperCase().padStart(2, "0");
    }

    // C
    let byteC = null;
    if (memC && memC[indirizzo] != null) {
        byteC = memC[indirizzo].toString(16).toUpperCase().padStart(2, "0");
    }

    // CAMPO (attenzione: potrebbe NON essere hex!)
    let rawCampo = campo.value;
    let byteCampo = parseInt(rawCampo, 16);

    let campoHex = isNaN(byteCampo)
        ? "NaN"
        : byteCampo.toString(16).toUpperCase().padStart(2, "0");

    // ============================
    // DEBUG POPUP
    // ============================

    alert(
        "DEBUG COLORE\n\n" +
        "RAW CAMPO: " + rawCampo + "\n" +
        "CAMPO HEX: " + campoHex + "\n\n" +
        "A: " + byteA + "\n" +
        "B: " + byteB + "\n" +
        "C: " + byteC + "\n\n" +
        "NOTE:\n" +
        "- Se CAMPO HEX = NaN → il valore NON è hex.\n" +
        "- Se CAMPO HEX ≠ C → ROSSO.\n" +
        "- Se CAMPO HEX = C ma C ≠ A → GIALLO.\n" +
        "- Se CAMPO HEX = A → VERDE.\n"
    );

    // ============================
    // COLORI
    // ============================

    if (!byteC) {
        campo.style.backgroundColor = "#006600";
        campo.style.color = "white";
        return;
    }

    if (campoHex !== byteC) {
        campo.style.backgroundColor = "#990000";
        campo.style.color = "white";
        return;
    }

    if (byteA && byteC !== byteA) {
        campo.style.backgroundColor = "#CCAA00";
        campo.style.color = "black";
        return;
    }

    campo.style.backgroundColor = "#006600";
    campo.style.color = "white";
}
