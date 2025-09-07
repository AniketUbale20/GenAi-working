import OpenAI from 'openai'
import { logger } from '../utils/logger'
import { ProjectRequirements } from '../types/project'

interface AIGeneratedStructure {
  architecture: string
  files: Array<{
    path: string
    content: string
    type: 'component' | 'service' | 'config' | 'test' | 'documentation'
  }>
  dependencies: string[]
  scripts: Record<string, string>
  environment: Record<string, string>
}

export class AICodeGenerator {
  private openai: OpenAI

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  }

  async generateProjectStructure(requirements: ProjectRequirements): Promise<AIGeneratedStructure> {
    try {
      logger.info(`Generating AI structure for ${requirements.type} project: ${requirements.name}`)

      const prompt = this.buildPrompt(requirements)
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt()
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })

      const aiResponse = response.choices[0]?.message?.content
      if (!aiResponse) {
        throw new Error('No response from AI')
      }

      return this.parseAIResponse(aiResponse, requirements)
    } catch (error) {
      logger.error('AI code generation failed:', error)
      // Fallback to template-based generation
      return this.generateFallbackStructure(requirements)
    }
  }

  private getSystemPrompt(): string {
    return `You are an expert software architect and full-stack developer. 
Your task is to generate complete, production-ready project structures based on user requirements.

Guidelines:
1. Generate modern, scalable, and secure code
2. Follow industry best practices and patterns
3. Include proper error handling and validation
4. Implement security measures (authentication, input validation, etc.)
5. Create responsive and accessible UI components
6. Include comprehensive testing structure
7. Use TypeScript for type safety
8. Follow clean code principles
9. Include proper documentation and comments
10. Ensure code is production-ready

Output Format:
Return a JSON object with the following structure:
{
  "architecture": "Brief description of the architecture",
  "files": [
    {
      "path": "relative/file/path",
      "content": "complete file content",
      "type": "component|service|config|test|documentation"
    }
  ],
  "dependencies": ["package1", "package2"],
  "scripts": {"script-name": "script-command"},
  "environment": {"ENV_VAR": "description"}
}`
  }

  private buildPrompt(requirements: ProjectRequirements): string {
    return `Create a ${requirements.type} application with the following requirements:

Project Name: ${requirements.name}
Description: ${requirements.description}
Framework: ${requirements.framework}
Features: ${requirements.features.join(', ')}
${requirements.database ? `Database: ${requirements.database}` : ''}
${requirements.authentication ? 'Authentication: Required' : ''}
${requirements.deployment ? `Deployment: ${requirements.deployment}` : ''}

Additional Requirements:
- Use modern development practices
- Include proper error handling
- Implement security best practices
- Create responsive design
- Include unit tests
- Add comprehensive documentation
- Use TypeScript for type safety
- Include CI/CD configuration
- Follow accessibility guidelines
- Implement proper logging

Generate a complete project structure with all necessary files, configurations, and code.`
  }

  private async parseAIResponse(response: string, requirements: ProjectRequirements): Promise<AIGeneratedStructure> {
    try {
      // Extract JSON from the response (AI might include additional text)
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response')
      }

      const parsed = JSON.parse(jsonMatch[0])
      
      // Validate and enhance the response
      return {
        architecture: parsed.architecture || 'AI-generated architecture',
        files: this.enhanceGeneratedFiles(parsed.files || [], requirements),
        dependencies: this.validateDependencies(parsed.dependencies || []),
        scripts: parsed.scripts || this.getDefaultScripts(requirements),
        environment: parsed.environment || {}
      }
    } catch (error) {
      logger.error('Failed to parse AI response:', error)
      return this.generateFallbackStructure(requirements)
    }
  }

  private enhanceGeneratedFiles(files: any[], requirements: ProjectRequirements): AIGeneratedStructure['files'] {
    // Add essential files if missing
    const essentialFiles = this.getEssentialFiles(requirements)
    const existingPaths = files.map(f => f.path)
    
    for (const essential of essentialFiles) {
      if (!existingPaths.includes(essential.path)) {
        files.push(essential)
      }
    }

    return files.map(file => ({
      path: file.path,
      content: file.content || '// Generated content',
      type: file.type || 'component'
    }))
  }

  private getEssentialFiles(requirements: ProjectRequirements): Array<{ path: string; content: string; type: string }> {
    const files: Array<{ path: string; content: string; type: string }> = []

    // Package.json
    files.push({
      path: 'package.json',
      content: this.generatePackageJson(requirements),
      type: 'config'
    })

    // README.md
    files.push({
      path: 'README.md',
      content: this.generateReadme(requirements),
      type: 'documentation'
    })

    // Environment configuration
    files.push({
      path: '.env.example',
      content: this.generateEnvExample(requirements),
      type: 'config'
    })

    if (requirements.type === 'fullstack' || requirements.type === 'frontend') {
      // TypeScript config
      files.push({
        path: 'tsconfig.json',
        content: this.generateTsConfig(),
        type: 'config'
      })
    }

    return files
  }

  private generatePackageJson(requirements: ProjectRequirements): string {
    const basePackage = {
      name: requirements.name.toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      description: requirements.description,
      main: 'index.js',
      scripts: this.getDefaultScripts(requirements),
      dependencies: this.getBaseDependencies(requirements),
      devDependencies: this.getDevDependencies(requirements)
    }

    return JSON.stringify(basePackage, null, 2)
  }

  private generateReadme(requirements: ProjectRequirements): string {
    return `# ${requirements.name}

${requirements.description}

## Features
${requirements.features.map(f => `- ${f}`).join('\n')}

## Technology Stack
- Framework: ${requirements.framework}
${requirements.database ? `- Database: ${requirements.database}` : ''}
${requirements.deployment ? `- Deployment: ${requirements.deployment}` : ''}

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
\`\`\`bash
npm install
\`\`\`

### Development
\`\`\`bash
npm run dev
\`\`\`

### Build
\`\`\`bash
npm run build
\`\`\`

### Testing
\`\`\`bash
npm test
\`\`\`

## Generated by GenAI Development Platform
This project was automatically generated using AI-powered code generation.
`
  }

  private generateEnvExample(requirements: ProjectRequirements): string {
    const envVars = [
      'NODE_ENV=development',
      'PORT=3000'
    ]

    if (requirements.database) {
      envVars.push('DATABASE_URL=your_database_url_here')
    }

    if (requirements.authentication) {
      envVars.push('JWT_SECRET=your_jwt_secret_here')
    }

    if (requirements.features.includes('Email Notifications')) {
      envVars.push('SMTP_HOST=your_smtp_host')
      envVars.push('SMTP_PORT=587')
      envVars.push('SMTP_USER=your_email')
      envVars.push('SMTP_PASS=your_password')
    }

    return envVars.join('\n')
  }

  private generateTsConfig(): string {
    return `{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": [
    "src"
  ]
}`
  }

  private getDefaultScripts(requirements: ProjectRequirements): Record<string, string> {
    const scripts: Record<string, string> = {
      "start": "node index.js",
      "build": "tsc",
      "test": "jest",
      "lint": "eslint . --ext .ts,.tsx,.js,.jsx"
    }

    if (requirements.type === 'frontend' || requirements.type === 'fullstack') {
      scripts.dev = "vite"
      scripts.build = "vite build"
      scripts.preview = "vite preview"
    }

    return scripts
  }

  private getBaseDependencies(requirements: ProjectRequirements): Record<string, string> {
    const deps: Record<string, string> = {}

    if (requirements.framework.includes('react')) {
      Object.assign(deps, {
        "react": "^18.2.0",
        "react-dom": "^18.2.0"
      })
    }

    if (requirements.framework.includes('node')) {
      Object.assign(deps, {
        "express": "^4.18.2",
        "cors": "^2.8.5",
        "helmet": "^7.1.0"
      })
    }

    if (requirements.database === 'postgresql') {
      deps.pg = "^8.11.3"
    }

    if (requirements.authentication) {
      Object.assign(deps, {
        "jsonwebtoken": "^9.0.2",
        "bcryptjs": "^2.4.3"
      })
    }

    return deps
  }

  private getDevDependencies(requirements: ProjectRequirements): Record<string, string> {
    return {
      "typescript": "^5.2.2",
      "@types/node": "^20.9.0",
      "jest": "^29.7.0",
      "eslint": "^8.53.0"
    }
  }

  private validateDependencies(dependencies: string[]): string[] {
    // Filter out invalid or dangerous packages
    const validPackages = dependencies.filter(dep => 
      dep && 
      !dep.includes('..') && 
      !dep.startsWith('/') && 
      dep.length > 0
    )

    return [...new Set(validPackages)] // Remove duplicates
  }

  private generateFallbackStructure(requirements: ProjectRequirements): AIGeneratedStructure {
    logger.info('Using fallback structure generation')
    
    return {
      architecture: `Template-based ${requirements.type} application`,
      files: this.getEssentialFiles(requirements),
      dependencies: Object.keys(this.getBaseDependencies(requirements)),
      scripts: this.getDefaultScripts(requirements),
      environment: {
        NODE_ENV: 'Environment (development/production)',
        PORT: 'Application port number'
      }
    }
  }
}