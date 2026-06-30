/**
 * priority_notifications.js
 * 
 * Implements Stage 6 of the Notification System Design.
 * Demonstrates an O(N log 10) approach to calculating the Top 10 Priority Notifications.
 */

// Simulated Logger Middleware
const logger = {
    info: (msg, meta = {}) => console.log(`[INFO] ${new Date().toISOString()} - ${msg}`, JSON.stringify(meta)),
    error: (msg, meta = {}) => console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, JSON.stringify(meta))
};

// Notification Weights
const WEIGHTS = {
    PLACEMENT: 3,
    RESULT: 2,
    EVENT: 1
};

/**
 * Calculates the score of a notification based on its type and recency.
 * @param {Object} notification - The notification object.
 * @param {number} currentTime - The current timestamp for recency calculation.
 * @returns {number} The calculated priority score.
 */
function calculateScore(notification, currentTime) {
    const weight = WEIGHTS[notification.type] || 0;
    
    // Recency: Give higher score to more recent notifications.
    // Example formula: Weight * 10000 + (1 / age_in_hours)
    // For simplicity in this demo, let's just decay the score based on age.
    const ageInHours = (currentTime - new Date(notification.createdAt).getTime()) / (1000 * 60 * 60);
    
    // Base score from weight. Add a recency bonus (newer = higher bonus).
    // Using a simple decay formula where a 0-hour old item gets +10 score, dropping as it ages.
    const recencyBonus = Math.max(0, 10 - ageInHours); 
    
    return (weight * 10) + recencyBonus;
}

/**
 * MinHeap implementation for maintaining the Top K notifications.
 * By keeping a Min-Heap of size K, we ensure the time complexity is O(N log K).
 * For K=10, this is essentially O(N).
 */
class MinHeap {
    constructor(capacity) {
        this.capacity = capacity;
        this.heap = [];
    }

    // Helper functions for tree traversal
    getLeftChildIndex(parentIndex) { return 2 * parentIndex + 1; }
    getRightChildIndex(parentIndex) { return 2 * parentIndex + 2; }
    getParentIndex(childIndex) { return Math.floor((childIndex - 1) / 2); }

    hasLeftChild(index) { return this.getLeftChildIndex(index) < this.heap.length; }
    hasRightChild(index) { return this.getRightChildIndex(index) < this.heap.length; }
    hasParent(index) { return this.getParentIndex(index) >= 0; }

    leftChild(index) { return this.heap[this.getLeftChildIndex(index)]; }
    rightChild(index) { return this.heap[this.getRightChildIndex(index)]; }
    parent(index) { return this.heap[this.getParentIndex(index)]; }

    swap(indexOne, indexTwo) {
        const temp = this.heap[indexOne];
        this.heap[indexOne] = this.heap[indexTwo];
        this.heap[indexTwo] = temp;
    }

    peek() {
        if (this.heap.length === 0) return null;
        return this.heap[0];
    }

    /**
     * Inserts a new notification into the heap.
     * If the heap exceeds capacity, it extracts the minimum (lowest score).
     * @param {Object} item 
     */
    insert(item) {
        this.heap.push(item);
        this.heapifyUp();
        
        if (this.heap.length > this.capacity) {
            this.extractMin();
        }
    }

    extractMin() {
        if (this.heap.length === 0) return null;
        const item = this.heap[0];
        this.heap[0] = this.heap[this.heap.length - 1];
        this.heap.pop();
        this.heapifyDown();
        return item;
    }

    heapifyUp() {
        let index = this.heap.length - 1;
        while (this.hasParent(index) && this.parent(index).score > this.heap[index].score) {
            this.swap(this.getParentIndex(index), index);
            index = this.getParentIndex(index);
        }
    }

    heapifyDown() {
        let index = 0;
        while (this.hasLeftChild(index)) {
            let smallerChildIndex = this.getLeftChildIndex(index);
            if (this.hasRightChild(index) && this.rightChild(index).score < this.leftChild(index).score) {
                smallerChildIndex = this.getRightChildIndex(index);
            }

            if (this.heap[index].score < this.heap[smallerChildIndex].score) {
                break;
            } else {
                this.swap(index, smallerChildIndex);
            }
            index = smallerChildIndex;
        }
    }

    /**
     * Returns the elements sorted by score descending.
     */
    getSortedDesc() {
        // We clone and extract all to get them sorted, then reverse since it's a min heap.
        const sorted = [];
        const cloneHeap = new MinHeap(this.capacity);
        cloneHeap.heap = [...this.heap];
        
        while (cloneHeap.heap.length > 0) {
            sorted.push(cloneHeap.extractMin());
        }
        return sorted.reverse();
    }
}

/**
 * Simulates fetching unread notifications from the database/API.
 */
async function fetchUnreadNotifications() {
    logger.info("Fetching unread notifications from database...");
    
    const now = Date.now();
    const oneHour = 1000 * 60 * 60;
    
    // Generate a mock dataset of 500 notifications to process
    const mockData = [];
    const types = ['PLACEMENT', 'RESULT', 'EVENT'];
    
    for (let i = 1; i <= 500; i++) {
        const randomType = types[Math.floor(Math.random() * types.length)];
        const randomAge = Math.random() * 48; // between 0 and 48 hours old
        
        mockData.push({
            id: `notif_${i}`,
            type: randomType,
            title: `Notification ${i}`,
            createdAt: new Date(now - (randomAge * oneHour)).toISOString()
        });
    }
    
    return mockData;
}

/**
 * Main processor function to get the Top 10 notifications.
 */
async function getTopPriorityNotifications() {
    try {
        const notifications = await fetchUnreadNotifications();
        logger.info(`Retrieved ${notifications.length} unread notifications. Processing...`);

        const minHeap = new MinHeap(10);
        const currentTime = Date.now();

        // O(N) iteration over the dataset.
        // Inserting into a heap of max size 10 takes O(log 10) time.
        // Total time complexity: O(N log 10) ≈ O(N).
        for (const notif of notifications) {
            const score = calculateScore(notif, currentTime);
            // Append score for tracking
            const item = { ...notif, score: Number(score.toFixed(2)) };
            minHeap.insert(item);
        }

        const top10 = minHeap.getSortedDesc();
        
        logger.info("Successfully calculated Top 10 Priority Notifications.", { topCount: top10.length });
        
        console.log("\n=============================================");
        console.log("          TOP 10 NOTIFICATIONS               ");
        console.log("=============================================\n");
        console.table(top10.map(n => ({
            ID: n.id,
            Type: n.type,
            Score: n.score,
            AgeHours: ((currentTime - new Date(n.createdAt).getTime()) / (1000 * 60 * 60)).toFixed(1)
        })));

        return top10;

    } catch (error) {
        logger.error("Failed to process priority notifications.", { error: error.message });
        throw {
            success: false,
            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "An unexpected error occurred while processing notifications."
            }
        };
    }
}

// Execute if run directly
if (require.main === module) {
    getTopPriorityNotifications();
}

module.exports = { getTopPriorityNotifications, MinHeap, calculateScore };
