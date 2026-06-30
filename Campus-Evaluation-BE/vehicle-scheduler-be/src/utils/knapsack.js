const { Log } = require('../../../logging-middleware');

async function knapsackTasks(tasks, capacityHours) {
    await Log('backend', 'info', 'utils', 'Optimization started: 0/1 Knapsack problem');
    
    if (!tasks || tasks.length === 0 || capacityHours <= 0) {
        return [];
    }

    const n = tasks.length;
    const scale = 100;
    const W = Math.round(capacityHours * scale);
    
    const dp = Array(n + 1).fill().map(() => Array(W + 1).fill(0));
    
    for (let i = 1; i <= n; i++) {
        const task = tasks[i - 1];
        const duration = task.estimatedServiceDuration ?? task.duration ?? 0;
        const w = Math.round(duration * scale);
        const v = task.impactScore ?? task.priority ?? task.operational_impact_score ?? 0;
        
        for (let j = 0; j <= W; j++) {
            if (w <= j) {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i - 1][j - w] + v);
            } else {
                dp[i][j] = dp[i - 1][j];
            }
        }
    }
    
    let res = dp[n][W];
    let w = W;
    const selectedTasks = [];
    
    for (let i = n; i > 0 && res > 0; i--) {
        if (res === dp[i - 1][w]) {
            continue;
        } else {
            const task = tasks[i - 1];
            selectedTasks.push(task);
            const v = task.impactScore ?? task.priority ?? task.operational_impact_score ?? 0;
            res -= v;
            const duration = task.estimatedServiceDuration ?? task.duration ?? 0;
            w -= Math.round(duration * scale);
        }
    }
    
    await Log('backend', 'info', 'utils', 'Optimization completed: Subset of tasks selected');
    
    return selectedTasks.reverse();
}

module.exports = { knapsackTasks };
