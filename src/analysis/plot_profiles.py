#!/usr/bin/env python3
#https://towardsdatascience.com/simple-example-of-2d-density-plots-in-python-83b83b934f67

import sys
import time
import os
from scipy import stats
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.cm as cm
from mpl_toolkits.axes_grid1 import make_axes_locatable
from xml.dom.minidom import parse
import pandas as pd
import glob


def plot_geometry(ax, _geometry_wall):
    for gw in _geometry_wall.keys():
        ax.plot(_geometry_wall[gw][:, 0], _geometry_wall[gw][:, 1], color='white', lw=1)


def read_IFD(IFD_filename):
    df = pd.read_csv(IFD_filename,
                     comment='#',sep='\t',
                     names=['f','i','x','y','z/m','d','v','p'],
                     index_col=False)
    return df


def geo_limits(geo_xml):
    geometry_wall = read_subroom_walls(geo_xml)
    geominX=1000
    geomaxX=-1000
    geominY=1000
    geomaxY=-1000
    Xmin = []
    Ymin = []
    Xmax = []
    Ymax = []
    for k in geometry_wall.keys():
        Xmin.append(np.min(geometry_wall[k][:,0]))
        Ymin.append(np.min(geometry_wall[k][:,1]))
        Xmax.append(np.max(geometry_wall[k][:,0]))
        Ymax.append(np.max(geometry_wall[k][:,1]))

    geominX = np.min(Xmin)
    geomaxX = np.max(Xmax)
    geominY = np.min(Ymin)
    geomaxY = np.max(Ymax)
    return geominX, geomaxX, geominY, geomaxY


def read_subroom_walls(xml_doc):
    dict_polynom_wall = {}
    n_wall = 0
    for s_num, s_elem in enumerate(xml_doc.getElementsByTagName('subroom')):
        for p_num, p_elem in enumerate(s_elem.getElementsByTagName('polygon')):
            if p_elem.getAttribute('caption') == "wall":
                n_wall = n_wall + 1
                n_vertex = len(p_elem.getElementsByTagName('vertex'))
                vertex_array = np.zeros((n_vertex, 2))

                for v_num, v_elem in enumerate(p_elem.getElementsByTagName('vertex')):
                    vertex_array[v_num, 0] = p_elem.getElementsByTagName('vertex')[v_num].attributes['px'].value
                    vertex_array[v_num, 1] = p_elem.getElementsByTagName('vertex')[v_num].attributes['py'].value


                dict_polynom_wall[n_wall] = vertex_array

    return dict_polynom_wall


def get_profile(data, xbins, ybins, geometry_wall):
    """ make profile plots for density and velocity
    This method, discritises the geometry in regular grids.
    The value of every grid cell is the mean of <values> for points within each bin.
    Empty bins will be represented by 0.
    Note: <values> here means 1/A_i (density) or v_i (velocity) of Agent i

    :param data: pandas array containing IFD-Date (calculated by method I)
    :param xbins: Discretisation of the geometry in x-axis
    :param ybins: Discretisation of the geometry in y-axis
    :param Id: A number. Useful to produce movies
    :param geometry_wall: Geometry
    :returns: plots two figures: Density and Velocity profiles
    :rtype:

    """
    # t = time.process_time()
    ret1 = stats.binned_statistic_2d(data['x'], data['y'], data['d'], 'mean', bins=[xbins, ybins])
    ret2 = stats.binned_statistic_2d(data['x'], data['y'], data['v'], 'mean', bins=[xbins, ybins])

    prof1 = np.nan_to_num(ret1.statistic.T)
    prof2 = np.nan_to_num(ret2.statistic.T)
    ids = np.unique(data['i'])

    methods = ['none', 'nearest', 'bilinear', 'bicubic', 'spline16',
           'spline36', 'hanning', 'hamming', 'hermite', 'kaiser', 'quadric',
           'catrom', 'gaussian', 'bessel', 'mitchell', 'sinc', 'lanczos']

    for m in ['bicubic']: #methods:
        fig1, ax1 = plt.subplots(1, 1)
        fig2, ax2 = plt.subplots(1, 1)

        im1 = ax1.imshow(prof1,
                        cmap=cm.jet,
                        interpolation=m,
                        origin='lower',
                        vmin=0, vmax=5.5,#np.mean(data['d']) + np.mean(data['d']),
                        extent=[geominX, geomaxX, geominY, geomaxY])

        im2 = ax2.imshow(prof2,
                        cmap=cm.jet,
                        interpolation=m,
                        origin='lower',
                        vmin=0, vmax=np.mean(data['v']) + np.mean(data['v']),
                        extent=[geominX, geomaxX, geominY, geomaxY])


        plot_geometry(ax1, geometry_wall)
        plot_geometry(ax2, geometry_wall)
        # plot_peds(ax)
        ax1.set_title("fr: [{}-{}], dx={:.2f}, dy={:.2f}".format(beginFrame, endFrame, dx, dy))
        ax2.set_title("fr: [{}-{}], dx={:.2f}, dy={:.2f}".format(beginFrame, endFrame, dx, dy))
        figname1 = "profile_density.png"
        figname2 = "profile_velocity.png"
        # print(figname1)
        # print(figname2)
        divider1 = make_axes_locatable(ax1)
        divider2 = make_axes_locatable(ax2)
        cax1 = divider1.append_axes("right", size="3.5%", pad=0.3)
        cax2 = divider2.append_axes("right", size="3.5%", pad=0.3)
        cb1 = plt.colorbar(im1, cax=cax1)
        cb2 = plt.colorbar(im2, cax=cax2)
        cb1.set_label(r'$\rho\; [m^{-2}]$', rotation=270, labelpad=15)
        cb2.set_label(r'$v\; [m/s]$', rotation=270, labelpad=15)
        fig1.savefig(figname1, dpi=300)
        fig2.savefig(figname2, dpi=300)
        # elapsed_time = time.process_time() - t
        # print("time: {:.3f} s".format(elapsed_time))

    return np.mean(prof1), np.std(prof1), np.max(prof1), np.min(prof1)


