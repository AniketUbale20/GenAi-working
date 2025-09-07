import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { 
  SparklesIcon, 
  PlayIcon, 
  DocumentDownloadIcon,
  EyeIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline'
import { Monaco } from '@monaco-editor/react'

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

export const CodeGeneratorPage: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCode, setGeneratedCode] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'requirements' | 'code' | 'preview'>('requirements')
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ProjectRequirements>({
    defaultValues: {
      type: 'fullstack',
      framework: 'react-node',
      features: [],
      authentication: false
    }
  })

  const projectType = watch('type')

  const frameworks = {
    fullstack: [
      { value: 'react-node', label: 'React + Node.js + Express' },
      { value: 'next-prisma', label: 'Next.js + Prisma + PostgreSQL' },
      { value: 'vue-laravel', label: 'Vue.js + Laravel + MySQL' }
    ],
    frontend: [
      { value: 'react-ts', label: 'React + TypeScript' },
      { value: 'vue-ts', label: 'Vue.js + TypeScript' },
      { value: 'angular', label: 'Angular' }
    ],
    backend: [
      { value: 'node-express', label: 'Node.js + Express' },
      { value: 'python-flask', label: 'Python + Flask' },
      { value: 'java-spring', label: 'Java + Spring Boot' }
    ]
  }

  const availableFeatures = [
    'User Authentication',
    'Database Integration',
    'REST API',
    'Real-time Chat',
    'File Upload',
    'Email Notifications',
    'Payment Integration',
    'Search Functionality',
    'Admin Dashboard',
    'Mobile Responsive'
  ]

  const onSubmit = async (data: ProjectRequirements) => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to generate code')
      }

      const result = await response.json()
      setGeneratedCode(result.code)
      setActiveTab('code')
      toast.success('Code generated successfully!')
    } catch (error) {
      toast.error('Failed to generate code. Please try again.')
      console.error('Code generation error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadCode = () => {
    const blob = new Blob([generatedCode], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'generated-project.zip'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">AI Code Generator</h1>
          <p className="text-gray-400 mt-2">
            Transform your project requirements into production-ready code
          </p>
        </div>
        {generatedCode && (
          <button onClick={downloadCode} className="btn-secondary">
            <DocumentDownloadIcon className="w-5 h-5" />
            Download Project
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('requirements')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'requirements'
              ? 'bg-primary-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Requirements
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'code'
              ? 'bg-primary-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Generated Code
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'preview'
              ? 'bg-primary-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Preview
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-gray-900 rounded-lg p-6">
        {activeTab === 'requirements' && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Project Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Project Name
                </label>
                <input
                  {...register('name', { required: 'Project name is required' })}
                  className="input-field w-full"
                  placeholder="My Awesome App"
                />
                {errors.name && (
                  <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Project Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Project Type
                </label>
                <select {...register('type')} className="input-field w-full">
                  <option value="fullstack">Full-Stack Application</option>
                  <option value="frontend">Frontend Only</option>
                  <option value="backend">Backend API</option>
                  <option value="component">Component Library</option>
                </select>
              </div>
            </div>

            {/* Project Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Project Description
              </label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                rows={4}
                className="input-field w-full"
                placeholder="Describe your project requirements in detail..."
              />
              {errors.description && (
                <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            {/* Framework Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Technology Stack
              </label>
              <select {...register('framework')} className="input-field w-full">
                {frameworks[projectType]?.map((fw) => (
                  <option key={fw.value} value={fw.value}>
                    {fw.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Features (Select all that apply)
              </label>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {availableFeatures.map((feature) => (
                  <label key={feature} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      value={feature}
                      {...register('features')}
                      className="h-4 w-4 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500"
                    />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Additional Options */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Database (Optional)
                </label>
                <select {...register('database')} className="input-field w-full">
                  <option value="">None</option>
                  <option value="postgresql">PostgreSQL</option>
                  <option value="mysql">MySQL</option>
                  <option value="mongodb">MongoDB</option>
                  <option value="sqlite">SQLite</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Deployment Platform
                </label>
                <select {...register('deployment')} className="input-field w-full">
                  <option value="">None</option>
                  <option value="vercel">Vercel</option>
                  <option value="netlify">Netlify</option>
                  <option value="aws">AWS</option>
                  <option value="heroku">Heroku</option>
                  <option value="docker">Docker</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                disabled={isGenerating}
                className="btn-primary min-w-[200px] justify-center"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    Generating...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-5 h-5" />
                    Generate Code
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'code' && (
          <div className="space-y-4">
            {generatedCode ? (
              <div className="h-96 border border-gray-700 rounded-lg overflow-hidden">
                <Monaco
                  height="100%"
                  defaultLanguage="typescript"
                  value={generatedCode}
                  theme="vs-dark"
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                  }}
                />
              </div>
            ) : (
              <div className="text-center py-12">
                <CodeBracketIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">
                  No code generated yet. Fill out the requirements and click "Generate Code".
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="space-y-4">
            <div className="text-center py-12">
              <EyeIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">
                Live preview will be available once code is generated.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}