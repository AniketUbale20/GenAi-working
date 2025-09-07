import { logger } from '../utils/logger'

export class SecurityScanner {
  private dangerousPatterns: RegExp[] = [
    /eval\s*\(/gi,
    /Function\s*\(/gi,
    /document\.write/gi,
    /innerHTML\s*=(?!=)/gi,
    /\.exec\s*\(/gi,
    /child_process/gi,
    /fs\.unlink/gi,
    /process\.exit/gi,
    /__proto__/gi,
    /constructor\.constructor/gi
  ]

  private sqlInjectionPatterns: RegExp[] = [
    /(?:;\s*(?:DROP|DELETE|INSERT|UPDATE|ALTER)\s+)/gi,
    /(?:UNION\s+SELECT)/gi,
    /'(?:\s*OR\s*'\w*'\s*=\s*'\w*')/gi,
    /(?:--|\#|\/\*)/g
  ]

  async scanAndFix(content: string, filePath: string): Promise<string> {
    logger.debug(`Scanning file: ${filePath}`)

    let secureContent = content

    // Check for dangerous patterns
    for (const pattern of this.dangerousPatterns) {
      if (pattern.test(content)) {
        logger.warn(`Dangerous pattern detected in ${filePath}: ${pattern}`)
        // Add security comment but don't remove (might be legitimate)
        secureContent = this.addSecurityComment(secureContent, pattern.toString())
      }
    }

    // Check for SQL injection patterns
    for (const pattern of this.sqlInjectionPatterns) {
      if (pattern.test(content)) {
        logger.warn(`Potential SQL injection pattern in ${filePath}: ${pattern}`)
        secureContent = this.addSecurityComment(secureContent, `SQL Injection risk: ${pattern.toString()}`)
      }
    }

    // Add input validation for API endpoints
    if (filePath.includes('route') || filePath.includes('controller')) {
      secureContent = this.addInputValidation(secureContent)
    }

    // Add CORS and security headers for Express apps
    if (filePath.includes('index.ts') && secureContent.includes('express')) {
      secureContent = this.addSecurityHeaders(secureContent)
    }

    return secureContent
  }

  private addSecurityComment(content: string, warning: string): string {
    const comment = `// SECURITY WARNING: ${warning}\n// Please review this code for security implications\n`
    return comment + content
  }

  private addInputValidation(content: string): string {
    // Add basic input validation if not present
    if (!content.includes('express-validator') && !content.includes('joi')) {
      const validationComment = `
// TODO: Add input validation using express-validator or joi
// Example: body('email').isEmail().normalizeEmail()
`
      return validationComment + content
    }
    return content
  }

  private addSecurityHeaders(content: string): string {
    if (!content.includes('helmet')) {
      const securityHeaders = `
// Security headers middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}))
`
      return content.replace('app.use(helmet())', securityHeaders)
    }
    return content
  }
}