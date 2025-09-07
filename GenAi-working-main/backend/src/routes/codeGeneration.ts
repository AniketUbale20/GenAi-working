import express from 'express'
import { body, validationResult } from 'express-validator'
import { CodeGenerationController } from '../controllers/CodeGenerationController'
import { asyncHandler } from '../utils/asyncHandler'

const router = express.Router()
const codeGenController = new CodeGenerationController()

// Validation middleware for code generation request
const validateCodeGenRequest = [
  body('name').notEmpty().withMessage('Project name is required'),
  body('description').notEmpty().withMessage('Project description is required'),
  body('type').isIn(['fullstack', 'frontend', 'backend', 'api', 'component']).withMessage('Invalid project type'),
  body('framework').notEmpty().withMessage('Framework is required'),
  body('features').isArray().withMessage('Features must be an array'),
]

// Generate code endpoint
router.post('/', validateCodeGenRequest, asyncHandler(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    })
  }

  const result = await codeGenController.generateCode(req.body)
  
  res.status(200).json({
    success: true,
    message: 'Code generated successfully',
    data: result
  })
}))

// Get generation status
router.get('/status/:jobId', asyncHandler(async (req, res) => {
  const { jobId } = req.params
  const status = await codeGenController.getGenerationStatus(jobId)
  
  res.status(200).json({
    success: true,
    data: status
  })
}))

// Download generated project
router.get('/download/:projectId', asyncHandler(async (req, res) => {
  const { projectId } = req.params
  const projectPath = await codeGenController.getProjectDownload(projectId)
  
  res.download(projectPath, `${projectId}.zip`)
}))

export default router