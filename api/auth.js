import express from 'express'
import supabase from '../lib/supabase.js'

const router = express.Router()

// Register
router.post('/register', async (req, res) => {
  const { email, password, full_name } = req.body

  if (!email || !password || !full_name) {
    return res.status(400).json({ error: 'Email, password and full name are required' })
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name }
    }
  })

  if (error) return res.status(400).json({ error: error.message })

  res.status(201).json({
    message: 'Registration successful — please check your email to confirm your account',
    user: data.user
  })
})

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) return res.status(401).json({ error: error.message })

  res.json({
    message: 'Login successful',
    user: data.user,
    session: data.session
  })
})

// Logout
router.post('/logout', async (req, res) => {
  const { error } = await supabase.auth.signOut()
  if (error) return res.status(400).json({ error: error.message })
  res.json({ message: 'Logged out successfully' })
})

export default router