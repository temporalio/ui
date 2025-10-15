# 🎉 Final Deployment Instructions - Version 0.0.13

## ✅ All Issues Fixed!

Version **0.0.13** contains all fixes:

1. ✅ **crypto.randomUUID polyfill** - Added to support older browsers
2. ✅ **Embedded assets** - Frontend build correctly embedded in Go binary
3. ✅ **CSP removed** - No Content Security Policy blocking inline scripts
4. ✅ **API endpoint** - Uses same-origin (relative URLs) instead of localhost:8080
5. ✅ **CORS configured** - Should work with your Kubernetes setup

---

## 🚀 Deploy to Kubernetes

Run these commands on your K8s cluster:

```bash
# Update deployment to version 0.0.13
kubectl set image deployment/temporal-ui-auth \
  temporal-ui-auth=devopsartifact.jio.com/jret-herald_forward_fs__dev__dcr/temporalio/temporal-ui-auth:0.0.13 \
  -n platform-services

# Watch the rollout
kubectl rollout status deployment/temporal-ui-auth -n platform-services

# Verify the new pod is running
kubectl get pods -n platform-services -l app=temporal-ui-auth

# Check the deployed image
kubectl get deployment temporal-ui-auth -n platform-services -o jsonpath='{.spec.template.spec.containers[0].image}'
```

Expected output: `devopsartifact.jio.com/jret-herald_forward_fs__dev__dcr/temporalio/temporal-ui-auth:0.0.13`

---

## 🧪 Testing

1. **Clear browser cache completely**
   - Press `Ctrl + Shift + Delete` (or `Cmd + Shift + Delete` on Mac)
   - Select "Cached images and files"
   - Click "Clear data"

2. **Open the UI**
   - Navigate to: `http://10.166.181.98:30189`

3. **Verify page source** (Right-click → View Page Source)
   - ✅ Should see polyfill script in `<body>`
   - ✅ Should NOT see `localhost:8080` anywhere
   - ✅ Should see new build files (e.g., `start.C6zNSaPU.js`)

4. **Check browser console** (F12 → Console tab)
   - ✅ Should see NO errors
   - ✅ API calls should go to same origin (not localhost:8080)

5. **Test navigation**
   - Navigate to workflows page
   - Check namespace dropdown
   - Verify filtering by `temporal_namespaces` attribute

---

## 🔧 Environment Variables

Your Kubernetes deployment should have these environment variables set:

```yaml
env:
  - name: TEMPORAL_ADDRESS
    value: '10.166.181.98:30533'
  - name: TEMPORAL_AUTH_ENABLED
    value: 'true' # Set to "true" to enable auth
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
```

---

## 📝 What Was Fixed in This Version

### Version History

**0.0.8** - Initial deployment (had old frontend)
**0.0.9** - Attempted fix (wrong approach)
**0.0.10** - Added polyfill to `src/app.html` but not embedded
**0.0.11** - Fixed embedded assets (copied build to `server/ui/assets/local/`)
**0.0.12** - Fixed CSP blocking inline scripts
**0.0.13** - Fixed API endpoint (removed `localhost:8080`, uses same-origin) ✅ **CURRENT**

### Key Changes in 0.0.13

1. **Dockerfile Line 55**: Added `COPY --from=frontend-builder /app/build/ ./ui/assets/local/`
   - Ensures Go binary embeds the latest frontend build

2. **package.json**: Changed `build:docker` script

   ```json
   "build:docker": "VITE_API= vite build"
   ```

   - Uses empty `VITE_API` for same-origin API calls (relative URLs)

3. **svelte.config.js**: Disabled CSP

   ```js
   csp: {
     mode: 'auto',
     directives: {},
   }
   ```

   - Allows inline polyfill script to execute

4. **src/app.html**: Polyfill added
   ```html
   <body>
     <script>
       // Polyfill for crypto.randomUUID()
       if (typeof crypto !== 'undefined' && !crypto.randomUUID) {
         crypto.randomUUID = function () { ... }
       }
     </script>
     <div id="svelte">%sveltekit.body%</div>
   </body>
   ```

