import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { ProjectsPage } from './pages/ProjectsPage'
import { CodeGeneratorPage } from './pages/CodeGeneratorPage'
import { ComponentLibraryPage } from './pages/ComponentLibraryPage'
import { SettingsPage } from './pages/SettingsPage'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/generator" element={<CodeGeneratorPage />} />
        <Route path="/components" element={<ComponentLibraryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Layout>
  )
}

export default App