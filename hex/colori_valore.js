function aggiornaColoreValore() {

    const param = ultimoParametro;
    if (!param) return;

    const indirizzo = parseInt(param.LIBERA1, 16);

    let valoreA = memA[indirizzo];
    let valoreB = memB[indirizzo];
    let valoreC = memC[indirizzo];

    let colorePrevisto = "NESSUNO";

    if (valoreA === valoreB && valoreB === valoreC) {
        colorePrevisto = "VERDE";
    }
    else if (valoreC === valoreB && valoreC !== valoreA) {
        colorePrevisto = "GIALLO";
    }
    else if (valoreC !== valoreA) {
        colorePrevisto = "ROSSO";
    }
    else if (valoreC !== valoreB) {
        colorePrevisto = "BLU";
    }

    // 🔥 TROVA IL CAMPO GIUSTO
    let campo =
        document.getElementById("tendina_valori") ||
        document.getElementById("input_valore") ||
        document.getElementById("input_valore_num");

    if (!campo) {
        console.log("NESSUN CAMPO TROVATO PER COLORE");
        return;
    }

    // 🔥 APPLICA IL COLORE
    if (colorePrevisto === "VERDE") {
        campo.style.setProperty("background-color", "#006600", "important");
        campo.style.setProperty("color", "white", "important");
    } else if (colorePrevisto === "GIALLO") {
        campo.style.setProperty("background-color", "#CCAA00", "important");
        campo.style.setProperty("color", "black", "important");
    } else if (colorePrevisto === "ROSSO") {
        campo.style.setProperty("background-color", "#990000", "important");
        campo.style.setProperty("color", "white", "important");
    } else if (colorePrevisto === "BLU") {
        campo.style.setProperty("background-color", "#0000CC", "important");
        campo.style.setProperty("color", "white", "important");
    }
}
