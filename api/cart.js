import express from 'express'
import supabase from '../lib/supabase.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

// Get user's cart
router.get('/', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('carts')
    .select('*, products(*, product_variants(*))')
    .eq('user_id', req.user.id)

  if (error) return res.status(400).json({ error: error.message })

  res.json(data)
})

// Add to cart
router.post('/', requireAuth, async (req, res) => {
  const { product_id, variant_label, size, quantity } = req.body

  const { data: existing } = await supabase
    .from('carts')
    .select('*')
    .eq('user_id', req.user.id)
    .eq('product_id', product_id)
    .eq('variant_label', variant_label)
    .eq('size', size || '')
    .single()

  if (existing) {
    const { data, error } = await supabase
      .from('carts')
      .update({ quantity: existing.quantity + (quantity || 1) })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) return res.status(400).json({ error: error.message })
    return res.json(data)
  }

  const { data, error } = await supabase
    .from('carts')
    .insert({
      user_id: req.user.id,
      product_id,
      variant_label,
      size: size || '',
      quantity: quantity || 1
    })
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })

  res.status(201).json(data)
})

// Update quantity
router.put('/:id', requireAuth, async (req, res) => {
  const { id } = req.params
  const { quantity } = req.body

  if (quantity <= 0) {
    const { error } = await supabase
      .from('carts')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id)

    if (error) return res.status(400).json({ error: error.message })
    return res.json({ message: 'Item removed' })
  }

  const { data, error } = await supabase
    .from('carts')
    .update({ quantity })
    .eq('id', id)
    .eq('user_id', req.user.id)
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })

  res.json(data)
})

// Remove from cart
router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params

  const { error } = await supabase
    .from('carts')
    .delete()
    .eq('id', id)
    .eq('user_id', req.user.id)

  if (error) return res.status(400).json({ error: error.message })

  res.json({ message: 'Removed from cart' })
})

// Clear cart
router.delete('/', requireAuth, async (req, res) => {
  const { error } = await supabase
    .from('carts')
    .delete()
    .eq('user_id', req.user.id)

  if (error) return res.status(400).json({ error: error.message })

  res.json({ message: 'Cart cleared' })
})

export default router