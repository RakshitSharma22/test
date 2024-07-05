const request = require('request');
const backendServers = [
    { host: '/api/server8080', isHealthy: true },
    { host: '/api/server8081', isHealthy: true },
    { host: '/api/server8082', isHealthy: true },
];

let currentServerIndex = 0;

function selectServer() {
    let server;
    const startIdx = currentServerIndex;

    do {
        server = backendServers[currentServerIndex];
        currentServerIndex = (currentServerIndex + 1) % backendServers.length;

        if (server.isHealthy) {
            return server;
        }
    } while (currentServerIndex !== startIdx);

    return null;
}

function logMetrics(server, url, responseTime) {
    console.log(`Request to ${server.host}${url} took ${responseTime}ms`);
    // You can extend this to log more detailed metrics or save to a database.
}

module.exports = (req, res) => {
    const server = selectServer();

    if (!server) {
        return res.status(503).send('No healthy backend servers available');
    }

    const url = `${server.host}${req.url}`;
    const startTime = Date.now();

    req.pipe(request(url))
        .on('error', (err) => {
            console.error('Error connecting to backend server:', err);
            res.status(500).send('Error connecting to backend server');
        })
        .on('response', (response) => {
            const responseTime = Date.now() - startTime;
            logMetrics(server, req.url, responseTime);
        })
        .pipe(res);
};
