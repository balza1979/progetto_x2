# X2_MAPPA_COMPLETA.md
# VERSIONE: 1.0 — MAPPA TECNICA COMPLETA
# SCOPO: mappatura totale di TUTTI i file, TUTTI i tasti, TUTTI gli ID, TUTTE le funzioni, TUTTI i flussi
# UTILIZZO: file interno per assistenza tecnica immediata

============================================================
REPO: progetto_x2
============================================================

------------------------------------------------------------
FILE: index.html
------------------------------------------------------------
TASTI / ID:
- mostra_tutto_btn → mostra tutti i parametri
- home_btn → torna alla home
- crea_hex_btn → apre confronto_memorie.html?mode=creazione

- btnConfronto → apre confronto_memorie.html
- menu_btn1..8 → selezione menu
- sottomenu_btn1..8 → selezione sottomenu
- screen-warning → overlay warning

FUNZIONI (x2_ui.js):
- popolaMenu()
- popolaSottomenu()
- popolaParametri()
- mostraInfoParametro()
- caricaValoriJSON()
- gestisciFonteValori()
- aggiornaPulsantiVal()
- aggiornaPulsantiParam()
- gestisciNavigazione()

FLUSSO:
index.html → x2_ui.js → x2_core.js → json_tendine → parametri

------------------------------------------------------------
FILE: confronto_memorie.html
------------------------------------------------------------
TASTI / ID:
- file1, file2, file3 → input file
- btnAB, btnAC, btnBC, btnABC → confronti
- flagVisualizzaTutto → mostra differenze complete
- columnFilters → filtri colonne
- gitPopup, gitList, btnChiudiGit, btnConfermaGit → selezione file GitHub

FUNZIONI:
- onFileA_Change()
- onFileB_Change()
- onFileC_Change()
- confrontaAB(), confrontaAC(), confrontaBC(), confrontaABC()
- selezionaSlot()
- apriErrori()

FLUSSO:
file → parse → confronto → risultati

------------------------------------------------------------
FILE: errori_x2.html
------------------------------------------------------------
TASTI / ID:
- btnMemA/B/C → selezione memoria
- btnLoadFile → carica file
- btnAI → suggerimenti
- errorList → lista errori
- detailsErrore → dettagli
- gridIN, gridOUT, gridFLAG → gemme

FUNZIONI:
- buildErrorList()
- selectError()
- updateDetails()
- buildGems()
- updateGems()
- setMem()
- aiMock()

FLUSSO:
memoria → errori → dettagli → gemme

------------------------------------------------------------
FILE: hex_generator.html
------------------------------------------------------------
TASTI / ID:
- csv_input → input CSV
- genera_hex_btn → genera HEX
- log → output

FUNZIONI:
- creaBufferMemoria()
- applicaBlocchiFF()
- intelHexChecksum()
- bufferToIntelHex()
- scaricaFile()
- scriviParametriDaTabella()

FLUSSO:
CSV → buffer → HEX → download

============================================================
REPO: MultipdfElmi
============================================================

------------------------------------------------------------
FILE: index.html
------------------------------------------------------------
TASTI / ID:
- folder-container → contiene card categorie
- ogni card ha:
  - titolo (nome cartella)
  - pulsante “Apri” (senza ID)

FUNZIONE:
btn.onclick → window.location.href = `pdf.html?cartella=${cartella}&ts=${timestamp}`

FLUSSO:
index → lista PDF → pdf.html → loading.html

------------------------------------------------------------
FILE: lista.html
------------------------------------------------------------
ID:
- titolo
- pdf-container

TASTI:
- pulsanti “Apri PDF” (generati dinamicamente)

FUNZIONE:
onclick → window.open(directUrl)

------------------------------------------------------------
FILE: pdf.html
------------------------------------------------------------
TASTI:
- nessuno (redirect immediato)

FUNZIONE:
window.location.href = loading.html

------------------------------------------------------------
FILE: loading.html
------------------------------------------------------------
ID:
- loader (classe)

FUNZIONE:
mostra spinner

============================================================
REPO: Schede_ausiliarie_Elmi
============================================================

------------------------------------------------------------
FILE: index.html
------------------------------------------------------------
ID:
- folder-container

TASTI:
- card → pulsante “Apri”

FUNZIONE:
onclick → pdf.html?cartella=...

------------------------------------------------------------
FILE: lista.html
------------------------------------------------------------
ID:
- titolo
- pdf-container

TASTI:
- pulsanti “Apri / Scarica”
- pulsanti “Vedi Online”

FUNZIONI:
openFast(url)
openSafe(directUrl, gviewUrl)

------------------------------------------------------------
FILE: pdf.html (GALLERIA)
------------------------------------------------------------
ID:
big-gallery
viewer-container
big-image
big-video
fullscreen-btn
mute-btn
prev-btn
next-btn
slideshow-btn
speed-control
counter
pdf-container
bottom-spacer
loadingPopup
loadingSub
testFrame

TASTI:
- prev-btn → immagine precedente
- next-btn → immagine successiva
- slideshow-btn → autoplay
- fullscreen-btn → fullscreen
- mute-btn → audio ON/OFF
- pulsanti nelle card:
  - Apri Immagine
  - Apri / Scarica
  - Vedi Online
  - Apri Video

FUNZIONI:
openFast()
openSafe()
showLoading()
showItem()
navigazione prev/next
mute
fullscreen

FLUSSO:
elenco.json → galleria → viewer → loading

