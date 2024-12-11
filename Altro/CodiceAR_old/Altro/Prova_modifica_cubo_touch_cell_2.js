

var test =0;
var arjs;
function fake_update(){
    var fake;
if(test==0)
    fake = { lat: 51.06, lon: -0.72 };
else 
   fake = { lat: 51.067, lon: -0.73 };
 test= (test+1)%2;

if (fake) {
    // Usa la posizione simulata per test
    arjs.fakeGps(fake.lon, fake.lat);
}
}

function main() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(80, 2, 0.1, 50000);
    const renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector('#canvas1'),
        alpha: true // Abilita il canale alfa per supportare lo sfondo trasparente
    });

    
    const texture = new THREE.TextureLoader().load('texture/3NKx.gif');
    texture.colorSpace = THREE.SRGBColorSpace;

    // Creazione del cubo
    const geom = new THREE.BoxGeometry(20, 25, 20);


    // Inizializzazione di AR.js con la scena e la telecamera per ottenere posizioni GPS
     arjs = new THREEx.LocationBased(scene, camera);

    // Inizializzazione del rendering della webcam sulla canvas con id 'video1'
    const cam = new THREEx.WebcamRenderer(renderer, '#video1');

    let fake = null; // Variabile per la posizione GPS simulata
    let orientationControls;

    // Controlli di orientamento che funzionano solo su dispositivi mobili
    if (isMobile()) {
        orientationControls = new THREEx.DeviceOrientationControls(camera);
    }

    let first = true; // Variabile per verificare se è il primo aggiornamento GPS

    // Evento che si attiva al ricevimento di un aggiornamento GPS
    arjs.on("gpsupdate", pos => {
      //  if (first) {
            // Alla prima ricezione di un aggiornamento GPS, posiziona gli oggetti nella scena
          //  
          setupObjects(-0.72, 51.06); 
            first = false; // Imposta la variabile su false per evitare di ripetere l'operazione
      //  }
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


    // Funzione per aggiungere il controllo di rotazione dell'oggetto con il mouse
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Funzione per rilevare se il dispositivo è mobile
    function isMobile() {
        // Verifica se il dispositivo è un mobile basato sul suo user agent
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
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
    
    var cube;
    
    function setupObjects(longitude, latitude) {
        
        const cubeMaterial = new THREE.MeshPhongMaterial({ map: texture });
        cube = new THREE.Mesh(geom, cubeMaterial);
    
        // Posizionamento del cubo leggermente sopra il piano
        cube.position.set(0, 10, -20); // L'asse Y solleva il cubo
        cube.castShadow = true; // Il cubo proietta ombre
        arjs.add(cube, longitude, latitude + 0.001); // Leggermente a nord della posizione GPS
        

         addMouseRotationControl(cube); // Usa il controllo di rotazione con il mouse
    
    }







//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Aggiungi event listener per devicemotion (accelerometro)
    window.addEventListener('devicemotion', handleMotion, true);

    // Aggiungi event listener per deviceorientation (giroscopio)
    window.addEventListener('deviceorientation', handleOrientation, true);

    function handleMotion(event) {
        let accelX = event.accelerationIncludingGravity.x;
        let accelY = event.accelerationIncludingGravity.y;
        let accelZ = event.accelerationIncludingGravity.z;

        console.log(`accel (Z): ${accelZ},accel (X): ${accelX}, accel (Y): ${accelY}`);

        camera.position.x += accelX * 0.01;
        camera.position.y += accelY * 0.01;
        camera.position.z += accelZ * 0.01;
    }

    function handleOrientation(event) {
        let alpha = event.alpha;
        let beta = event.beta;
        let gamma = event.gamma;

        console.log(`Alpha (Z): ${alpha}, Beta (X): ${beta}, Gamma (Y): ${gamma}`);

        cube.rotation.set(
            THREE.Math.degToRad(beta),
            THREE.Math.degToRad(alpha),
            THREE.Math.degToRad(gamma)
        );
    } 


    // Richiesta di eseguire il rendering della scena al prossimo frame
    requestAnimationFrame(render);
    setInterval(fake_update,1000);
    setInterval(cam.update,1100);

}

// Avvia la funzione principale
main();
