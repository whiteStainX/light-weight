# Project Light-Weight

> "I believe that if you're a good programmer, you can write code in any language. But if you're a great programmer, you'll know when not to."

## The Spark

This project started from a simple observation: there are a lot of strong people in the gym, but not all of them are lifting with technique that's both effective and safe. Inspired by the raw power of legends like Ronnie Coleman and the scientific principles of Pavel Tsatsouline, I wanted to build a tool that could offer clear, data-driven feedback on weightlifting form.

The initial idea was to create a simple stick-figure animation. However, it quickly became apparent that accurately modeling biomechanics is a complex challenge. The existing tools and libraries for this are powerful but have a steep learning curve. This led to a pivot: instead of getting bogged down in complex animations, the project will focus on what matters most to a serious lifter—data.

This project is now about building a web-based application that provides scientific feedback on powerlifting technique through clear, easy-to-understand charts and data visualizations.

## The Vision

**Project Light-Weight** aims to be a web-based, data-driven tool for powerlifting analysis. It will allow users to define and adjust lifting parameters to receive an accurate biomechanical analysis, helping them optimize performance and reduce injury risk. The project is currently in its early stages, focusing on building a solid foundation for the user interface and a mocked backend.

## Development Roadmap

The project is being developed in stages, starting with a UI-focused prototype and gradually building towards a full-fledged cloud application.

### Stage 0: UI Prototype & Backend Mock (Current Stage)

-   **Objective:** Build a high-fidelity UI and a placeholder backend to rapidly iterate on the user experience.
-   **Frontend:** A chart-centric UI with a "System 7" aesthetic.
-   **Backend:** A placeholder API (`/api/v1/simulate/placeholder`) that returns hardcoded, correctly formatted JSON data.

### Stage 1: Synchronous Localhost (The Technical Prototype)

-   **Objective:** Validate the core simulation logic with a working end-to-end proof of concept.
-   **Architecture:** React Frontend <--> FastAPI Server (with OpenSim).

### Stage 2: Asynchronous Localhost (The MVP)

-   **Objective:** Refactor the prototype into a robust, non-blocking application.
-   **Architecture:** Introduce Celery and Redis for asynchronous task handling.

### Stage 3: Full-Fledged Cloud Deployment (Production)

-   **Objective:** Deploy the application to the cloud for public access.
-   **Architecture:** A fully managed, scalable cloud infrastructure.

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

-   **Frontend:** React, Tailwind CSS, Chart.js
-   **Backend API:** Python, FastAPI, Pydantic
-   **Simulation Engine:** OpenSim Python API
-   **Asynchronous Tasks:** Celery
-   **Message Broker & Cache:** Redis
-   **Database:** SQLite (local), PostgreSQL (production)
-   **DevOps:** Docker, Docker Compose, GitHub Actions

## A Note on the Journey

This project is as much about the process as it is about the final product. It's an exploration of how to build a complex application from the ground up, learning and adapting along the way. The journey is documented in the `diary.md` file, which offers a more personal, human-oriented perspective on the project's development.