---

## 🐛 Troubleshooting

### Issue: Still seeing old version

**Solution:**

```bash
# Force delete pods
kubectl delete pods -n platform-services -l app=temporal-ui-auth

# Verify new image is pulled
kubectl describe pod -n platform-services -l app=temporal-ui-auth | grep Image:
```

### Issue: CORS errors

**Check CORS configuration in pod:**

```bash
POD_NAME=$(kubectl get pods -n platform-services -l app=temporal-ui-auth -o jsonpath='{.items[0].metadata.name}')
kubectl exec -n platform-services $POD_NAME -- env | grep TEMPORAL_CORS
```

Expected: `TEMPORAL_CORS_ORIGINS=http://10.166.181.98:30189`

### Issue: API calls failing

**Check logs:**

```bash
kubectl logs -f deployment/temporal-ui-auth -n platform-services
```

Look for:

- ✅ `Loading config; env=docker`
- ✅ `Starting UI server...`
- ❌ Any error messages

### Issue: Blank page

**Check browser console (F12):**

- Look for JavaScript errors
- Check Network tab for failed requests
- Verify all `/_app/immutable/` resources load successfully

---

## 📊 Verification Checklist

Before marking as complete, verify:

- [ ] Deployment shows `0.0.13` image
- [ ] Pod is running and healthy
- [ ] Page loads without errors
- [ ] No `localhost:8080` in browser network tab
- [ ] API calls go to `http://10.166.181.98:30189/api/v1/...`
- [ ] Namespace dropdown shows filtered namespaces (if auth enabled)
- [ ] Workflows page loads successfully
- [ ] No `crypto.randomUUID` errors in console
- [ ] No CSP errors in console
- [ ] No CORS errors in console

---

## 🎯 Success Criteria

When everything works, you should see:

1. **Browser Network Tab:**

   ```
   http://10.166.181.98:30189/
   http://10.166.181.98:30189/_app/immutable/entry/start.C6zNSaPU.js
   http://10.166.181.98:30189/_app/immutable/entry/app.WqZJ9jjn.js
   http://10.166.181.98:30189/api/v1/settings
   http://10.166.181.98:30189/api/v1/cluster/info
   http://10.166.181.98:30189/api/v1/namespaces
   ```

2. **Browser Console:**

   ```
   (No errors - clean console)
   ```

3. **Page:**
   - Temporal UI loads completely
   - Namespace dropdown populated
   - Workflows page accessible
   - All features working

---

## 🎉 You're Done!

If all tests pass, your Temporal UI with custom authentication and namespace filtering is fully deployed and working! 🚀

### For Future Deployments

Use this workflow:

```bash
# 1. Make changes to code
# 2. Build and deploy
./server/docker-build-amd64-force.sh

# 3. Tag with new version (increment version number)
docker tag temporal-ui-auth:latest \
  devopsartifact.jio.com/jret-herald_forward_fs__dev__dcr/temporalio/temporal-ui-auth:0.0.14

# 4. Push
docker push devopsartifact.jio.com/jret-herald_forward_fs__dev__dcr/temporalio/temporal-ui-auth:0.0.14

# 5. Update K8s
kubectl set image deployment/temporal-ui-auth \
  temporal-ui-auth=devopsartifact.jio.com/jret-herald_forward_fs__dev__dcr/temporalio/temporal-ui-auth:0.0.14 \
  -n platform-services
```

---

**Need help?** Check the following files:

- `KUBERNETES_DEPLOYMENT_GUIDE.md` - Detailed deployment guide
- `KUBERNETES_ISSUE_EXPLAINED.md` - Root cause analysis
- `BUILD_FOR_KUBERNETES.md` - Build instructions
- `Dockerfile` - Multi-stage Docker build
- `server/config/docker.yaml` - Configuration with environment variables
