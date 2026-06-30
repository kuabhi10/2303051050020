# Notification System Design & Priority Implementation

This repository contains a comprehensive System Design document and an algorithmic implementation for a scalable Notification System.

## Repository Structure

```
├── notification_system_design.md   # Complete system design covering APIs, WebSockets, DB, Queues, and Scalability.
├── priority_notifications.js       # Node.js implementation of the Top 10 priority logic using a Min-Heap (O(N log 10)).
├── package.json                    # Project configuration.
└── README.md                       # This file.
```

## Running the Code

The implementation simulates an API call fetching unread notifications and calculates the Top 10 most relevant ones based on their weight and recency using a highly optimized O(N log 10) Min-Heap algorithm.

### Commands to run:

1. **Install dependencies** (Though no external dependencies are needed for this core algorithmic file, you can run install just in case):
   ```bash
   npm install
   ```

2. **Execute the script**:
   ```bash
   npm start
   ```

## Screenshots & Outputs

When you run the script, capture the following for your documentation/evaluation:
1. **Console output:** Shows the structured logs (info/error).
2. **Top 10 notification list:** Shows the table printed out by `console.table()`.
3. **Priority scores:** Inside the table, you will see exactly how `Weight` and `Recency` formulated the `Score`.

The output clearly demonstrates how an O(N log 10) approach elegantly avoids sorting the entire dataset, maximizing CPU utilization on the Node.js event loop.
