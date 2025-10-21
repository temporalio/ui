# Temporal Setup with TLS

This repository contains multiple Temporal setups to help you get started with Temporal, both with and without TLS.

## 🚀 Quick Start

### Option 1: Simple Setup (No TLS) - **RECOMMENDED FOR DEVELOPMENT**

This is the fastest way to get Temporal running:

```bash
# Start the simple setup
docker-compose -f docker-compose-simple.yaml up -d

# Wait for services to start (about 1-2 minutes)
# Then access:
# - Temporal UI: http://localhost:8999
# - Temporal Server: localhost:7233 (no TLS)
```

### Option 2: TLS Setup (For Production-like Environment)

For TLS-enabled setup:

```bash
# Run the setup script (generates certificates and starts services)
./setup-temporal-tls.sh

# Or manually:
docker-compose -f docker-compose-tls.yaml up -d
```

## 📁 File Structure

```
temporal/
├── docker-compose-simple.yaml      # Simple setup (no TLS) - WORKING
├── docker-compose-tls.yaml         # TLS setup with environment variables
├── docker-compose-tls-config.yaml # TLS setup with config files
├── setup-temporal-tls.sh           # Automated TLS setup script
├── test-tls-setup.sh              # Test script for TLS setup
├── certs/                          # Generated TLS certificates
├── config/                        # Configuration files
└── postgres-init/                 # PostgreSQL initialization
```

## 🔧 Setup Options

### 1. Simple Setup (No TLS)

- **File**: `docker-compose-simple.yaml`
- **Status**: ✅ **WORKING**
- **Use case**: Development, testing, learning
- **Access**:
  - UI: http://localhost:8999
  - Server: localhost:7233 (no TLS)

### 2. TLS Setup (Environment Variables)

- **File**: `docker-compose-tls.yaml`
- **Status**: ⚠️ **HAS ISSUES** (TLS handshake problems)
- **Use case**: Production-like environment
- **Access**:
  - UI: http://localhost:8999
  - Server: localhost:7233 (with TLS)

### 3. TLS Setup (Config Files)

- **File**: `docker-compose-tls-config.yaml`
- **Status**: ⚠️ **HAS ISSUES** (Config template not found)
- **Use case**: Advanced configuration

## 🧪 Testing

### Test Simple Setup

```bash
# Check if services are running
docker-compose -f docker-compose-simple.yaml ps

# Test server connection
docker-compose -f docker-compose-simple.yaml exec temporal tctl --address temporal:7233 namespace list

# Access UI
open http://localhost:8999
```

### Test TLS Setup

```bash
# Run the test script
./test-tls-setup.sh

# Manual test
sleep 15 && docker-compose -f docker-compose-server-tls-proper.yaml exec temporal tctl --tls_cert_path /etc/temporal/certs/client.crt --tls_key_path /etc/temporal/certs/client.key --tls_ca_path /etc/temporal/certs/ca.crt --address temporal-server:7233 namespace list


docker-compose -f docker-compose-server-tls-proper.yaml exec temporal tctl --tls_cert_path /etc/temporal/certs/client.crt --tls_key_path /etc/temporal/certs/client.key --tls_ca_path /etc/temporal/certs/ca.crt --address temporal-server:7233 admin cluster add-search-attributes --name "BusinessKey2" --type "Keyword"

```

## 🔍 Troubleshooting

### Common Issues

1. **"error reading server preface: EOF"**

   - **Cause**: TLS configuration issues
   - **Solution**: Use the simple setup (`docker-compose-simple.yaml`)

2. **UI not accessible**

   - **Cause**: Health check failures
   - **Solution**: Wait longer or check logs with `docker-compose logs temporal-ui`

3. **Container restarting**
   - **Cause**: Configuration errors
   - **Solution**: Check logs and use the working simple setup

### Logs and Debugging

```bash
# View all logs
docker-compose -f docker-compose-simple.yaml logs

# View specific service logs
docker-compose -f docker-compose-simple.yaml logs temporal
docker-compose -f docker-compose-simple.yaml logs temporal-ui

# Follow logs in real-time
docker-compose -f docker-compose-simple.yaml logs -f temporal
```

## 📋 Service Status

| Service         | Simple Setup | TLS Setup  | Notes         |
| --------------- | ------------ | ---------- | ------------- |
| PostgreSQL      | ✅ Working   | ✅ Working | Database      |
| Temporal Server | ✅ Working   | ✅ Working | Core service  |
| Temporal UI     | ✅ Working   | ✅ Working | Web interface |

