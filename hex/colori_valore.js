function aggiornaColoreValore() {

    const campo = document.getElementById("tendina_valori");
    if (!campo) return;

    const param = ultimoParametro;
    if (!param) return;

    const indirizzo = parseInt(param.LIBERA1, 16);

    // Valori logici già convertiti da mostraInfoParametro()
    let valoreA = convertValueFromByte(param, memA[indirizzo]);
    let valoreB = convertValueFromByte(param, memB[indirizzo]);
    let valoreC = convertValueFromByte(param, memC[indirizzo]);

    // Popup
    alert(
        "DEBUG COLORE (POST-SALVATAGGIO)\n\n" +
        "A: " + valoreA + "\n" +
        "B: " + valoreB + "\n" +
        "C: " + valoreC + "\n\n"
    );

    // LOGICA COLORI UFFICIALE
    if (valoreA === valoreB && valoreB === valoreC) {
        campo.style.backgroundColor = "#006600"; // verde
        campo.style.color = "white";
        return;
    }

    if (valoreB === valoreC && valoreA !== valoreB) {
        campo.style.backgroundColor = "#CCAA00"; // giallo
        campo.style.color = "black";
        return;
    }

    if (valoreC !== valoreA) {
        campo.style.backgroundColor = "#990000"; // rosso
        campo.style.color = "white";
        return;
    }

    if (valoreC !== valoreB) {
        campo.style.backgroundColor = "#0000CC"; // blu
        campo.style.color = "white";
        return;
    }

    campo.style.backgroundColor = "black";
    campo.style.color = "white";
}
