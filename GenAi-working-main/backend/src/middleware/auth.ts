import { Request, Response, NextFunction } from 'express'

export const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  // Placeholder for API key validation
  // In production, implement proper API key validation
  next()
}