"""
server/app.py
Smart Traffic Management System - FastAPI Entry Point
"""

import asyncio
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

# Local imports
from routes.traffic_routes import router, broadcast_loop, _ws_handler

# Static build folder
STATIC_DIR = Path(__file__).parent.parent / "static"


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Start background websocket broadcast task
    """
    task = asyncio.create_task(broadcast_loop())

    yield

    task.cancel()

    try:
        await task
    except asyncio.CancelledError:
        pass


# FastAPI App
app = FastAPI(
    title="Smart Traffic Management API",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routes
app.include_router(router)

# WebSocket Route
@app.websocket("/ws/traffic")
async def websocket_endpoint(websocket: WebSocket):
    await _ws_handler(websocket)


# --------------------------------------------------
# Production React Build
# --------------------------------------------------

if STATIC_DIR.exists():

    assets_dir = STATIC_DIR / "assets"

    if assets_dir.exists():
        app.mount(
            "/assets",
            StaticFiles(directory=str(assets_dir)),
            name="assets",
        )

    @app.get("/{full_path:path}", include_in_schema=False)
    async def spa_fallback(full_path: str):
        index_file = STATIC_DIR / "index.html"

        if index_file.exists():
            return FileResponse(str(index_file))

        return {
            "detail": "React build not found. Run: cd client && npm run build"
        }

else:

    @app.get("/", include_in_schema=False)
    async def root():
        return {
            "message": "Smart Traffic API Running",
            "docs": "/docs",
        }


# --------------------------------------------------
# Run Server
# --------------------------------------------------

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=False,
    )

