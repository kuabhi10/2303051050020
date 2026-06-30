const axios = require('axios');
const assert = require('assert');

const BASE_URL = 'http://localhost:3000/api/schedule';
const EVAL_URL = 'http://4.224.186.213/evaluation-service';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiIyMzAzMDUxMDUwMDIwQHBhcnVsdW5pdmVyc2l0eS5hYy5pbiIsImV4cCI6MTc4MjgxNDc4MCwiaWF0IjoxNzgyODEzODgwLCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiYTQxZGZiMGYtNTY1ZS00YWRjLWIwMTctOGE4YmIxNTZlYzZkIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoiYWJoaXNoZWsga3VtYXIiLCJzdWIiOiI5MDEzZmZhNS1jNzQ3LTQwNzYtYTY2ZC00MGVjYzgzMjQwZDEifSwiZW1haWwiOiIyMzAzMDUxMDUwMDIwQHBhcnVsdW5pdmVyc2l0eS5hYy5pbiIsIm5hbWUiOiJhYmhpc2hlayBrdW1hciIsInJvbGxObyI6IjIzMDMwNTEwNTAwMjAiLCJhY2Nlc3NDb2RlIjoiY0pxYUVCIiwiY2xpZW50SUQiOiI5MDEzZmZhNS1jNzQ3LTQwNzYtYTY2ZC00MGVjYzgzMjQwZDEiLCJjbGllbnRTZWNyZXQiOiJ2Z0NQZ3drbmtXSFJNdnllIn0.DbvDTRB11hbzG0WredAyAj2qzvcNra141wKSSUjs8hY';

async function runTests() {
    console.log("Starting tests...");
    
    // 1. Get a valid depot
    console.log("Fetching depots from Evaluation API...");
    let depotId = null;
    try {
        const depotRes = await axios.get(`${EVAL_URL}/depots`, { headers: { Authorization: `Bearer ${TOKEN}` } });
        if (Array.isArray(depotRes.data) && depotRes.data.length > 0) {
            depotId = depotRes.data[0].id;
        } else if (depotRes.data && depotRes.data.id) {
            depotId = depotRes.data.id;
        }
        console.log("Got depot ID:", depotId);
    } catch (e) {
        console.error("Failed to fetch depots from evaluation API:", e.message);
        return;
    }

    if (!depotId) {
        console.error("No valid depot found to test.");
        return;
    }

    // 2. Test valid request
    try {
        console.log(`\nTesting valid request: GET ${BASE_URL}/${depotId}?availableHours=20`);
        const res = await axios.get(`${BASE_URL}/${depotId}?availableHours=20`);
        console.log("Status:", res.status);
        assert.equal(res.status, 200);
        console.log("Response indicates success. Selected tasks:", res.data.selected_maintenance_tasks.length);
        console.log("Total duration:", res.data.total_duration);
        console.log("Total impact score:", res.data.total_operational_impact_score);
    } catch (e) {
        console.error("Valid request failed:", e.response ? e.response.data : e.message);
    }

    // 3. Test invalid depot
    try {
        console.log(`\nTesting invalid depot: GET ${BASE_URL}/invalid-depot-123?availableHours=20`);
        await axios.get(`${BASE_URL}/invalid-depot-123?availableHours=20`);
        console.error("Invalid depot request should have failed!");
    } catch (e) {
        console.log("Status:", e.response.status);
        assert.equal(e.response.status >= 400, true);
        console.log("Invalid depot correctly rejected:", e.response.data);
    }

    // 4. Test missing availableHours
    try {
        console.log(`\nTesting missing availableHours: GET ${BASE_URL}/${depotId}`);
        await axios.get(`${BASE_URL}/${depotId}`);
        console.error("Missing availableHours request should have failed!");
    } catch (e) {
        console.log("Status:", e.response.status);
        assert.equal(e.response.status, 400);
        console.log("Missing availableHours correctly rejected:", e.response.data);
    }

    // 5. Test negative availableHours
    try {
        console.log(`\nTesting negative availableHours: GET ${BASE_URL}/${depotId}?availableHours=-5`);
        await axios.get(`${BASE_URL}/${depotId}?availableHours=-5`);
        console.error("Negative availableHours request should have failed!");
    } catch (e) {
        console.log("Status:", e.response.status);
        assert.equal(e.response.status, 400);
        console.log("Negative availableHours correctly rejected:", e.response.data);
    }

    console.log("\nAll API tests completed.");
}

runTests();
