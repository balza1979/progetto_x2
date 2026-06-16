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
# MAPPA16.6.26.MD
Mappa tecnica completa sistema X2 – Memorie / HEX / Confronto / Errori / Generazione  
Versione: 2026‑06‑16 – Luca/Copilot

============================================================
========================= PARTE 1 ==========================
============================================================

## STRUTTURA DEL PROGETTO

/html  
- crea_memoria.html  
- confronto_memorie.html  
- errori_x2.html  
- hex_generator.html  

/js  
- x2_parametri_data.js  
- crea_memoria_v3.js  
- confronto_memorie.js  
- memorie_tipo.js  
- colori_valore.js  

============================================================
========================= PARTE 2 ==========================
============================================================

## x2_parametri_data.js (FONTE PARAMETRI)

Contiene per ogni parametro:
- LIBERA1 → indirizzo base  
- LIBERA2 → size  
- LIBERA3 → tipo  
- LIBERA4 → scala  
- LIBERA6 → offset  
- VALORE  
- VALORE_DEFAULT  
- PARAMETRO / DESCRIZIONE  

Usato da:
- hex_generator.html  
- confronto_memorie.js  
- colori_valore.js  

------------------------------------------------------------

## crea_memoria_v3.js (GESTIONE MEMORIE A/B/C)

### Lettura file
- leggiFileHex()  
- hexToMemoryMap()  

### Caricamento automatico
- se manca A → fallback POLLI  
- se esiste A/B/C → ricostruisce da localStorage  

### Salvataggio
Scrive:
- memA_hex / memA_nome  
- memB_hex / memB_nome  
- memC_hex / memC_nome  
- memoriaC / nomeMemoriaC  

### Creazione C
C = copia perfetta di B (HEX)

### Reset totale
Cancella:
- memA_hex / memA_nome  
- memB_hex / memB_nome  
- memC_hex / memC_nome  
- memoriaC / nomeMemoriaC  

------------------------------------------------------------

## crea_memoria.html (UI CREAZIONE MEMORIA)

- File A/B con input file + Git loader  
- Reset memoria  
- Blocco creazione C (visibile solo se A e B esistono)  
- Popup Git  
- Script: x2_parametri_data.js, memorie_tipo.js, crea_memoria_v3.js  

============================================================
========================= PARTE 3 ==========================
============================================================

## confronto_memorie.js (CONFRONTO A/B/C)

### Variabili
- memoriaA  
- memoriaB  
- memoriaC  
- confrontoAttivo  

### Indirizzi runtime
0x04F4, 0x0810, 0x0811, 0x081A, 0x081B, 0x081C,  
0x09E3, 0x09FA, 0x09FB, 0x09FE, 0x09FF  

### Funzioni principali
- leggiFileHex()  
- hexToMemoryMap()  
- ricostruisciValore()  
- compareMemory3()  
- renderResults()  
- confrontaAB / AC / BC / ABC  
- evidenziaPulsante()  
- applyColumnFilters()  
- aggiornaCheckboxColonne()  
- resetConfronto()  
- salvaMemoriaComeHex()  

### compareMemory3()
Per ogni parametro:
- legge LIBERA1 (indirizzo)  
- legge LIBERA4 (len)  
- legge bytes A/B/C  
- ricostruisce valore  
- confronta secondo modalità:  
  - A‑B  
  - A‑C  
  - B‑C  
  - A‑B‑C  
- esclude runtime  
- esclude parametri non validi  
- genera diff[] e runtime[]  

### renderResults()
- genera tabella differenze  
- genera tabella runtime  
- applica colori C tramite colori_valore.js  
- applica filtri colonne  

------------------------------------------------------------

## confronto_memorie.html (UI CONFRONTO)

- File A/B/C con input + Git loader  
- Pulsanti confronto: AB, AC, BC, ABC  
- Flag “Visualizza tutti i parametri”  
- Filtri colonne  
- Tabella risultati  
- Script: x2_parametri_data.js, memorie_tipo.js, confronto_memorie.js, colori_valore.js  

============================================================
========================= PARTE 4 ==========================
============================================================

## colori_valore.js (COLORI CAMPO VALORE)

Input:
- ultimoParametro  
- memB[indirizzo]  
- memC[indirizzo]  
- VALORE_DEFAULT  
- valore campo utente  

Logica colore:
- C mancante → verde  
- campo ≠ C → rosso  
- campo = C ma C ≠ A → giallo  
- campo = C = A → verde  

Richiede:
- window.memB  
- window.memC  

============================================================
========================= PARTE 5 ==========================
============================================================

## hex_generator.html (GENERATORE 8192 BYTE)

Buffer:
- Uint8Array(8192)

Blocchi FF:
- 0x0000–0x01FF  
- 0x0520–0x05FF  
- 0x0A00–0x1FFF  

Scrittura parametri:
- usa x2_parametri_data.js  
- applica scala/offset  
- scrive NUM/ENUM/BIT/INT16/INT32  
- esclude runtime e zone protette  

Output:
- file Intel HEX  
- record 16 byte  
- checksum  
- EOF  

============================================================
========================= PARTE 6 ==========================
============================================================

## errori_x2.html (ERRORI 0x800–0x8FF)

Memorie simulate:
- memA, memB, memC = Uint8Array(0x1000)

Struttura errore (16 byte):
- [0] codice  
- [1] piano  
- [2] giorno  
- [3] mese  
- [4] anno  
- [5] ora  
- [6] minuti  
- [7] secondi  

UI:
- lista errori  
- dettagli errore  
- gemme IN/OUT/FLAG  

============================================================
========================= PARTE 7 ==========================
============================================================

## memorie_tipo.js (GIT + FAKE FILE)

Contiene:
- fakeFile()  
- loader Git  
- binToMemoryMap()  

Usato da:
- crea_memoria.html  
- confronto_memorie.html  

============================================================
========================= PARTE 8 ==========================
============================================================

## FLUSSI COMPLETI

### Flusso A/B/C
1. Caricamento A (localStorage o POLLI)  
2. Caricamento B  
3. Creazione C (copia di B)  
4. Confronto AB/AC/BC/ABC  
5. Colorazione valori  

### Flusso generazione HEX
1. Carica parametri  
2. Inizializza buffer  
3. Scrive parametri  
4. Esporta HEX  

### Flusso errori
1. Legge 0x800–0x8FF  
2. Mostra lista  
3. Mostra dettagli  

============================================================
========================= PARTE 9 ==========================
============================================================

## DOVE PRENDI I DATI

- hex_generator.html → x2_parametri_data.js  
- crea_memoria_v3.js → file, localStorage, Git  
- confronto_memorie.js → file, localStorage, x2_parametri_data.js  
- colori_valore.js → ultimoParametro, memB, memC  
- errori_x2.html → memA/B/C  
- memorie_tipo.js → GitHub RAW  

## DOVE SCRIVI I DATI

- crea_memoria_v3.js → localStorage  
- confronto_memorie.js → DOM  
- colori_valore.js → DOM  
- hex_generator.html → file .hex  
- errori_x2.html → DOM  
- memorie_tipo.js → DOM  

============================================================
========================= PARTE 10 =========================
============================================================

## PUNTI CRITICI

- window.hexToMemoryMap deve essere globale  
- window.memB / window.memC necessari per colori_valore.js  
- compareMemory3() è il cuore del confronto  
- fallback POLLI per A  
- salvaMemoriaComeHex() esporta mappe in HEX  
- flagVisualizzaTutto forza visualizzazione completa  

============================================================
========================= FINE FILE ========================
============================================================
