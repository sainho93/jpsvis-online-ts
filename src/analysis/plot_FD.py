import pandas as pd
import matplotlib.pyplot as plt
import numpy as np


def get_frame_limits(IFDfile):
    data = pd.read_csv(IFDfile,comment='#',sep='\t',
                       names=['Frame','PersID','x','y','z','rho','vel','poly'],
                       index_col=False)

    frames = data['Frame']
    m = np.min(frames)
    M = np.max(frames)
    return m, M


def plot_density_frame(rho_v_filename):
    print('------- Start generate Rho_frame --------')
    fmin = get_frame_limits(rho_v_filename)[0]
    fmax = get_frame_limits(rho_v_filename)[1]

    f = rho_v_filename
    figname = "density_frame.png"

    fig1, axs = plt.subplots(1, 1)

    data = np.loadtxt(f)
    mask = (data[:, 0] >= fmin) & (data[:, 0] <= fmax)
    frames = data[:, 0]

    axs.plot([fmin], [data[fmin-int(min(frames)), 1]], 'o')
    axs.plot([fmax], [data[fmax-int(min(frames)), 1]], 'o')
    axs.plot(data[:, 0], data[:, 1], 'k')
    axs.plot(data[fmin-int(min(frames)):fmax-int(min(frames)), 0],
                   data[fmin-int(min(frames)):fmax-int(min(frames)), 1],
                   '-r', lw=2)
    axs.set(xlabel=r'$frame$', ylabel='$\\rho\; [m{-2}$]')
    x0,x1 = axs.get_xlim()
    y0,y1 = axs.get_ylim()
    axs.set_aspect(abs(x1-x0)/abs(y1-y0))
    fig1.savefig(figname, dpi=300)
    print ("------- Plot Rho_frame finished! --------")


def plot_velocity_frame(rho_v_filename):
    print('------- Start generate V_frame --------')
    fmin = get_frame_limits(rho_v_filename)[0]
    fmax = get_frame_limits(rho_v_filename)[1]

    f = rho_v_filename
    figname = "velocity_frame.png"

    fig1, axs = plt.subplots(1, 1)

    data = np.loadtxt(f)
    mask = (data[:, 0] >= fmin) & (data[:, 0] <= fmax)
    frames = data[:, 0]

    axs.plot(data[:, 0], data[:, 2], 'k')
    axs.plot([fmin], [data[fmin-int(min(frames)), 2]], 'o')
    axs.plot([fmax], [data[fmax-int(min(frames)), 2]], 'o')
    axs.plot(data[fmin-int(min(frames)):fmax-int(min(frames)), 0],
                   data[fmin-int(min(frames)):fmax-int(min(frames)), 2],
                   '-r', lw=2)
    axs.set(xlabel=r'$frame$', ylabel='$v\; [m/s$]')
    x0,x1 = axs.get_xlim()
    y0,y1 = axs.get_ylim()
    axs.set_aspect(abs(x1-x0)/abs(y1-y0))
    fig1.savefig(figname, dpi=300)
    print ("------- Plot V_frame finished! --------")


def plot_density_velocity(IFD_filename):
    """
    method D
    file contain three columns:
    >> frame density velocity <<
    """
    fmin = get_frame_limits(IFD_filename)[0]
    fmax = get_frame_limits(IFD_filename)[1]

    f = IFD_filename
    fig, axs = plt.subplots(2, 2)

    data = np.loadtxt(f)
    mask = (data[:, 0] >= fmin) & (data[:, 0] <= fmax)
    frames = data[:, 0]
    # rho(t)
    axs[0][0].plot([fmin], [data[fmin-int(min(frames)), 1]], 'o', color=color)
    axs[0][0].plot([fmax], [data[fmax-int(min(frames)), 1]], 'o', color=color)
    axs[0][0].plot(data[:, 0], data[:, 1], 'k')
    axs[0][0].plot(data[fmin-int(min(frames)):fmax-int(min(frames)), 0],
                   data[fmin-int(min(frames)):fmax-int(min(frames)), 1],
                   '-r', lw=2)
    axs[0][0].set(xlabel=r'$frame$', ylabel='$\\rho\; [m{-2}$]')
    x0,x1 = axs[0][0].get_xlim()
    y0,y1 = axs[0][0].get_ylim()
    axs[0][0].set_aspect(abs(x1-x0)/abs(y1-y0))
    # v(t)
    axs[0][1].plot(data[:, 0], data[:, 2], 'k')
    axs[0][1].plot([fmin], [data[fmin-int(min(frames)), 2]], 'o', color=color)
    axs[0][1].plot([fmax], [data[fmax-int(min(frames)), 2]], 'o', color=color)
    axs[0][1].plot(data[fmin-int(min(frames)):fmax-int(min(frames)), 0],
                   data[fmin-int(min(frames)):fmax-int(min(frames)), 2],
                   '-r', lw=2)
    axs[0][1].set(xlabel=r'$frame$', ylabel='$v\; [m/s$]')
    x0,x1 = axs[0][1].get_xlim()
    y0,y1 = axs[0][1].get_ylim()
    axs[0][1].set_aspect(abs(x1-x0)/abs(y1-y0))
    # rho vs J
    data2 = data[mask]
    maxRho = np.max(data[:, 1])
    maxJ = np.max(data[:, 1]*data[:, 2])
    axs[1][1].scatter(data2[:, 1], data2[:, 1]*data2[:, 2], color=color, alpha=alpha)
    axs[1][1].set(xlabel='$\\rho\; [1/m{-2}]$', ylabel='$J\; [1/ms$]', xlim=[0, maxRho], ylim=[0, maxJ])
    x0,x1 = axs[1][1].get_xlim()
    y0,y1 = axs[1][1].get_ylim()
    axs[1][1].set_aspect(abs(x1-x0)/abs(y1-y0))
    #axs[1][1].set_aspect('scaled')
    # rho vs v
    maxV = np.max(data[:, 2])
    axs[1][0].scatter(data2[:, 1], data2[:, 2], color=color, alpha=alpha)
    axs[1][0].set(xlabel='$\\rho\; [1/m{-2}]$', ylabel='$v\; [m/s$]', xlim=[0, maxRho], ylim=[0, maxV])
    x0,x1 = axs[1][0].get_xlim()
    y0,y1 = axs[1][0].get_ylim()
    axs[1][0].set_aspect(abs(x1-x0)/abs(y1-y0))
    plt.tight_layout()
