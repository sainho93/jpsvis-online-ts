#  \file server.py
#  \date 2020 - 5 - 8
#  \author Tao Zhong
#  \copyright <2009 - 2020> Forschungszentrum Jülich GmbH. All rights reserved.
#
#  \section License
#  This file is part of JuPedSim.
#
#  JuPedSim is free software: you can redistribute it and/or modify
#   it under the terms of the GNU Lesser General Public License as published by
#  the Free Software Foundation, either version 3 of the License, or
#   any later version.
#
#  JuPedSim is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
#  GNU General Public License for more details.
#
#  You should have received a copy of the GNU Lesser General Public License
#  along with JuPedSim. If not, see <http://www.gnu.org/licenses/>.
# import aiohttp_debugtoolbar
from aiohttp import web
import aiohttp_cors
import json
import asyncio
import logging
import pathlib
import base64
import os
from numpy import *

from xml.etree import ElementTree as ET
import xmltodict
import sys

BASE_DIR=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

from analysis import _Plot_N_t
from analysis import plot_profiles
from analysis import plot_FD

# Base directory
PROJ_ROOT = pathlib.Path(__file__).parent.parent.parent
NO_CACHE_HEADER = {'cache-control': 'no-cache'}


def parse_geometry_file(filepath):
    if filepath:
        with open(filepath, encoding='utf-8') as f:
            return xmltodict.parse(f.read(), attr_prefix='')
    else:
        return None


def parse_trajectory_file(filepath):
    trajectory = {'pedestrians': []}
    if filepath:
        with open(filepath, 'r') as f:
            for line in f.readlines():
                line = line.strip('\n')
                if line.startswith('#framerate:'):
                    framerate = float(line.split()[1])
                    trajectory['framerate'] = framerate
                else:
                    if line.startswith('#') is False and line != '':
                        line = line.split('\t')
                        id = int(line[0])
                        if id < len(trajectory['pedestrians']) + 1:
                            trajectory['pedestrians'][id - 1].append(parse_pedestrian(line))
                        else:
                            trajectory['pedestrians'].append([parse_pedestrian(line)])

        return trajectory

    else:
        return None


def parse_pedestrian(dataline):
    id = dataline[0]
    x = float(dataline[2])
    y = float(dataline[3])
    z = float(dataline[4])
    a = float(dataline[5])
    b = float(dataline[6])
    angle = float(dataline[7])
    color = float(dataline[8])

    location = {
        'coordinate': {'x': x, 'y': y, 'z': z},
        'axes': {'A': a, 'B': b},
        'angle': angle,
        'color': color,
        'id': id
    }

    return location


async def index(request):
    # Avoid web.FileResponse here because we want to disable caching.
    html = open(str(PROJ_ROOT / 'static' / 'index.html')).read()
    return web.Response(text=html, content_type='text/html', headers=NO_CACHE_HEADER)


# Handler for request "/N_t"
async def get_Nt(request):
    nt_file = 'N_t.dat'
    _Plot_N_t.plot_Nt(nt_file)

    with open("N_t.png", "rb") as img_f:
        return web.Response(text=base64.b64encode(img_f.read()).decode('utf-8'))


# Handler for request "/Profiles_Density"
async def get_profile_density(request):
    geofile = 'geometry.xml'
    trafile = 'trajectory.txt'
    IFDfile = 'IFD.dat'

    if not os.path.exists("profile_density.png"):
        plot_profiles.plot_profiles(geofile, trafile, IFDfile)

    with open("profile_density.png", "rb") as img_f:
        return web.Response(text=base64.b64encode(img_f.read()).decode('utf-8'))


async def get_profile_velocity(request):
    geofile = 'geometry.xml'
    trafile = 'trajectory.txt'
    IFDfile = 'IFD.dat'

    if not os.path.exists("profile_velocity.png"):
        plot_profiles.plot_profiles(geofile, trafile, IFDfile)

    with open("profile_velocity.png", "rb") as img_f:
        return web.Response(text=base64.b64encode(img_f.read()).decode('utf-8'))


async def get_density_frame(request):
    rho_v_file = 'rho_v.dat'

    if not os.path.exists("density_frame.png"):
        plot_FD.plot_density_frame(rho_v_file)

    with open("density_frame.png", "rb") as img_f:
        return web.Response(text=base64.b64encode(img_f.read()).decode('utf-8'))


async def get_velocity_frame(request):
    rho_v_file = 'rho_v.dat'

    if not os.path.exists("velocity_frame.png"):
        plot_FD.plot_velocity_frame(rho_v_file)

    with open("velocity_frame.png", "rb") as img_f:
        return web.Response(text=base64.b64encode(img_f.read()).decode('utf-8'))


