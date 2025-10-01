# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import time
import random

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

@app.post("/api/v1/simulate/placeholder")
def simulate_placeholder():
    """
    This is a placeholder endpoint.
    It mimics the final JSON schema without running a real simulation.
    """
    # Simulate a delay as if a real simulation were running
    time.sleep(0.5)

    # Generate fake data that looks real
    num_points = 100
    times = [i * 0.02 for i in range(num_points)]
    
    # Generate a plausible curve for angles and moments
    def generate_curve(max_val, phase_shift):
        return [max_val * (0.5 * (1 - random.uniform(0.9, 1.1) *_cos(2 * 3.14159 * (t - phase_shift) / (times[-1] * 2)))) for t in times]

    # Helper for cosine, as math.cos is not available by default
    def _cos(angle):
        # Simple approximation for this placeholder
        angle = angle % (2 * 3.14159)
        if angle > 3.14159:
            angle -= 2 * 3.14159
        return 1 - (angle**2)/2 + (angle**4)/24


    return {
        "meta": {
            "lift": "squat",
            "variant": "highbar",
            "load_pct_1rm": 80,
            "fps": 50,
            "subject": "placeholder_m_75kg",
            "source": "placeholder_v1",
            "version": "0.1.0"
        },
        "events": [
            {"name": "descent", "t0": 0.1, "t1": 1.0},
            {"name": "bottom", "t": 1.0},
            {"name": "sticking", "t": 1.2},
            {"name": "lockout", "t": 2.0}
        ],
        "series": {
            "time": times,
            "hip_angle": generate_curve(120, 1.0),
            "knee_angle": generate_curve(110, 1.0),
            "hip_moment": generate_curve(350, 1.0),
            "knee_moment": generate_curve(250, 1.0),
            "grf_v": [1200 + 200 * _cos(3.14159 * t) + random.uniform(-20, 20) for t in times],
            "quad_activation": generate_curve(0.8, 1.0),
            "glute_activation": generate_curve(0.7, 1.0),
            "spine_comp": [2500 + 500 * _cos(3.14159 * t) + random.uniform(-50, 50) for t in times]
        }
    }