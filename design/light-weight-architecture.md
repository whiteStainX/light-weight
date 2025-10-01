# Light-Weight Project — Backend & Frontend Architecture with OpenSim

This document refines the project plan by incorporating **OpenSim backend usage**.  
It provides a comprehensive overview of the architecture, practical implementation details, and design considerations.

---

## 1. High-Level Architecture

```
          +--------------------+
          |   React Frontend   |
          | (System 7 UI,      |
          |  Charts, Insights) |
          +---------+----------+
                    |
                    v
          +--------------------+
          |  FastAPI Backend   |
          |   (REST API)       |
          +---------+----------+
                    |
             Async job queue
          +--------------------+
          |   Celery Workers   |
          | (Python + OpenSim) |
          +---------+----------+
                    |
                    v
          +--------------------+
          |  OpenSim Engine    |
          | (Python API,       |
          |  .osim models)     |
          +--------------------+
```

- **Frontend (React):** Charts and insights, vintage System 7 style.  
- **Backend (FastAPI):** Provides REST endpoints for triggering analysis.  
- **Workers (Celery):** Execute heavy OpenSim jobs asynchronously.  
- **OpenSim Core:** Runs via Python API (installed with Conda).

---

## 2. Backend Job Flow

```
[Frontend Request]
      |
      v
[FastAPI Endpoint] --> [Celery Queue] --> [Worker executes OpenSim job]
      |                                            |
      |                                            v
      |                                [Generate .sto/.mot files]
      |                                            |
      |                                            v
      |                                [Convert to JSON schema]
      |                                            |
      +--------------------------------------------+
                      [Frontend fetches JSON + renders charts]
```

---

## 3. Folder Structure

```
light-weight/
├─ backend/
│  ├─ app.py              # FastAPI entry
│  ├─ worker.py           # Celery tasks
│  ├─ opensim_runner.py   # Wrapper around OpenSim API
│  ├─ converters.py       # .sto/.mot → JSON schema
│  └─ requirements.txt
│
├─ sim/
│  ├─ models/
│  │  ├─ squat_highflex.osim
│  │  ├─ deadlift_spine.osim
│  │  └─ bench_shoulder.osim
│  ├─ config/
│  │  ├─ external_loads.xml
│  │  └─ so_settings.xml
│  └─ work/               # Outputs (sto/mot)
│
├─ frontend/
│  └─ (React app with charts + System 7 UI)
└─ docs/
   └─ architecture.md
```

---

## 4. JSON Schema (Frontend Contract)

```json
{
  "meta": {
    "lift": "squat",
    "variant": "highbar",
    "load_pct_1rm": 80,
    "fps": 100,
    "subject": "generic_m_75kg",
    "source": "opensim",
    "version": "1.0.0"
  },
  "events": [
    {"name":"descent","t0":0.12,"t1":0.48},
    {"name":"bottom","t":0.48},
    {"name":"sticking","t":0.63},
    {"name":"lockout","t":0.98}
  ],
  "series": {
    "time": [0.00, 0.01, ...],
    "hip_angle": [...],
    "knee_angle": [...],
    "hip_moment": [...],
    "knee_moment": [...],
    "grf_v": [...],
    "quad_activation": [...],
    "glute_activation": [...],
    "spine_comp": [...]
  }
}
```

---

## 5. Example Worker Code

```python
import opensim as osim
import pandas as pd

def run_lift_analysis(model_path, coords_mot, external_loads_xml):
    # Load model
    model = osim.Model(model_path)

    # Inverse Dynamics
    idtool = osim.InverseDynamicsTool()
    idtool.setModel(model)
    idtool.setCoordinatesFileName(coords_mot)
    idtool.setExternalLoadsFileName(external_loads_xml)
    idtool.setOutputGenForceFileName("work/id.sto")
    idtool.run()

    # Static Optimization
    so = osim.StaticOptimization()
    so.setModel(model)
    so.setCoordinatesFileName(coords_mot)
    so.printToXML("work/so_settings.xml")
    so.run()

    # Convert .sto to DataFrame
    table = osim.TimeSeriesTable("work/id.sto")
    cols = list(table.getColumnLabels())
    times = list(table.getIndependentColumn())
    data = pd.DataFrame(list(table.getMatrix()), columns=cols)
    data.insert(0, "time", times)

    # Return JSON-ready dict
    return {
        "meta": {"lift":"squat","variant":"highbar","load_pct_1rm":80,"fps":100},
        "series": {
            "time": times,
            "hip_moment": data["hip_flexion_r"].tolist(),
            "knee_moment": data["knee_angle_r"].tolist()
        }
    }
```

---

## 6. FastAPI + Celery

**app.py**
```python
from fastapi import FastAPI
from worker import analyze_lift

app = FastAPI()

@app.post("/analyze")
def analyze(lift: str, variant: str, load: int):
    task = analyze_lift.delay(lift, variant, load)
    return {"task_id": task.id}
```

**worker.py**
```python
from celery import Celery
from opensim_runner import run_lift_analysis

celery = Celery("tasks", broker="redis://localhost:6379/0")

@celery.task
def analyze_lift(lift, variant, load):
    model = f"sim/models/{lift}_{variant}.osim"
    coords = f"sim/input/{lift}_{variant}.mot"
    ext = "sim/config/external_loads.xml"
    return run_lift_analysis(model, coords, ext)
```

---

## 7. Frontend

- Fetch from `/results/{task_id}` → returns JSON.  
- Render with Highcharts/ECharts.  
- Insights panel consumes JSON → outputs coach cues.  

```
[React Charts] <-- JSON (angles, moments, forces) -- [FastAPI results endpoint]
```

---

## 8. Design Considerations

- **OpenSim install:** via Conda (`conda install -c opensim-org opensim`).  
- **Models:** shipped as `.osim` files in `/sim/models`.  
- **Partial usage:** keep core intact, just call ID/SO/JRA as needed.  
- **Performance:** Downsample outputs (≤200 points per rep).  
- **Extensibility:** Add new `.osim` models or scenarios without touching frontend.  

---

## 9. Next Steps

1. Containerize backend with OpenSim + FastAPI + Celery.  
2. Implement JSON schema converter.  
3. Test sample models (squat, deadlift, bench).  
4. Hook into React charts and insights.  

---

**End of Documentation**
