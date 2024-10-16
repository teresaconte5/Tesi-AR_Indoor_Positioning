import os
import re
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

# Funzione per calcolare le medie e le deviazioni standard degli RSSI dai file CSV
def calculate_averages(directory, channel=None):
    # Codifica il nome della directory per il sistema operativo
    directory_encoded = os.fsencode(directory)
    # Lista i file nella directory
    files = os.listdir(directory_encoded)
    # Ordina i file in base ai numeri presenti nei nomi dei file
    files.sort(key=lambda f: int(re.sub(r'\D', '', os.fsdecode(f))))

    averages = []
    standard_deviations = []
    for file in files:
        filename = os.fsdecode(file)
        if filename.endswith(".csv"):
            # Legge il file CSV in un DataFrame Pandas
            df = pd.read_csv(f'{directory}/{filename}')

            # Filtra per canale, se specificato
            if channel:
                df = df[df.channel == channel]

            # Calcola la media e la deviazione standard degli RSSI
            averages.append(df.rssi.mean())
            standard_deviations.append(df.rssi.std(ddof=0))

    return averages, standard_deviations

# Funzione per tracciare le misurazioni RSSI
def plot_measurements(los_directory, nlos_directory, error_bars=True):
    distances = np.arange(0.5, 12.5, 0.5)

    los_averages, los_standard_deviations = calculate_averages(los_directory)
    nlos_averages, nlos_standard_deviations = calculate_averages(nlos_directory)

    plt.figure(figsize=(8, 5))
    if error_bars:
        plt.errorbar(distances, los_averages, marker='o', color='tab:blue', alpha=0.7, label='Misurazioni LOS',
                     yerr=los_standard_deviations, capsize=5)
        plt.errorbar(distances, nlos_averages, marker='s', color='tab:red', alpha=0.7, label='Misurazioni NLOS',
                     yerr=nlos_standard_deviations, capsize=5)
    else:
        plt.plot(distances, los_averages, marker='o', color='tab:blue', alpha=0.7, label='Misurazioni LOS')
        plt.plot(distances, nlos_averages, marker='s', color='tab:red', alpha=0.7, label='Misurazioni NLOS')

    plt.title('Misurazioni RSSI da 0.5 a 12 metri')
    plt.xticks(distances, rotation=45)
    plt.xlabel('Distanza (m)')
    plt.ylabel('RSSI (dBm)')
    plt.grid(linewidth=0.5, alpha=0.5)
    plt.legend()
    plt.tight_layout()

    plt.show()

# Funzione per tracciare le deviazioni standard delle misurazioni RSSI
def plot_standard_deviations(los_directory, nlos_directory):
    distances = np.arange(0.5, 12.5, 0.5)

    _, los_standard_deviations = calculate_averages(los_directory)
    _, nlos_standard_deviations = calculate_averages(nlos_directory)

    plt.figure(figsize=(8, 5))
    plt.plot(distances, los_standard_deviations, marker='o', color='tab:blue', alpha=0.7, label='Deviazione standard LOS')
    plt.plot(distances, nlos_standard_deviations, marker='s', color='tab:red', alpha=0.7, label='Deviazione standard NLOS')

    plt.title('Deviazioni standard delle misurazioni RSSI da 0.5 a 12 metri')
    plt.xticks(distances, rotation=45)
    plt.xlabel('Distanza (m)')
    plt.ylabel('Deviazione standard RSSI (dBm)')
    plt.grid(linewidth=0.5, alpha=0.5)
    plt.legend()
    plt.tight_layout()

    plt.show()

# Funzione per tracciare il modello di perdita di percorso logaritmico
def plot_path_loss_model(distances, n=2.0, tx_power=-56):
    path_loss = 10 * n * -np.log10(distances) + tx_power
    plt.plot(distances, path_loss, linestyle='dashed', color='tab:green', label=f'Modello di perdita di percorso logaritmico (n = {n:.1f}, TX power = {tx_power})')

