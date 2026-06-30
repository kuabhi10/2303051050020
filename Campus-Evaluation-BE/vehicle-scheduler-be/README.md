# Vehicle Maintenance Scheduler Microservice

This microservice handles optimal scheduling for vehicle maintenance tasks using a 0/1 Knapsack Dynamic Programming algorithm. It integrates securely with the Evaluation APIs to fetch depot and task data, maximizing operational impact while adhering to capacity limits.

## Installation

1. Navigate to the project directory:
   ```bash
   cd vehicle-scheduler-be
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

## Run Instructions

- **Production:**
  ```bash
  npm start
  ```
- **Development:**
  *(Requires nodemon to be installed globally or locally)*
  ```bash
  npm run dev
  ```

## Environment Variables

Create a `.env` file in the root of the `vehicle-scheduler-be` directory:

```env
PORT=3000
EVALUATION_API_URL=https://api.example.com
EVALUATION_API_KEY=your_dummy_authorization_token
```

## API Endpoint

**GET `/api/schedule/:depotId?availableHours={number}`**

- **`depotId`**: The ID of the depot (path parameter).
- **`availableHours`**: The total capacity of mechanic-hours available (query parameter).

**Response Format:**
```json
{
  "depot": { /* Depot information */ },
  "available_mechanic_hours": 100,
  "selected_maintenance_tasks": [ /* Array of tasks */ ],
  "total_duration": 45,
  "total_operational_impact_score": 250
}
```

## Architecture Notes
- Only uses the provided `Log()` custom middleware.
- Solves task scheduling utilizing Dynamic Programming.
- Uses strict layered architecture: Routes -> Controllers -> Services -> Utils.
- Implements comprehensive edge case handling and validation.
