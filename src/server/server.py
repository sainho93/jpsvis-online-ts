from aiohttp import web
import aiohttp_cors
import os
import json
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

        text = {'res': '200'}
        return web.Response(text=json.dumps(text, ensure_ascii=False)) # Response to Dragger component
    except Exception as e:
        print(e)
        return web.Response(text="500") # Response to Dragger component



# Set-up web app
async def init():
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
            # allow_methods="*",
        )
    })
    resource = cors.add(app.router.add_resource("/upload/"))
    cors.add(resource.add_route("POST", post_file)) # Add handler for POST request on ./upload

    # Routers
    app.router.add_get("/", index)
    app.router.add_static('/', path=str(PROJ_ROOT / 'static'))
    #TODO: Fix CSS file error

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
    loop.run_forever()
    #TODO: Fix run_forever error