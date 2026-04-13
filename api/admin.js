import express from 'express'
import supabase, { supabaseAdmin } from '../lib/supabase.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

async function requireAdmin(req, res, next) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('is_admin')
    .eq('id', req.user.id)
    .single()

  if (error || !data?.is_admin) {
    return res.status(403).json({ error: 'Access denied' })
  }

  next()
}

router.get('/orders', requireAuth, requireAdmin, async (req, res) => {
  const { data: orders, error } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false })

  if (error) return res.status(400).json({ error: error.message })

  const ordersWithDetails = await Promise.all(
    orders.map(async order => {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('full_name, phone, address')
        .eq('id', order.user_id)
        .single()

      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(order.user_id)

      return {
        ...order,
        profiles: profile || {},
        email: userData?.user?.email || ''
      }
    })
  )

  res.json(ordersWithDetails)
})

router.put('/orders/:id', requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params
  const { status } = req.body

  const { data, error } = await supabaseAdmin
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })

  res.json(data)
})

router.put('/variants/:id/stock', requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params
  const { stock } = req.body

  const { data, error } = await supabaseAdmin
    .from('product_variants')
    .update({ stock })
    .eq('id', id)
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })

  res.json(data)
})

export default router