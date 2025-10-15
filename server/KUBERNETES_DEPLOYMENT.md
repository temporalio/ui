# Kubernetes Deployment Guide

## ⚠️ Architecture Requirements

Kubernetes typically runs on Linux AMD64 architecture. If you're building on a Mac (especially Apple Silicon/ARM64), you **must** build specifically for Linux AMD64.

## 🔧 Building for Kubernetes

### Option 1: Use the Linux AMD64 Build Script (Recommended)

```bash
./server/docker-build-linux-amd64.sh
```

This script uses Docker buildx to create a Linux AMD64 image regardless of your host architecture.

### Option 2: Manual Build with Platform Flag

```bash
docker buildx build --platform linux/amd64 -f Dockerfile -t temporal-ui-auth:latest --load .
```

### Verify Architecture

After building, verify the image is Linux AMD64:

```bash
./server/verify-arch.sh
```

Expected output:
```
✅ Architecture: amd64 (Linux AMD64 - Kubernetes compatible)
```

## 🚀 Deployment Steps

### 1. Build the Image

```bash
# Build for Linux AMD64
./server/docker-build-linux-amd64.sh
```

### 2. Tag for Your Registry

```bash
# Replace with your registry
docker tag temporal-ui-auth:latest your-registry.com/temporal-ui-auth:v1.0.0
```

### 3. Push to Registry

```bash
docker push your-registry.com/temporal-ui-auth:v1.0.0
```

### 4. Deploy to Kubernetes

#### Basic Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: temporal-ui
  namespace: temporal
spec:
  replicas: 2
  selector:
    matchLabels:
      app: temporal-ui
  template:
    metadata:
      labels:
        app: temporal-ui
    spec:
      containers:
      - name: temporal-ui
        image: your-registry.com/temporal-ui-auth:v1.0.0
        ports:
        - containerPort: 8088
          name: http
        env:
        - name: TEMPORAL_ADDRESS
          value: "temporal-frontend.temporal.svc.cluster.local:7233"
        - name: TEMPORAL_UI_PORT
          value: "8088"
        - name: TEMPORAL_AUTH_ENABLED
          value: "false"
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8088
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
        readinessProbe:
          httpGet:
            path: /health
            port: 8088
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
---
apiVersion: v1
kind: Service
metadata:
  name: temporal-ui
  namespace: temporal
spec:
  type: ClusterIP
  ports:
  - port: 8088
    targetPort: 8088
    protocol: TCP
    name: http
  selector:
    app: temporal-ui
```

#### With Authentication

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: temporal-ui
  namespace: temporal
spec:
  replicas: 2
  selector:
    matchLabels:
      app: temporal-ui
  template:
    metadata:
      labels:
        app: temporal-ui
    spec:
      containers:
      - name: temporal-ui
        image: your-registry.com/temporal-ui-auth:v1.0.0
        ports:
        - containerPort: 8088
          name: http
        env:
        - name: TEMPORAL_ADDRESS
          value: "temporal-frontend.temporal.svc.cluster.local:7233"
        - name: TEMPORAL_UI_PORT
          value: "8088"
        - name: TEMPORAL_AUTH_ENABLED
          value: "true"
        - name: TEMPORAL_AUTH_TYPE
          value: "oidc"
        - name: TEMPORAL_AUTH_PROVIDER_URL
          value: "https://keycloak.example.com/realms/temporal-ui"
        - name: TEMPORAL_AUTH_CLIENT_ID
          value: "temporal-ui"
        - name: TEMPORAL_AUTH_CLIENT_SECRET
          valueFrom:
            secretKeyRef:
              name: temporal-ui-secrets
              key: client-secret
        - name: TEMPORAL_AUTH_CALLBACK_URL
          value: "https://temporal-ui.example.com/auth/sso/callback"
        - name: TEMPORAL_AUTH_SCOPES
          value: "openid,profile,email"
        - name: TEMPORAL_CORS_ORIGINS
          value: "https://temporal-ui.example.com"
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8088
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8088
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Secret
metadata:
  name: temporal-ui-secrets
  namespace: temporal
type: Opaque
stringData:
  client-secret: "your-keycloak-client-secret"
---
apiVersion: v1
kind: Service
metadata:
  name: temporal-ui
  namespace: temporal
spec:
  type: ClusterIP
  ports:
  - port: 8088
    targetPort: 8088
    protocol: TCP
    name: http
  selector:
    app: temporal-ui
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: temporal-ui
  namespace: temporal
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - temporal-ui.example.com
    secretName: temporal-ui-tls
  rules:
  - host: temporal-ui.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: temporal-ui
            port:
              number: 8088
```

