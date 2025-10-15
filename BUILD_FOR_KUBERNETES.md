# Building Temporal UI for Kubernetes (Mac to Linux AMD64)

## ⚠️ The Problem

When building Docker images on a Mac (especially Apple Silicon/ARM64) for Kubernetes deployment on Linux AMD64, you'll encounter:

1. **`exec format error`** - The binary is compiled for the wrong architecture
2. **`exec /bin/sh: exec format error`** - The entire image is wrong architecture

## ✅ The Solution

Use the special build script that forces Linux AMD64:

```bash
./server/docker-build-amd64-force.sh
```

This script:

1. Uses Docker buildx with `--platform linux/amd64`
2. Exports to a tarball (workaround for `--load` limitations)
3. Loads the tarball as a proper AMD64 image
4. Verifies the architecture

## 🚀 Complete Build and Deploy Process

### Step 1: Build for Linux AMD64

```bash
# Build the image
./server/docker-build-amd64-force.sh

# This creates: temporal-ui-auth:latest (AMD64)
```

### Step 2: Verify Architecture

```bash
# Should output: amd64
docker image inspect temporal-ui-auth:latest --format '{{.Architecture}}'

# Full verification
docker run --rm temporal-ui-auth:latest uname -m
# Should output: x86_64
```

### Step 3: Tag and Push to Registry

```bash
# Replace with your registry
REGISTRY="your-registry.com"
IMAGE_NAME="temporal-ui"
TAG="v1.0.0"

# Tag
docker tag temporal-ui-auth:latest $REGISTRY/$IMAGE_NAME:$TAG

# Push
docker push $REGISTRY/$IMAGE_NAME:$TAG
```

### Step 4: Deploy to Kubernetes

Create `temporal-ui-deployment.yaml`:

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
          image: your-registry.com/temporal-ui:v1.0.0
          ports:
            - containerPort: 8088
              name: http
          env:
            - name: TEMPORAL_ADDRESS
              value: 'temporal-frontend:7233'
            - name: TEMPORAL_UI_PORT
              value: '8088'
            - name: TEMPORAL_AUTH_ENABLED
              value: 'false'
          resources:
            requests:
              memory: '256Mi'
              cpu: '100m'
            limits:
              memory: '512Mi'
              cpu: '500m'
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
            initialDelaySeconds: 10
            periodSeconds: 5
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
      name: http
  selector:
    app: temporal-ui
```

Deploy:

```bash
kubectl apply -f temporal-ui-deployment.yaml
```

### Step 5: Verify Deployment

```bash
# Check pods
kubectl get pods -n temporal -l app=temporal-ui

# Check logs (should show docker config, not production)
kubectl logs -n temporal -l app=temporal-ui

# Expected output:
# Loading config; env=docker,configDir=config
# Loading config files=[config/base.yaml config/docker.yaml]
# UI Server started on :8088

# Test architecture in pod
kubectl exec -n temporal deployment/temporal-ui -- uname -m
# Should output: x86_64

# Port-forward and test
kubectl port-forward -n temporal svc/temporal-ui 8088:8088
curl http://localhost:8088/health
```

## 🐛 Troubleshooting

### Issue: "exec format error" when running /bin/sh in pod

**Cause**: Image is ARM64, not AMD64

**Solution**:

```bash
# Check your local image
docker image inspect temporal-ui-auth:latest --format '{{.Architecture}}'

# If it says "arm64", rebuild:
./server/docker-build-amd64-force.sh

# Verify it's now "amd64"
docker image inspect temporal-ui-auth:latest --format '{{.Architecture}}'

# Re-push to registry
docker tag temporal-ui-auth:latest your-registry.com/temporal-ui:v1.0.0
docker push your-registry.com/temporal-ui:v1.0.0

# Restart pods
kubectl rollout restart deployment/temporal-ui -n temporal
```

### Issue: "crypto.randomUUID is not a function"

**Cause**: This is actually a symptom of the architecture problem - the Node.js build artifacts were created on ARM64 but running on AMD64

**Solution**: Rebuild with the correct script (above)

### Issue: buildx --load doesn't create AMD64 image

**Cause**: Docker buildx has limitations with `--load` on Mac when cross-compiling

**Solution**: Use `docker-build-amd64-force.sh` which uses the tarball method

## 📋 Verification Checklist

Before deploying to Kubernetes:

- [ ] Local image shows: `docker image inspect temporal-ui-auth:latest --format '{{.Architecture}}'` = `amd64`
- [ ] Can run: `docker run --rm temporal-ui-auth:latest uname -m` = `x86_64`
- [ ] Dockerfile CMD uses `--env docker` (not `production`)
- [ ] Image pushed to registry with correct tag
- [ ] Kubernetes deployment uses the correct image from registry

After deploying to Kubernetes:

- [ ] Pods are running (not CrashLoopBackOff)
- [ ] Logs show: `Loading config files=[config/base.yaml config/docker.yaml]`
- [ ] Logs do NOT show: `Unable to load server CA certificate`
- [ ] Can exec into pod: `kubectl exec -n temporal deployment/temporal-ui -- uname -m` = `x86_64`
- [ ] Health check passes: `curl http://pod-ip:8088/health`

## 🔧 Quick Commands Reference

```bash
# Build for AMD64
./server/docker-build-amd64-force.sh

# Verify architecture
docker image inspect temporal-ui-auth:latest --format '{{.Architecture}}'

# Test locally
docker run --rm -p 8088:8088 \
  -e TEMPORAL_ADDRESS=your-server:7233 \
  temporal-ui-auth:latest

# Tag and push
docker tag temporal-ui-auth:latest your-registry.com/temporal-ui:v1.0.0
docker push your-registry.com/temporal-ui:v1.0.0

# Deploy
kubectl apply -f temporal-ui-deployment.yaml

# Check status
kubectl get pods -n temporal -l app=temporal-ui
kubectl logs -f -n temporal -l app=temporal-ui

# Verify in pod
kubectl exec -n temporal deployment/temporal-ui -- uname -m

# Cleanup tarball
rm temporal-ui-amd64.tar
```

## 🎯 Why This Approach Works

1. **Explicit Platform**: `--platform linux/amd64` forces AMD64 build
2. **Tarball Export**: Bypasses `--load` limitations on Mac
3. **Clean Load**: `docker load` properly imports the AMD64 image
4. **Verification**: Script checks architecture before completion

## 📚 Additional Resources

- `server/docker-build-amd64-force.sh` - The build script
- `KUBERNETES_FIX_SUMMARY.md` - Summary of all fixes
- `server/KUBERNETES_DEPLOYMENT.md` - Full K8s guide
- `server/verify-arch.sh` - Architecture verification

## ✅ Success Criteria

Your build is successful when:

1. Local image architecture is `amd64`
2. Pods start without "exec format error"
3. Logs show loading `docker.yaml` config
4. Can execute commands in the pod
5. UI is accessible

🎉 Happy deploying!
