# AR Indoor Positioning
## Overview
Questo progetto esplora un sistema di posizionamento indoor basato su machine learning integrato con un'interfaccia di realtà aumentata (AR), progettato per tracciare in tempo reale la posizione degli
utenti in ambienti chiusi. L'architettura attuale utilizza segnali RSSI provenienti da beacon Bluetooth e modelli di machine learning per stimare le coordinate degli utenti, visualizzandole poi in una 
scena AR accessibile tramite smartphone.

## a) System Architecture
L’architettura proposta è composta da una parte **Edge Side**, che gestisce i componenti e le operazioni vicine all’utente e ai dispositivi hardware, e una parte **Cloud Side**, che fornisce supporto per la gestione dei dati e dei contenuti centralizzati.
![architettura](https://github.com/teresaconte5/Tesi-AR_Indoor_Positioning/blob/main/images/Architettura_proposta.png).
# Edge Side #

**1. Hardware Components**

-**IoT Device - BLE Tag:**  Piccoli beacon distribuiti nell'ambiente che emettono segnali RSSI (Received Signal Strength Indicator).

-**Available Devices(Smartphone, Tablet, Smart Glasses)**: Dispositivi con connettività BLE e capacità di elaborazione per applicazioni AR.

**2. Software Components**

-**RSSI Scanner:** Raccoglie i segnali RSSI dai BLE Tag e fornisce i dati grezzi per la stima della posizione.

-**ML Position Predictor:** Modulo basato su machine learning che elabora i segnali RSSI per calcolare le coordinate precise dell'utente, compensando ostacoli e variazioni di segnale.

-**AR Module:** Utilizza le coordinate generate per posizionare e visualizzare oggetti virtuali in tempo reale, creando un'esperienza AR immersiva e contestualizzata.

**3. Mobile Application**
La Mobile Application è il cuore del sistema e fornisce le seguenti funzionalità:

-Riceve i dati RSSI dai BLE Tag tramite l'RSSI Scanner.
-Stima la posizione dell'utente tramite il ML Position Predictor.
-Visualizza i contenuti AR grazie al modulo AR, posizionando gli oggetti virtuali.
-Gestisce connessioni al database delle posizioni per aggiornamenti in tempo reale.

Architettura realmenterealizzata del sistema del sistema
![architettura](https://github.com/teresaconte5/Tesi-AR_Indoor_Positioning/blob/main/images/Architettura_Realizzata.png)


