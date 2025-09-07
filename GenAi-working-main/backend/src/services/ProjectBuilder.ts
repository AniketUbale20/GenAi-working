import { logger } from '../utils/logger'
import { SecurityScanner } from './SecurityScanner'
import { ProjectRequirements } from '../types/project'

interface ProjectFile {
  path: string
  content: string
}

interface BuildProjectInput {
  projectId: string
  requirements: ProjectRequirements
  aiGeneratedStructure: any
}

export class ProjectBuilder {
  private securityScanner: SecurityScanner

  constructor() {
    this.securityScanner = new SecurityScanner()
  }

  async buildProject(input: BuildProjectInput): Promise<ProjectFile[]> {
    logger.info(`Building project ${input.projectId}`)

    try {
      // Start with AI-generated files
      let files = input.aiGeneratedStructure.files || []

      // Add framework-specific boilerplate
      files = await this.addFrameworkBoilerplate(files, input.requirements)

      // Add CI/CD configuration
      files = await this.addCICDConfig(files, input.requirements)

      // Add Docker configuration
      files = await this.addDockerConfig(files, input.requirements)

      // Validate and fix common issues
      files = await this.validateAndFixFiles(files)

      logger.info(`Project built successfully with ${files.length} files`)
      return files
    } catch (error) {
      logger.error('Project build failed:', error)
      throw new Error('Failed to build project')
    }
  }

  async applySecurity(files: ProjectFile[]): Promise<ProjectFile[]> {
    logger.info('Applying security measures to generated code')

    const secureFiles = []
    
    for (const file of files) {
      try {
        const secureContent = await this.securityScanner.scanAndFix(file.content, file.path)
        secureFiles.push({
          path: file.path,
          content: secureContent
        })
      } catch (error) {
        logger.warn(`Security scan failed for ${file.path}:`, error)
        secureFiles.push(file) // Use original if security scan fails
      }
    }

    // Add security-related files
    secureFiles.push(...this.generateSecurityFiles())

    return secureFiles
  }

  private async addFrameworkBoilerplate(files: ProjectFile[], requirements: ProjectRequirements): Promise<ProjectFile[]> {
    const frameworkFiles = [...files]

    if (requirements.framework.includes('react')) {
      frameworkFiles.push(...this.getReactBoilerplate(requirements))
    }

    if (requirements.framework.includes('node')) {
      frameworkFiles.push(...this.getNodeBoilerplate(requirements))
    }

    if (requirements.framework.includes('next')) {
      frameworkFiles.push(...this.getNextJSBoilerplate(requirements))
    }

    return frameworkFiles
  }

  private getReactBoilerplate(requirements: ProjectRequirements): ProjectFile[] {
    const files: ProjectFile[] = []

    // Vite config
    files.push({
      path: 'vite.config.ts',
      content: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})`
    })

    // Main entry point
    files.push({
      path: 'src/main.tsx',
      content: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`
    })

    // App component
    files.push({
      path: 'src/App.tsx',
      content: `import React from 'react'
import './App.css'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>${requirements.name}</h1>
        <p>${requirements.description}</p>
      </header>
      <main>
        {/* Generated components will be added here */}
      </main>
    </div>
  )
}

export default App`
    })

    // Basic CSS
    files.push({
      path: 'src/index.css',
      content: `:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}

#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}`
    })

    return files
  }

  private getNodeBoilerplate(requirements: ProjectRequirements): ProjectFile[] {
    const files: ProjectFile[] = []

    // Main server file
    files.push({
      path: 'src/index.ts',
      content: `import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json())

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to ${requirements.name} API',
    description: '${requirements.description}'
  })
})

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`)
})`
    })

    if (requirements.database) {
      files.push(...this.getDatabaseBoilerplate(requirements.database))
    }

    return files
  }

  private getNextJSBoilerplate(requirements: ProjectRequirements): ProjectFile[] {
    return [
      {
        path: 'next.config.js',
        content: `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
}

