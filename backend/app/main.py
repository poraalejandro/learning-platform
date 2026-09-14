from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.settings import settings
from app.tutor import router as tutor_router

app = FastAPI(title="learning-platform API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tutor_router)


@app.get("/")
def root():
    return {"status": "ok", "service": "learning-platform-backend"}


@app.get("/health")
def health():
    return {"status": "healthy"}
