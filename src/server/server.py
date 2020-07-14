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


from aiohttp import web
import aiohttp_cors
import os
import json
import asyncio
import logging
import pathlib
import aiohttp_debugtoolbar
from xml.etree import ElementTree as ET
import functools
import xmltodict
from aiohttp_debugtoolbar import toolbar_middleware_factory

# Base directory
PROJ_ROOT = pathlib.Path(__file__).parent.parent.parent
NO_CACHE_HEADER = {'cache-control': 'no-cache'}


def parse_xml_file(filepath):
    if filepath:
        with open(filepath, encoding='utf-8') as f:
            return xmltodict.parse(f.read(), attr_prefix='')
    else:
        return None


async def get_geometry(request):
    geo_file = 'geometry.xml'
    return web.Response(text=json.dumps(parse_xml_file(geo_file), ensure_ascii=False))


async def get_trajectory(request):
    tra_file = 'trajectory.xml'
    return web.Response(text=json.dumps(parse_xml_file(tra_file), ensure_ascii=False))


async def index(request):
    # Avoid web.FileResponse here because we want to disable caching.
    html = open(str(PROJ_ROOT / 'static' / 'index.html')).read()
    return web.Response(text=html, content_type='text/html', headers=NO_CACHE_HEADER)


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
                if root.tag == 'geometry':
                    os.rename(filename, 'geometry.xml')
                    text = {'res': '200'}

                else:
                    os.remove(filename)
                    text = {'res': '500'}
            elif filename.endswith('.txt'):
                os.rename(filename, 'trajectory.txt')
                text = {'res': '200'}
            else:
                text = {'res': '500'}

            return web.Response(text=json.dumps(text, ensure_ascii=False))  # Response to Dragger component

    except Exception as e:
        print(e)
        return web.Response(text="500")  # Response to Dragger component


def setup_server():
    app = web.Application()
    aiohttp_debugtoolbar.setup(app)

    # CORS Implementation
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
    resource = cors.add(app.router.add_resource("/upload/"))
    cors.add(resource.add_route("POST", post_file))  # Add handler for POST request on ./upload

    # Routers
    app.router.add_get("/", index)
    app.router.add_get("/ViewPage", index)
    app.router.add_get("/geometry", get_geometry)
    app.router.add_get("/trajectory", get_trajectory)
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
    logging.basicConfig(level=logging.DEBUG)
    loop = asyncio.get_event_loop()
    loop.run_until_complete(init())

    try:
        loop.run_forever()
    except KeyboardInterrupt:
        pass
