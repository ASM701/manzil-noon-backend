import express from 'express'
import supabase from '../lib/supabase.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

// Create a new order
router.post('/', requireAuth, async (req, res) => {
  const { items, total } = req.body

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Order must have at least one item' })
  }

  // Create the order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: req.user.id,
      total,
      status: 'pending',
      created_at: new Date()
    })
    .select()
    .single()

  if (orderError) return res.status(400).json({ error: orderError.message })

  // Insert order items
  const orderItems = items.map(item => ({
    order_id: order.id,
    product_id: item.productId,
    product_name: item.name,
    variant_label: item.variantLabel,
    size: item.size,
    price: item.price,
    quantity: item.quantity,
    img: item.img
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (itemsError) return res.status(400).json({ error: itemsError.message })

  res.status(201).json({
    message: 'Order created successfully',
    order
  })
})

// Get all orders for current user
router.get('/', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false })

  if (error) return res.status(400).json({ error: error.message })

  res.json(data)
})

// Get a single order by id
router.get('/:id', requireAuth, async (req, res) => {
  const { id } = req.params

  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .eq('user_id', req.user.id)
    .single()

  if (error) return res.status(404).json({ error: 'Order not found' })

  res.json(data)
})

// Cancel an order
router.put('/:id/cancel', requireAuth, async (req, res) => {
  const { id } = req.params

  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .eq('user_id', req.user.id)
    .single()

  if (fetchError) return res.status(404).json({ error: 'Order not found' })

  if (order.status !== 'pending') {
    return res.status(400).json({ error: 'Only pending orders can be cancelled' })
  }

  const { data, error } = await supabase
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })

  res.json({ message: 'Order cancelled successfully', order: data })
})

export default router