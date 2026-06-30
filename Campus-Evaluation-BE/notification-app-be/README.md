# Real-Time Notification System Backend

This repository contains the system architecture documentation and reference implementations for a robust, highly-scalable Real-Time Notification System.

## Repository Structure

```
notification-app-be/
├── README.md                          # This file
├── package.json                       # Node.js project metadata and scripts
├── notification_system_design.md      # Comprehensive Architectural Design Document (Stages 1-5)
└── priority_notifications.js          # Stage 6: Working code for MinHeap based Priority Notifications
```

## Setup & Execution

### Prerequisites
- Node.js (v18+ recommended)

### Commands to Run

1. **Navigate to the directory**:
   ```bash
   cd notification-app-be
   ```

2. **Run the Priority Notifications Script**:
   ```bash
   npm start
   ```
   *(Alternatively, run `node priority_notifications.js` directly)*

### Sample Output Screenshots Description

After running `npm start`, you should capture a screenshot of your terminal console output. The screenshot should clearly display:
1. **The Custom Logging output**: Demonstrating that the system successfully fetches and computes the notifications.
2. **The Top 10 List**: The actual `=== TOP 10 UNREAD NOTIFICATIONS ===` header followed by the 10 prioritized notifications.
3. **Priority Scores**: You will see the internally calculated `[Score: <number>]` for each entry, showing how the combination of Weight (Placement=3, Result=2, Event=1) and Recency directly influences the sort order.
