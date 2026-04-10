import express from 'express'
import supabase from '../lib/supabase.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

// Get user's wishlist
router.get('/', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('wishlists')
    .select('*, products(*, product_variants(*))')
    .eq('user_id', req.user.id)

  if (error) return res.status(400).json({ error: error.message })

  res.json(data)
})

// Add to wishlist
router.post('/', requireAuth, async (req, res) => {
  const { product_id, variant_label } = req.body

  const { data, error } = await supabase
    .from('wishlists')
    .insert({
      user_id: req.user.id,
      product_id,
      variant_label
    })
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })

  res.status(201).json(data)
})

// Remove from wishlist
router.delete('/', requireAuth, async (req, res) => {
  const { product_id, variant_label } = req.body

  const { error } = await supabase
    .from('wishlists')
    .delete()
    .eq('user_id', req.user.id)
    .eq('product_id', product_id)
    .eq('variant_label', variant_label)

  if (error) return res.status(400).json({ error: error.message })

  res.json({ message: 'Removed from wishlist' })
})

export default router