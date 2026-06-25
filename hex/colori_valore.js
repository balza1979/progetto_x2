function aggiornaColoreValore(indirizzo) {

    if (indirizzo == null || isNaN(indirizzo)) return;

    const campo = document.getElementById("tendina_valori");
    if (!campo) return;

    // A, B, C presi dalle memorie, NON da VALORE_DEFAULT
    let byteA = null;
    if (memA && memA[indirizzo] != null) {
        byteA = memA[indirizzo].toString(16).toUpperCase().padStart(2, "0");
    }

    let byteB = null;
    if (memB && memB[indirizzo] != null) {
        byteB = memB[indirizzo].toString(16).toUpperCase().padStart(2, "0");
    }

    let byteC = null;
    if (memC && memC[indirizzo] != null) {
        byteC = memC[indirizzo].toString(16).toUpperCase().padStart(2, "0");
    }

    const rawCampo = campo.value;
    const campoNum = parseInt(rawCampo, 16);
    const campoHex = isNaN(campoNum)
        ? "NaN"
        : campoNum.toString(16).toUpperCase().padStart(2, "0");

    let colorePrevisto = "";
    let motivo = "";

    if (!byteC) {
        colorePrevisto = "VERDE";
        motivo = "C mancante → mai salvato";
    } else if (campoHex !== byteC) {
        colorePrevisto = "ROSSO";
        motivo = "CAMPO (" + campoHex + ") ≠ C (" + byteC + ")";
    } else if (byteA && byteC !== byteA) {
        colorePrevisto = "GIALLO";
        motivo = "CAMPO = C ma C (" + byteC + ") ≠ A (" + byteA + ")";
    } else {
        colorePrevisto = "VERDE";
        motivo = "CAMPO = C = A";
    }

    alert(
        "DEBUG COLORE\n\n" +
        "RAW CAMPO: " + rawCampo + "\n" +
        "CAMPO HEX: " + campoHex + "\n\n" +
        "A (memA): " + byteA + "\n" +
        "B (memB): " + byteB + "\n" +
        "C (memC): " + byteC + "\n\n" +
        "COLORE PREVISTO: " + colorePrevisto + "\n" +
        "MOTIVO: " + motivo + "\n"
    );

    if (colorePrevisto === "VERDE") {
        campo.style.backgroundColor = "#006600";
        campo.style.color = "white";
    } else if (colorePrevisto === "GIALLO") {
        campo.style.backgroundColor = "#CCAA00";
        campo.style.color = "black";
    } else {
        campo.style.backgroundColor = "#990000";
        campo.style.color = "white";
    }
}
