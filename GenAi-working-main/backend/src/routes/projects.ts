import express from 'express'

const router = express.Router()

// Get all projects
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Projects endpoint',
    data: []
  })
})

export default router