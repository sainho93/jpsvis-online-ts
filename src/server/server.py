from aiohttp import web
import os
import asyncio
import logging
import pathlib
import aiohttp_debugtoolbar
from aiohttp_debugtoolbar import toolbar_middleware_factory

# Base directory
PROJ_ROOT = pathlib.Path(__file__).parent.parent.parent
NO_CACHE_HEADER = {'cache-control': 'no-cache'}


async def index(request):
    # Avoid web.FileResponse here because we want to disable caching.
    html = open(str(PROJ_ROOT / 'static' / 'index.html')).read()
    return web.Response(text=html, content_type='text/html', headers=NO_CACHE_HEADER)


# Set-up web app
async def init():
    app = web.Application()
    aiohttp_debugtoolbar.setup(app)

    app.router.add_get("/", index)
    app.router.add_static('/', path=str(PROJ_ROOT / 'static'))

    return app


# Set-up event loop
def main():
    logging.basicConfig(level=logging.DEBUG)

    loop = asyncio.get_event_loop()
    app = loop.run_until_complete(init())

    web.run_app(app)

    loop.run_forever()


if __name__ == '__main__':
    main()
