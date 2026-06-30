const axios = require('axios');
const config = require('../config');
const { knapsackTasks } = require('../utils/knapsack');
const { Log } = require('../../../logging-middleware');

async function scheduleMaintenance(depotId, availableHours) {
    await Log('backend', 'info', 'service', `Starting scheduling process for depot: ${depotId}`);
    
    let depot;
    try {
        await Log('backend', 'info', 'service', `Calling depot API to fetch depots`);
        const depotRes = await axios.get(`${config.evaluationApiUrl}/depots`, {
            headers: { 'Authorization': `Bearer ${config.evaluationApiKey}` }
        });
        
        const depotsData = depotRes.data;
        if (Array.isArray(depotsData)) {
            depot = depotsData.find(d => String(d.id) === String(depotId));
        } else if (depotsData && String(depotsData.id) === String(depotId)) {
            depot = depotsData;
        } else {
            depot = null;
        }

        if (!depot || Object.keys(depot).length === 0) {
            await Log('backend', 'error', 'service', `Depot not found for depotId: ${depotId}`);
            const err = new Error(`Depot not found for id: ${depotId}`);
            err.status = 404;
            throw err;
        }

        await Log('backend', 'info', 'service', `Depot API success for depotId: ${depotId}`);
    } catch (error) {
        await Log('backend', 'error', 'service', `Depot API failure for depotId: ${depotId} - ${error.message}`);
        throw error;
    }
    
    let tasks;
    try {
        await Log('backend', 'info', 'service', `Calling task API for depotId: ${depotId}`);
        const tasksRes = await axios.get(`${config.evaluationApiUrl}/tasks?depotId=${depotId}`, {
            headers: { 'Authorization': `Bearer ${config.evaluationApiKey}` }
        });
        tasks = tasksRes.data;
        if (!Array.isArray(tasks)) {
            tasks = [];
        }
        await Log('backend', 'info', 'service', `Task API success for depotId: ${depotId}. Found ${tasks.length} tasks.`);
    } catch (error) {
        await Log('backend', 'error', 'service', `Task API failure for depotId: ${depotId} - ${error.message}`);
        throw error;
    }
        
    try {
        await Log('backend', 'info', 'service', `Optimization started for depotId: ${depotId}`);
        const selectedTasks = await knapsackTasks(tasks, availableHours);
        await Log('backend', 'info', 'service', `Optimization completed for depotId: ${depotId}. Selected ${selectedTasks.length} tasks.`);
        
        let totalDuration = 0;
        let totalScore = 0;
        for (const t of selectedTasks) {
            const duration = t.estimatedServiceDuration ?? t.duration ?? 0;
            const score = t.impactScore ?? t.priority ?? t.operational_impact_score ?? 0;
            totalDuration += duration;
            totalScore += score;
        }
        
        return {
            depot,
            available_mechanic_hours: availableHours,
            selected_maintenance_tasks: selectedTasks,
            total_duration: totalDuration,
            total_operational_impact_score: totalScore
        };
    } catch (error) {
        await Log('backend', 'error', 'service', `Unexpected failure in optimizing: ${error.message}`);
        throw error;
    }
}

module.exports = { scheduleMaintenance };
