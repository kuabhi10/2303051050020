const axios = require('axios');

const ALLOWED_STACKS = new Set(['backend', 'frontend']);
const ALLOWED_LEVELS = new Set(['debug', 'info', 'warn', 'error', 'fatal']);
const ALLOWED_PACKAGES = new Set([
    'cache', 'controller', 'cron_job', 'db', 'domain', 'handler', 'repository', 'route', 'service',
    'api', 'component', 'hook', 'page', 'state', 'style',
    'auth', 'config', 'middleware', 'utils'
]);

async function Log(stack, level, pkg, message) {
    if (!ALLOWED_STACKS.has(stack) || !ALLOWED_LEVELS.has(level) || !ALLOWED_PACKAGES.has(pkg)) {
        return;
    }
    const apiUrl = process.env.LOG_API_URL || process.env.LOGGING_API_URL || process.env.EVALUATION_API_URL || 'https://dummy-log-api.com/logs';
    const apiToken = process.env.LOG_AUTH_TOKEN || process.env.LOGGING_API_KEY || process.env.EVALUATION_API_KEY || 'dummy_token';

    const payload = {
        stack,
        level,
        package: pkg,
        message
    };

    try {
        await axios.post(apiUrl, payload, {
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json'
            }
        });
    } catch (err) {
    }
}

module.exports = { Log };
