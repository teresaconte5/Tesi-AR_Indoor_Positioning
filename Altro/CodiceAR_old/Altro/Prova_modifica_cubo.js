function main() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 50000);
    const renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector('#canvas1'),
        alpha: true // Abilita il canale alfa per supportare lo sfondo trasparente
    });

    // Illuminazione
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5); // Posiziona la luce per illuminare l'oggetto
    scene.add(light);

    const texture = new THREE.TextureLoader().load('texture/3NKx.gif');
    texture.colorSpace = THREE.SRGBColorSpace;

    // Creazione del cubo
    const geom = new THREE.BoxGeometry(20, 25, 20);

    // Inizializzazione di AR.js con la scena e la telecamera per ottenere posizioni GPS
    const arjs = new THREEx.LocationBased(scene, camera);

    // Inizializzazione del rendering della webcam sulla canvas con id 'camerafeed'
    const cam = new THREEx.WebcamRenderer(renderer, '#video1');

    let fake = { lat: 51.05, lon: -0.72 }; // Posizione GPS simulata
    let model; // Variabile per memorizzare il modello 3D
    let first = true; // Variabile per verificare se è il primo aggiornamento GPS

    // Controlli di orientamento che funzionano solo su dispositivi mobili
    let orientationControls;
    if (isMobile()) {
        orientationControls = new THREEx.DeviceOrientationControls(camera);
    }

    // Evento che si attiva al ricevimento di un aggiornamento GPS
    arjs.on("gpsupdate", pos => {
        console.log("Aggiornamento GPS ricevuto:", pos.coords.longitude, pos.coords.latitude);
        if (first) {
            model = setupObjects(pos.coords.longitude, pos.coords.latitude);
            first = false; // Imposta la variabile su false per evitare di ripetere l'operazione
        }
    });

    // Evento che si attiva in caso di errore GPS
    arjs.on("gpserror", code => {
        alert(`Errore GPS: codice ${code}`);
    });

    // Usa la posizione simulata per test
    arjs.fakeGps(fake.lon, fake.lat);
    // Per avviare la localizzazione GPS reale, usa: arjs.startGps();

     // Configurazione per la telecamera
     const cameraRadius = 2; // Distanza della telecamera dall'albero
     let cameraAngle = 0; // Angolo iniziale della telecamera
     const rotationSpeed = 0.01; // Velocità di rotazione della telecamera
 
     // Funzione per ruotare la telecamera attorno al modello
     const rotateCamera = () => {
        if (model) {
            cameraAngle += rotationSpeed; // Aggiorna l'angolo di rotazione
    
            // Calcola la posizione della telecamera
            camera.position.x = model.position.x + cameraRadius * Math.sin(cameraAngle);
            camera.position.z = model.position.z + cameraRadius * Math.cos(cameraAngle);
            camera.position.y = model.position.y + 1; // Mantieni un'altezza fissa sopra il modello
            
            // Focalizza la telecamera sul modello
            camera.lookAt(model.position);
    
            // Log delle posizioni
            console.log("Camera Position:", camera.position);
            console.log("Model Position:", model.position);
        }
    };
    
 
     // Funzione per l'animazione principale
     const animate = () => {
         rotateCamera(); // Chiama la funzione per ruotare la telecamera
 
         resizeUpdate(); // Aggiorna le dimensioni del canvas
         if (orientationControls) orientationControls.update(); // Aggiorna i controlli di orientamento, se presenti
         cam.update(); // Aggiorna il rendering della webcam
         renderer.render(scene, camera); // Renderizza la scena con la telecamera
         requestAnimationFrame(animate); // Chiamata ricorsiva per l'animazione
     }


     // Funzione per aggiungere il controllo di rotazione dell'oggetto con il mouse
    function addMouseRotationControl(object, mouseStep = 0.05) {
        let mousedown = false, lastX = 0, lastY = 0; // Variabili per gestire l'interazione col mouse
    
        // Eventi del mouse per testare su un desktop
        window.addEventListener("mousedown", e => {
            mousedown = true; // Abilita il flag di trascinamento quando il mouse è premuto
            lastX = e.clientX; // Salva la posizione iniziale del mouse
            lastY = e.clientY;
        });
    
        window.addEventListener("mouseup", () => {
            mousedown = false; // Disabilita il flag di trascinamento quando il mouse è rilasciato
        });
    
        window.addEventListener("mousemove", e => {
            if (!mousedown) return; // Se il mouse non è premuto, esce dall'evento
            
            // Rotazione orizzontale (sinistra-destra) sull'asse Y
            object.rotation.y += (e.clientX - lastX) * mouseStep; // Aggiorna la rotazione
            // Rotazione verticale (su-giù) sull'asse X
            object.rotation.x += (e.clientY - lastY) * mouseStep;
    
            lastX = e.clientX; // Aggiorna la posizione X del mouse
            lastY = e.clientY; // Aggiorna la posizione Y del mouse
        });
    
        // Eventi del tocco per dispositivi mobili
        let touchStartX = 0, touchStartY = 0; // Variabili per il tocco
    
        window.addEventListener("touchstart", e => {
            if (e.touches.length > 0) {
                mousedown = true; // Abilita il flag di trascinamento quando il tocco è attivo
                touchStartX = e.touches[0].clientX; // Salva la posizione iniziale del tocco
                touchStartY = e.touches[0].clientY;
            }
        });
    
        window.addEventListener("touchend", () => {
            mousedown = false; // Disabilita il flag di trascinamento quando il tocco termina
        });
    
        window.addEventListener("touchmove", e => {
            if (!mousedown) return; // Se il tocco non è attivo, esce dall'evento
    
            // Rotazione orizzontale (sinistra-destra) sull'asse Y
            object.rotation.y += (e.touches[0].clientX - touchStartX) * mouseStep; // Aggiorna la rotazione
            // Rotazione verticale (su-giù) sull'asse X
            object.rotation.x += (e.touches[0].clientY - touchStartY) * mouseStep;
    
            touchStartX = e.touches[0].clientX; // Aggiorna la posizione X del tocco
            touchStartY = e.touches[0].clientY; // Aggiorna la posizione Y del tocco
        });
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
        const cubeMaterial = new THREE.MeshPhongMaterial({ map: texture }); // Usa la texture
        const cube = new THREE.Mesh(geom, cubeMaterial);
        arjs.add(cube, longitude, latitude + 0.001);

        addMouseRotationControl(cube); // Usa il controllo di rotazione con il mouse
        
    }

    // Funzione per rilevare se il dispositivo è mobile
    function isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // Inizia l'animazione
    animate();
}

window.addEventListener('load', main);