# Funzione per tracciare le curve adattate alle misurazioni RSSI
def plot_fitted_curves(los_directory, nlos_directory, channel=None, save=False, plot_measurements=True, plot_path_loss=False):
    distances = np.arange(0.5, 12.5, 0.5)

    los_averages, _ = calculate_averages(los_directory, channel)
    nlos_averages, _ = calculate_averages(nlos_directory, channel)

    m_los, c_los = np.polyfit(np.log(distances), los_averages, 1)
    los_fitted = np.log(distances) * m_los + c_los

    m_nlos, c_nlos = np.polyfit(np.log(distances), nlos_averages, 1)
    nlos_fitted = np.log(distances) * m_nlos + c_nlos

    fitted_averages = np.log(distances) * np.average([m_los, m_nlos]) + np.average([c_los, c_nlos])

    plt.figure(figsize=(8, 5))

    plt.plot(distances, los_fitted, linestyle='dashdot', color='tab:blue', label='Linea di tendenza delle misurazioni LOS')
    plt.plot(distances, nlos_fitted, linestyle='dashdot', color='tab:red', label='Linea di tendenza delle misurazioni NLOS')
    plt.plot(distances, fitted_averages, linestyle='dashed', color='black', label='Linea di tendenza media')

    if plot_path_loss:
        plot_path_loss_model(distances)

    if plot_measurements:
        plt.plot(distances, los_averages, marker='o', color='tab:blue', alpha=0.7, label='Misurazioni LOS')
        plt.plot(distances, nlos_averages, marker='s', color='tab:red', alpha=0.7, label='Misurazioni NLOS')

    plt.title('Misurazioni RSSI e le loro linee di tendenza da 0.5 a 12 metri')
    plt.xticks(distances, rotation=45)
    plt.xlabel('Distanza (m)')
    plt.ylabel('RSSI (dBm)')
    plt.grid(linewidth=0.5, alpha=0.5)
    plt.legend()
    plt.tight_layout()

    if save:
        plt.savefig('rssi-distance-plot.pdf')
    else:
        plt.show()

# Funzione per tracciare i modelli di perdita di percorso logaritmico per vari esponenti di perdita di percorso e potenze di trasmissione
def plot_path_loss_models(pl_exponent_range=np.arange(2.0, 3.6, 0.1), tx_power_range=range(-70, -49)):
    distances = np.arange(0.5, 12.5, 0.5)

    default_tx_power = -60
    plt.figure(figsize=(8, 5))
    for n in pl_exponent_range:
        plot_path_loss_model(distances, n=n, tx_power=default_tx_power)

    plt.title(f'Modello di perdita di percorso logaritmico per esponenti di perdita di percorso (n) da 2.0 a 3.5, e una potenza di trasmissione di {default_tx_power} dBm')
    plt.xticks(np.arange(0.5, 12.5, 0.5), rotation=45)
    plt.yticks(range(-100, -30, 10))
    plt.xlabel('Distanza (m)')
    plt.ylabel('RSSI (dBm)')
    plt.grid(linewidth=0.5, alpha=0.5)

    x = distances[-1]
    y = 10 * pl_exponent_range[0] * -np.log10(distances[-1]) + default_tx_power
    plt.annotate(f'n = {pl_exponent_range[0]:.1f}', xy=(x, y), xycoords='data', xytext=(30, 20), textcoords='offset points', arrowprops=dict(arrowstyle="->", connectionstyle="arc3, rad=.2"))

    y = 10 * pl_exponent_range[-1] * -np.log10(distances[-1]) + default_tx_power
    plt.annotate(f'n = {pl_exponent_range[-1]::.1f}', xy=(x, y), xycoords='data', xytext=(30, 20), textcoords='offset points', arrowprops=dict(arrowstyle="->", connectionstyle="arc3, rad=-.2"))

    plt.show()

    default_pl_exponent = 2.0
    plt.figure(figsize=(9, 5))
    for tx_power in tx_power_range:
        plot_path_loss_model(distances, n=default_pl_exponent, tx_power=tx_power)

    plt.title(f'Modello di perdita di percorso logaritmico per potenze di trasmissione da -70 a -50 dBm, e un esponente di perdita di percorso (n) di {default_pl_exponent}')
    plt.xticks(np.arange(0.5, 12.5, 0.5), rotation=45)
    plt.yticks(range(-100, -30, 10))
    plt.xlabel('Distanza (m)')
    plt.ylabel('RSSI (dBm)')
    plt.grid(linewidth=0.5, alpha=0.5)

    y = 10 * default_pl_exponent * -np.log10(distances[-1]) + tx_power_range[0]
    plt.annotate(f'TX power = {tx_power_range[0]}', xy=(x, y), xycoords='data', xytext=(40, 20), textcoords='offset points', arrowprops=dict(arrowstyle="->", connectionstyle="arc3, rad=.2"))

    y = 10 * default_pl_exponent * -np.log10(distances[-1]) + tx_power_range[-1]
    plt.annotate(f'TX power = {tx_power_range[-1]}', xy=(x, y), xycoords='data', xytext=(40, -10), textcoords='offset points', arrowprops=dict(arrowstyle="->", connectionstyle="arc3, rad=-.2"))

    plt.show()