## 🔍 Troubleshooting

### Error: "exec format error"

**Cause**: Image was built for wrong architecture (e.g., ARM64 instead of AMD64)

**Solution**:
```bash
# Rebuild for Linux AMD64
./server/docker-build-linux-amd64.sh

# Verify architecture
./server/verify-arch.sh

# Should show: Architecture: amd64
```

### Pod CrashLoopBackOff

**Check logs**:
```bash
kubectl logs -n temporal deployment/temporal-ui
```

**Common issues**:
1. **Cannot connect to Temporal server**
   - Verify `TEMPORAL_ADDRESS` is correct
   - Check network connectivity
   
2. **Configuration errors**
   - Check environment variables
   - Verify secrets exist

3. **Health check failures**
   - Increase `initialDelaySeconds` in probes
   - Check application logs

### Image Pull Errors

```bash
# Check if secret exists for private registry
kubectl get secret -n temporal

# Create docker registry secret if needed
kubectl create secret docker-registry regcred \
  --docker-server=your-registry.com \
  --docker-username=your-username \
  --docker-password=your-password \
  --docker-email=your-email \
  -n temporal

# Add to deployment spec
spec:
  template:
    spec:
      imagePullSecrets:
      - name: regcred
```

## 📊 Monitoring

### Check Pod Status

```bash
# View pods
kubectl get pods -n temporal

# Watch pods
kubectl get pods -n temporal -w

# Describe pod
kubectl describe pod -n temporal <pod-name>
```

### View Logs

```bash
# Tail logs
kubectl logs -f -n temporal deployment/temporal-ui

# Previous pod logs
kubectl logs -n temporal <pod-name> --previous
```

### Check Events

```bash
kubectl get events -n temporal --sort-by='.lastTimestamp'
```

## 🔐 Security Best Practices

1. **Use Secrets for Sensitive Data**
   ```bash
   kubectl create secret generic temporal-ui-secrets \
     --from-literal=client-secret=your-secret \
     -n temporal
   ```

2. **Enable TLS**
   - Use cert-manager for automatic certificate management
   - Configure Ingress with TLS

3. **Network Policies**
   ```yaml
   apiVersion: networking.k8s.io/v1
   kind: NetworkPolicy
   metadata:
     name: temporal-ui-network-policy
     namespace: temporal
   spec:
     podSelector:
       matchLabels:
         app: temporal-ui
     policyTypes:
     - Ingress
     - Egress
     ingress:
     - from:
       - namespaceSelector:
           matchLabels:
             name: ingress-nginx
       ports:
       - protocol: TCP
         port: 8088
     egress:
     - to:
       - namespaceSelector:
           matchLabels:
             name: temporal
       ports:
       - protocol: TCP
         port: 7233
   ```

4. **Resource Limits**
   - Always set resource requests and limits
   - Use Pod Disruption Budgets for HA

5. **Run as Non-Root**
   - Image already runs as UID 1001 (non-root)
   - No additional security context needed

## 📈 Scaling

### Horizontal Pod Autoscaler

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: temporal-ui-hpa
  namespace: temporal
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: temporal-ui
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

## 🎯 Quick Deploy

```bash
# Build for Kubernetes
./server/docker-build-linux-amd64.sh

# Tag and push
docker tag temporal-ui-auth:latest your-registry.com/temporal-ui-auth:v1.0.0
docker push your-registry.com/temporal-ui-auth:v1.0.0

# Deploy
kubectl apply -f kubernetes/temporal-ui-deployment.yaml

# Check status
kubectl get pods -n temporal -l app=temporal-ui

# View logs
kubectl logs -f -n temporal -l app=temporal-ui

# Access UI (port-forward for testing)
kubectl port-forward -n temporal svc/temporal-ui 8088:8088
# Then visit: http://localhost:8088
```

## 📚 Additional Resources

- [Docker Build Guide](README_DOCKER_BUILD.md)
- [Troubleshooting](DOCKER_BUILD_TROUBLESHOOTING.md)
- [Environment Variables](../DOCKER_ENVIRONMENT_VARIABLES.md)
- [Build Success Guide](BUILD_SUCCESS.md)

