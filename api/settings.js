import express from 'express'
import supabase from '../lib/supabase.js'

const router = express.Router()

router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')

  if (error) return res.status(400).json({ error: error.message })

  const settings = {}
  data.forEach(row => {
    settings[row.key] = row.value
  })

  res.json(settings)
})

export default router