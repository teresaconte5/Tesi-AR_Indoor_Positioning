import mysql.connector


# Connessione al database MySQL
def connect_to_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="rootpassword",
        database="indoor_positioning_db"  # Il nome del tuo database
    )


# Funzione per creare la tabella oggetti
def create_table():
    connection = connect_to_db()
    cursor = connection.cursor()

    # SQL per creare la tabella oggetti
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS oggettiAR (
        id INT AUTO_INCREMENT PRIMARY KEY,
        gbl VARCHAR(255) NOT NULL,
        lat DOUBLE NOT NULL,
        lon DOUBLE NOT NULL,
        file_path VARCHAR(500) NOT NULL
    );
    """

    try:
        cursor.execute(create_table_sql)
        connection.commit()
        print("Tabella 'oggettiAR' creata (se non esisteva già).")
    except mysql.connector.Error as err:
        print(f"Errore durante la creazione della tabella: {err}")
    finally:
        cursor.close()
        connection.close()


# Funzione per inserire un oggetto nel database con il percorso del file .gltf
def insert_object(gbl, lat, lon, file_path):
    connection = connect_to_db()
    cursor = connection.cursor()

    sql = "INSERT INTO oggettiAR (gbl, lat, lon, file_path) VALUES (%s, %s, %s, %s)"
    values = (gbl, lat, lon, file_path)

    try:
        cursor.execute(sql, values)
        connection.commit()
        print(f"Oggetto {gbl} inserito correttamente.")
    except mysql.connector.Error as err:
        print(f"Errore: {err}")
    finally:
        cursor.close()
        connection.close()


# Creazione della tabella prima di inserire gli oggetti
create_table()

# Inserisci gli oggetti con i percorsi .gltf
objects_to_insert = [
    ('Oggetto1', 40.712776, -74.005974, r'D:\Teresa\Ingegneria\Laurea Magistrale\Tirocinio\Codice AR.js\example_simple\assets\articuno\scena.gltf'),  # New York
    # ('Oggetto2', 51.507351, -0.127758, '/path/to/oggetto2.gltf'),  # Londra
    # ('Oggetto3', 48.856613, 2.352222, '/path/to/oggetto3.gltf')  # Parigi
]

for obj in objects_to_insert:
    insert_object(*obj)
