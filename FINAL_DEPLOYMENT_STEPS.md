# ✅ Final Deployment Steps - crypto.randomUUID Fix

## 🎉 Local Testing: SUCCESS!

The fix is working locally at `http://localhost:8088/namespaces/jio-herald-plt/workflows`

## 🔧 What Was Fixed

1. **Content Security Policy (CSP)**: The inline script was blocked by CSP's `strict-dynamic` policy
2. **Solution**: Moved the polyfill to an external file `/static/crypto-polyfill.js`
3. **CSP Updated**: Added `unsafe-inline` to CSP directives (though external scripts work with `strict-dynamic`)

## 🚀 Deploy to Kubernetes

### Step 1: Tag and Push Image

```bash
# Replace with your registry
REGISTRY="your-registry.com"  # e.g., devopsartifact.jio.com/jret-herald_forward_fs__dev__dcr
IMAGE_NAME="temporal-ui"      # or temporalio/temporal-ui-auth
TAG="v1.0.2"                  # New version with crypto.randomUUID fix

# Tag the image
docker tag temporal-ui-auth:latest $REGISTRY/$IMAGE_NAME:$TAG

# Push to registry
docker push $REGISTRY/$IMAGE_NAME:$TAG
```

### Step 2: Update Kubernetes Deployment

```bash
# Quick update using kubectl
kubectl set image deployment/temporal-ui \
  temporal-ui=$REGISTRY/$IMAGE_NAME:$TAG \
  -n temporal

# Watch the rollout
kubectl rollout status deployment/temporal-ui -n temporal

# Check pods
kubectl get pods -n temporal -l app=temporal-ui
```

### Step 3: Verify in Kubernetes

```bash
# Check logs
kubectl logs -n temporal -l app=temporal-ui --tail=50

# Expected output:
# Loading config; env=docker,configDir=config
# Loading config files=[config/base.yaml config/docker.yaml]
# UI Server started on :8080

# Port forward to test (optional)
kubectl port-forward -n temporal svc/temporal-ui 8088:8088
```

### Step 4: Test the UI

1. Open your browser to: `http://10.166.181.98:30189`
2. Navigate to: `Namespaces → jio-herald-rugs → Workflows`
3. **Expected**: Page loads without errors ✅
4. **NOT Expected**: `crypto.randomUUID is not a function` ❌

## 📋 Quick Deployment Script

```bash
#!/bin/bash
# deploy-crypto-fix.sh

set -e

# Configuration - UPDATE THESE!
REGISTRY="devopsartifact.jio.com/jret-herald_forward_fs__dev__dcr"
IMAGE_NAME="temporalio/temporal-ui-auth"
TAG="v1.0.2"
NAMESPACE="temporal"

echo "🚀 Deploying Temporal UI crypto.randomUUID fix"
echo ""
echo "📦 Image: $REGISTRY/$IMAGE_NAME:$TAG"
echo ""

# Tag
echo "🏷️  Tagging image..."
docker tag temporal-ui-auth:latest $REGISTRY/$IMAGE_NAME:$TAG

# Push
echo "⬆️  Pushing to registry..."
docker push $REGISTRY/$IMAGE_NAME:$TAG

# Update deployment
echo "🔄 Updating deployment..."
kubectl set image deployment/temporal-ui \
  temporal-ui=$REGISTRY/$IMAGE_NAME:$TAG \
  -n $NAMESPACE

# Wait
echo "⏳ Waiting for rollout..."
kubectl rollout status deployment/temporal-ui -n $NAMESPACE --timeout=5m

# Verify
echo ""
echo "✅ Deployment complete!"
echo ""
kubectl get pods -n $NAMESPACE -l app=temporal-ui
echo ""
echo "🌐 Test at: http://10.166.181.98:30189/namespaces/jio-herald-rugs/workflows"
```

## 🔍 Verification Checklist

After deployment:

- [ ] Image pushed to registry successfully
- [ ] Pods rolled out (check age is recent)
- [ ] Pods are running (not CrashLoopBackOff)
- [ ] Logs show: `Loading config files=[config/base.yaml config/docker.yaml]`
- [ ] Can navigate to namespaces page ✅
- [ ] Can navigate to workflows page ✅
- [ ] **No "crypto.randomUUID is not a function" error** ✅
- [ ] Can exec into pod: `kubectl exec -it -n temporal deployment/temporal-ui -- sh` ✅

## 🐛 If Still Seeing Error

### 1. Clear Browser Cache

```bash
# Hard refresh
# Chrome/Edge: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
# Firefox: Cmd+Shift+R (Mac) or Ctrl+F5 (Windows)
```

### 2. Verify Pod is Using New Image

```bash
kubectl describe pod -n temporal <pod-name> | grep Image:

# Should show:
# Image: your-registry.com/temporal-ui:v1.0.2
```

### 3. Check if Polyfill is Loading

```bash
# Port forward
kubectl port-forward -n temporal svc/temporal-ui 8088:8088

# Test polyfill file exists
curl http://localhost:8088/crypto-polyfill.js

# Should return the polyfill code
```

### 4. Force Pod Restart

```bash
# Delete old pods
kubectl delete pod -n temporal -l app=temporal-ui

# Or restart deployment
kubectl rollout restart deployment/temporal-ui -n temporal
```

## 📊 What Changed

### Files Modified:

1. **`src/app.html`**
   - Added: `<script src="/crypto-polyfill.js"></script>`

2. **`static/crypto-polyfill.js`** (NEW)
   - External polyfill file for crypto.randomUUID()

3. **`svelte.config.js`**
   - Updated CSP: `directives: { 'script-src': ['strict-dynamic', 'unsafe-inline'] }`

### Why External File?

- **CSP Compliance**: External scripts work with `strict-dynamic`
- **No Inline Script Issues**: Avoids CSP hash/nonce complications
- **Cacheable**: Browser can cache the polyfill
- **Clean Separation**: Keeps polyfill separate from app code

## ✅ Summary

**Problem**: `crypto.randomUUID is not a function` on workflows page

**Root Cause**:

1. Function not available in some browsers/contexts
2. Inline polyfill blocked by Content Security Policy

**Solution**:

1. Created external polyfill file: `/static/crypto-polyfill.js`
2. Load it before app code in `src/app.html`
3. Works with CSP `strict-dynamic` policy

**Status**: ✅ Working locally, ready for Kubernetes deployment

## 🎯 Next Action

Run these commands to deploy:

```bash
# 1. Tag and push (update REGISTRY and IMAGE_NAME)
docker tag temporal-ui-auth:latest your-registry/temporal-ui:v1.0.2
docker push your-registry/temporal-ui:v1.0.2

# 2. Update Kubernetes
kubectl set image deployment/temporal-ui \
  temporal-ui=your-registry/temporal-ui:v1.0.2 \
  -n temporal

# 3. Watch and verify
kubectl rollout status deployment/temporal-ui -n temporal
kubectl get pods -n temporal -l app=temporal-ui
```

🎉 Your fix is ready!
