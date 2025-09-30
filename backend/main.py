# main.py
from fastapi import FastAPI

app = FastAPI()

@app.get("/api/v1/hello")
def read_root():
    return {"message": "Hello from the Python Backend!"}
