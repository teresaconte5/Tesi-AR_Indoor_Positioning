export async function get_object_ar() {
    try {
        const response = await fetch('api-service/object-ar.php'); // Aspetta la risposta della fetch
        if (!response.ok) {
            throw new Error(`Errore nella richiesta: ${response.status} - ${response.statusText}`);
        }
        return await response.json(); // Aspetta la conversione della risposta in JSON e assegna alla variabile
    } catch (error) {
        console.error('Errore:', error); // Gestione errori
        return null; // Restituisce null in caso di errore
    }
}