# Sample Node.js Helm Chart

A Helm chart for deploying the sample Node.js Express application with Prometheus metrics support.

## Prerequisites

- Kubernetes 1.19+
- Helm 3.0+
- Docker (for building the image)

## Installation

### 1. Build and Load the Docker Image

**IMPORTANT:** You must build the Docker image and load it into minikube before deploying, otherwise pods will fail with `ImagePullBackOff` error.

#### Option 1: Build and Load (Recommended for Windows PowerShell)

```powershell
# Navigate to the project directory
cd Targil01

# Build the Docker image
docker build -t sample-nodejs:1.0.0 .

# Load the image into minikube
minikube image load sample-nodejs:1.0.0
```

#### Option 2: Use Minikube's Docker Daemon (Linux/Mac)

```bash
# Navigate to the project directory
cd Targil01

# Use minikube's Docker daemon
eval $(minikube docker-env)

# Build the image (it will be available directly in minikube)
docker build -t sample-nodejs:1.0.0 .
```

**Verify the image is loaded:**
```powershell
# Check if image exists
docker images | Select-String "sample-nodejs"
```

### 2. Install the chart

```bash
cd helm/sample-nodejs
helm install my-app .
```

Or with custom values:

```bash
helm install my-app . -f my-values.yaml
```

### 3. Verify the installation

```bash
kubectl get pods
kubectl get svc
kubectl get ingress
```

## Configuration

The following table lists the configurable parameters and their default values:

| Parameter | Description | Default |
|-----------|-------------|---------|
| `replicaCount` | Number of replicas | `2` |
| `image.repository` | Image repository | `sample-nodejs` |
| `image.tag` | Image tag | `1.0.0` |
| `image.pullPolicy` | Image pull policy | `IfNotPresent` |
| `service.type` | Service type | `ClusterIP` |
| `service.port` | Service port | `80` |
| `ingress.enabled` | Enable ingress | `true` |
| `ingress.hosts[0].host` | Ingress hostname | `sample-nodejs.local` |
| `resources.limits.cpu` | CPU limit | `500m` |
| `resources.limits.memory` | Memory limit | `512Mi` |
| `resources.requests.cpu` | CPU request | `100m` |
| `resources.requests.memory` | Memory request | `128Mi` |
| `livenessProbe.enabled` | Enable liveness probe | `true` |
| `readinessProbe.enabled` | Enable readiness probe | `true` |
| `autoscaling.enabled` | Enable HPA | `false` |

## Features

### Health Probes

- **Liveness Probe**: Checks `/live` endpoint every 10 seconds
- **Readiness Probe**: Checks `/ready` endpoint every 5 seconds
- **Startup Probe**: Optional, can be enabled for slow-starting apps

### Resource Management

- CPU and memory limits and requests are configurable
- Default limits: 500m CPU, 512Mi memory
- Default requests: 100m CPU, 128Mi memory

### Ingress

- Supports multiple ingress controllers (nginx, traefik, etc.)
- Configurable TLS/SSL
- Path-based routing

### Autoscaling

- Horizontal Pod Autoscaler (HPA) support
- CPU and memory-based scaling
- Configurable min/max replicas

### Monitoring

- ServiceMonitor for Prometheus Operator (optional)
- Metrics endpoint at `/metrics`

## Usage Examples

### Basic installation

```bash
helm install my-app .
```

### Custom replica count

```bash
helm install my-app . --set replicaCount=3
```

### Disable ingress

```bash
helm install my-app . --set ingress.enabled=false
```

### Enable autoscaling

```bash
helm install my-app . --set autoscaling.enabled=true
```

### Custom resource limits

```bash
helm install my-app . \
  --set resources.limits.cpu=1000m \
  --set resources.limits.memory=1Gi \
  --set resources.requests.cpu=200m \
  --set resources.requests.memory=256Mi
```

### Using a values file

Create `custom-values.yaml`:

```yaml
replicaCount: 3
resources:
  limits:
    cpu: 1000m
    memory: 1Gi
  requests:
    cpu: 200m
    memory: 256Mi
ingress:
  enabled: true
  hosts:
    - host: myapp.example.com
      paths:
        - path: /
          pathType: Prefix
```

Then install:

```bash
helm install my-app . -f custom-values.yaml
```

## Accessing the Application

### Via Ingress (if enabled)

Add the host to your `/etc/hosts` file:

```bash
echo "$(minikube ip) sample-nodejs.local" | sudo tee -a /etc/hosts
```

Then access: `http://sample-nodejs.local`

### Via Port Forwarding

```bash
kubectl port-forward svc/my-app-sample-nodejs 8080:80
```

Then access: `http://localhost:8080`

### Via NodePort (if service type is NodePort)

```bash
kubectl get svc my-app-sample-nodejs
# Use the NodePort shown in the output
```

## Uninstallation

```bash
helm uninstall my-app
```

## Troubleshooting

### ImagePullBackOff / ErrImagePull Error

**Most Common Issue:** If pods show `ImagePullBackOff` or `ErrImagePull`, the Docker image is not available in minikube.

**Solution:**
```powershell
# Build and load the image
cd C:\Users\user\Desktop\TArgilRAF\Targil01
docker build -t sample-nodejs:1.0.0 .
minikube image load sample-nodejs:1.0.0

# Delete failing pods (they will be recreated)
kubectl delete pod -l app.kubernetes.io/name=sample-nodejs

# Verify pods are running
kubectl get pods
```

### Check pod status

```bash
kubectl get pods -l app.kubernetes.io/name=sample-nodejs
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

### Check service

```bash
kubectl get svc
kubectl describe svc my-app-sample-nodejs
```

### Check ingress

```bash
kubectl get ingress
kubectl describe ingress my-app-sample-nodejs
```

### Test endpoints

```bash
# Port forward to a pod
kubectl port-forward <pod-name> 8080:8080

# Test endpoints
curl http://localhost:8080/my-app
curl http://localhost:8080/ready
curl http://localhost:8080/live
curl http://localhost:8080/metrics
```

