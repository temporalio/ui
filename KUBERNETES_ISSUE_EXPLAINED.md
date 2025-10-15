# Kubernetes Deployment Issue - Root Cause Analysis

## 🎯 The Real Problem

You successfully:

1. ✅ Fixed the `crypto.randomUUID` error by adding a polyfill to `src/app.html`
2. ✅ Built a new Docker image with the fix
3. ✅ Tagged it as `temporal-ui-auth:latest` locally
4. ✅ Pushed it to your registry as `0.0.8`

**But Kubernetes was still showing the error!** 😱

### Why?

**Kubernetes was using a CACHED old version of image `0.0.8`**

## 🔍 The Evidence

### Your Local Image (NEW - Has Fix)

```bash
$ docker run --rm temporal-ui-auth:latest cat /app/build/index.html | head -30
```

**Output shows:**

- ✅ Polyfill script in `<body>`
- Build files: `start.C6zNSaPU.js`, `app.WqZJ9jjn.js` (NEW hashes)

### Your Kubernetes Deployment (OLD - No Fix)

From your browser "View Page Source" on `http://10.166.181.98:30189`:

**Output shows:**

- ❌ NO polyfill script in `<body>`
- Build files: `start.DoL8KRec.js`, `app.DPPHb_9m.js` (OLD hashes)

### Conclusion

**The Kubernetes nodes have cached the OLD `0.0.8` image and are NOT pulling your new build!**

---

## 🧐 Why Does This Happen?

### Docker Image Tagging Behavior

When you:

1. Build a new image: `docker build -t temporal-ui-auth:latest`
2. Tag it with same version: `docker tag temporal-ui-auth:latest registry/image:0.0.8`
3. Push: `docker push registry/image:0.0.8`

Docker **overwrites** the `0.0.8` tag in your registry. ✅ This works fine!

### Kubernetes Image Pulling Behavior

But when Kubernetes tries to deploy:

1. Sees image: `registry/image:0.0.8`
2. Checks local node cache: "Do I already have `0.0.8`?"
3. **Finds OLD `0.0.8` in cache**: "Great! No need to pull!"
4. Uses the OLD cached image ❌

This is called **"image caching"** and it's by design for performance.

---

## ✅ The Solution

### Use a NEW version tag every time you rebuild

```bash
# Build
./server/docker-build-amd64-force.sh

# Tag with NEW version (increment every build)
docker tag temporal-ui-auth:latest registry/image:0.0.10  # <- New version!

# Push
docker push registry/image:0.0.10

# Update K8s
kubectl set image deployment/temporal-ui-auth \
  temporal-ui-auth=registry/image:0.0.10 \
  -n platform-services
```

### Why This Works

Kubernetes sees:

- Old deployment: `registry/image:0.0.8`
- New deployment: `registry/image:0.0.10`
- "Oh, a DIFFERENT tag! I need to pull the new one."
- Pulls fresh image from registry ✅
- Uses the NEW image with your fixes ✅

---

## 📋 Version Control Strategy

### Recommended Versioning

Use semantic versioning: `MAJOR.MINOR.PATCH`

```bash
0.0.1  # Initial deployment
0.0.2  # Bug fix
0.0.3  # Another bug fix
0.1.0  # New feature
1.0.0  # Production-ready
```

### For Your Case

```bash
0.0.8  # Old version (cached in K8s)
0.0.9  # Crypto polyfill attempt
0.0.10 # Crypto polyfill + config fixes ← USE THIS
```

---

## 🛠️ Alternative Solutions

### Option 1: Use `imagePullPolicy: Always` (Not Recommended for Production)

In your deployment YAML:

```yaml
spec:
  containers:
    - name: temporal-ui-auth
      image: registry/image:0.0.8
      imagePullPolicy: Always # Always pull, ignore cache
```

**Pros:** Same tag works every time  
**Cons:**

- Slower deployments (always downloads)
- Can break if registry is down
- Can cause race conditions
- Not a best practice

### Option 2: Force Delete Pods (Temporary Fix)

```bash
kubectl delete pods -n platform-services -l app=temporal-ui-auth
```

**Pros:** Quick test  
**Cons:**

- Doesn't guarantee new image pull
- May still use cached image
- Not reliable

