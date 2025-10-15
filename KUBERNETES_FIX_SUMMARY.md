# Kubernetes Deployment Fix Summary

## 🐛 Issues Found and Fixed

### Issue 1: Architecture Mismatch ❌ → ✅

**Error**: `exec ./ui-server: exec format error`

**Cause**: Image was built for ARM64 (Mac) instead of Linux AMD64 (Kubernetes)

**Fix**:

- Updated Dockerfile to explicitly use `GOARCH=amd64`
- Created `server/docker-build-linux-amd64.sh` script
- Use Docker buildx with `--platform linux/amd64`

### Issue 2: TLS Certificate Loading Error ❌ → ✅

**Error**: `Unable to load server CA certificate`

**Cause**: Dockerfile was using `--env production` which loads `production.yaml` with TLS requirements

**Fix**: Changed CMD to use `--env docker` which loads `docker.yaml` (no TLS requirements)

## ✅ Solution Applied

### Dockerfile Changes

```dockerfile
# Line 54: Added GOARCH=amd64 for Kubernetes compatibility
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -a -installsuffix cgo -o ui-server ./cmd/server

# Line 98: Changed to use docker config (no TLS requirements)
CMD ["./ui-server", "--config", "./config", "--env", "docker", "start"]
```

## 🚀 Build for Kubernetes

### Option 1: Using buildx (Recommended)

```bash
# Build for Linux AMD64
docker buildx build --platform linux/amd64 -f Dockerfile -t temporal-ui-auth:latest --load .

# Verify architecture
docker image inspect temporal-ui-auth:latest --format '{{.Architecture}}'
# Should output: amd64
```

### Option 2: Using the Build Script

```bash
# Use the automated script
./server/docker-build-linux-amd64.sh
```

## 📦 Push to Registry

```bash
# Tag for your registry
docker tag temporal-ui-auth:latest your-registry.com/temporal-ui:v1.0.0

# Push
docker push your-registry.com/temporal-ui:v1.0.0
```

## 🎯 Deploy to Kubernetes

### Basic Deployment YAML

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
            # Core Configuration
            - name: TEMPORAL_ADDRESS
              value: 'temporal-frontend.temporal.svc.cluster.local:7233'
            - name: TEMPORAL_UI_PORT
              value: '8088'

            # Authentication (if needed)
            - name: TEMPORAL_AUTH_ENABLED
              value: 'true'
            - name: TEMPORAL_AUTH_PROVIDER_URL
              value: 'https://your-keycloak.com/realms/temporal'
            - name: TEMPORAL_AUTH_CLIENT_ID
              value: 'temporal-ui'
            - name: TEMPORAL_AUTH_CLIENT_SECRET
              valueFrom:
                secretKeyRef:
                  name: temporal-ui-secrets
                  key: client-secret
            - name: TEMPORAL_AUTH_CALLBACK_URL
              value: 'https://temporal-ui.yourdomain.com/auth/sso/callback'
            - name: TEMPORAL_AUTH_SCOPES
              value: 'openid,profile,email'

            # CORS (adjust for your domain)
            - name: TEMPORAL_CORS_ORIGINS
              value: 'https://temporal-ui.yourdomain.com'

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
            timeoutSeconds: 5
            failureThreshold: 3

          readinessProbe:
            httpGet:
              path: /health
              port: 8088
            initialDelaySeconds: 10
            periodSeconds: 5
            timeoutSeconds: 3
            failureThreshold: 3

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

## 🔍 Verify Deployment

```bash
# Check pods are running
kubectl get pods -n temporal -l app=temporal-ui

# Check logs (should not show TLS errors anymore)
kubectl logs -n temporal -l app=temporal-ui

# Expected output:
# 2025/10/14 16:41:59 Loading config; env=docker,configDir=config
# 2025/10/14 16:41:59 Loading config files=[config/base.yaml config/docker.yaml]
# 2025/10/14 16:41:59 UI Server started on :8088

# Port-forward for testing
kubectl port-forward -n temporal svc/temporal-ui 8088:8088

# Test
curl http://localhost:8088/health
```

