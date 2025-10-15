# 🎯 UPDATE: Correct Deployment Name

## The Real Issue

Your deployment is named **`temporal-ui`**, not `temporal-ui-auth`!

### Current State:

```bash
$ kubectl get deployment temporal-ui -n platform-services -o jsonpath='{.spec.template.spec.containers[0].image}'
devopsartifact.jio.com/jret-herald_forward_fs__dev__dcr/temporalio/ui:2.18.0
```

This is the **official Temporal UI image**, not your custom one! ❌

---

## ✅ Solution: Update the Correct Deployment

### Option 1: Quick Update (Recommended)

```bash
# Update the CORRECT deployment name
kubectl set image deployment/temporal-ui \
  temporal-ui=devopsartifact.jio.com/jret-herald_forward_fs__dev__dcr/temporalio/temporal-ui-auth:0.0.10 \
  -n platform-services

# Wait for rollout
kubectl rollout status deployment/temporal-ui -n platform-services

# Verify
kubectl get deployment temporal-ui -n platform-services -o jsonpath='{.spec.template.spec.containers[0].image}'
```

### Option 2: Update via YAML

1. Get your current deployment:

```bash
kubectl get deployment temporal-ui -n platform-services -o yaml > temporal-ui-deployment.yaml
```

2. Edit the file and change the image line:

```yaml
spec:
  template:
    spec:
      containers:
        - name: temporal-ui
          # Change from:
          image: devopsartifact.jio.com/jret-herald_forward_fs__dev__dcr/temporalio/ui:2.18.0
          # To:
          image: devopsartifact.jio.com/jret-herald_forward_fs__dev__dcr/temporalio/temporal-ui-auth:0.0.10
          imagePullPolicy: Always
```

3. Apply:

```bash
kubectl apply -f temporal-ui-deployment.yaml
```

---

## Updated Deployment Script

I'll also update the `deploy-to-k8s.sh` script to use the correct deployment name.

---

## Quick Commands

### Update deployment:

```bash
kubectl set image deployment/temporal-ui \
  temporal-ui=devopsartifact.jio.com/jret-herald_forward_fs__dev__dcr/temporalio/temporal-ui-auth:0.0.10 \
  -n platform-services
```

### Check status:

```bash
kubectl rollout status deployment/temporal-ui -n platform-services
kubectl get pods -n platform-services -l app=temporal-ui
```

### Verify image in pod:

```bash
kubectl get pods -n platform-services -l app=temporal-ui -o jsonpath='{.items[0].spec.containers[0].image}'
```

### Check polyfill in pod:

```bash
POD=$(kubectl get pods -n platform-services -l app=temporal-ui -o jsonpath='{.items[0].metadata.name}')
kubectl exec -n platform-services $POD -- cat /app/build/index.html | grep -A 5 "crypto.randomUUID"
```

---

## What We Learned

1. ✅ Your image build is **correct** (has polyfill)
2. ✅ Your image push to registry works
3. ❌ You were updating the **wrong deployment name**
   - Script used: `temporal-ui-auth`
   - Actual deployment: `temporal-ui`

---

## After Update

Once you run the correct `kubectl set image` command:

1. Kubernetes will pull your `temporal-ui-auth:0.0.10` image
2. The new pod will have the polyfill
3. Clear browser cache
4. Test: `http://10.166.181.98:30189`
5. ✅ No more `crypto.randomUUID` error!
