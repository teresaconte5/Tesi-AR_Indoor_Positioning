import logging
import sys
import time
from MQTT_Client.Posizionamento.Algoritmi.Point import AccessPoint
from MQTT_Client.Posizionamento.Algoritmi.Positioning import Positioning
from MQTT_Client.Posizionamento.Algoritmi.Preprocessing import load_and_preprocess_data
from MQTT_Client.Posizionamento.Conversione_metri_lat_lon.coordinate_utils import meters_to_lat_lon
from mqtt_client_pos import setup_mqtt, observed_rss_values
import joblib
import numpy as np
import mysql.connector
from datetime import datetime
import pytz  # Per gestire i fusi orari

# Configurazione logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Coordinate GPS della porta in basso a sinistra
ref_lat = 40.986137  # Latitudine della porta
ref_lon = 14.171388  # Longitudine della porta

# Offsets tra il pallino blu in alto a sinistra (origine del sistema) e la porta (in metri)
x_offset = 2.5  # Distanza lungo X
y_offset = 2.03  # Distanza lungo Y


###############################################################################################################################

# Funzione per connettersi al database MySQL
def connect_to_mysql():
    try:
        db_conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="rootpassword"
        )
        cursor = db_conn.cursor()

        # Creazione del database se non esiste
        cursor.execute("CREATE DATABASE IF NOT EXISTS indoor_positioning_db")
        db_conn.database = 'indoor_positioning_db'

        # Creazione della tabella se non esiste
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS rssi_data (
            id INT AUTO_INCREMENT PRIMARY KEY,
            position_id VARCHAR(50),
            rssi VARCHAR(255),
            x_coordinate FLOAT,
            y_coordinate FLOAT,
            Latitude DOUBLE,
            Longitude DOUBLE,
            timestamp TIMESTAMP
        )
        """)
        logging.info("Connessione al database MySQL riuscita e database preparato.")
        return db_conn, cursor
    except mysql.connector.Error as err:
        logging.error(f"Errore durante la connessione al database MySQL: {err}")
        sys.exit("Errore fatale: impossibile connettersi al database MySQL.")


###############################################################################################################################
# Funzione per memorizzare i dati RSSI nel database MySQL
def store_rssi_data(cursor, db_conn, position_id, rssi_value, coordinates):
    try:
        coordinates_list = coordinates.tolist() if isinstance(coordinates, np.ndarray) else coordinates
        x_coordinate, y_coordinate = coordinates_list

        # Converti le coordinate locali in coordinate GPS usando meters_to_lat_lon
        lat, lon = meters_to_lat_lon(x_coordinate, y_coordinate, ref_lat, ref_lon)

        # Convertire l'array RSSI in stringa
        rssi_str = ','.join(map(str, rssi_value))

        # Ottieni l'orario attuale in UTC e converti in orario locale (Europe/Rome)
        utc_now = datetime.now(pytz.utc)
        local_tz = pytz.timezone('Europe/Rome')
        local_time = utc_now.astimezone(local_tz)

        sql = """
        INSERT INTO rssi_data (position_id, rssi, x_coordinate, y_coordinate, Latitude, Longitude, timestamp)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        val = (position_id, rssi_str, x_coordinate, y_coordinate, lat, lon, local_time)
        cursor.execute(sql, val)
        db_conn.commit()
        logging.info(
            f"Dati salvati per {position_id}: RSSI={rssi_str}, x={x_coordinate}, y={y_coordinate}, lat={lat}, lon={lon}, timestamp={local_time}")
    except mysql.connector.Error as err:
        logging.error(f"Errore durante l'inserimento dei dati nel database MySQL: {err}")


###############################################################################################################################

with open(
        r'D:\Teresa\Ingegneria\Laurea Magistrale\Tesi\MQTT_Client_15_10_2024_MySQL\MQTT_Client\Posizionamento\Algoritmi\scaler.pkl',
        'rb') as scaler_model:
    scaler = joblib.load(scaler_model)

