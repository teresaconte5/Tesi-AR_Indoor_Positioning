function main() {
    // Creazione di una nuova scena di THREE.js
    const scene = new THREE.Scene();

    // Creazione della telecamera con un campo visivo di 80 gradi, rapporto d'aspetto 2, distanza di clipping (ritaglio) vicino 0.1 e lontano 50000
    const camera = new THREE.PerspectiveCamera(80, 2, 0.1, 50000);

    // Creazione di un renderer WebGL che disegna sulla canvas con id 'canvas1'
    const renderer = new THREE.WebGLRenderer({ 
        canvas: document.querySelector('#canvas1') 
    });

    // Definizione della geometria di un cubo di dimensioni 20x20x20
    const geom = new THREE.BoxGeometry(20, 20, 20);

    // Inizializzazione di AR.js con la scena e la telecamera per ottenere posizioni GPS
    const arjs = new THREEx.LocationBased(scene, camera);

    // Inizializzazione del rendering della webcam sulla canvas con id 'video1'
    const cam = new THREEx.WebcamRenderer(renderer, '#video1');

    // Conversione di 5 gradi in radianti per il passo di movimento del mouse
    const mouseStep = THREE.MathUtils.degToRad(5);

    let orientationControls;

    // Controlli di orientamento che funzionano solo su dispositivi mobili
    if (isMobile()) {   
        orientationControls = new THREEx.DeviceOrientationControls(camera);
    }

    let first = true; // Variabile per verificare se è il primo aggiornamento GPS

    // Evento che si attiva al ricevimento di un aggiornamento GPS
    arjs.on("gpsupdate", pos => {
        if (first) {
            // Alla prima ricezione di un aggiornamento GPS, posiziona gli oggetti nella scena
            setupObjects(pos.coords.longitude, pos.coords.latitude);
            first = false; // Imposta la variabile su false per evitare di ripetere l'operazione
        }
    });

    // Evento che si attiva in caso di errore GPS, mostrando un messaggio d'errore
    arjs.on("gpserror", code => {
        alert(`Errore GPS: codice ${code}`);
    });

    // Codice per usare una posizione GPS simulata
    const fake = { lat: 51.05, lon: -0.72 };
    if (fake) {
        // Usa la posizione simulata per test
        arjs.fakeGps(fake.lon, fake.lat);

        // Continuare ad aggiornare la posizione simulata con una leggera variazione di latitudine/longitudine per test
        setInterval(() => {
            arjs.fakeGps(fake.lon + Math.random() * 0.001, fake.lat + Math.random() * 0.001);
        }, 5000); // Aggiorna la posizione ogni 5 secondi
    } else {
        // Avvia la localizzazione GPS reale
        arjs.startGps();
    }

    let mousedown = false, lastX = 0; // Variabili per gestire l'interazione col mouse

    // Eventi del mouse per testare su un desktop (poiché i controlli mobili non funzionano sui desktop)
    if (!isMobile()) {
        window.addEventListener("mousedown", e => {
            mousedown = true; // Abilita il flag di trascinamento quando il mouse è premuto
        });

        window.addEventListener("mouseup", e => {
            mousedown = false; // Disabilita il flag di trascinamento quando il mouse è rilasciato
        });

        window.addEventListener("mousemove", e => {
            if (!mousedown) return; // Se il mouse non è premuto, esce dall'evento
            if (e.clientX < lastX) {
                // Se il mouse si muove a sinistra, ruota la telecamera a destra
                camera.rotation.y += mouseStep; 
                if (camera.rotation.y < 0) {
                    // Mantieni l'angolo di rotazione all'interno di 0-2π radianti
                    camera.rotation.y += 2 * Math.PI;
                }
            } else if (e.clientX > lastX) {
                // Se il mouse si muove a destra, ruota la telecamera a sinistra
                camera.rotation.y -= mouseStep;
                if (camera.rotation.y > 2 * Math.PI) {
                    // Mantieni l'angolo di rotazione all'interno di 0-2π radianti
                    camera.rotation.y -= 2 * Math.PI;
                }
            }
            lastX = e.clientX; // Aggiorna la posizione X del mouse
        });
    }

    // Funzione per rilevare se il dispositivo è mobile
	function isMobile() {
        // Verifica se il dispositivo è un mobile basato sul suo user agent
    	if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        	// Ritorna true per dispositivi mobili
        	return true;
    	}
    	return false;
	}

    // Funzione per eseguire il rendering continuo della scena
    function render(time) {
        resizeUpdate(); // Aggiorna le dimensioni del canvas
        if (orientationControls) orientationControls.update(); // Aggiorna i controlli di orientamento, se presenti
        cam.update(); // Aggiorna il rendering della webcam
        renderer.render(scene, camera); // Renderizza la scena con la telecamera
        requestAnimationFrame(render); // Chiedi di richiamare questa funzione al prossimo frame
    }

    // Funzione per aggiornare le dimensioni del renderer se cambia la dimensione del canvas
    function resizeUpdate() {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth, height = canvas.clientHeight;
        if (width != canvas.width || height != canvas.height) {
            // Aggiorna la dimensione del renderer se la dimensione del canvas cambia
            renderer.setSize(width, height, false);
        }
        camera.aspect = canvas.clientWidth / canvas.clientHeight; // Aggiorna il rapporto d'aspetto della telecamera
        camera.updateProjectionMatrix(); // Aggiorna la matrice di proiezione della telecamera
    }

    // Funzione per aggiungere oggetti alla scena in base alla posizione GPS
    function setupObjects(longitude, latitude) {
        // Creazione di quattro cubi colorati in quattro direzioni (nord, sud, ovest, est)
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Rosso
        //const material2 = new THREE.MeshBasicMaterial({ color: 0xffff00 }); // Giallo
        //const material3 = new THREE.MeshBasicMaterial({ color: 0x0000ff }); // Blu
        //const material4 = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // Verde
        
        // Aggiunta degli oggetti alla scena con piccole variazioni di latitudine e longitudine
        arjs.add(new THREE.Mesh(geom, material), longitude, latitude + 0.001); // Leggermente a nord
        //arjs.add(new THREE.Mesh(geom, material2), longitude, latitude - 0.001); // Leggermente a sud
        //arjs.add(new THREE.Mesh(geom, material3), longitude - 0.001, latitude); // Leggermente a ovest
        //arjs.add(new THREE.Mesh(geom, material4), longitude + 0.001, latitude); // Leggermente a est
    }

    // Richiesta di eseguire il rendering della scena al prossimo frame
    requestAnimationFrame(render);
}

// Esecuzione della funzione principale
main();
