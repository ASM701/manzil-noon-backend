import express from 'express'
import supabase from '../lib/supabase.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

// Get current user profile
router.get('/me', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', req.user.id)
    .single()

  if (error) return res.status(400).json({ error: error.message })

  res.json(data)
})

// Update current user profile
router.put('/me', requireAuth, async (req, res) => {
  const { full_name, phone, address } = req.body

  const { data, error } = await supabase
    .from('profiles')
    .update({ full_name, phone, address, updated_at: new Date() })
    .eq('id', req.user.id)
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })

  res.json(data)
})

export default router