# Funzione per tracciare le curve adattate alle misurazioni RSSI per un determinato canale
def plot_fitted_curves_channel(los_directory, nlos_directory, channel):
    distances = np.arange(0.5, 12.5, 0.5)

    los_averages, _ = calculate_averages(los_directory, channel)
    nlos_averages, _ = calculate_averages(nlos_directory, channel)

    m_los, c_los = np.polyfit(np.log(distances), los_averages, 1)
    los_fitted = np.log(distances) * m_los + c_los

    m_nlos, c_nlos = np.polyfit(np.log(distances), nlos_averages, 1)
    nlos_fitted = np.log(distances) * m_nlos + c_nlos

    fitted_averages = np.log(distances) * np.average([m_los, m_nlos]) + np.average([c_los, c_nlos])

    colors = {
        37: 'tab:orange',
        38: 'tab:blue',
        39: 'tab:green'
    }

    plt.plot(distances, los_fitted, linestyle='solid', color=colors[channel], label=f'Linea di tendenza LOS per canale {channel}')
    plt.plot(distances, fitted_averages, linestyle='dashed', color=colors[channel], label=f'Linea di tendenza media per canale {channel}')
    plt.plot(distances, nlos_fitted, linestyle='dashdot', color=colors[channel], label=f'Linea di tendenza NLOS per canale {channel}')

    plt.xticks(distances, rotation=45)
    plt.xlabel('Distanza (m)')
    plt.ylabel('RSSI (dBm)')

# Funzione per confrontare le misurazioni RSSI per diversi canali
def plot_channel_comparison(los_channel_directory, nlos_channel_directory):
    plt.figure(figsize=(8, 5))

    for channel in [37, 38, 39]:
        plot_fitted_curves_channel(los_channel_directory, nlos_channel_directory, channel)

    plt.title('Linee di tendenza adattate per 0.5 a 12 metri e diversi canali')
    plt.grid(linewidth=0.5, alpha=0.5)
    plt.legend()
    plt.tight_layout()

    plt.savefig('rssi-distance-trendlines-channels.pdf')

# Funzione principale per eseguire le varie operazioni di tracciamento
def main():
    # Directory dei file di misurazione LOS e NLOS
    los_channel_directory = 'D:/Teresa/Ingegneria/Laurea Magistrale/Tesi/Versione_25_06_2024_AppANDROID_and_Client/MQTT_Client_25_06_2024/MQTT_Client/retta'
    nlos_channel_directory = 'distance-channel-measurements/non-line-of-sight'
    plot_channel_comparison(los_channel_directory, nlos_channel_directory)

if __name__ == "__main__":
    main()
