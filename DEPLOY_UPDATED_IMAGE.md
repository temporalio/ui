# Deploy Updated Image with crypto.randomUUID Fix

## ✅ Image Ready

The new image with the `crypto.randomUUID` polyfill fix is ready:

- **Architecture**: AMD64 (Kubernetes compatible) ✅
- **Polyfill**: Added IIFE wrapper for better compatibility ✅
- **Configuration**: Uses `docker.yaml` (no TLS requirements) ✅

## 🚀 Deploy to Kubernetes

### Step 1: Tag and Push to Registry

```bash
# Replace with your registry details
REGISTRY="your-registry.com"
IMAGE_NAME="temporal-ui"
TAG="v1.0.1"  # Use a new version tag

# Tag the image
docker tag temporal-ui-auth:latest $REGISTRY/$IMAGE_NAME:$TAG

# Push to registry
docker push $REGISTRY/$IMAGE_NAME:$TAG
```

### Step 2: Update Kubernetes Deployment

#### Option A: Using kubectl set image (Quick)

```bash
kubectl set image deployment/temporal-ui \
  temporal-ui=$REGISTRY/$IMAGE_NAME:$TAG \
  -n temporal

# Watch the rollout
kubectl rollout status deployment/temporal-ui -n temporal
```

#### Option B: Edit Deployment YAML

Update your deployment file to use the new tag:

```yaml
spec:
  template:
    spec:
      containers:
        - name: temporal-ui
          image: your-registry.com/temporal-ui:v1.0.1 # Updated tag
```

Then apply:

```bash
kubectl apply -f your-deployment.yaml
```

### Step 3: Force Pod Restart (If needed)

If the image tag hasn't changed, force a restart:

```bash
kubectl rollout restart deployment/temporal-ui -n temporal
```

### Step 4: Verify the Fix

```bash
# Check pods are running
kubectl get pods -n temporal -l app=temporal-ui

# Check logs
kubectl logs -n temporal -l app=temporal-ui --tail=50

# Port forward and test
kubectl port-forward -n temporal svc/temporal-ui 8088:8088
```

Then open your browser:

- Navigate to: `http://localhost:8088/namespaces/your-namespace/workflows`
- Open browser console (F12)
- Check for errors - should NOT see "crypto.randomUUID is not a function"

## 🔍 Troubleshooting

### Issue: Still Getting the Error

**Possible Causes:**

1. **Browser Cache**

   ```bash
   # Clear browser cache or do hard refresh
   # Chrome/Edge: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   # Firefox: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
   ```

2. **Old Pod Still Running**

   ```bash
   # Check pod age
   kubectl get pods -n temporal -l app=temporal-ui

   # If pod is old, delete it to force recreation
   kubectl delete pod -n temporal -l app=temporal-ui
   ```

3. **Old Image in Node Cache**

   ```bash
   # On Kubernetes nodes, the old image might be cached
   # Force pull new image by changing imagePullPolicy

   spec:
     template:
       spec:
         containers:
           - name: temporal-ui
             image: your-registry.com/temporal-ui:v1.0.1
             imagePullPolicy: Always  # Force pull
   ```

4. **Wrong Image Running**

   ```bash
   # Verify the image in the running pod
   kubectl describe pod -n temporal <pod-name> | grep Image:

   # Should show your new image with v1.0.1 tag
   ```

### Issue: Image Pull Error

```bash
# Check if secret exists for private registry
kubectl get secret -n temporal

# Verify deployment has imagePullSecrets
kubectl get deployment temporal-ui -n temporal -o yaml | grep imagePullSecrets
```

## 📋 Verification Steps

After deployment, verify each step:

### 1. Check Pod is Running New Image

```bash
kubectl describe pod -n temporal <pod-name> | grep -A 3 "Image:"

# Expected output:
# Image: your-registry.com/temporal-ui:v1.0.1
# Image ID: docker-pullable://your-registry.com/temporal-ui@sha256:...
```

### 2. Check Logs Show No Errors

```bash
kubectl logs -n temporal -l app=temporal-ui --tail=100

# Should show:
# Loading config; env=docker,configDir=config
# Loading config files=[config/base.yaml config/docker.yaml]
# UI Server started on :8088
```

### 3. Test the UI

```bash
# Port forward
kubectl port-forward -n temporal svc/temporal-ui 8088:8088

# In another terminal or browser:
curl http://localhost:8088/health
# Should return: OK or health status
```

### 4. Test Workflow Page

1. Open browser to `http://localhost:8088` (or your ingress URL)
2. Navigate to: `Namespaces → Select a namespace → Workflows`
3. Open browser console (F12)
4. Check for errors
5. **Should NOT see**: `crypto.randomUUID is not a function` ✅

### 5. Test crypto.randomUUID in Console

1. Open browser console (F12) on the workflows page
2. Type: `crypto.randomUUID()`
3. Press Enter
4. **Should return**: A UUID like `"a1b2c3d4-e5f6-7890-abcd-ef1234567890"` ✅

## 🎯 Complete Deployment Script

```bash
#!/bin/bash
set -e

# Configuration
REGISTRY="your-registry.com"
IMAGE_NAME="temporal-ui"
TAG="v1.0.1"
NAMESPACE="temporal"
DEPLOYMENT="temporal-ui"

echo "🏗️  Deploying Temporal UI with crypto.randomUUID fix"
echo ""

# Tag and push
echo "📦 Tagging image..."
docker tag temporal-ui-auth:latest $REGISTRY/$IMAGE_NAME:$TAG

echo "⬆️  Pushing to registry..."
docker push $REGISTRY/$IMAGE_NAME:$TAG

# Update deployment
echo "🚀 Updating Kubernetes deployment..."
kubectl set image deployment/$DEPLOYMENT \
  temporal-ui=$REGISTRY/$IMAGE_NAME:$TAG \
  -n $NAMESPACE

# Wait for rollout
echo "⏳ Waiting for rollout to complete..."
kubectl rollout status deployment/$DEPLOYMENT -n $NAMESPACE

# Verify
echo "✅ Deployment complete!"
echo ""
echo "🔍 Verifying..."
kubectl get pods -n $NAMESPACE -l app=temporal-ui

echo ""
echo "📝 Check logs:"
echo "   kubectl logs -f -n $NAMESPACE -l app=temporal-ui"
echo ""
echo "🌐 Port forward:"
echo "   kubectl port-forward -n $NAMESPACE svc/temporal-ui 8088:8088"
echo ""
echo "✨ Done! Test at: http://localhost:8088"
```

Save as `deploy-temporal-ui.sh`, make executable, and run:

```bash
chmod +x deploy-temporal-ui.sh
./deploy-temporal-ui.sh
```

## ✅ Success Criteria

Your deployment is successful when:

- [ ] New image pushed to registry
- [ ] Pods restarted with new image
- [ ] Pods are running (not CrashLoopBackOff)
- [ ] Logs show `Loading config files=[config/base.yaml config/docker.yaml]`
- [ ] Can access UI via port-forward or ingress
- [ ] Namespaces page loads ✅
- [ ] **Workflows page loads without errors** ✅
- [ ] **No "crypto.randomUUID is not a function" in console** ✅
- [ ] Can exec into pod without "exec format error" ✅

## 🎉 Your Fix is Complete!

The `crypto.randomUUID` polyfill is now in the image and will work in all browsers and contexts.

**What was fixed:**

1. ✅ Added polyfill in `src/app.html`
2. ✅ Wrapped in IIFE for better isolation
3. ✅ Rebuilt image for AMD64 architecture
4. ✅ Ready for Kubernetes deployment

**Next:** Push to registry and deploy!
