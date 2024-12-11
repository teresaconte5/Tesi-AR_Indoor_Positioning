// Funzione per convertire gradi in radianti
function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

// Funzione per calcolare la distanza tra due punti GPS in chilometri
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raggio della Terra in km
    const dLat = deg2rad(lat2 - lat1);  
    const dLon = deg2rad(lon2 - lon1);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    const distance = R * c; 
    return distance;
}

// Funzione per recuperare gli oggetti dal database
async function getObjectsFromDatabase() {
    try {
        const response = await fetch('/api/oggetti'); // Modifica l'URL con quello del tuo server
        const objects = await response.json();
        return objects; // Array di oggetti con {id, gbl, lat, lon, file_path}
    } catch (error) {
        console.error('Errore nel recupero degli oggetti:', error);
        return []; // Ritorna un array vuoto in caso di errore
    }
}

// Funzione per trovare oggetti nel raggio specificato
async function findObjectsInRange(userLat, userLon, radiusKm) {
    const objects = await getObjectsFromDatabase(); // Recupera gli oggetti dal database
    const objectsInRange = objects.filter(obj => {
        const distance = getDistanceFromLatLonInKm(userLat, userLon, obj.lat, obj.lon);
        return distance <= radiusKm; // Filtra gli oggetti entro il raggio specificato
    });
    return objectsInRange;
}

// Funzione per visualizzare gli oggetti in AR
function displayObjects(objects) {
    objects.forEach(obj => {
        setupObjects(obj.lon, obj.lat, obj.file_path); // Visualizza gli oggetti in AR
    });
}

// Funzione principale per aggiornare la scena AR
async function updateARScene(userLat, userLon, radiusKm) {
    const objectsInRange = await findObjectsInRange(userLat, userLon, radiusKm); // Trova oggetti nel raggio specificato
    displayObjects(objectsInRange); // Visualizza gli oggetti trovati
}

// Funzione per inizializzare la posizione dell'utente e aggiornare la scena AR
function initARScene() {
    navigator.geolocation.getCurrentPosition(async (position) => {
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;
        const radiusKm = 1; // Specifica il raggio desiderato in km
        await updateARScene(userLat, userLon, radiusKm); // Aggiorna la scena AR
    }, (error) => {
        console.error('Errore nel recupero della posizione:', error);
    });
}

// Creazione di una nuova scena di THREE.js
const scene = new THREE.Scene();

// Creazione della telecamera con un campo visivo di 80 gradi, rapporto d'aspetto 3, distanza di clipping (ritaglio) vicino 0.1 e lontano 50000
const camera = new THREE.PerspectiveCamera(80, 3, 0.1, 50000);

// Definizione della geometria di un cubo di dimensioni 75x75x75
const geom = new THREE.BoxGeometry(75, 75, 75);

// Creazione di un renderer WebGL che disegna sulla canvas con id 'canvas1'
const renderer = new THREE.WebGLRenderer({ 
    canvas: document.querySelector('#canvas1') 
});

// Attivare ombre nel renderer
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

// Inizializzazione di AR.js con la scena e la telecamera per ottenere posizioni GPS
const arjs = new THREEx.LocationBased(scene, camera);

// Inizializzazione del rendering della webcam sulla canvas con id 'video1'
const cam = new THREEx.WebcamRenderer(renderer, '#video1');

// Creare SpotLight e abilitare le ombre
const light = new THREE.SpotLight(0xffffff);
light.castShadow = true; // Abilitare le ombre
light.position.set(10, 50, 50); // Posizionare la luce
scene.add(light);

// Impostare le proprietà delle ombre per la luce
light.shadow.mapSize.width = 512;
light.shadow.mapSize.height = 512;
light.shadow.camera.near = 0.5;
light.shadow.camera.far = 500;
light.shadow.focus = 1;

let orientationControls;

// Controlli di orientamento che funzionano solo su dispositivi mobili
if (isMobile()) {   
    orientationControls = new THREEx.DeviceOrientationControls(camera);
}

let fake = null; // Variabile per la posizione GPS simulata
let first = true; // Variabile per verificare se è il primo aggiornamento GPS

// Evento che si attiva al ricevimento di un aggiornamento GPS
arjs.on("gpsupdate", pos => {
    if (first) {
        // Alla prima ricezione di un aggiornamento GPS, posiziona gli oggetti nella scena
        initARScene(); // Inizializza la scena AR
        first = false; // Imposta la variabile su false per evitare di ripetere l'operazione
    }
});

// Evento che si attiva in caso di errore GPS, mostrando un messaggio d'errore
arjs.on("gpserror", code => {
    alert(`Errore GPS: codice ${code}`);
});

// Codice per usare una posizione GPS simulata
fake = { lat: 51.05, lon: -0.72 };
if (fake) {
    // Usa la posizione simulata per test
    arjs.fakeGps(fake.lon, fake.lat);
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


// Funzione per aggiungere oggetti alla scena in base alla posizione GPS
function setupObjects(longitude, latitude, filePath) {
    // Creazione di un materiale grigio chiaro con riflessi
    const material = new THREE.MeshPhongMaterial({
        color: 0xd3d3d3,  // Grigio chiaro
        specular: 0xffffff, // Colore dei riflessi, bianco per un effetto lucido
        shininess: 100      // Maggiore è il valore, più il materiale è lucido
    });
    
    // Creazione della geometria
    const geom = new THREE.BoxGeometry(0.1, 0.1, 0.1); // Dimensione esemplificativa per gli oggetti

    // Creazione dell'oggetto
    const object = new THREE.Mesh(geom, material);
    object.castShadow = true;

    // Posizionamento dell'oggetto in base alla latitudine e longitudine
    arjs.add(object, longitude, latitude);
}

// Funzione di rendering che aggiorna la scena e la telecamera
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();

// Chiamata per inizializzare la scena AR all'avvio dell'applicazione
initARScene();
