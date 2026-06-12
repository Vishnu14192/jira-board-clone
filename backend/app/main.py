from fastapi import FastAPI
from app.routers.users import router as users_router
from app.routers.tasks import (router as tasks_router,)

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Jira Board API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users_router)

app.include_router(tasks_router)

@app.get("/")
async def root():
    return {
        "message": "Jira Board API Running"
    }




