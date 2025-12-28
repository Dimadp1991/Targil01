# Quick Start Guide

This guide will help you deploy the sample Node.js application to Kubernetes using Helm.

## Prerequisites

1. Docker installed
2. kubectl installed
3. minikube installed and running
4. Helm 3.x installed

## Step-by-Step Deployment

### 1. Start Minikube

```bash
minikube start
```

### 2. Enable Minikube Addons (Optional but Recommended)

```bash
# Enable ingress controller
minikube addons enable ingress

# Enable metrics server (for HPA)
minikube addons enable metrics-server
```

### 3. Build and Load Docker Image

**IMPORTANT:** You must build the Docker image and load it into minikube before deploying, otherwise pods will fail with `ImagePullBackOff` error.

#### Option 1: Build and Load (Recommended for Windows)

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

**Note:** After building, verify the image is available:
```powershell
# Check if image exists
docker images | Select-String "sample-nodejs"
```

### 4. Install with Helm

```bash
# Navigate to helm chart directory
cd helm/sample-nodejs

# Install the chart
helm install my-app .

# Or install with custom values
helm install my-app . --set replicaCount=3
```

### 5. Verify Deployment

```bash
# Check pods
kubectl get pods

# Check services
kubectl get svc

# Check ingress
kubectl get ingress

# View pod logs
kubectl logs -l app.kubernetes.io/name=sample-nodejs
```

### 6. Access the Application

#### Option 1: Via Ingress (Recommended)

```bash
# Get minikube IP
minikube ip

# Add to /etc/hosts (Linux/Mac) or C:\Windows\System32\drivers\etc\hosts (Windows)
# Replace <MINIKUBE_IP> with the actual IP
echo "<MINIKUBE_IP> sample-nodejs.local" | sudo tee -a /etc/hosts

# Access the application
curl http://sample-nodejs.local/my-app
```

#### Option 2: Via Port Forwarding

```bash
# Port forward the service
kubectl port-forward svc/my-app-sample-nodejs 8080:80

# In another terminal, test the endpoints
curl http://localhost:8080/my-app
curl http://localhost:8080/ready
curl http://localhost:8080/live
curl http://localhost:8080/metrics
```

#### Option 3: Via NodePort

```bash
# Update service type to NodePort
helm upgrade my-app . --set service.type=NodePort

# Get the NodePort
kubectl get svc my-app-sample-nodejs

# Access via minikube IP and NodePort
curl http://$(minikube ip):<NODEPORT>/my-app
```

### 7. Test Health Endpoints

```bash
# Test readiness probe
curl http://sample-nodejs.local/ready

# Test liveness probe
curl http://sample-nodejs.local/live

# View Prometheus metrics
curl http://sample-nodejs.local/metrics
```

### 8. Monitor Resources

```bash
# Check resource usage
kubectl top pods

# Describe a pod to see resource limits
kubectl describe pod <pod-name>
```

## Customization Examples

### Increase Replicas

```bash
helm upgrade my-app . --set replicaCount=5
```

### Adjust Resource Limits

```bash
helm upgrade my-app . \
  --set resources.limits.cpu=1000m \
  --set resources.limits.memory=1Gi \
  --set resources.requests.cpu=200m \
  --set resources.requests.memory=256Mi
```

### Enable Autoscaling

```bash
helm upgrade my-app . \
  --set autoscaling.enabled=true \
  --set autoscaling.minReplicas=2 \
  --set autoscaling.maxReplicas=10
```

### Change Ingress Host

```bash
helm upgrade my-app . \
  --set ingress.hosts[0].host=myapp.example.com
```

### Disable Ingress

```bash
helm upgrade my-app . --set ingress.enabled=false
```

## Troubleshooting

### Pods Not Starting / ImagePullBackOff Error

If you see `ImagePullBackOff` or `ErrImagePull` errors, the image is not available in minikube:

```powershell
# Check pod status
kubectl get pods

# Check the error details
kubectl describe pod <pod-name>

# Solution: Build and load the image
cd C:\Users\user\Desktop\TArgilRAF\Targil01
docker build -t sample-nodejs:1.0.0 .
minikube image load sample-nodejs:1.0.0

# Delete the failing pods (they will be recreated automatically)
kubectl delete pod -l app.kubernetes.io/name=sample-nodejs

# Wait a few seconds and check again
kubectl get pods
```

### Image Pull Errors (Alternative Solutions)

```powershell
# Option 1: Verify image exists in minikube
minikube ssh
docker images | grep sample-nodejs
exit

# Option 2: Rebuild and load image
cd C:\Users\user\Desktop\TArgilRAF\Targil01
docker build -t sample-nodejs:1.0.0 .
minikube image load sample-nodejs:1.0.0
```

### Pods Not Starting (Other Issues)

```powershell
# Check pod status
kubectl get pods

# Describe pod for events
kubectl describe pod <pod-name>

# Check logs
kubectl logs <pod-name>

# Check logs from all pods
kubectl logs -l app.kubernetes.io/name=sample-nodejs
```

### Ingress Not Working

```bash
# Check ingress controller
kubectl get pods -n ingress-nginx

# Check ingress status
kubectl describe ingress my-app-sample-nodejs

# Verify ingress addon is enabled
minikube addons list | grep ingress
```

## Uninstall

```bash
# Uninstall the Helm release
helm uninstall my-app

# Verify cleanup
kubectl get all
```

## Next Steps

- Review the Helm chart README: `helm/sample-nodejs/README.md`
- Customize values in `helm/sample-nodejs/values.yaml`
- Set up Prometheus monitoring with ServiceMonitor
- Configure TLS/SSL for production
- Set up CI/CD pipeline

