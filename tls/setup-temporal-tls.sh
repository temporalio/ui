#!/bin/bash
# setup-temporal-tls.sh
# Complete setup script for Temporal with TLS

set -e

echo "🚀 Setting up Temporal with TLS..."
echo ""

# Create directory structure
echo "📁 Creating directory structure..."
mkdir -p certs
mkdir -p config/dynamicconfig
mkdir -p postgres-init

# Generate certificates if they don't exist
if [ ! -f "certs/ca.crt" ]; then
    echo "🔐 Generating TLS certificates..."
    
    # Generate CA
    openssl genrsa -out certs/ca.key 4096
    openssl req -new -x509 -days 365 -key certs/ca.key -out certs/ca.crt \
        -subj "/C=US/ST=State/L=City/O=Temporal/OU=IT/CN=Temporal-CA"
    
    # Generate Server Certificate
    openssl genrsa -out certs/server.key 4096
    openssl req -new -key certs/server.key -out certs/server.csr \
        -subj "/C=US/ST=State/L=City/O=Temporal/OU=IT/CN=temporal-server"
    
    # Server extensions
    cat > certs/server.ext << EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = temporal-server
DNS.2 = temporal
DNS.3 = localhost
IP.1 = 127.0.0.1
EOF
    
    openssl x509 -req -in certs/server.csr -CA certs/ca.crt -CAkey certs/ca.key \
        -CAcreateserial -out certs/server.crt -days 365 -sha256 -extfile certs/server.ext
    
    # Generate Client Certificate
    openssl genrsa -out certs/client.key 4096
    openssl req -new -key certs/client.key -out certs/client.csr \
        -subj "/C=US/ST=State/L=City/O=Temporal/OU=IT/CN=temporal-client"
    
    # Client extensions
    cat > certs/client.ext << EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
extendedKeyUsage = clientAuth
EOF
    
    openssl x509 -req -in certs/client.csr -CA certs/ca.crt -CAkey certs/ca.key \
        -CAcreateserial -out certs/client.crt -days 365 -sha256 -extfile certs/client.ext
    
    # Set permissions
    chmod 600 certs/*.key
    chmod 644 certs/*.crt
    
    echo "✅ Certificates generated successfully"
else
    echo "✅ Certificates already exist"
fi

# Create dynamic config if it doesn't exist
if [ ! -f "config/dynamicconfig/development-sql.yaml" ]; then
    echo "📝 Creating dynamic config..."
    cat > config/dynamicconfig/development-sql.yaml << 'EOF'
system.enableTLS:
  - value: true
system.tlsRequireClientAuth:
  - value: true
frontend.enableClientVersionCheck:
  - value: true
frontend.rps:
  - value: 2400
history.maxAutoResetPoints:
  - value: 20
matching.numTaskqueueWritePartitions:
  - value: 3
matching.numTaskqueueReadPartitions:
  - value: 3
EOF
    echo "✅ Dynamic config created"
else
    echo "✅ Dynamic config already exists"
fi

# Create postgres init script
if [ ! -f "postgres-init/01-init-temporal.sh" ]; then
    echo "📝 Creating PostgreSQL init script..."
    cat > postgres-init/01-init-temporal.sh << 'EOF'
#!/bin/bash
set -e
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE temporal_visibility;
    GRANT ALL PRIVILEGES ON DATABASE temporal_visibility TO temporal;
EOSQL
EOF
    chmod +x postgres-init/01-init-temporal.sh
    echo "✅ PostgreSQL init script created"
else
    echo "✅ PostgreSQL init script already exists"
fi

echo ""
echo "🧹 Cleaning up old containers and volumes..."
docker-compose -f docker-compose-tls.yaml down -v 2>/dev/null || true

echo ""
echo "🐳 Starting Docker containers with TLS..."
docker-compose -f docker-compose-tls.yaml up -d

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 5

# Wait for PostgreSQL
echo "Waiting for PostgreSQL..."
until docker-compose -f docker-compose-tls.yaml exec -T postgresql pg_isready -U temporal > /dev/null 2>&1; do
    echo -n "."
    sleep 2
done
echo " ✅"

# Wait for Temporal
echo "Waiting for Temporal server..."
sleep 10
until docker-compose -f docker-compose-tls.yaml logs temporal 2>&1 | grep -q "Started Temporal server" > /dev/null 2>&1; do
    echo -n "."
    sleep 3
done
echo " ✅"

echo ""
echo "📊 Checking service status..."
docker-compose -f docker-compose-tls.yaml ps

echo ""
echo "✅ Setup complete!"
echo ""
echo "🔗 Access points:"
echo "   Temporal UI: http://localhost:8999"
echo "   Temporal Server (TLS): localhost:7233"
echo "   PostgreSQL: localhost:5432"
echo ""
echo "📜 View logs with:"
echo "   docker-compose -f docker-compose-tls.yaml logs -f temporal"
echo "   docker-compose -f docker-compose-tls.yaml logs -f temporal-ui"
echo ""
echo "🧪 Test TLS connection:"
echo "   ./quick-test.sh"
echo "   OR"
echo "   docker-compose -f docker-compose-tls.yaml exec temporal tctl --tls_cert_path /etc/temporal/certs/client.crt --tls_key_path /etc/temporal/certs/client.key --tls_ca_path /etc/temporal/certs/ca.crt --address temporal:7233 namespace list"
echo ""
echo "🔍 Verify certificates:"
echo "   openssl verify -CAfile certs/ca.crt certs/server.crt"
echo "   openssl verify -CAfile certs/ca.crt certs/client.crt"