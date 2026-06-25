function aggiornaColoreValore() {

    const campo = document.getElementById("tendina_valori");
    if (!campo) return;

    const param = ultimoParametro;
    if (!param) return;

    const indirizzo = parseInt(param.LIBERA1, 16);

    // Valori logici già calcolati da mostraInfoParametro()
    let valoreA = convertValueFromByte(param, memA[indirizzo]);
    let valoreB = convertValueFromByte(param, memB[indirizzo]);
    let valoreC = convertValueFromByte(param, memC[indirizzo]);

    // ============================
    // POPUP SEMPRE PRESENTE
    // ============================
    alert(
        "DEBUG COLORE\n\n" +
        "A: " + valoreA + "\n" +
        "B: " + valoreB + "\n" +
        "C: " + valoreC + "\n\n"
    );

    // ============================
    // LOGICA COLORI UFFICIALE
    // ============================

    // VERDE → A = B = C
    if (valoreA === valoreB && valoreB === valoreC) {
        campo.style.backgroundColor = "#006600";
        campo.style.color = "white";
        return;
    }

    // GIALLO → A ≠ B MA B = C
    if (valoreB === valoreC && valoreA !== valoreB) {
        campo.style.backgroundColor = "#CCAA00";
        campo.style.color = "black";
        return;
    }

    // ROSSO → C ≠ A
    if (valoreC !== valoreA) {
        campo.style.backgroundColor = "#990000";
        campo.style.color = "white";
        return;
    }

    // BLU → C ≠ B
    if (valoreC !== valoreB) {
        campo.style.backgroundColor = "#0000CC";
        campo.style.color = "white";
        return;
    }

    // NESSUN COLORE
    campo.style.backgroundColor = "black";
    campo.style.color = "white";
}