------------------------------------------------------------
FILE: viewer.html
------------------------------------------------------------
FUNZIONE:
document.write Google Viewer

============================================================
REPO: Elmi-Ricerca-errori
============================================================

ID:
labelA/B/C/D
menu
campoB/C/D

FUNZIONI:
caricaExcel()
menu.onchange → aggiorna campi

============================================================
REPO: errori_vers4
============================================================

ID:
versione
titoloErrore
menu
manuali-container
menuDettaglio
campoB/C/D
labelA_det, labelB, labelC, labelD
modal, modalText, chiudiModal

FUNZIONI:
loadWorkbook()
caricaExcel()
selezionaFoglio()
gestione manuali (colonne 13–20)
modale fullscreen

============================================================
REPO: Richiesta_Preventivo
============================================================

ID:
txtID
txtNome
txtTelefono
txtDescrizione
txtSchede
selectDispositivi
miniBtn
btnInvia

FUNZIONI:
miniBtn.onclick → aggiunge voce
selectDispositivi.onchange → aggiunge voce
btnInvia → valida + mailto + redirect avviso.html

avviso.html:
goEmail → apre mailto → redirect home

============================================================
DIPENDENZE GLOBALI
============================================================

elenco.json  
errori.xlsx  
pdfManualiErrori/  
pdf/<cartella>/  
loading.html  
Google Docs Viewer  
libreria XLSX  
memorie_loader.js
x.js
x2_compare.js
x2_core.js
x2_debug.js
x2_loader.js
x2_menu_struttura_data.js
x2_parametri_data.js
x2_ui.js

============================================================
MODALITÀ E FLUSSI X2 — DEFINIZIONE COMPLETA
============================================================

------------------------------------------------------------
MODALITÀ 1 — LETTURA / MANUALE TECNICO
------------------------------------------------------------
SCOPO:
Navigazione pura dei menu, sottomenu, parametri e valori.
Nessuna memoria, nessun salvataggio, nessuna modifica.

USA:
- x2_menu_struttura_data.js
- x2_parametri_data.js
- JSON tendine
- File associati (8 per menu / 8 per sottomenu / 8 per parametro / 8 per valore)

NON USA:
- localStorage
- memA / memB / memC
- colori
- confronti
- salvataggi

FLUSSO:
index.html → x2_ui.js → struttura menu → struttura sottomenu → parametri → JSON valori → file associati

REGOLE:
- Tutti i filtri attivi (min/max, decimali, HEX, JSON)
- Nessun colore
- Nessun alert
- Nessuna scrittura
- Solo visualizzazione

------------------------------------------------------------
MODALITÀ 2 — CREA MEMORIA
------------------------------------------------------------
SCOPO:
Creare memA, memB, memC nel localStorage.

SLOT:
- A → DEF di default (selezionabile)
- B → selezionabile (Git / locale)
- C → richiede nome

SALVATAGGIO:
Premendo SALVA vengono create:
- memA_hex + memA_nome
- memB_hex + memB_nome
- memC_hex + memC_nome (copia IDENTICA di B)

FLUSSO:
confronto_memorie.html?mode=creazione → selezione A/B → nome C → SALVA → localStorage

------------------------------------------------------------
MODALITÀ 3 — PROGRAMMATORE X2 (memC)
------------------------------------------------------------
SCOPO:
Modificare memC con filtri, controlli, colori e salvataggi.

VALORI:
- Valore mostrato = memC
- Valore grezzo = memA

COLORI:
- VERDE → C == A
- GIALLO → C == A && A != B
- ROSSO → C != A && C != B

IN TEMPO REALE:
Il colore cambia immediatamente quando modifichi il valore.

SNAPSHOT:
All’ingresso del parametro → salva valore originale di C.
Se cambi → parametro “modificato”.

ALERT USCITA:
Se esci senza salvare:
- “Prosegui senza salvare” → ripristina snapshot
- “Salva in memC” → aggiorna localStorage

SALVATAGGIO:
Aggiorna memC_hex in localStorage.

NAVIGAZIONE:
- frecce
- menu
- sottomenu
- ricerca
- tendine

------------------------------------------------------------
MODALITÀ 4 — CONFRONTO MEMORIE (POST-PROGRAMMAZIONE)
------------------------------------------------------------
SCOPO:
Confrontare memA, memB, memC del localStorage o file selezionati.

DEFAULT:
- Slot A = memA_local
- Slot B = memB_local
- Slot C = memC_local

Tutti e tre selezionabili (Git / locale).

TASTI CONFRONTO:
- AB
- AC
- BC
- ABC

COLORI:
Stessa logica del Programmatore:
- verde / rosso / giallo

COLONNE AUTOMATICHE:
- AB → nascondi C
- AC → nascondi B
- BC → nascondi A
- ABC → mostra tutto

I flag vengono aggiornati automaticamente.

FLUSSO:
localStorage (o file selezionati) → confronto → tabella → colori → filtri colonne

NESSUNA SCRITTURA:
Modalità solo lettura.

------------------------------------------------------------
REGOLE DI CONVERSIONE (VALIDA PER TUTTE LE MODALITÀ)
------------------------------------------------------------
TIPO DECIMALE:
- min/max → dec → hex → padding 2 cifre

TIPO HEX:
- min/max → hex → padding 2 cifre

TIPO DEC + DECIMALI:
- rimuovi punto → min/max → dec → hex → padding

TIPO JSON / SPECIFICO:
- valore diretto dal JSON → padding

SEMPRE:
- 2 cifre
- filtri attivi
- range attivo
- nessuna eccezione
