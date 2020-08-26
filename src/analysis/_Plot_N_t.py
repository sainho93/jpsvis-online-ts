from numpy import *
import matplotlib.pyplot as plt
import os
import pathlib


# Base directory
PROJ_ROOT = pathlib.Path(__file__).parent.parent

def plot_Nt(file):
    fig = plt.figure(figsize=(16, 16), dpi=72)
    ax1 = fig.add_subplot(111, aspect='auto')
    plt.rc("font", size=30)
    plt.rc('pdf', fonttype=42)
    data_file = file
    if not os.path.exists(data_file):
        return "Not found the N_t.dat file"

    data_NT = loadtxt(data_file)
    plt.plot(data_NT[:, 0], data_NT[:, 1], 'r-')
    plt.xlabel("t [s]")
    plt.ylabel("N [-]")
    plt.title("N_t")
    plt.savefig('N_t.png')
    plt.close()