module.exports = nextConfig`
      },
      {
        path: 'app/layout.tsx',
        content: `export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}`
      },
      {
        path: 'app/page.tsx',
        content: `export default function Home() {
  return (
    <main>
      <h1>${requirements.name}</h1>
      <p>${requirements.description}</p>
    </main>
  )
}`
      }
    ]
  }

  private getDatabaseBoilerplate(database: string): ProjectFile[] {
    const files: ProjectFile[] = []

    if (database === 'postgresql') {
      files.push({
        path: 'src/config/database.ts',
        content: `import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

export default pool`
      })
    }

    if (database === 'mongodb') {
      files.push({
        path: 'src/config/database.ts',
        content: `import { MongoClient } from 'mongodb'

const client = new MongoClient(process.env.DATABASE_URL!)

export default client`
      })
    }

    return files
  }

  private async addCICDConfig(files: ProjectFile[], requirements: ProjectRequirements): Promise<ProjectFile[]> {
    const cicdFiles = [...files]

    // GitHub Actions workflow
    cicdFiles.push({
      path: '.github/workflows/ci.yml',
      content: `name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js \${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: \${{ matrix.node-version }}
        cache: 'npm'
    
    - run: npm ci
    - run: npm run build --if-present
    - run: npm test
    - run: npm run lint

  security:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - run: npm audit --audit-level high`
    })

    // Add deployment workflow if specified
    if (requirements.deployment) {
      cicdFiles.push(...this.getDeploymentConfig(requirements.deployment))
    }

    return cicdFiles
  }

  private getDeploymentConfig(platform: string): ProjectFile[] {
    const files: ProjectFile[] = []

    if (platform === 'vercel') {
      files.push({
        path: 'vercel.json',
        content: `{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/node"
    }
  ]
}`
      })
    }

    if (platform === 'docker') {
      files.push({
        path: '.github/workflows/deploy.yml',
        content: `name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Build and push Docker image
      uses: docker/build-push-action@v3
      with:
        context: .
        push: true
        tags: app:latest`
      })
    }

    return files
  }

  private async addDockerConfig(files: ProjectFile[], requirements: ProjectRequirements): Promise<ProjectFile[]> {
    const dockerFiles = [...files]

    // Dockerfile
    dockerFiles.push({
      path: 'Dockerfile',
      content: `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

${requirements.type === 'frontend' ? 'RUN npm run build' : ''}

EXPOSE 3000

${requirements.type === 'frontend' 
  ? 'CMD ["npm", "run", "preview"]' 
  : 'CMD ["npm", "start"]'
}`
    })

    // Docker Compose
    dockerFiles.push({
      path: 'docker-compose.yml',
      content: `version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    ${requirements.database ? `depends_on:
      - db` : ''}

${requirements.database === 'postgresql' ? `  db:
    image: postgres:15
    environment:
      POSTGRES_DB: app
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:` : ''}`
    })

    // .dockerignore
    dockerFiles.push({
      path: '.dockerignore',
      content: `node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.env.local
.env.development
.env.test
.env.production
.nyc_output
coverage
.docker`
    })

    return dockerFiles
  }

  private async validateAndFixFiles(files: ProjectFile[]): Promise<ProjectFile[]> {
    return files.map(file => {
      // Basic validation and fixes
      let content = file.content

      // Ensure proper line endings
      content = content.replace(/\r\n/g, '\n')

      // Remove trailing whitespace
      content = content.replace(/[ \t]+$/gm, '')

      // Ensure file ends with newline
      if (content && !content.endsWith('\n')) {
        content += '\n'
      }

      return {
        path: file.path,
        content
      }
    })
  }

  private generateSecurityFiles(): ProjectFile[] {
    return [
      {
        path: '.eslintrc.json',
        content: `{
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "plugin:security/recommended"
  ],
  "plugins": ["security"],
  "rules": {
    "security/detect-object-injection": "error",
    "security/detect-non-literal-regexp": "error",
    "security/detect-unsafe-regex": "error"
  }
}`
      },
      {
        path: '.gitignore',
        content: `node_modules/
.env
.env.local
.env.development
.env.test
.env.production
dist/
build/
coverage/
.nyc_output/
*.log
.DS_Store
.vscode/
.idea/
*.tgz
*.tar.gz`
      }
    ]
  }
}