import numpy as np
from sklearn.neighbors import KNeighborsRegressor
from sklearn.cluster import KMeans

# Classe per rappresentare un punto di riferimento con RSSI e coordinate (x, y)
class ReferencePoint:
    def __init__(self, readings, coordinates):
        self.readings = readings  # Lista di letture RSSI
        self.coordinates = coordinates  # Array di coordinate [x, y]

# Funzione per calcolare la posizione stimata utilizzando K-means e KNN
def knn_kmeans_algorithm(rps, observed_rss_values, k_clusters=4, k_neighbors=4):
    # Costruzione del dataset di addestramento
    X_train = [rp.readings for rp in rps]
    coordinates = [rp.coordinates for rp in rps]

    # Applicazione del clustering K-means
    kmeans = KMeans(n_clusters=k_clusters)
    clusters = kmeans.fit_predict(X_train)

    # Identificazione del cluster dell'osservazione corrente
    observed_cluster = kmeans.predict([observed_rss_values])[0]

    # Filtraggio dei reference points appartenenti al cluster dell'osservazione
    cluster_rps = [rps[i] for i in range(len(rps)) if clusters[i] == observed_cluster]

    # Preparazione dei dati per KNN
    cluster_X_train = [rp.readings for rp in cluster_rps]
    cluster_y_train_x = [rp.coordinates[0] for rp in cluster_rps]
    cluster_y_train_y = [rp.coordinates[1] for rp in cluster_rps]

    # Inizializzazione del regressore KNN
    knn_x = KNeighborsRegressor(n_neighbors=k_neighbors)
    knn_y = KNeighborsRegressor(n_neighbors=k_neighbors)

    # Addestramento dei regressori
    knn_x.fit(cluster_X_train, cluster_y_train_x)
    knn_y.fit(cluster_X_train, cluster_y_train_y)

    # Predizione della posizione stimata basata sui RSSI osservati
    predicted_x = knn_x.predict([observed_rss_values])
    predicted_y = knn_y.predict([observed_rss_values])

    return [predicted_x[0], predicted_y[0]]