def get_frame_limits(IFDfile):
    # data = np.loadtxt(IFDfile)
    # frames = data[:, 0]
    # m = np.min(frames)
    # M = np.max(frames)
    data = pd.read_csv(IFDfile,comment='#',sep='\t',
                       names=['Frame','PersID','x','y','z','rho','vel','poly'],
                       index_col=False)

    frames = data['Frame']
    m = np.min(frames)
    M = np.max(frames)
    return m, M


def plot_profiles(geo_filename, traj_filename, IFD_filename):
    print('------- Start generate profiles --------')
    global beginFrame
    global endFrame
    beginFrame = get_frame_limits(IFD_filename)[0]
    endFrame = get_frame_limits(IFD_filename)[1]

    # dx = args.size
    # dy = args.size # probably should be parsed as well, but here dx == dy
    global dx
    global dy
    dx = 0.2
    dy = 0.2
    #---
    # print("inifile: {}".format(jpsreport_inifile))
    # print("Begin steady: {}".format(beginFrame))
    # print("End steady: {}".format(endFrame))
    # print("dx: {:.2f}, fy: {:.2f}".format(dx, dy))
    #----
    # if not os.path.exists(jpsreport_inifile):
    #     sys.exit("{} does not exist".format(jpsreport_inifile))

    # d = parse(jpsreport_inifile)
    # method_I =  d.getElementsByTagName('method_I')[0].attributes.items()[0][1]
    # if method_I.lower() == "false":
    #     sys.exit("method I ist false. Nothing to plot")

    # jpsreport_ini_dir = os.path.dirname(jpsreport_inifile)
    # geo_filename = os.path.join(jpsreport_ini_dir,
    #                            d.getElementsByTagName('geometry')[0].attributes.items()[0][1])
    # traj_filename = os.path.join(jpsreport_ini_dir,
    #                              d.getElementsByTagName("trajectories")[0].getElementsByTagName("file")[0].attributes['name'].value)
    # output_dir = d.getElementsByTagName('output')[0].attributes.items()[0][1]
    # # TODO parse id
    # IFD_filename = os.path.join(jpsreport_ini_dir, output_dir, "Fundamental_Diagram", "IndividualFD", "IFD_I_{}_id_1.dat".format(os.path.basename(traj_filename)))

    if not os.path.exists(geo_filename):
        sys.exit("{} does not exist".format(geo_filename))
    # else:
        # print("geo: {}".format(geo_filename))

    if not os.path.exists(traj_filename):
        sys.exit("{} does not exist".format(traj_filename))
    # else:
        # print("traj: {}".format(traj_filename))

    if not os.path.exists(IFD_filename):
        sys.exit("{} does not exist".format(IFD_filename))
    # else:
        # print("traj: {}".format(IFD_filename))

    xml_datei = open(geo_filename, "r")
    geo_xml = parse(xml_datei)
    xml_datei.close()
    geometry_wall = read_subroom_walls(geo_xml)

    global geominX
    global geomaxX
    global geominY
    global geomaxY
    geominX, geomaxX, geominY, geomaxY = geo_limits(geo_xml)

    data = read_IFD(IFD_filename)
    # filter data
    if beginFrame is None or beginFrame < data['f'].iloc[0]:
        beginFrame = data['f'].iloc[0]
        # print("Change begin frame to {}".format(beginFrame))
    if endFrame is None or endFrame > data['f'].iloc[-1]:
        # print("Change end frame to {}".format(endFrame))
        endFrame = data['f'].iloc[-1]

    ###################################################

    xbins = np.arange(geominX, geomaxX + dx, dx)
    ybins = np.arange(geominY, geomaxY + dx, dy)
    data = data[(data['f'] >= beginFrame) & (data['f'] <= endFrame)]
    get_profile(data, xbins, ybins, geometry_wall)
    ###################################################
    print ("------- Plot profiles finished! --------")

