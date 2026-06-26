import express from 'express'
import supabase, { supabaseAdmin } from '../lib/supabase.js'

const router = express.Router()

// Get all products
router.get('/', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*, product_variants(*, product_variant_sizes(*))')
    .order('created_at', { ascending: false })

  if (error) return res.status(400).json({ error: error.message })

  res.json(data)
})

// Get single product by id
router.get('/:id', async (req, res) => {
  const { id } = req.params

  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*, product_variants(*, product_variant_sizes(*))')
    .eq('id', id)
    .single()

  if (error) return res.status(404).json({ error: 'Product not found' })

  res.json(data)
})

export default router