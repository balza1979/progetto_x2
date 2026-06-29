// ============================================================
//  FILE: colori_valore.js
//  DATA: 29/06/2026 14:15
//  DESCRIZIONE:
//  - Colore tendina valori
//  - Popup debug PRIMA e DOPO
//  - Nessuna modifica a input/min/max/unità
//  - Nessuna modifica in modalità visualizzazione
// ============================================================

function aggiornaColoreValore() {

    // 🔥 Se NON c’è memoria C → NON CAMBIO COLORE
    if (!memC) {
        // console.log("Nessuna Memoria C → nessun colore");
        return;
    }

    // 🔥 Se le memorie non sono pronte → NON CAMBIO COLORE
    if (!memA || !memB || !memC) {
        // console.log("Memorie non pronte");
        return;
    }

    // 🔥 Parametro corrente
    const param = ultimoParametro;
    if (!param || !param.LIBERA1) {
        // console.log("Nessun parametro valido");
        return;
    }

    // 🔥 Campo tendina valori (UNICO elemento da colorare)
    const campo = document.getElementById("tendina_valori");
    if (!campo) {
        // console.log("tendina_valori non trovata");
        return;
    }

    // 🔥 Indirizzo memoria
    const indirizzo = parseInt(param.LIBERA1, 16);
    if (isNaN(indirizzo)) {
        alert("ERRORE: indirizzo non valido: " + param.LIBERA1);
        return;
    }

    // 🔥 Lettura valori A/B/C
    const valoreA = memA[indirizzo];
    const valoreB = memB[indirizzo];
    const valoreC = memC[indirizzo];

    // 🔥 POPUP PRIMA
    alert(
        "POPUP PRIMA DEL COLORE\n\n" +
        "Indirizzo: " + indirizzo + "\n\n" +
        "A = " + valoreA + "\n" +
        "B = " + valoreB + "\n" +
        "C = " + valoreC + "\n"
    );

    // 🔥 Calcolo colore
    let colore = null;

    if (valoreA === valoreB && valoreB === valoreC) {
        colore = "VERDE";
    }
    else if (valoreC === valoreB && valoreC !== valoreA) {
        colore = "GIALLO";
    }
    else if (valoreC !== valoreA) {
        colore = "ROSSO";
    }
    else if (valoreC !== valoreB) {
        colore = "BLU";
    }

    // 🔥 POPUP DOPO
    alert(
        "POPUP DOPO IL COLORE\n\n" +
        "Colore previsto: " + colore + "\n"
    );

    // 🔥 Applicazione colore SOLO alla tendina valori
    if (colore === "VERDE") {
        campo.style.backgroundColor = "#006600";
        campo.style.color = "white";
    }
    else if (colore === "GIALLO") {
        campo.style.backgroundColor = "#CCAA00";
        campo.style.color = "black";
    }
    else if (colore === "ROSSO") {
        campo.style.backgroundColor = "#990000";
        campo.style.color = "white";
    }
    else if (colore === "BLU") {
        campo.style.backgroundColor = "#0000CC";
        campo.style.color = "white";
    }
    else {
        // colore non definito → stile base
        campo.style.backgroundColor = "#0d0d0d";
        campo.style.color = "#ffcccc";
    }
}