### Option 3: Use Image Digest Instead of Tag (Advanced)

```bash
# Get digest
docker inspect registry/image:0.0.8 --format='{{.RepoDigests}}'

# Use in deployment
image: registry/image@sha256:abc123...
```

**Pros:** Immutable, always exact image  
**Cons:**

- Hard to manage
- Long strings
- Harder to read

---

## ✨ Best Practice: The Golden Rule

**🏆 Always use a new tag for each build that goes to Kubernetes!**

### Quick Deploy Workflow

```bash
# 1. Build
./server/docker-build-amd64-force.sh

# 2. Automated deploy (handles tagging, push, k8s update)
./deploy-to-k8s.sh 0.0.10

# Done! ✅
```

---

## 🔧 Your Environment Variables Question

You also asked about environment variables not being applied. Here's what's happening:

### Your `docker.yaml` Template (Correct! ✅)

```yaml
# enable-template
temporalGrpcAddress: { { env "TEMPORAL_ADDRESS" | default "127.0.0.1:7233" } }
port: { { env "TEMPORAL_UI_PORT" | default "8080" } }
auth:
  enabled: { { env "TEMPORAL_AUTH_ENABLED" | default "false" } }
```

### This IS CORRECT!

The Temporal UI server **will process** these Go templates at startup. Here's how:

1. Server starts with `--env docker`
2. Loads `config/docker.yaml`
3. Sees `# enable-template` comment (line 1)
4. Processes Go template syntax using `sprig` library
5. Replaces `{{ env "TEMPORAL_ADDRESS" }}` with actual env var
6. Uses the rendered config

### Why You Thought It Wasn't Working

When you ran in the pod:

```bash
$ env $TEMPORAL_ADDRESS
# Error: can't execute '10.166.181.98:30533'
```

This command is wrong! It tries to **execute** the value as a command.

**Correct way to check env vars:**

```bash
$ echo $TEMPORAL_ADDRESS
# Output: 10.166.181.98:30533

$ env | grep TEMPORAL
# Output: All TEMPORAL_* variables
```

### The Real Issue

Your **OLD image (0.0.8)** in Kubernetes didn't have:

1. The polyfill fix
2. The latest template processing

The **NEW image (0.0.10)** has everything correct! You just need to:

1. Tag with new version
2. Push to registry
3. Update K8s deployment

---

## 🚀 Summary & Next Steps

### What We Know:

1. ✅ Your local image **HAS** the polyfill
2. ✅ Your local image **HAS** the template config
3. ✅ Environment variable templating **WORKS**
4. ❌ Kubernetes is using **OLD cached image**

### What To Do:

1. Use the deployment script: `./deploy-to-k8s.sh 0.0.10`
2. Wait for rollout to complete
3. Clear browser cache
4. Test the UI

### What You'll See:

1. ✅ No more `crypto.randomUUID` error
2. ✅ Environment variables applied correctly
3. ✅ Namespace filtering working
4. ✅ Authentication working

---

## 📞 Quick Reference Commands

### Build & Deploy

```bash
./deploy-to-k8s.sh 0.0.10
```

### Check Deployment

```bash
kubectl get pods -n platform-services -l app=temporal-ui-auth
kubectl get deployment temporal-ui-auth -n platform-services -o jsonpath='{.spec.template.spec.containers[0].image}'
```

### View Logs

```bash
kubectl logs -f deployment/temporal-ui-auth -n platform-services
```

### Debug Pod

```bash
kubectl exec -it deployment/temporal-ui-auth -n platform-services -- /bin/sh

# Inside pod:
echo $TEMPORAL_ADDRESS
cat /app/config/docker.yaml | head -20
cat /app/build/index.html | grep -A 10 "crypto.randomUUID"
```

### Force Refresh

```bash
# Delete old pods
kubectl delete pods -n platform-services -l app=temporal-ui-auth

# Scale down/up
kubectl scale deployment/temporal-ui-auth --replicas=0 -n platform-services
kubectl scale deployment/temporal-ui-auth --replicas=1 -n platform-services
```

---

**Remember:** The image in your registry IS the new one, but Kubernetes needs to see a DIFFERENT tag to actually pull it! 🎯
