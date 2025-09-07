import { AICodeGenerator } from '../services/AICodeGenerator'
import { ProjectBuilder } from '../services/ProjectBuilder'
import { TemplateManager } from '../services/TemplateManager'
import { logger } from '../utils/logger'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import fs from 'fs-extra'

interface ProjectRequirements {
  name: string
  description: string
  type: 'fullstack' | 'frontend' | 'backend' | 'api' | 'component'
  framework: string
  features: string[]
  database?: string
  authentication?: boolean
  deployment?: string
}

interface GenerationResult {
  projectId: string
  code: string
  files: Array<{
    path: string
    content: string
  }>
  downloadUrl: string
}

export class CodeGenerationController {
  private aiGenerator: AICodeGenerator
  private projectBuilder: ProjectBuilder
  private templateManager: TemplateManager

  constructor() {
    this.aiGenerator = new AICodeGenerator()
    this.projectBuilder = new ProjectBuilder()
    this.templateManager = new TemplateManager()
  }

  async generateCode(requirements: ProjectRequirements): Promise<GenerationResult> {
    const projectId = uuidv4()
    logger.info(`Starting code generation for project: ${projectId}`)

    try {
      // Step 1: Generate AI-powered code structure
      const aiResult = await this.aiGenerator.generateProjectStructure(requirements)
      
      // Step 2: Build project files using templates
      const projectFiles = await this.projectBuilder.buildProject({
        projectId,
        requirements,
        aiGeneratedStructure: aiResult
      })

      // Step 3: Apply security and best practices
      const secureCode = await this.projectBuilder.applySecurity(projectFiles)

      // Step 4: Create downloadable package
      const projectPath = await this.createDownloadableProject(projectId, secureCode)

      // Step 5: Generate main code preview
      const mainCode = this.generateCodePreview(secureCode)

      logger.info(`Code generation completed for project: ${projectId}`)

      return {
        projectId,
        code: mainCode,
        files: secureCode,
        downloadUrl: `/api/generate-code/download/${projectId}`
      }
    } catch (error) {
      logger.error(`Code generation failed for project ${projectId}:`, error)
      throw new Error('Code generation failed. Please try again.')
    }
  }

  async getGenerationStatus(jobId: string) {
    // This would typically check a job queue or database
    // For now, return a mock status
    return {
      jobId,
      status: 'completed',
      progress: 100,
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString()
    }
  }

  async getProjectDownload(projectId: string): Promise<string> {
    const projectPath = path.join(process.cwd(), 'generated_projects', `${projectId}.zip`)
    
    if (!await fs.pathExists(projectPath)) {
      throw new Error('Project not found')
    }

    return projectPath
  }

  private async createDownloadableProject(projectId: string, files: Array<{ path: string; content: string }>): Promise<string> {
    const projectDir = path.join(process.cwd(), 'generated_projects', projectId)
    const zipPath = path.join(process.cwd(), 'generated_projects', `${projectId}.zip`)

    // Ensure directories exist
    await fs.ensureDir(path.dirname(zipPath))
    await fs.ensureDir(projectDir)

    // Write all files to temporary directory
    for (const file of files) {
      const filePath = path.join(projectDir, file.path)
      await fs.ensureDir(path.dirname(filePath))
      await fs.writeFile(filePath, file.content, 'utf8')
    }

    // Create ZIP archive
    const archiver = require('archiver')
    const output = fs.createWriteStream(zipPath)
    const archive = archiver('zip', { zlib: { level: 9 } })

    return new Promise((resolve, reject) => {
      output.on('close', () => {
        // Clean up temporary directory
        fs.remove(projectDir).catch(console.error)
        resolve(zipPath)
      })

      archive.on('error', reject)
      archive.pipe(output)
      archive.directory(projectDir, false)
      archive.finalize()
    })
  }

  private generateCodePreview(files: Array<{ path: string; content: string }>): string {
    // Find the main entry file to display as preview
    const mainFiles = ['src/App.tsx', 'src/index.ts', 'app.js', 'index.js', 'main.py']
    
    for (const mainFile of mainFiles) {
      const file = files.find(f => f.path.includes(mainFile))
      if (file) {
        return file.content
      }
    }

    // If no main file found, return the first code file
    const codeFile = files.find(f => 
      f.path.endsWith('.ts') || 
      f.path.endsWith('.tsx') || 
      f.path.endsWith('.js') || 
      f.path.endsWith('.jsx')
    )

    return codeFile ? codeFile.content : '// Generated project files'
  }
}