## 🎯 Recommendations

1. **For Development**: Use `docker-compose-simple.yaml` - it's working and reliable
2. **For Production**: Fix the TLS setup issues first, or use external TLS termination
3. **For Learning**: Start with the simple setup, then explore TLS options

## 🔧 Next Steps

If you want to fix the TLS setup:

1. The issue seems to be with the auto-setup image's TLS environment variable handling
2. Consider using the standard Temporal server image with custom configuration
3. Or use external TLS termination (nginx, traefik, etc.)

## 📞 Support

- Check logs: `docker-compose logs [service-name]`
- Test connections: Use the provided test scripts
- Verify certificates: `openssl verify -CAfile certs/ca.crt certs/server.crt`


```java
import io.grpc.netty.shaded.io.grpc.netty.GrpcSslContexts;
import io.grpc.netty.shaded.io.netty.handler.ssl.SslContext;
import io.grpc.netty.shaded.io.netty.handler.ssl.SslContextBuilder;
import io.temporal.client.WorkflowClient;
import io.temporal.client.WorkflowClientOptions;
import io.temporal.serviceclient.WorkflowServiceStubs;
import io.temporal.serviceclient.WorkflowServiceStubsOptions;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.InputStream;
import javax.net.ssl.SSLException;

public class TemporalRemoteConnection {

  //  public static String port = "30533";
  //  public static String host = "10.145.171.182";
  //  public static String namespace = "jio-herald-plt";

  public static String port = "7233";
  public static String host = "localhost";
  public static String namespace = "default";

  public static WorkflowClient createBasicRemoteClient() {
    WorkflowServiceStubsOptions serviceOptions =
        WorkflowServiceStubsOptions.newBuilder().setTarget(host + ":" + port).build();

    WorkflowServiceStubs service = WorkflowServiceStubs.newServiceStubs(serviceOptions);

    WorkflowClientOptions clientOptions =
        WorkflowClientOptions.newBuilder()
            .setNamespace("default") // or your specific namespace
            .build();

    return WorkflowClient.newInstance(service, clientOptions);
  }

  // 2. Connection with Custom Namespace
  public static WorkflowClient createClientWithNamespace() {
    WorkflowServiceStubsOptions serviceOptions =
        WorkflowServiceStubsOptions.newBuilder().setTarget(host + ":" + port).build();

    WorkflowServiceStubs service = WorkflowServiceStubs.newServiceStubs(serviceOptions);

    WorkflowClientOptions clientOptions =
        WorkflowClientOptions.newBuilder().setNamespace(namespace).build();

    return WorkflowClient.newInstance(service, clientOptions);
  }

  // 2. Connection with Custom Namespace with SSL
  public static WorkflowClient createClientWithNamespaceSSL()
      throws FileNotFoundException, SSLException {

    String basePath = "/Users/sagar.prasad/Documents/office/tools/temporal/certs/";
    // Load your client certificate, which should look like:
    // -----BEGIN CERTIFICATE-----
    // ...
    // -----END CERTIFICATE-----
    InputStream clientCert = new FileInputStream(basePath + "client.crt");

    // PKCS8 client key, which should look like:
    // -----BEGIN PRIVATE KEY-----
    // ...
    // -----END PRIVATE KEY-----
    InputStream clientKey = new FileInputStream(basePath + "client.key");

    // Load your Certification Authority certificate, which should look like:
    // -----BEGIN CERTIFICATE-----
    // ...
    // -----END CERTIFICATE-----
    InputStream caCert = new FileInputStream(basePath + "ca.crt");

    SslContext sslContext =
        GrpcSslContexts.configure(
                SslContextBuilder.forClient()
                    .keyManager(clientCert, clientKey)
                    .trustManager(caCert))
            .build();

    WorkflowServiceStubs service =
        WorkflowServiceStubs.newServiceStubs(
            WorkflowServiceStubsOptions.newBuilder()
                .setSslContext(sslContext)
                .setTarget(host + ":" + port)
                // Override the authority name used for TLS handshakes
                .setChannelInitializer(c -> c.overrideAuthority("localhost"))
                .build());

    WorkflowClientOptions clientOptions =
        WorkflowClientOptions.newBuilder().setNamespace(namespace).build();

    return WorkflowClient.newInstance(service, clientOptions);
  }
}

```
