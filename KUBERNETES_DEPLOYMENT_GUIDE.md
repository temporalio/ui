# Kubernetes Deployment Guide - Temporal UI with Auth

## The Issue You Encountered

Your Kubernetes deployment is using an **old cached image** even though you pushed with tag `0.0.8`.

### Evidence:

- **Local image** (`temporal-ui-auth:latest`): Has polyfill, uses new build hashes (`start.C6zNSaPU.js`)
- **K8s image** (`0.0.8`): No polyfill, uses old build hashes (`start.DoL8KRec.js`)
- **K8s page source**: Missing `crypto.randomUUID` polyfill in `<body>`

### Root Cause:

When you rebuild and push to the **same tag** (`0.0.8`), Kubernetes nodes cache the old image and don't pull the new one.

---

## ✅ Solution: Build, Tag, Push with New Version

### Step 1: Build the Latest Image

```bash
cd /Users/sagar.prasad/Documents/office/code/temporal/ui

# Build for Linux AMD64 (required for K8s)
./server/docker-build-amd64-force.sh
```

### Step 2: Tag with New Version

```bash
# Tag the latest build with a NEW version number
docker tag temporal-ui-auth:latest \
  devopsartifact.jio.com/jret-herald_forward_fs__dev__dcr/temporalio/temporal-ui-auth:0.0.10

# Also tag as latest
docker tag temporal-ui-auth:latest \
  devopsartifact.jio.com/jret-herald_forward_fs__dev__dcr/temporalio/temporal-ui-auth:latest
```

### Step 3: Push to Registry

```bash
# Push the new version
docker push devopsartifact.jio.com/jret-herald_forward_fs__dev__dcr/temporalio/temporal-ui-auth:0.0.10

# Push latest
docker push devopsartifact.jio.com/jret-herald_forward_fs__dev__dcr/temporalio/temporal-ui-auth:latest
```

### Step 4: Update Kubernetes Deployment

**Option A: Quick Update (kubectl set image)**

```bash
kubectl set image deployment/temporal-ui-auth \
  temporal-ui-auth=devopsartifact.jio.com/jret-herald_forward_fs__dev__dcr/temporalio/temporal-ui-auth:0.0.10 \
  -n platform-services
```

**Option B: Update YAML and Re-apply**
Update your deployment YAML:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: temporal-ui-auth
  namespace: platform-services
spec:
  replicas: 1
  selector:
    matchLabels:
      app: temporal-ui-auth
  template:
    metadata:
      labels:
        app: temporal-ui-auth
    spec:
      containers:
        - name: temporal-ui-auth
          # CHANGE THIS LINE - use new version 0.0.10
          image: devopsartifact.jio.com/jret-herald_forward_fs__dev__dcr/temporalio/temporal-ui-auth:0.0.10
          imagePullPolicy: Always # ADD THIS - force pull on every deployment
          ports:
            - containerPort: 8088
          env:
            - name: TZ
              value: 'Asia/Kolkata'
            - name: LOG_LEVEL
              value: 'trace'
            - name: TEMPORAL_ADDRESS
              value: '10.166.181.98:30533'
            - name: TEMPORAL_AUTH_ENABLED
              value: 'true'
            - name: TEMPORAL_CORS_ORIGINS
              value: 'http://10.166.181.98:30189'
            - name: TEMPORAL_TLS_ENABLE_HOST_VERIFICATION
              value: 'false'
            - name: TEMPORAL_AUTH_PROVIDER_URL
              value: 'http://10.166.181.98:30080/auth/realms/scps'
            - name: TEMPORAL_AUTH_CLIENT_ID
              value: 'heraldtemporal'
            - name: TEMPORAL_AUTH_CLIENT_SECRET
              value: 'DAqgktwGb91c0AXo1DbhPHpg7XWRupGB'
            - name: TEMPORAL_AUTH_CALLBACK_URL
              value: 'http://10.166.181.98:30189/auth/sso/callback'
            - name: TEMPORAL_AUTH_SCOPES
              value: 'openid,profile,email'
          resources:
            requests:
              memory: '256Mi'
              cpu: '250m'
            limits:
              memory: '500Mi'
              cpu: '500m'
```

Then apply:

```bash
kubectl apply -f your-deployment.yaml
```

### Step 5: Verify Deployment

```bash
# Watch the rollout
kubectl rollout status deployment/temporal-ui-auth -n platform-services

# Check pod logs
kubectl logs -f deployment/temporal-ui-auth -n platform-services

# Verify the new image is being used
kubectl get pods -n platform-services -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.containers[0].image}{"\n"}{end}' | grep temporal-ui-auth

# Check if pods are running
kubectl get pods -n platform-services -l app=temporal-ui-auth
```

### Step 6: Test in Browser

1. **Clear browser cache** (Ctrl+Shift+Delete or Cmd+Shift+Delete)
2. **Hard refresh** (Ctrl+F5 or Cmd+Shift+R)
3. Navigate to: `http://10.166.181.98:30189/namespaces/jio-herald-rugs/workflows`
4. **Check page source** (Right-click → View Page Source)
5. Verify you see the polyfill in `<body>`:

```html
<body>
  <script>
    // Polyfill for crypto.randomUUID() - placed in body to execute before app
    if (typeof crypto !== 'undefined' && !crypto.randomUUID) {
      crypto.randomUUID = function () {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(
          /[018]/g,
          function (c) {
            return (
              c ^
              (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
            ).toString(16);
          },
        );
      };
    }
  </script>
  <div id="svelte">...</div>
</body>
```

---

## Environment Variable Configuration

Your `docker.yaml` uses Go templates with the `# enable-template` directive. The server **will automatically process** these templates at startup.

