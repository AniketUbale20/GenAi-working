import express from 'express'

const router = express.Router()

// Get all components
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Components endpoint',
    data: []
  })
})

export default router