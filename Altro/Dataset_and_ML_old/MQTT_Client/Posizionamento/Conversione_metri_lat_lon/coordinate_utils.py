import math
import csv
import mysql.connector  # Utilizzo di MySQL
from pprint import pprint  # Importa pprint per una visualizzazione più leggibile


# Funzione per convertire da metri a gradi (approssimazione per piccole distanze)
def meters_to_lat_lon(x_meters, y_meters, ref_lat, ref_lon):
    earth_radius = 6378137.0  # Raggio medio della Terra in metri

    # Conversione da metri a latitudine
    delta_lat = (x_meters / earth_radius) * (180.0 / math.pi)

    # Conversione da metri a longitudine, tenendo conto della latitudine del punto di riferimento
    delta_lon = (y_meters / (earth_radius * math.cos(math.pi * ref_lat / 180.0))) * (180.0 / math.pi)

    # Calcolo delle nuove coordinate GPS
    new_lat = ref_lat + delta_lat
    new_lon = ref_lon + delta_lon

    return new_lat, new_lon


# Coordinate GPS della porta in basso a sinistra
ref_lat = 40.986137  # Latitudine della porta
ref_lon = 14.171388  # Longitudine della porta

# Offsets tra il pallino blu in alto a sinistra (origine del sistema) e la porta (in metri)
x_offset = 2.5  # Distanza lungo X
y_offset = 2.03  # Distanza lungo Y

'''Questa parte sotto serve per convertire le coordinate locali note del dataset
in coordinate gps (lat,long) a partire dal punto di riferimento scelto ossia dalla
lat e long note'''
# Connessione al database MySQL
db_conn = mysql.connector.connect(
    host="localhost",  # parametri corretti del server MySQL
    user="root",
    password="rootpassword",
    database="indoor_positioning_db"
)
cursor = db_conn.cursor()

# Creazione della tabella per le coordinate GPS (se non esiste già)
cursor.execute("""
    CREATE TABLE IF NOT EXISTS gps_coordinates_note (
        id INT AUTO_INCREMENT PRIMARY KEY,
        Position FLOAT,
        x FLOAT,
        y FLOAT,
        Latitude DOUBLE,
        Longitude DOUBLE
    );
""")

# Lettura delle coordinate dal file CSV (coordinate locali rispetto al pallino blu)
with open(
        r'D:\Teresa\Ingegneria\Laurea Magistrale\Tesi\MQTT_Client_15_10_2024_MySQL\MQTT_Client\Posizionamento\Algoritmi\Dataset_Beacon_iTag.csv',
        mode='r') as file:
    reader = csv.reader(file)
    next(reader)  # Salta l'intestazione
    gps_coordinates_note = []

    for row in reader:
        position_id, x_local, y_local = float(row[0]), float(row[1]), float(row[2])

        # Calcolo delle coordinate locali rispetto alla porta
        x_relative = x_local - x_offset
        y_relative = y_local - y_offset

        # Conversione in coordinate GPS
        # lat, lon = meters_to_lat_lon(x_relative, y_relative, ref_lat, ref_lon)
        # gps_coordinates_note.append((position_id, x_local, y_local, lat, lon))  # Include position, x, y, lat, lon

        # Stampa delle coordinate GPS
        # print(f"Coordinate GPS per la posizione {position_id}: lat = {lat}, lon = {lon}")

        # Inserimento delle coordinate nel database MySQL
        sql = """
        INSERT INTO gps_coordinates_note (Position, x, y, Latitude, Longitude)
        VALUES (%s, %s, %s, %s, %s)
        """
        # val = (position_id, x_local, y_local, lat, lon)
        # cursor.execute(sql, val)
        # db_conn.commit()

# Salvataggio delle coordinate GPS in un nuovo file CSV
with open('gps_coordinates.csv', mode='w', newline='') as file:
    writer = csv.writer(file)
    writer.writerow(['Position', 'x', 'y', 'Latitude', 'Longitude'])  # Intestazione
    for position, x_local, y_local, lat, lon in gps_coordinates_note:  # Scrivi tutte le coordinate
        writer.writerow([position, x_local, y_local, lat, lon])  # Scrivi tutte le informazioni nel CSV

# Recupera e stampa tutte le righe dalla tabella MySQL
cursor.execute("SELECT * FROM gps_coordinates_note")
gps_data = cursor.fetchall()
document_count = 0

for row in gps_data:
    pprint(row)
    document_count += 1

print(f"Numero totale di righe: {document_count}")

# Chiudi la connessione al database
cursor.close()
db_conn.close()