## 📋 Environment Variables Reference

### Required

- `TEMPORAL_ADDRESS` - Temporal server address (default: 127.0.0.1:7233)
- `TEMPORAL_UI_PORT` - UI port (default: 8080)

### Authentication

- `TEMPORAL_AUTH_ENABLED` - Enable auth (default: false)
- `TEMPORAL_AUTH_PROVIDER_URL` - OIDC provider URL
- `TEMPORAL_AUTH_CLIENT_ID` - OAuth client ID
- `TEMPORAL_AUTH_CLIENT_SECRET` - OAuth client secret
- `TEMPORAL_AUTH_CALLBACK_URL` - OAuth callback URL
- `TEMPORAL_AUTH_SCOPES` - Comma-separated scopes

### Optional

- `TEMPORAL_CORS_ORIGINS` - Comma-separated allowed origins
- `TEMPORAL_TLS_CA` - CA certificate path (if using mTLS)
- `TEMPORAL_TLS_CERT` - Client certificate path
- `TEMPORAL_TLS_KEY` - Client key path
- `TEMPORAL_DEFAULT_NAMESPACE` - Default namespace
- `TEMPORAL_SHOW_TEMPORAL_SYSTEM_NAMESPACE` - Show system namespace

## ✅ Verification Checklist

- [ ] Image built for `linux/amd64` architecture
- [ ] Image uses `--env docker` configuration
- [ ] Image pushed to registry
- [ ] Deployment created in Kubernetes
- [ ] Pods are running (not CrashLoopBackOff)
- [ ] Logs show: `Loading config files=[config/base.yaml config/docker.yaml]`
- [ ] Health check passes
- [ ] Can access UI (via port-forward or ingress)

## 🎉 Expected Result

**Logs should show**:

```
2025/10/14 XX:XX:XX Loading config; env=docker,configDir=config
2025/10/14 XX:XX:XX Loading config files=[config/base.yaml config/docker.yaml]
2025/10/14 XX:XX:XX UI Server started on :8088
```

**NOT**:

```
2025/10/14 XX:XX:XX Loading config files=[config/base.yaml config/production.yaml]
2025/10/14 XX:XX:XX Unable to load server CA certificate
```

## 📚 Additional Resources

- **Build Script**: `server/docker-build-linux-amd64.sh`
- **Verify Script**: `server/verify-arch.sh`
- **K8s Guide**: `server/KUBERNETES_DEPLOYMENT.md`
- **Build Guide**: `server/README_DOCKER_BUILD.md`
- **Troubleshooting**: `server/DOCKER_BUILD_TROUBLESHOOTING.md`

## 🔧 Quick Commands

```bash
# Rebuild image
docker buildx build --platform linux/amd64 -f Dockerfile -t temporal-ui-auth:latest --load .

# Verify architecture
docker image inspect temporal-ui-auth:latest --format '{{.Architecture}}'

# Test locally
docker run --rm -p 8088:8088 -e TEMPORAL_ADDRESS=your-server:7233 temporal-ui-auth:latest

# Push to registry
docker tag temporal-ui-auth:latest your-registry.com/temporal-ui:v1.0.0
docker push your-registry.com/temporal-ui:v1.0.0

# Deploy
kubectl apply -f temporal-ui-deployment.yaml

# Check status
kubectl get pods -n temporal -l app=temporal-ui
kubectl logs -f -n temporal -l app=temporal-ui
```

## 🎯 Summary

Both Kubernetes issues have been fixed:

1. ✅ **Architecture**: Now builds for Linux AMD64
2. ✅ **Configuration**: Uses `docker.yaml` (no TLS requirements)

Your image is now ready for Kubernetes deployment! 🚀
