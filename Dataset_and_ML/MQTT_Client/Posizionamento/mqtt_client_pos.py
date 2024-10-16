import paho.mqtt.client as mqtt
import json
import logging

# Configura il logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Variabili globali per memorizzare i valori RSSI ricevuti
observed_rss_values = {}
mac_rssi_data = {}


# Funzione per processare il payload JSON
def process_payload(payload_json):
    global mac_rssi_data
    try:
        mac_address = payload_json.get("macAddress")
        rssi = payload_json.get("RSSI")
        timestamp = payload_json.get("timestamp")
        posizione = payload_json.get("Posizione")

        if mac_address and rssi is not None:
            logging.info(f"Ricevuto {json.dumps(payload_json)} al tempo '{timestamp}'")

            if mac_address not in mac_rssi_data:
                mac_rssi_data[mac_address] = []

            # Controlla se il timestamp è più recente rispetto all'ultimo salvato
            if not mac_rssi_data[mac_address] or mac_rssi_data[mac_address][-1]["timestamp"] < timestamp:
                mac_rssi_data[mac_address].append({
                    "Posizione": posizione,
                    "mac": mac_address,
                    "RSSI": rssi,
                    "timestamp": timestamp
                })

                # Aggiorna i valori osservati RSSI
                observed_rss_values[mac_address] = rssi
            else:
                logging.info(f"Scartato payload obsoleto per {mac_address}")
    except Exception as e:
        logging.error(f"Errore nel processare il payload: {e}")


# Callback quando viene ricevuto un messaggio
def on_message(client, userdata, message):
    global observed_rss_values
    try:
        msg = message.payload.decode()
        payload_json = json.loads(msg)

        # Se il payload è una lista, iterare attraverso di essa
        if isinstance(payload_json, list):
            for item in payload_json:
                process_payload(item)
        else:
            process_payload(payload_json)

        # Logga i valori RSSI ricevuti
        # logging.info(f"Valori RSSI osservati aggiornati: {observed_rss_values}")

    except json.JSONDecodeError:
        logging.error("Errore nella decodifica del JSON")
    except Exception as e:
        logging.error(f"Errore nel callback on_message: {e}")


# Funzione per configurare il client MQTT
def setup_mqtt(broker_address, topic, qos):
    client = mqtt.Client()

    client.on_connect = lambda client, userdata, flags, rc: logging.info(
        f"Connesso al broker MQTT con codice di ritorno {rc}")
    client.on_disconnect = lambda client, userdata, rc: logging.info(
        f"Disconnesso dal broker MQTT con codice di ritorno {rc}")

    client.connect(broker_address)

    # Configura la sottoscrizione al topic

    def subscribe(topic, qos):
        client.subscribe(topic, qos)
        logging.info(f"Sottoscritto al topic {topic}")

    subscribe(topic, qos)
    client.on_message = on_message
    client.loop_start()  # Avvia il loop in un thread separato
    return client