# Configurazione MQTT
broker = 'test.mosquitto.org'
port = 1883
topic = "beaconData"
Qos = 0
keep_alive = 60
client = setup_mqtt(broker, topic, Qos)

# Crea un'istanza della classe Positioning
positioning = Positioning();


# Carica i modelli preaddestrati
# with open(
#       r'D:\Teresa\Ingegneria\Laurea Magistrale\Tesi\MQTT_Client_15_10_2024_MySQL\MQTT_Client\Posizionamento\Algoritmi\knn_model.pkl',
#      'rb') as model_file_1:
# knn_model = joblib.load(model_file_1)

# with open(
#         r'D:\Teresa\Ingegneria\Laurea Magistrale\Tesi\MQTT_Client_20_09_2024_MySQL\MQTT_Client\Posizionamento\Algoritmi\svc_model.pkl',
#         'rb') as model_file_2:
#     svc_model = joblib.load(model_file_2)

with open(
        r'D:\Teresa\Ingegneria\Laurea Magistrale\Tesi\MQTT_Client_20_09_2024_MySQL\MQTT_Client\Posizionamento\Algoritmi\rf_model.pkl',
        'rb') as model_file_3:
    rf_model = joblib.load(model_file_3)

# Assegna i modelli x e y all'istanza della classe Positioning
positioning.model_x = rf_model['model_x']
positioning.model_y = rf_model['model_y']

###############################################################################################################################
# Connessione al database
db_conn, cursor = connect_to_mysql()

###############################################################################################################################
# Timeout per l'assenza di messaggi
last_timestamp = time.time()
timeout = 10

mac_order = [
    'FF:FF:11:15:F5:9A',
    'FF:FF:11:15:2D:C4',
    'FF:FF:11:10:14:A0'
]

print("mac order", mac_order)

try:
    while True:
        # Controllo dei valori RSSI
        if observed_rss_values:
            logging.info(f"Valori RSSI osservati: {observed_rss_values}")

            # Ordina i valori RSSI in base al MAC order
            ordered_rss_values = [observed_rss_values.get(mac, None) for mac in mac_order]

            mac_values = {mac: [] for mac in mac_order}
            for mac in mac_order:
                rssi = observed_rss_values.get(mac, None)
                if rssi is not None:
                    mac_values[mac].append(rssi)

            # Calcola la media dei RSSI per ogni MAC
            mean_rssi_values = {mac: sum(rssis) / len(rssis) for mac, rssis in mac_values.items() if rssis}

            # Verifica che ci siano almeno 3 valori RSSI e che non siano None
            if len(mean_rssi_values) >= 3 and all(val is not None for val in mean_rssi_values.values()):

                # Scaling dei valori RSSI
                scaled_rssi = scaler.transform([list(mean_rssi_values.values())])

                predicted_position = positioning.predict(scaled_rssi)[0]

                # Salvataggio nel database
                # store_rssi_data(cursor, db_conn, 'position_knn', ordered_rss_values, predicted_position_1)
                # store_rssi_data(cursor, db_conn, 'position_knn_optim', ordered_rss_values, predicted_position_2)

                logging.info(f"Previsioni: {predicted_position}")
            else:
                logging.warning("Mancano valori RSSI da uno o più beacon, impossibile fare previsioni.")

            # Reset RSSI
            observed_rss_values.clear()
            last_timestamp = time.time()

        else:
            logging.info("Nessun valore RSSI ricevuto.")
            if time.time() - last_timestamp > timeout:
                logging.warning(f"Nessun nuovo messaggio negli ultimi {timeout} secondi, fermando il loop.")
                break

        # Pausa tra le iterazioni
        time.sleep(5)

except KeyboardInterrupt:
    logging.info("Interruzione manuale del programma.")

finally:
    client.loop_stop()
    client.disconnect()
    cursor.close()
    db_conn.close()
    logging.info("Connessione al database chiusa.")
