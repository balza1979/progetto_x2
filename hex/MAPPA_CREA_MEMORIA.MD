# CREA_MEMORIA – MAPPA TECNICA (per Copilot)

## HTML
page
 ├─ file-block A
 │    ├─ #labelFileA
 │    ├─ #file1
 │    └─ button → selezionaSlot("A")
 │
 ├─ file-block B
 │    ├─ #labelFileB
 │    ├─ #file2
 │    └─ button → selezionaSlot("B")
 │
 ├─ #btnResetMemoria
 │
 ├─ #crea-memoria-container
 │    ├─ #btnGeneraC
 │    └─ #log
 │
 ├─ #selettoreGit
 │    ├─ #gitList
 │    └─ #btnChiudiGitList
 │
 ├─ SCRIPT: x2_parametri_data.js
 ├─ SCRIPT: memorie_tipo.js
 └─ SCRIPT: crea_memoria.js


## JS – crea_memoria.js
variabili:
 ├─ memoriaA
 ├─ memoriaB

funzioni:
 ├─ leggiFileHex(input, callback)
 ├─ hexToMemoryMap(hexText)
 ├─ log(msg)
 ├─ onFileA_Change()
 ├─ onFileB_Change()
 ├─ aggiornaBloccoCreazione()
 ├─ resetCreazione()  (non usata dal bottone)
 └─ EVENTI:
      ├─ DOMContentLoaded → ripristino A/B + aggiornaBloccoCreazione()
      ├─ #btnGeneraC.click
      └─ #btnResetMemoria.click → clear localStorage + reload


## JS – memorie_tipo.js (tendina Git)
variabili:
 ├─ slotAttivo
 ├─ strutturaGit
 ├─ listaCompleta

costanti:
 ├─ GIT_API
 └─ RAW_BASE

funzioni:
 ├─ selezionaSlot(slot)
 ├─ caricaStrutturaGit()
 ├─ leggiCartella(path)
 ├─ popolaListaGit()
 ├─ confermaGit(path)
 ├─ fakeFile(nome, contenuto)
 ├─ caricaFileGit(path)
 └─ convertiBinInHex(buffer)

eventi:
 └─ #btnChiudiGitList.click → chiudi popup


## COLLEGAMENTI LOGICI
file1 → onFileA_Change → memoriaA + localStorage → aggiornaBloccoCreazione  
file2 → onFileB_Change → memoriaB + localStorage → aggiornaBloccoCreazione  

selezionaSlot("A") → memorie_tipo.js → confermaGit("A") → memoriaA + fakeFile + localStorage → aggiornaBloccoCreazione  
selezionaSlot("B") → memorie_tipo.js → confermaGit("B") → memoriaB + fakeFile + localStorage → aggiornaBloccoCreazione  

btnResetMemoria → clear localStorage → reload  

crea-memoria-container → visibile solo se (memA_hex && memB_hex)


## ELEMENTI CHE NON ESISTONO
(no file C)  
(no confronto)  
(no tabella)  
(no filtri)  
(no runtime)
