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
    let campoNum = parseInt(rawCampo, 16);
    let campoHex = isNaN(campoNum)
        ? "NaN"
        : campoNum.toString(16).toUpperCase().padStart(2, "0");

    let colorePrevisto = "";
    let motivo = "";

    // ============================
    // LOGICA COLORI
    // ============================

    if (!byteC) {
        colorePrevisto = "VERDE";
        motivo = "C mancante → parametro mai salvato";
    }
    else if (campoHex !== byteC) {
        colorePrevisto = "ROSSO";
        motivo = "CAMPO (" + campoHex + ") diverso da C (" + byteC + ")";
    }
    else if (byteA && byteC !== byteA) {
        colorePrevisto = "GIALLO";
        motivo = "CAMPO = C ma C (" + byteC + ") diverso da A (" + byteA + ")";
    }
    else {
        colorePrevisto = "VERDE";
        motivo = "CAMPO = C = A";
    }

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
        "COLORE PREVISTO: " + colorePrevisto + "\n" +
        "MOTIVO: " + motivo + "\n"
    );

    // ============================
    // APPLICA COLORE
    // ============================

    if (colorePrevisto === "VERDE") {
        campo.style.backgroundColor = "#006600";
        campo.style.color = "white";
    }
    else if (colorePrevisto === "GIALLO") {
        campo.style.backgroundColor = "#CCAA00";
        campo.style.color = "black";
    }
    else if (colorePrevisto === "ROSSO") {
        campo.style.backgroundColor = "#990000";
        campo.style.color = "white";
    }
}
