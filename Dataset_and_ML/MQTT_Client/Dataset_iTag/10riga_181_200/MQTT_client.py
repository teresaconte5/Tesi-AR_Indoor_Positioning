import json
import random
from datetime import datetime
from paho.mqtt import client as mqtt_client

# Configurazione del broker MQTT e del topic
broker = 'test.mosquitto.org'
port = 1883
topic = "beaconData"
client_id = f'subscribe-{random.randint(0, 100)}'
Qos = 1
keep_alive = 60

# Dizionario per memorizzare i dati ricevuti
mac_rssi_data = {}

# Funzione per connettersi al broker MQTT
def connect_mqtt() -> mqtt_client.Client:
    def on_connect(client, userdata, flags, rc):
        if rc == 0:
            print("Connesso al broker MQTT!")
        else:
            print(f"Connessione fallita, codice di ritorno {rc}\n")

    client = mqtt_client.Client(client_id)
    client.on_connect = on_connect
    client.connect(broker, port, keep_alive)
    return client

# Funzione per sanificare i nomi dei file (sostituendo i caratteri non validi)
def sanitize_filename(filename):
    invalid_chars = ':'
    for char in invalid_chars:
        filename = filename.replace(char, '_')
    return filename

# Funzione per gestire la sottoscrizione e il ricevimento dei messaggi
def subscribe(client: mqtt_client.Client):
    def on_message(client, userdata, msg):
        payload = msg.payload.decode()

        try:
            payload_json = json.loads(payload)
        except json.JSONDecodeError:
            print("Errore nella decodifica del JSON")
            return

        # Se il payload è una lista, iterare attraverso di essa
        if isinstance(payload_json, list):
            for item in payload_json:
                process_payload(item)
        # Se il payload è un singolo oggetto JSON, processarlo direttamente
        else:
            process_payload(payload_json)

    client.subscribe(topic, Qos)
    client.on_message = on_message

# Funzione per processare ciascun oggetto JSON nel payload
def process_payload(payload_json):
    mac_address = payload_json.get("macAddress")
    rssi = payload_json.get("RSSI")
    data_to_send = payload_json.get("timestamp")
    Posizione=payload_json.get("Posizione")

    if mac_address and rssi and data_to_send:
        timestamp = datetime.now().isoformat()
        print(f"Ricevuto `{json.dumps(payload_json)}` al tempo '{timestamp}'")

        if mac_address not in mac_rssi_data:
            mac_rssi_data[mac_address] = []

        mac_rssi_data[mac_address].append({
            "Posizione": Posizione,
            "mac": mac_address,
            "RSSI": rssi,
            "dataToSend": data_to_send
        })

        # Scrivi i dati aggiornati nel file JSON
        filename = sanitize_filename(mac_address)
        try:
            with open(f"{filename}.json", "w") as json_file:
                json.dump({mac_address: mac_rssi_data[mac_address]}, json_file, indent=4)
        except IOError as e:
            print(f"Errore durante la scrittura del file {filename}.json: {e}")
    else:
        print("Il payload non contiene tutti i campi necessari (mac, rssi e dataToSend)")

# Funzione principale per eseguire il client MQTT
def run():
    client = connect_mqtt()
    subscribe(client)
    try:
        client.loop_forever()
    except KeyboardInterrupt:
        print("Interruzione manuale del programma")

if __name__ == '__main__':
    run()


    
