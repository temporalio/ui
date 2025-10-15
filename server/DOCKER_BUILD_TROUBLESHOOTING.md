# Docker Build Troubleshooting Guide

## Common Build Issues and Solutions

### 1. Node.js Version Issues

**Error:**
```
Error: tsx must be loaded with --import instead of --loader
The --loader flag was deprecated in Node v20.6.0
```

**Solution:**
- The Dockerfile now uses Node.js 20 instead of Node.js 18
- The `--ignore-scripts` flag prevents the prepare hook from running during installation

**Fix Applied:**
```dockerfile
FROM node:20-alpine AS frontend-builder
RUN pnpm install --frozen-lockfile --ignore-scripts
```

### 2. Go Version Mismatch

**Error:**
```
go: go.mod requires go >= 1.23.0 (running go 1.21.13; GOTOOLCHAIN=local)
```

**Solution:**
- The Dockerfile now uses Go 1.23 instead of Go 1.21

**Fix Applied:**
```dockerfile
FROM golang:1.23-alpine AS go-builder
```

### 3. Build Scripts Not Running

**Error:**
```
Ignored build scripts: @swc/core, @temporalio/core-bridge, esbuild, protobufjs, svelte-preprocess
```

**Solution:**
- This is a warning, not an error
- The `--ignore-scripts` flag intentionally skips these
- The prepare script is run manually after installation

**Why:**
- Prevents potential issues during Docker build
- Gives more control over the build process

### 4. Missing Files During Build

**Error:**
```
COPY failed: file not found
```

**Solution:**
- Ensure you're running the build script from the project root
- Check that all required files exist:
  - `package.json`
  - `pnpm-lock.yaml`
  - `server/go.mod`
  - `src/` directory
  - `static/` directory
  - `scripts/` directory

### 5. Docker Daemon Not Running

**Error:**
```
Cannot connect to the Docker daemon
```

**Solution:**
```bash
# Check Docker status
docker info

# Start Docker (Linux)
sudo systemctl start docker

# Start Docker (Mac)
open -a Docker
```

### 6. Insufficient Disk Space

**Error:**
```
no space left on device
```

**Solution:**
```bash
# Remove unused Docker resources
docker system prune -a

# Remove all stopped containers
docker container prune

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune
```

### 7. Network Issues During Build

**Error:**
```
failed to fetch
```

**Solution:**
```bash
# Retry the build
./server/docker-build.sh

# Build with no cache
docker build --no-cache -f Dockerfile -t temporal-ui-auth:latest .

# Check network connectivity
ping registry.npmjs.org
ping proxy.golang.org
```

### 8. Permission Denied

**Error:**
```
permission denied while trying to connect to the Docker daemon
```

**Solution:**
```bash
# Add user to docker group (Linux)
sudo usermod -aG docker $USER
newgrp docker

# Or run with sudo
sudo ./server/docker-build.sh
```

## Build Performance Tips

### 1. Use Build Cache

Docker caches layers to speed up subsequent builds. To maximize cache usage:

- Don't modify package files unless necessary
- Copy dependencies before source code
- Use `.dockerignore` to exclude unnecessary files

### 2. Multi-core Builds

```bash
# Use multiple cores for Docker build
docker build --cpus 4 -f Dockerfile -t temporal-ui-auth:latest .
```

### 3. BuildKit

Enable Docker BuildKit for better performance:

```bash
# One-time build with BuildKit
DOCKER_BUILDKIT=1 docker build -f Dockerfile -t temporal-ui-auth:latest .

# Enable BuildKit permanently
echo 'export DOCKER_BUILDKIT=1' >> ~/.bashrc
source ~/.bashrc
```

## Debugging Build Issues

### 1. Run Build Steps Manually

```bash
# Build just the frontend
docker build --target frontend-builder -f Dockerfile -t temporal-ui-frontend .

# Build just the Go backend
docker build --target go-builder -f Dockerfile -t temporal-ui-backend .
```

### 2. Inspect Build Layers

```bash
# Build with verbose output
docker build --progress=plain -f Dockerfile -t temporal-ui-auth:latest .

# View build history
docker history temporal-ui-auth:latest
```

### 3. Interactive Debugging

```bash
# Build up to a specific stage
docker build --target frontend-builder -f Dockerfile -t debug-frontend .

# Run the stage interactively
docker run --rm -it debug-frontend /bin/sh

# Manually run commands to debug
cd /app
ls -la
pnpm install
pnpm run build
```

### 4. Check Logs

```bash
# View build logs
docker logs <container-id>

# Follow logs in real-time
docker logs -f <container-id>
```

## Clean Build

If you're experiencing persistent issues, try a clean build:

```bash
# Remove all temporal-ui images
docker rmi $(docker images temporal-ui-auth -q) -f

# Clean build cache
docker builder prune -a

# Rebuild from scratch
./server/docker-build.sh
```

## Platform-Specific Issues

### Linux

```bash
# Check SELinux permissions
getenforce

# Temporarily disable SELinux (if needed)
sudo setenforce 0
```

### macOS

```bash
# Increase Docker Desktop resources
# Docker Desktop > Settings > Resources > Advanced
# - CPUs: 4+
# - Memory: 8GB+
# - Disk: 60GB+
```

### Windows (WSL2)

```bash
# Ensure WSL2 is up to date
wsl --update

# Check Docker integration
wsl -l -v
```

## Getting Help

If you're still experiencing issues:

1. **Check the logs** with verbose output:
   ```bash
   docker build --progress=plain -f Dockerfile -t temporal-ui-auth:latest . 2>&1 | tee build.log
   ```

2. **Review the documentation**:
   - `server/README_DOCKER_BUILD.md`
   - `DOCKER_ENVIRONMENT_VARIABLES.md`
   - `DOCKER_DEPLOYMENT.md`

3. **Common fixes**:
   - Update Docker to the latest version
   - Ensure sufficient disk space (10GB+)
   - Check network connectivity
   - Verify all source files are present

## Quick Reference

### Successful Build Output

You should see:
```
✅ Docker image built successfully: temporal-ui-auth:latest
Image size: ~128MB
```

### Test the Image

```bash
# Quick test
docker run --rm -p 8088:8088 temporal-ui-auth:latest

# Test with health check
docker run --rm -p 8088:8088 temporal-ui-auth:latest &
sleep 10
curl http://localhost:8088/health
```

### Verify Image

```bash
# List images
docker images temporal-ui-auth

# Inspect image
docker inspect temporal-ui-auth:latest

# View layers
docker history temporal-ui-auth:latest
```

