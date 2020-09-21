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
sys.path.append("..")
from analysis import _Plot_N_t
from analysis import SteadyState

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
                        if id < len(trajectory['pedestrians'])+1:
                            trajectory['pedestrians'][id-1].append(parse_pedestrian(line))
                        else:
                            trajectory['pedestrians'].append([parse_pedestrian(line)])

        return trajectory

    else:
        return None


def parse_pedestrian(dataline):

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
    }

    return location


async def index(request):
    # Avoid web.FileResponse here because we want to disable caching.
    html = open(str(PROJ_ROOT / 'static' / 'index.html')).read()
    return web.Response(text=html, content_type='text/html', headers=NO_CACHE_HEADER)


async def get_RhoV_classic(request):
    SteadyState.get_steady_files("rho_v_Classic.dat")


# Handler for request "/N_t"
async def get_Nt(request):
    nt_file = 'N_t.dat'
    _Plot_N_t.plot_Nt(nt_file)

    with open("N_t.png", "rb") as img_f:
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
            if filename.endswith('.xml'):
                tree = ET.parse(filename)
                root = tree.getroot()
                if root.tag == 'geometry':  # geometry file
                    os.rename(filename, 'geometry.xml')
                    text = {'res': '200'}

                else:
                    os.remove(filename)
                    text = {'res': '500'}
            elif filename.endswith('.txt'):  # Trajectory file
                os.rename(filename, 'trajectory.txt')

                text = {'res': '200'}
            elif filename.endswith('.dat'):  # outputs file
                namestrings = filename.split("_")

                if namestrings[0] == 'rho':
                    if namestrings[2] == 'Classic':
                        os.rename(filename, 'rho_v_Classic.dat')
                    elif namestrings[2] == "Voronoi":
                        os.rename(filename, 'rho_v_Voronoi.dat')
                elif namestrings[1] == 'NT':
                    os.rename(filename, 'N_t.dat')

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
    app.router.add_get("/Density_Velocity_Classic", get_RhoV_classic)
    app.router.add_get("/N_t", get_Nt)
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
