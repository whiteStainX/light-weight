# Project Blueprint: Light-Weight

**Version:** 2.0
**Status:** In Progress

---

## 1. Vision

To create a web-based application that provides data-driven, scientific feedback on powerlifting technique. Users can define or adjust lifting parameters and receive an accurate biomechanical analysis, helping them optimize performance and reduce injury risk.

---

## 2. Development Roadmap

This project will be developed in four stages, building from a UI-focused prototype to a full-fledged cloud application. This approach allows for parallel exploration of the frontend design and the backend's technical capabilities (OpenSim).

### Stage 0: UI Prototype & Backend Mock (Current Stage)

**Objective:** Build a high-fidelity UI and a placeholder backend to rapidly iterate on the user experience without being blocked by complex simulation logic.

-   **Strategy:** Work from both ends towards the middle. Design the ideal UI while simultaneously researching OpenSim's capabilities.
-   **Backend:** Create a placeholder API endpoint (`/api/v1/simulate/placeholder`) that returns hardcoded, but correctly formatted, JSON data mimicking the final schema.
-   **Frontend:** Redesign the UI to be chart-centric. Replace the animation canvas with components that fetch and visualize the placeholder data. Refine the System 7 aesthetic.
-   **Success Criterion:** The frontend is fully functional and visually polished, powered by a fake backend. This allows for user testing and design refinement early in the process.

### Stage 1: Synchronous Localhost (The Technical Prototype)

**Objective:** Build a working, end-to-end proof of concept on a single machine to validate the core simulation logic.

-   **Architecture:** React Frontend <--> FastAPI Server (with OpenSim).
-   **Key Tasks:**
    1.  Integrate OpenSim into the backend.
    2.  Replace the placeholder API with a real endpoint that runs a synchronous OpenSim analysis.
    3.  Connect the existing frontend to this real endpoint, handling the loading state.
-   **Success Criterion:** A user can trigger a real simulation from the browser and see the resulting data in a chart.

### Stage 2: Asynchronous Localhost (The MVP)

**Objective:** Refactor the prototype into a robust, non-blocking application that can handle long-running tasks gracefully.

-   **Architecture:** Introduce Celery and Redis to decouple the API from the simulation engine.
-   **Key Tasks:**
    1.  Move the OpenSim logic into a Celery task.
    2.  Refactor the API to be asynchronous (submit job -> poll status -> fetch results).
    3.  Update the frontend to follow the async flow.
    4.  Containerize the entire stack with Docker.
-   **Success Criterion:** The web app remains responsive during a simulation. The entire stack can be launched with `docker-compose up`.

### Stage 3: Full-Fledged Cloud Deployment (Production)

**Objective:** Deploy the application to the cloud, making it scalable, reliable, and publicly accessible.

-   **Architecture:** A fully managed, scalable cloud infrastructure (e.g., AWS, GCP).
-   **Key Tasks:**
    1.  Set up a CI/CD pipeline (e.g., GitHub Actions).
    2.  Provision managed cloud services (e.g., RDS for database, ElastiCache for Redis).
    3.  Implement caching, logging, and monitoring.
-   **Success Criterion:** The application is live on a public URL and the development-to-deployment process is fully automated.

---

## 3. System Architecture

### 3.1. High-Level Diagram

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

### 3.2. Backend Job Flow

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

### 3.3. Technology Stack

-   **Frontend:** React, Tailwind CSS, Chart.js
-   **Backend API:** Python, FastAPI, Pydantic
-   **Simulation Engine:** OpenSim Python API
-   **Asynchronous Tasks:** Celery
-   **Message Broker & Cache:** Redis
-   **Database:** SQLite (local), PostgreSQL (production)
-   **DevOps:** Docker, Docker Compose, GitHub Actions

---

## 4. Technical Details

### 4.1. Proposed Folder Structure

```
light-weight/
├─ backend/              # Python backend
├─ frontend/             # React frontend (current root)
├─ sim/                  # Simulation models and assets
│  ├─ models/
│  └─ config/
└─ design/               # Design documents
```

### 4.2. API JSON Schema (The Contract)

This schema defines the structure of the data passed from the backend to the frontend.

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

### 4.3. Example Worker Code (Conceptual)

```python
# This is a conceptual example for Stage 1+
import opensim as osim
import pandas as pd

def run_lift_analysis(model_path, coords_mot, external_loads_xml):
    # Load model and run various OpenSim tools
    model = osim.Model(model_path)
    idtool = osim.InverseDynamicsTool()
    # ... setup and run tools ...

    # Convert output .sto files to a JSON-friendly format
    table = osim.TimeSeriesTable("work/id.sto")
    df = table.getAsPandasDataFrame()

    return df.to_dict(orient='list')
```