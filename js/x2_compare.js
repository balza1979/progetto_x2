/* ============================================================
   X2 COMPARE — DEBUG / MAPPE / MOUSEOVER
   ============================================================ */

document.addEventListener("mouseover", function (e) {
    const el = e.target;
    const id = el.id;
    if (!id) return;

    const dbgId   = document.getElementById("dbg_id");
    const dbgFile = document.getElementById("dbg_file");
    const dbgCol  = document.getElementById("dbg_col");
    const dbgRol  = document.getElementById("dbg_ruolo");

    if (!dbgId) return;

    dbgId.innerText = id;

    let file = mappaFile[id] || "—";

    if (id.startsWith("btn_file")) {
        try {
            const parametroEl = document.getElementById("parametro");
            const tendinaEl   = document.getElementById("tendina_valori");

            const parametro = parametroEl?.value;
            const valore    = tendinaEl?.value;

            if (typeof x2_file_parametri !== "undefined" && parametro && valore) {
                const filesMap = x2_file_parametri[parametro]?.file_parametro || {};
                const files    = filesMap[valore] || [];
                const index    = parseInt(id.replace("btn_file", "").replace("_parametro", ""), 10) - 1;
                const fileAssociato = files[index];
                if (fileAssociato) file = fileAssociato;
            }
        } catch (err) {
            // opzionale: dbgFile.innerText = "ERR";
        }
    }

    dbgFile.innerText = file;

    const infoCol = mappaColonne[id];
    dbgCol.innerText = infoCol ? infoCol.col : "—";
    dbgRol.innerText = infoCol ? infoCol.ref : "—";
});
