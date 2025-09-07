import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  CodeBracketIcon, 
  HomeIcon, 
  FolderIcon, 
  CubeIcon, 
  CogIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Projects', href: '/projects', icon: FolderIcon },
    { name: 'Code Generator', href: '/generator', icon: CodeBracketIcon },
    { name: 'Components', href: '/components', icon: CubeIcon },
    { name: 'Settings', href: '/settings', icon: CogIcon },
  ]

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-800">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <SparklesIcon className="w-8 h-8 text-primary-500" />
            <div>
              <h1 className="text-xl font-bold text-white">GenAI Platform</h1>
              <p className="text-sm text-gray-400">AI-Powered Development</p>
            </div>
          </div>
        </div>
        
        <nav className="px-4 pb-4">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}