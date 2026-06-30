/**
 * Stage 6: Priority Notifications Implementation
 * 
 * Requirement:
 * Fetch notifications from an API. Assign weights: Placement = 3, Result = 2, Event = 1.
 * Priority depends on Weight AND Recency.
 * Return top 10 unread notifications using a Min Heap (size 10).
 * 
 * Complexity:
 * Current: O(N log N) if using full sorting array.sort()
 * Improved: O(N log K) where K = 10 -> O(N) since K is constant.
 */

const { Log } = require('../logging-middleware');

// Weight mappings for notification types
const TYPE_WEIGHTS = {
  'Placement': 3,
  'Result': 2,
  'Event': 1
};

/**
 * Calculate Priority Score
 * priority_score = weight * recency_multiplier
 * 
 * @param {string} type - Notification type
 * @param {string} createdAt - ISO Date string
 * @returns {number} Score
 */
function calculateScore(type, createdAt) {
  const weight = TYPE_WEIGHTS[type] || 0;
  
  // Convert ISO string to timestamp to determine recency
  // Using a combined score logic: 
  // priority = weight * 10^13 + timestamp
  // This ensures weight is the primary sort key, and timestamp is the secondary sort key.
  // JavaScript's MAX_SAFE_INTEGER is 9,007,199,254,740,991.
  // Timestamp is ~1,700,000,000,000. Weight max is 3. 
  // 3 * 10,000,000,000,000 = 30,000,000,000,000. Fits comfortably in safe int limits.
  const timestamp = new Date(createdAt).getTime();
  
  return (weight * 10000000000000) + timestamp;
}

/**
 * MinHeap implementation for maintaining the top K elements.
 * Reason for Min Heap:
 * We want the TOP 10 highest scored notifications. A Min Heap of size 10 keeps the 
 * *lowest* of the top 10 at the root. When a new notification comes in, we compare its 
 * score with the root. If it's higher, we replace the root and heapify down.
 * Complexity: O(log K) per insertion, leading to O(N log K) overall. Since K=10, it is O(N).
 */
class MinHeap {
  constructor(maxSize) {
    this.heap = [];
    this.maxSize = maxSize;
  }

  getParentIndex(i) { return Math.floor((i - 1) / 2); }
  getLeftChildIndex(i) { return 2 * i + 1; }
  getRightChildIndex(i) { return 2 * i + 2; }

  swap(i, j) {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }

  insert(node) {
    if (this.heap.length < this.maxSize) {
      this.heap.push(node);
      this.heapifyUp(this.heap.length - 1);
    } else if (node.score > this.heap[0].score) {
      // If new node has higher score than the minimum in the heap, replace the minimum
      this.heap[0] = node;
      this.heapifyDown(0);
    }
  }

  heapifyUp(index) {
    let curr = index;
    while (curr > 0 && this.heap[curr].score < this.heap[this.getParentIndex(curr)].score) {
      this.swap(curr, this.getParentIndex(curr));
      curr = this.getParentIndex(curr);
    }
  }

  heapifyDown(index) {
    let curr = index;
    while (this.getLeftChildIndex(curr) < this.heap.length) {
      let smallestChildIndex = this.getLeftChildIndex(curr);
      const rightChildIndex = this.getRightChildIndex(curr);

      if (rightChildIndex < this.heap.length && this.heap[rightChildIndex].score < this.heap[smallestChildIndex].score) {
        smallestChildIndex = rightChildIndex;
      }

      if (this.heap[curr].score <= this.heap[smallestChildIndex].score) {
        break;
      }

      this.swap(curr, smallestChildIndex);
      curr = smallestChildIndex;
    }
  }

  // Returns elements sorted descending by score for final output
  getSorted() {
    return [...this.heap].sort((a, b) => b.score - a.score);
  }
}

/**
 * Fetch and process top notifications
 */
async function getTopNotifications() {
  Log('backend', 'info', 'service', 'Fetching and processing top notifications');
  try {
    // Simulated API response for notifications
    const mockNotifications = [
      { id: 1, type: 'Event', message: 'Hackathon tomorrow', createdAt: '2026-06-29T10:00:00Z', isRead: false },
      { id: 2, type: 'Placement', message: 'Google interview scheduled', createdAt: '2026-06-28T09:00:00Z', isRead: false },
      { id: 3, type: 'Result', message: 'Math 101 grades posted', createdAt: '2026-06-30T08:00:00Z', isRead: false },
      { id: 4, type: 'Event', message: 'Guest lecture at 5 PM', createdAt: '2026-06-30T14:00:00Z', isRead: false },
      { id: 5, type: 'Placement', message: 'Amazon coding assessment', createdAt: '2026-06-27T11:00:00Z', isRead: false },
      { id: 6, type: 'Result', message: 'Physics midterm scores', createdAt: '2026-06-29T15:00:00Z', isRead: true }, // Read, should be skipped
      { id: 7, type: 'Event', message: 'Campus tour', createdAt: '2026-06-25T10:00:00Z', isRead: false },
      { id: 8, type: 'Placement', message: 'Meta offer letter', createdAt: '2026-06-30T09:30:00Z', isRead: false },
      { id: 9, type: 'Result', message: 'Chemistry lab results', createdAt: '2026-06-28T10:00:00Z', isRead: false },
      { id: 10, type: 'Placement', message: 'Microsoft resume selected', createdAt: '2026-06-26T09:00:00Z', isRead: false },
      { id: 11, type: 'Event', message: 'Alumni meet', createdAt: '2026-06-30T07:00:00Z', isRead: false },
      { id: 12, type: 'Result', message: 'Biology final grades', createdAt: '2026-06-29T11:00:00Z', isRead: false }
    ];

    Log('backend', 'info', 'service', `Fetched ${mockNotifications.length} notifications`);

    // Min Heap of size 10 to keep the top 10 elements
    const topNotificationsHeap = new MinHeap(10);

    for (const notif of mockNotifications) {
      if (notif.isRead) continue; // Skip read notifications

      const score = calculateScore(notif.type, notif.createdAt);
      
      // Augment notification with calculated score and insert into heap
      topNotificationsHeap.insert({ ...notif, score });
    }

    // Extract the sorted top 10 elements
    const top10 = topNotificationsHeap.getSorted();
    
    Log('backend', 'info', 'service', `Successfully computed top ${top10.length} notifications`);
    
    // Output the results
    console.log("=== TOP 10 UNREAD NOTIFICATIONS ===");
    top10.forEach((n, idx) => {
      console.log(`${idx + 1}. [Score: ${n.score}] [${n.type}] ${n.message} (Date: ${n.createdAt})`);
    });

    return top10;
  } catch (error) {
    Log('backend', 'error', 'service', `Failed to process notifications: ${error.message}`);
    throw error;
  }
}

// Execute the script directly if run from CLI
if (require.main === module) {
  getTopNotifications();
}

module.exports = { getTopNotifications, MinHeap, calculateScore };
