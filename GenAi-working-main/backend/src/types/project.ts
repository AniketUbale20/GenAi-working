export interface ProjectRequirements {
  name: string
  description: string
  type: 'fullstack' | 'frontend' | 'backend' | 'api' | 'component'
  framework: string
  features: string[]
  database?: string
  authentication?: boolean
  deployment?: string
}