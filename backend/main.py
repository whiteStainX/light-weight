# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# This is crucial: It allows your React frontend (on a different port)
# to make requests to this backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"]  # Allows all origins for simplicity in development
)

PAVEL_QUOTES = [
  "Strength is a skill. It is not a random act of brutality.",
  "The kettlebell is an ancient Russian weapon against weakness.",
  "Strength has a greater purpose. Serve your family, your country, your God.",
  "Don't train to get smoked; train to feel stronger every day.",
  "A kettlebell is a cannonball with a handle—and a weapon against weakness.",
  "You do not have a weak arm and a strong arm—but a strong and a stronger one.",
  "Strength is not a data point; it's not a number. It's an attitude.",
  "Comrade, breathe deep and crush the handle. The lift rewards tension, timing, and ruthless focus.",
]

PAVEL_ASCII_ART = """
    ,--.----.    
   /  /  \   \   
  /  /    \   \  
 /  /      \   \ 
/  /--------\   \ 
'.___________.' 
"""


@app.get("/api/v1/hello")
def read_root():
    return {"message": "Hello from the Python Backend!"}

@app.get("/api/v1/content/pavel")
def get_pavel_content():
    return {"quotes": PAVEL_QUOTES, "ascii_art": PAVEL_ASCII_ART}
