import React from 'react'
import { Link } from 'react-router-dom'
import { 
  RocketLaunchIcon, 
  CodeBracketIcon, 
  CubeIcon,
  ChartBarIcon,
  ClockIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

export const HomePage: React.FC = () => {
  const stats = [
    { name: 'Projects Created', value: '12', icon: ChartBarIcon },
    { name: 'Code Generated', value: '1.2K', icon: CodeBracketIcon },
    { name: 'Components Built', value: '45', icon: CubeIcon },
    { name: 'Time Saved', value: '120h', icon: ClockIcon },
  ]

  const recentProjects = [
    { name: 'E-commerce Dashboard', type: 'React + Node.js', lastModified: '2 hours ago' },
    { name: 'Blog Platform', type: 'Next.js + Prisma', lastModified: '1 day ago' },
    { name: 'API Gateway', type: 'Express + TypeScript', lastModified: '3 days ago' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Welcome to GenAI Platform</h1>
          <p className="text-gray-400 mt-2">
            Transform your ideas into functional code with AI-powered development
          </p>
        </div>
        <Link to="/generator" className="btn-primary">
          <SparklesIcon className="w-5 h-5" />
          Start Creating
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{stat.name}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <div className="p-3 bg-primary-600 rounded-lg">
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Projects */}
        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Projects</h2>
          <div className="space-y-3">
            {recentProjects.map((project, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div>
                  <h3 className="text-white font-medium">{project.name}</h3>
                  <p className="text-gray-400 text-sm">{project.type}</p>
                </div>
                <span className="text-gray-400 text-sm">{project.lastModified}</span>
              </div>
            ))}
          </div>
          <Link to="/projects" className="block mt-4 text-primary-400 hover:text-primary-300 text-sm">
            View all projects →
          </Link>
        </div>

        {/* Quick Start */}
        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Start</h2>
          <div className="space-y-3">
            <Link to="/generator" className="block p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <RocketLaunchIcon className="w-6 h-6 text-primary-400" />
                <div>
                  <h3 className="text-white font-medium">Generate New Project</h3>
                  <p className="text-gray-400 text-sm">Create a full-stack application from requirements</p>
                </div>
              </div>
            </Link>
            <Link to="/components" className="block p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <CubeIcon className="w-6 h-6 text-primary-400" />
                <div>
                  <h3 className="text-white font-medium">Browse Components</h3>
                  <p className="text-gray-400 text-sm">Explore our LCNC component library</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}