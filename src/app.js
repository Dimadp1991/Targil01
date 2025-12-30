const express = require('express');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const promClient = require('prom-client');

const app = express();

app.use(cookieParser());
app.use(csrf({ cookie: true }));

const port = process.env.PORT || 4000;

// Create a Registry to register the metrics
const register = new promClient.Registry();

// Enable the collection of default metrics
promClient.collectDefaultMetrics({ register });

const helloWorldCounter = new promClient.Counter({
    name: 'root_access_total',
    help: 'Total number of accesses to the root path',
});
register.registerMetric(helloWorldCounter);




// Define routes

app.get('/', (req, res) => {
    const summary = `
        <h1>Welcome to the Homepage - Mini-Production Flow</h1>
        <hr>
        <h3>Pipeline Architecture:</h3>
        <ul>
            <li><strong>Source:</strong> Gogs (Git)</li>
            <li><strong>CI/CD:</strong> Jenkins (Semgrep, Trivy, Docker Buildx)</li>
            <li><strong>Registry:</strong> Zot (Private Image Store)</li>
            <li><strong>GitOps:</strong> Argo CD</li>
            <li><strong>Infrastructure:</strong> Minikube (Kubernetes)</li>
        </ul>
        <p>Try <a href="/my-app">/my-app</a> to increment the Prometheus counter!</p>
    `;
    res.send(summary);
});

app.get('/my-app', (req, res) => {
    helloWorldCounter.inc();
    res.send('Hello Hello,  World!');
});

app.get('/about', (req, res) => {
    res.send('This is a sample Node.js application for Kubernetes deployment testing.');
});

app.get('/ready', (req, res) => {
    res.status(200).send('Ready');
});

app.get('/live', (req, res) => {
    res.status(200).send('Alive');
});

app.get('/classified', (req, res) => {
    res.status(200).send('You should not be here!!!');
});

app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = app;