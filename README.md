# Project Light-Weight

> "Discipline is the bridge between ambition and victory, comrade."

## The Spark

The idea for **Project Light-Weight** lit up while watching iron legends trade shouts with gravity. Between the power of Ronnie Coleman and the precision of Pavel Tsatsouline, it became clear that lifters deserve data that matches their grit. Rather than chasing flashy stick-figure animations, this mission focuses on measurable insight—charts, signals, and biomechanical feedback that help every comrade lift smarter and stay resilient.

## The Vision

The application aims to deliver web-based, data-driven analysis for the competition lifts. Users define their key parameters, and the system responds with science-backed feedback that improves performance and reduces risk. For now, the focus is on a polished interface and a mocked backend, but the long march leads toward a full production stack.

## Development Roadmap

The roadmap is organized into four stages so each comrade knows exactly where the campaign stands.

### Stage 0: UI Prototype & Backend Mock (Current)

- **Objective:** Deliver a high-fidelity interface and a placeholder backend for rapid iteration.
- **Frontend:** Chart-first React experience with a System 7 inspired aesthetic.
- **Backend:** Mocked endpoint at `/api/v1/simulate/placeholder` returning hardcoded JSON that matches the production contract.

### Stage 1: Synchronous Localhost (Technical Prototype)

- **Objective:** Validate core simulation logic end-to-end on a single machine.
- **Architecture:** React frontend talking to a FastAPI service powered by OpenSim.

### Stage 2: Asynchronous Localhost (MVP)

- **Objective:** Keep the interface responsive while long-running simulations execute.
- **Architecture:** Introduce Celery and Redis so the API can offload heavy work.

### Stage 3: Full Cloud Deployment (Production)

- **Objective:** Bring the stack to the cloud for reliable, public access.
- **Architecture:** Managed services and automation that scale with the squad.

## System Architecture

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

## Technology Stack

- **Frontend:** React, Tailwind CSS, Chart.js
- **Backend API:** Python, FastAPI, Pydantic
- **Simulation Engine:** OpenSim Python API
- **Asynchronous Tasks:** Celery
- **Message Broker & Cache:** Redis
- **Database:** SQLite for local work, PostgreSQL in production
- **DevOps:** Docker, Docker Compose, GitHub Actions

## Working with external data

The project now bundles a small CLI helper to explore the Certificate of Entitlement (COE) dataset hosted on [data.gov.sg](https://data.gov.sg). This is useful during development to verify that upstream data is reachable from your environment.

- `npm run fetch:coe` &mdash; fetches a small sample of rows.
- `npm start -- --fetch-coe` &mdash; tests the API and then (optionally) continue with any additional flags. Combine with:
  - `--limit <n>` / `--offset <n>` &mdash; pagination controls.
  - `--month <YYYY-MM>` &mdash; filter for a specific bidding month.
  - `--category <A|B|C|D|E>` &mdash; focus on a COE category.
  - `--dev` &mdash; start the Vite dev server after the fetch completes.

You can also expose more verbose logging by setting `DEBUG_DATAGOV=1` before running the command.

## A Note on the Journey

This effort is about forging strength together. Every iteration sharpens the tools, every chart tells a story, and every comrade benefits from the shared discipline. The evolving narrative lives in `diary.md`, where decisions, pivots, and reflections are recorded for any teammate or model to study. Light weight, comrade!
