import type { Request, Response, NextFunction } from 'express'
import { supabase } from '../lib/supabase.js'
import type { UserSession } from '../lib/types.js'

export interface AuthRequest extends Request {
  user?: UserSession
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ ok: false, error: 'Missing token' })
    return
  }

  const token = header.slice(7)

  try {
    // Let Supabase securely verify the JWT
    // This avoids having to parse ES256 JWKs or manage JWT secrets manually
    const { data, error } = await supabase.auth.getUser(token)
    
    if (error || !data.user) {
      console.error('Supabase token verification error:', error)
      res.status(401).json({ ok: false, error: 'Invalid token' })
      return
    }
    
    req.user = {
      userId: data.user.id,
      email: data.user.email!,
      iat: 0, // Placeholder as Supabase API abstracts token parsing
      exp: 0,
    }
    
    next()
  } catch (err) {
    console.error('Unexpected auth error:', err)
    res.status(401).json({ ok: false, error: 'Invalid token' })
  }
}
