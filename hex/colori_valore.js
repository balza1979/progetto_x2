function aggiornaColoreValore() {

    const campo = document.getElementById("tendina_valori");
    if (!campo) return;

    const param = ultimoParametro;
    if (!param) return;

    const indirizzo = parseInt(param.LIBERA1, 16);

    let valoreA = memA[indirizzo];
    let valoreB = memB[indirizzo];
    let valoreC = memC[indirizzo];

    let colorePrevisto = "NESSUNO";
    let motivo = "nessuna condizione soddisfatta";

    if (valoreA === valoreB && valoreB === valoreC) {
        colorePrevisto = "VERDE";
        motivo = "A = B = C";
    }
    else if (valoreC === valoreB && valoreC !== valoreA) {
        colorePrevisto = "GIALLO";
        motivo = "B = C ma A diverso";
    }
    else if (valoreC !== valoreA) {
        colorePrevisto = "ROSSO";
        motivo = "C diverso da A";
    }
    else if (valoreC !== valoreB) {
        colorePrevisto = "BLU";
        motivo = "C diverso da B";
    }

    // -------------------------------------------------------------
    // 🔥 POPUP (RIMESSO ESATTAMENTE COME LO VOLEVI)
    // -------------------------------------------------------------
    alert(
        "DEBUG COLORE\n\n" +
        "A: " + valoreA + "\n" +
        "B: " + valoreB + "\n" +
        "C: " + valoreC + "\n\n" +
        "COLORE PREVISTO: " + colorePrevisto + "\n" +
        "MOTIVO: " + motivo + "\n"
    );

    // -------------------------------------------------------------
    // APPLICAZIONE COLORE
    // -------------------------------------------------------------
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


// DOPO AVER MESSO IL COLORE
alert(
    "DOPO APPLICAZIONE COLORE\n" +
    "backgroundColor: " + campo.style.backgroundColor + "\n" +
    "color: " + campo.style.color
);

    
}