async def get_density_velocity(request):
    rho_v_file = 'rho_v.dat'

    if not os.path.exists("density_velocity.png"):
        plot_FD.plot_density_velocity(rho_v_file)

    with open("density_velocity.png", "rb") as img_f:
        return web.Response(text=base64.b64encode(img_f.read()).decode('utf-8'))


async def get_density_J(request):
    rho_v_file = 'rho_v.dat'

    if not os.path.exists("density_J.png"):
        plot_FD.plot_density_J(rho_v_file)

    with open("density_J.png", "rb") as img_f:
        return web.Response(text=base64.b64encode(img_f.read()).decode('utf-8'))


async def get_geometry(request):
    geo_file = 'geometry.xml'
    return web.Response(text=json.dumps(parse_geometry_file(geo_file), ensure_ascii=False))


async def get_trajectory(request):
    tra_file = 'trajectory.txt'
    return web.Response(text=json.dumps(parse_trajectory_file(tra_file), ensure_ascii=False))


# Upload request handler
async def post_file(request):
    try:
        reader = await request.multipart()
        file = await reader.next()
        filename = file.filename if file.filename else 'undefined'

        print('here: ', filename, os.getcwd())

        size = 0
        with open(filename, 'wb') as f:
            while True:
                chunk = await file.read_chunk()
                if not chunk:
                    break
                size += len(chunk)
                f.write(chunk)

            f.close()

            # Identify the file format
            # Rename according to the file format
            namestrings = filename.split("_")

            if filename.endswith('.xml'):
                tree = ET.parse(filename)
                root = tree.getroot()

                if root.tag == 'geometry':  # geometry file
                    os.rename(filename, 'geometry.xml')
                    text = {'res': '200'}
                elif root.tag == 'JPSreport':  # JPSreport ini file
                    os.rename(filename, 'JPSreport_ini.xml')
                    text = {'res': '200'}

                else:
                    os.remove(filename)
                    text = {'res': '500'}
            elif filename.endswith('.txt'):  # Trajectory file
                with open(filename, 'r') as f:
                    firstline = f.readline()
                    if firstline.startswith('#description'):
                        os.rename(filename, 'trajectory.txt')
                    elif firstline.startswith('#Simulation'):
                        os.rename(filename, 'flow_{id}.txt'.format(id=namestrings[3]))

                text = {'res': '200'}
            elif filename.endswith('.dat'):  # outputs file
                if namestrings[0] == 'rho':
                    if namestrings[1] == 'v':
                        os.rename(filename, 'rho_v.dat')
                elif namestrings[1] == 'NT':
                    os.rename(filename, 'N_t.dat')
                elif namestrings[0] == 'IFD':
                    os.rename(filename, 'IFD.dat')

                text = {'res': '200'}
            else:
                text = {'res': '500'}

            return web.Response(text=json.dumps(text, ensure_ascii=False))  # Response to Dragger component

    except Exception as e:
        print(e)
        return web.Response(text="500")  # Response to Dragger component


def setup_server():
    app = web.Application()
    # aiohttp_debugtoolbar.setup(app)

    # Add CORS implementation for /upload
    # `aiohttp_cors.setup` returns `aiohttp_cors.CorsConfig` instance.
    # The `cors` instance will store CORS configuration for the application.
    cors = aiohttp_cors.setup(app, defaults={
        "*": aiohttp_cors.ResourceOptions(
            allow_credentials=True,
            expose_headers="*",
            allow_headers="*",
            allow_methods="*",
            max_age=3600,
        )
    })
    resource = cors.add(app.router.add_resource("/upload"))
    cors.add(resource.add_route("POST", post_file))

    # Routers
    app.router.add_get("/", index)
    app.router.add_get("/ViewPage", index)
    app.router.add_get("/geometry", get_geometry)
    app.router.add_get("/trajectory", get_trajectory)
    app.router.add_get("/N_t", get_Nt)
    app.router.add_get("/Profiles_Density", get_profile_density)
    app.router.add_get("/Profiles_Velocity", get_profile_velocity)
    app.router.add_get("/Density_Time", get_density_frame)
    app.router.add_get("/Velocity_Time", get_velocity_frame)
    app.router.add_get("/Density_Velocity", get_density_velocity)
    app.router.add_get("/Density_Flow", get_density_J)
    app.router.add_static('/', path=str(PROJ_ROOT / 'static'))

    return app


# Set-up web app
async def init():
    app = setup_server()
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, '0.0.0.0', 8080)

    print('------- Http server started at localhost:8080 --------')

    await site.start()

    return app


if __name__ == '__main__':
    # logging.basicConfig(level=logging.DEBUG)
    loop = asyncio.get_event_loop()
    loop.run_until_complete(init())

    try:
        loop.run_forever()
    except KeyboardInterrupt:
        pass
