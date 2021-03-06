import os
import glob
import re
import numpy as np
import pandas as pd

def str_to_array(p):
    """
    convert jpsreport polygon into <np.array>

    :param p: polygon (str)

    """
    if not isinstance(p, str):
        raise TypeError('str_to_Array argument must be str')

    pat = re.compile(r'''(-*\d+\.?\d*, -*\d+\.?\d*),*''')
    matches = pat.findall(p)
    lst = []
    if matches:
        lst = [tuple(map(float, m.split(","))) for m in matches]
    else:
        print("could not convert str to list")

    return np.array(lst)

def get_ids_nt_files(nt_files):
    """    extract ids from nt_files (Method A)

    :param nt_files: list of files -> Fundamental_Diagram/FlowVelocity/Flow_NT_*.dat
    :returns: sorted list of ids
    :rtype: 

    """
    ids = set([-1])
    for f in nt_files:
        i = int(f.split("id_")[-1].split(".")[0])
        ids.add(i)
        
    return list(sorted(ids))

def get_ids_prf_files(field_dir):
    """return ids of measurement areas extracted from profile files

    :param field_dir: Fundamental_Diagram/Classical_Voronoi/field
    :returns: sorted list of ids
    :rtype: 

    """
    files = glob.glob(os.path.join(field_dir, "density",  "Prf_*.dat"))
    ids = set([])
    for f in files:
        ids.add(int(f.split("id_")[-1].split("_")[0]))

    return sorted(ids)    
    


def read_obstacle(xml_doc):
    # Initialization of a dictionary with obstacles
    return_dict = {}
    # read in obstacles and combine them into an array for polygon representation
    for o_num, o_elem in enumerate(xml_doc.getElementsByTagName('obstacle')):

        N_polygon = len(o_elem.getElementsByTagName('polygon'))
        if len(o_elem.getElementsByTagName('polygon')) == 1:
            pass
        else:
            points = np.zeros((0, 2))

        for p_num, p_elem in enumerate(o_elem.getElementsByTagName('polygon')):
            for v_num, v_elem in enumerate(p_elem.getElementsByTagName('vertex')):
                vertex_x = float(p_elem.getElementsByTagName('vertex')[v_num].attributes['px'].value)
                vertex_y = float(p_elem.getElementsByTagName('vertex')[v_num].attributes['py'].value)
                points = np.vstack([points , [vertex_x, vertex_y]])

        points = np.unique(points, axis=0)
        x = points[:, 0]
        y = points[:, 1]
        n = len(points)
        center_point = [np.sum(x)/n, np.sum(y)/n]
        angles = np.arctan2(x-center_point[0],y-center_point[1])
        ##sorting the points:
        sort_tups = sorted([(i,j,k) for i,j,k in zip(x,y,angles)], key = lambda t: t[2])
        return_dict[o_num] = np.array(sort_tups)[:,0:2]

    return return_dict


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

def plot_peds(ax):
    for i in ids:
        d = data[data['i']==i]
        x = d['x']
        y = d['y']
        ax.plot(x, y, 'k', lw=0.05)

def plot_geometry(ax, _geometry_wall):
    for gw in _geometry_wall.keys():
        ax.plot(_geometry_wall[gw][:, 0], _geometry_wall[gw][:, 1], color='white', lw=1)

def read_IFD(IFD_filename):
    df = pd.read_csv(IFD_filename,
                     comment='#',sep='\t',
                     names=['f','i','x','y','z/m','d','v','p'],
                     index_col=False)
    return df
