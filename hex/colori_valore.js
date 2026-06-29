function aggiornaColoreValore() {

    // Se non c'è memoria C → NON CAMBIO COLORE
    if (!memC) return;

    // Se il parametro non ha LIBERA1 → NON CAMBIO COLORE
    const param = ultimoParametro;
    if (!param || !param.LIBERA1) return;

    // Se non esiste la tendina valori → NON CAMBIO COLORE
    const campo = document.getElementById("tendina_valori");
    if (!campo) return;

    // Se le memorie non sono pronte → NON CAMBIO COLORE
    if (!memA || !memB || !memC) return;

    const indirizzo = parseInt(param.LIBERA1, 16);
    if (isNaN(indirizzo)) return;

    const valoreA = memA[indirizzo];
    const valoreB = memB[indirizzo];
    const valoreC = memC[indirizzo];

    let colore = null;

    if (valoreA === valoreB && valoreB === valoreC) colore = "VERDE";
    else if (valoreC === valoreB && valoreC !== valoreA) colore = "GIALLO";
    else if (valoreC !== valoreA) colore = "ROSSO";
    else if (valoreC !== valoreB) colore = "BLU";

    if (colore === "VERDE") {
        campo.style.backgroundColor = "#006600";
        campo.style.color = "white";
    } else if (colore === "GIALLO") {
        campo.style.backgroundColor = "#CCAA00";
        campo.style.color = "black";
    } else if (colore === "ROSSO") {
        campo.style.backgroundColor = "#990000";
        campo.style.color = "white";
    } else if (colore === "BLU") {
        campo.style.backgroundColor = "#0000CC";
        campo.style.color = "white";
    }
}