### How It Works:

1. **Config file** (`server/config/docker.yaml`):

```yaml
# enable-template
temporalGrpcAddress: { { env "TEMPORAL_ADDRESS" | default "127.0.0.1:7233" } }
port: { { env "TEMPORAL_UI_PORT" | default "8080" } }
auth:
  enabled: { { env "TEMPORAL_AUTH_ENABLED" | default "false" } }
```

2. **At runtime**, the Go server:
   - Reads `docker.yaml`
   - Sees `# enable-template` comment
   - Processes Go templates using environment variables
   - Applies the rendered config

3. **Result**: Your Kubernetes env vars will be applied correctly!

### Supported Environment Variables:

| Environment Variable                    | Default                 | Description                                       |
| --------------------------------------- | ----------------------- | ------------------------------------------------- |
| `TEMPORAL_ADDRESS`                      | `127.0.0.1:7233`        | Temporal server address                           |
| `TEMPORAL_UI_PORT`                      | `8080`                  | UI server port (but exposed as 8088 in container) |
| `TEMPORAL_AUTH_ENABLED`                 | `false`                 | Enable authentication                             |
| `TEMPORAL_AUTH_PROVIDER_URL`            | ``                      | OIDC provider URL                                 |
| `TEMPORAL_AUTH_CLIENT_ID`               | ``                      | OIDC client ID                                    |
| `TEMPORAL_AUTH_CLIENT_SECRET`           | ``                      | OIDC client secret                                |
| `TEMPORAL_AUTH_CALLBACK_URL`            | ``                      | OIDC callback URL                                 |
| `TEMPORAL_AUTH_SCOPES`                  | ``                      | Comma-separated scopes                            |
| `TEMPORAL_CORS_ORIGINS`                 | `http://localhost:8080` | Comma-separated allowed origins                   |
| `TEMPORAL_TLS_ENABLE_HOST_VERIFICATION` | `false`                 | Enable TLS host verification                      |

---

## Troubleshooting

### Issue: "Config values not being applied"

**Check:**

```bash
# Exec into pod
kubectl exec -it deployment/temporal-ui-auth -n platform-services -- /bin/sh

# Verify env vars are set
env | grep TEMPORAL

# Check config file
cat /app/config/docker.yaml | head -20

# Check server logs
kubectl logs deployment/temporal-ui-auth -n platform-services
```

### Issue: "Still seeing old version"

**Solution:**

```bash
# Force delete all pods
kubectl delete pods -n platform-services -l app=temporal-ui-auth

# Scale down and up
kubectl scale deployment/temporal-ui-auth --replicas=0 -n platform-services
kubectl scale deployment/temporal-ui-auth --replicas=1 -n platform-services
```

### Issue: "Polyfill still not working"

**Check:**

1. Clear browser cache completely
2. Use incognito/private window
3. View page source (not inspector) to see raw HTML
4. Verify image tag in pod: `kubectl get pods -o yaml | grep image:`

---

## Quick Deploy Script

Save this as `deploy-to-k8s.sh`:

```bash
#!/bin/bash
set -e

VERSION="0.0.10"
REGISTRY="devopsartifact.jio.com/jret-herald_forward_fs__dev__dcr/temporalio"
IMAGE_NAME="temporal-ui-auth"
NAMESPACE="platform-services"

echo "🏗️  Building image for Linux AMD64..."
./server/docker-build-amd64-force.sh

echo "🏷️  Tagging image as $VERSION..."
docker tag temporal-ui-auth:latest $REGISTRY/$IMAGE_NAME:$VERSION
docker tag temporal-ui-auth:latest $REGISTRY/$IMAGE_NAME:latest

echo "📤 Pushing to registry..."
docker push $REGISTRY/$IMAGE_NAME:$VERSION
docker push $REGISTRY/$IMAGE_NAME:latest

echo "🚀 Updating Kubernetes deployment..."
kubectl set image deployment/temporal-ui-auth \
  temporal-ui-auth=$REGISTRY/$IMAGE_NAME:$VERSION \
  -n $NAMESPACE

echo "⏳ Waiting for rollout..."
kubectl rollout status deployment/temporal-ui-auth -n $NAMESPACE

echo "✅ Deployment complete!"
echo ""
echo "📋 Pod status:"
kubectl get pods -n $NAMESPACE -l app=temporal-ui-auth

echo ""
echo "📝 View logs:"
echo "kubectl logs -f deployment/temporal-ui-auth -n $NAMESPACE"
```

Run with:

```bash
chmod +x deploy-to-k8s.sh
./deploy-to-k8s.sh
```

---

## Success Checklist

- [ ] Built image with `docker-build-amd64-force.sh`
- [ ] Tagged with NEW version (0.0.10)
- [ ] Pushed to registry
- [ ] Updated K8s deployment with new image tag
- [ ] Added `imagePullPolicy: Always` to deployment
- [ ] Verified rollout completed
- [ ] Checked pod logs show no errors
- [ ] Cleared browser cache
- [ ] Verified page source has polyfill in `<body>`
- [ ] Tested workflow pages work without `crypto.randomUUID` error

---

## What's Fixed in This Version

✅ `crypto.randomUUID` polyfill added to `<body>`  
✅ Environment variable templating in `docker.yaml`  
✅ Linux AMD64 architecture for Kubernetes  
✅ Frontend namespace filtering by user attributes  
✅ JWT claims extraction (`temporal_namespaces`, etc.)  
✅ CSP headers allow inline polyfill script  
✅ All namespaces returned by API, filtered on frontend

---

**Remember:** Always use a NEW version tag when deploying to Kubernetes to avoid cached image issues!
