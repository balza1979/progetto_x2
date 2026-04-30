/* ============================================================
   X2 UI — MENU / SOTTOMENU / PARAMETRI / VALORI / FILE
   ============================================================ */

const X2_UI = {

    // ------------------------------------------------------------
    // MENU
    // ------------------------------------------------------------
    popolaMenu() {
        const sel = document.getElementById("menu");
        sel.innerHTML = "";

        const visti = new Set();

        x2_menu_struttura_data.forEach(r => {
            const cod = r.cod__menu.split(".")[0];
            if (!visti.has(cod)) {
                visti.add(cod);
                const opt = document.createElement("option");
                opt.value = cod;
                opt.textContent = r.menu;
                sel.appendChild(opt);
            }
        });

        if (sel.options.length > 0) {
            sel.selectedIndex = 0;
            sel.dispatchEvent(new Event("change"));
        }
    },

    // ------------------------------------------------------------
    // SOTTOMENU
    // ------------------------------------------------------------
    popolaSottomenu(codMenu) {
        const sel = document.getElementById("sottomenu");
        sel.innerHTML = "";

        const lista = x2_menu_struttura_data.filter(r =>
            r.cod__menu.startsWith(codMenu + ".")
        );

        lista.forEach(r => {
            const opt = document.createElement("option");
            opt.value = r.cod__menu;
            opt.textContent = r.sottomenu;
            sel.appendChild(opt);
        });

        if (sel.options.length > 0) sel.selectedIndex = 0;
    },

    // ------------------------------------------------------------
    // PARAMETRI
    // ------------------------------------------------------------
    popolaParametri(codMenuCompleto) {
        const sel = document.getElementById("parametro");
        sel.innerHTML = "";

        const pref = codMenuCompleto + ".";
        let lista = x2_parametri.filter(p => p.PARAMETRO.startsWith(pref));

        if (lista.length === 0) {
            const menu = codMenuCompleto.split(".")[0];
            lista = x2_parametri.filter(p => p.PARAMETRO.startsWith(menu + "."));
        }

        lista.forEach(p => {
            const opt = document.createElement("option");
            opt.value = p.PARAMETRO;
            opt.textContent = p.PARAMETRO + " – " + (p.DESCRIZIONE || "");
            sel.appendChild(opt);
        });

        if (lista.length > 0) sel.selectedIndex = 0;
    },

    // ------------------------------------------------------------
    // INFO PARAMETRO
    // ------------------------------------------------------------
    mostraInfo(param) {
        const box = document.getElementById("info_parametro");
        box.innerHTML = `
            <b>Codice:</b> ${param.PARAMETRO}<br>
            <b>Descrizione:</b> ${param.DESCRIZIONE}<br>
            <b>Valore grezzo:</b> ${X2_CORE.pulisci(param.VALORE)}
        `;
    },

    // ------------------------------------------------------------
    // VALORI (UI)
    // ------------------------------------------------------------
    popolaValori(param) {

        const tendina = document.getElementById("tendina_valori");
        tendina.innerHTML = "";

        // Reset pulsanti file
        const puls = [val1,val2,val3,val4,val5,val6,val7,val8];
        puls.forEach(p => {
            p.textContent = "-";
            p.disabled = true;
            p.onclick = null;
        });

        X2_CORE.getValori(param, data => {

            // NUMERICO
            if (data.tipo === "NUM") {
                unita_misura.value = data.unita;
                val_min.value = data.min;
                val_max.value = data.max;
                return;
            }

            // TESTO
            if (data.tipo === "TEXT") {
                const opt = document.createElement("option");
                opt.value = param.VALORE || "";
                opt.textContent = param.VALORE || "";
                tendina.appendChild(opt);
                return;
            }

            // BOOLEANO
            if (data.tipo === "BOOL") {
                data.valori.forEach(v => {
                    const opt = document.createElement("option");
                    opt.value = v.id;
                    opt.textContent = v.text;
                    tendina.appendChild(opt);
                });
                tendina.value = param.VALORE;
                return;
            }

            // SPECIFICO / ELENCO COMUNE
            if (data.valori) {
                data.valori.forEach(v => {
                    const opt = document.createElement("option");
                    opt.value = v.id;
                    opt.textContent = `"${v.id}" ${v.text}`;
                    tendina.appendChild(opt);
                });

                tendina.value = param.VALORE;

                // FILE associati
                const lista = data.file_parametro?.[param.VALORE] || [];
                lista.forEach((f, i) => {
                    if (f) {
                        puls[i].textContent = f;
                        puls[i].disabled = false;
                        puls[i].onclick = () => window.open("img/" + f, "_blank");
                    }
                });
            }
        });
    }
};

/* ============================================================
   LISTENER DOM
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    X2_UI.popolaMenu();

    menu.addEventListener("change", () => {
        X2_UI.popolaSottomenu(menu.value);
        sottomenu.dispatchEvent(new Event("change"));
    });

    sottomenu.addEventListener("change", () => {
        X2_UI.popolaParametri(sottomenu.value);
        parametro.dispatchEvent(new Event("change"));
    });

    parametro.addEventListener("change", () => {
        const cod = parametro.value;
        const param = x2_parametri.find(p => p.PARAMETRO === cod);
        if (!param) return;

        X2_UI.mostraInfo(param);
        X2_UI.popolaValori(param);
    });

    tendina_valori.addEventListener("change", () => {
        const cod = parametro.value;
        const param = x2_parametri.find(p => p.PARAMETRO === cod);
        if (!param) return;

        param.VALORE = tendina_valori.value;
        X2_UI.popolaValori(param);
    });
});
