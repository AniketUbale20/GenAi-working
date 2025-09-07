# GenAI Development Platform - Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Git
- OpenAI API Key

### 1. Clone and Setup
```bash
git clone <repository-url>
cd genai-dev-platform
cp .env.example .env
# Edit .env with your configuration
```

### 2. Start with Docker Compose
```bash
# Development environment
docker-compose up -d

# Production environment
docker-compose -f docker-compose.prod.yml up -d
```

### 3. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Database: postgresql://localhost:5432

## 🛠️ Development Setup

### Local Development
```bash
# Install dependencies
npm run install:all

# Start development servers
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## 🏗️ Production Deployment

### Cloud Deployment Options

#### 1. AWS Deployment
```bash
# Using AWS CLI and Docker
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build and push images
docker build -t genai-frontend ./frontend
docker tag genai-frontend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/genai-frontend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/genai-frontend:latest

# Deploy using ECS or EKS
```

#### 2. GCP Deployment
```bash
# Using Google Cloud Build
gcloud builds submit --config cloudbuild.yaml

# Deploy to Cloud Run
gcloud run deploy genai-frontend --image gcr.io/PROJECT-ID/genai-frontend --platform managed
```

#### 3. Azure Deployment
```bash
# Using Azure Container Instances
az container create --resource-group myResourceGroup --name genai-platform --image genai-platform:latest
```

### Kubernetes Deployment
```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -n genai
```

## 🔧 Configuration

### Environment Variables
```bash
# Required
OPENAI_API_KEY=your_openai_api_key
JWT_SECRET=your_jwt_secret
DATABASE_URL=postgresql://user:pass@host:port/db

# Optional
NODE_ENV=production
LOG_LEVEL=info
REDIS_URL=redis://localhost:6379
```

### Database Setup
```bash
# Run migrations
npm run migrate

# Seed initial data
npm run seed
```

### SSL/TLS Configuration
```bash
# Generate self-signed certificates for development
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout deployment/ssl/key.pem \
  -out deployment/ssl/cert.pem

# For production, use Let's Encrypt or your certificate provider
```

## 📊 Monitoring and Logging

### Health Checks
- Frontend: http://localhost:3000/health
- Backend: http://localhost:5000/health
- Database: `pg_isready`

### Logging
- Application logs: `logs/combined.log`
- Error logs: `logs/error.log`
- Nginx logs: `/var/log/nginx/`

### Metrics
```bash
# View container stats
docker stats

# Check resource usage
docker system df
```

## 🔒 Security

### Security Checklist
- [ ] Update all dependencies
- [ ] Configure proper CORS origins
- [ ] Set up rate limiting
- [ ] Enable HTTPS/TLS
- [ ] Configure security headers
- [ ] Set up monitoring and alerting
- [ ] Regular security audits

### Security Scanning
```bash
# Run security audit
npm audit

# Container security scan
docker scan genai-platform:latest

# OWASP ZAP scan
docker run -t owasp/zap2docker-stable zap-baseline.py -t http://localhost:3000
```

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check database status
docker-compose ps postgres

# View database logs
docker-compose logs postgres

# Connect to database
docker-compose exec postgres psql -U postgres -d genai_db
```

#### API Connection Issues
```bash
# Check backend logs
docker-compose logs backend

# Test API endpoint
curl http://localhost:5000/health

# Check network connectivity
docker network ls
```

#### Frontend Build Issues
```bash
# Clear node modules and reinstall
rm -rf frontend/node_modules frontend/package-lock.json
cd frontend && npm install

# Check for TypeScript errors
npm run type-check
```

### Performance Optimization

#### Database Optimization
```sql
-- Check slow queries
SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;

-- Add indexes
CREATE INDEX idx_projects_user_id ON projects(user_id);
```

#### Frontend Optimization
```bash
# Analyze bundle size
npm run build:analyze

# Enable gzip compression
# Configure in nginx.conf
```

#### Backend Optimization
```bash
# Enable Redis caching
# Configure connection pooling
# Optimize API responses
```

## 📈 Scaling

### Horizontal Scaling
```yaml
# docker-compose.scale.yml
version: '3.8'
services:
  backend:
    deploy:
      replicas: 3
  frontend:
    deploy:
      replicas: 2
```

### Load Balancing
```nginx
upstream backend {
    server backend1:5000;
    server backend2:5000;
    server backend3:5000;
}
```

### Database Scaling
- Read replicas for PostgreSQL
- Connection pooling with PgBouncer
- Database sharding for large datasets

## 🔄 CI/CD Pipeline

### GitHub Actions
The platform includes automated CI/CD with:
- Code quality checks
- Security scanning
- Automated testing
- Container image building
- Deployment to UAT environment

### Manual Deployment
```bash
# Build and deploy
./scripts/deploy.sh production

# Rollback
./scripts/rollback.sh
```

## 📞 Support

For deployment issues:
1. Check the troubleshooting section
2. Review logs for error messages
3. Consult the documentation
4. Open an issue on GitHub

## 🎯 Next Steps

After successful deployment:
1. Configure monitoring and alerting
2. Set up backup procedures
3. Configure auto-scaling
4. Implement disaster recovery
5. Set up development/staging environments