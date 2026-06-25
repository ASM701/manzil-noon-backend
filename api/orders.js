import express from 'express'
import supabase, { supabaseAdmin } from '../lib/supabase.js'
import { requireAuth } from '../middleware/auth.js'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const router = express.Router()

// Create a new order
router.post('/', requireAuth, async (req, res) => {
  const { items, total } = req.body

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Order must have at least one item' })
  }

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

  const orderItems = items.map(item => ({
    order_id: order.id,
    product_id: item.productId,
    product_name: item.name,
    variant_label: item.variantLabel,
    size: item.size,
    price: item.price,
    quantity: item.quantity,
    img: item.img,
    is_gift: item.isGift || false
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (itemsError) return res.status(400).json({ error: itemsError.message })

  // Decrease stock for each ordered variant
  for (const item of items) {
    const { data: variant } = await supabaseAdmin
      .from('product_variants')
      .select('stock')
      .eq('product_id', item.productId)
      .eq('label', item.variantLabel)
      .single()

    if (variant) {
      const newStock = Math.max(0, variant.stock - item.quantity)
      await supabaseAdmin
        .from('product_variants')
        .update({ stock: newStock })
        .eq('product_id', item.productId)
        .eq('label', item.variantLabel)
    }
  }

  // Decrease size stock if applicable
  // Decrease variant size stock if applicable
  for (const item of items) {
    if (item.size) {
      const { data: variantData } = await supabaseAdmin
        .from('product_variants')
        .select('id')
        .eq('product_id', item.productId)
        .eq('label', item.variantLabel)
        .single()

      if (variantData) {
        const { data: sizeData } = await supabaseAdmin
          .from('product_variant_sizes')
          .select('stock')
          .eq('variant_id', variantData.id)
          .eq('label', item.size)
          .single()

        if (sizeData) {
          const newStock = Math.max(0, sizeData.stock - item.quantity)
          await supabaseAdmin
            .from('product_variant_sizes')
            .update({ stock: newStock })
            .eq('variant_id', variantData.id)
            .eq('label', item.size)
        }
      }
    }
  }

  // Send email notification
  try {
    await resend.emails.send({
      from: 'Manzil Noon <onboarding@resend.dev>',
      to: 'Manzilnoon@hotmail.com',
      subject: `🛍️ New Order Received!`,
      html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16166B;">New Order Received — منزل نون</h2>
        <p style="color: #5a5a7a; font-size: 14px;">A new order has been placed on Manzil Noon.</p>

        <div style="background: #F5F0E6; padding: 16px; margin: 20px 0;">
          <p style="margin: 0 0 8px; font-size: 13px; color: #5a5a7a;">ORDER ID</p>
          <p style="margin: 0; font-size: 14px; font-weight: bold;">#${order.id.slice(0, 8).toUpperCase()}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px 0; color: #5a5a7a; font-size: 14px; width: 40%;">Total</td>
            <td style="padding: 8px 0; font-size: 14px;">KD ${Number(total).toFixed(3)}</td>
          </tr>
        </table>

        <h3 style="color: #16166B; margin-bottom: 12px;">Items Ordered</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${items.map(item => `
            <tr style="border-bottom: 1px solid #E8DDD0;">
              <td style="padding: 12px 0;">
                <p style="margin: 0 0 4px; font-size: 14px; font-weight: 500;">${item.name}</p>
                <p style="margin: 0; font-size: 12px; color: #5a5a7a;">
                  ${item.variantLabel}
                  ${item.size ? `· ${item.size}` : ''}
                  ${item.isGift ? '· 🎁 Gift Wrapped' : ''}
                  · Qty ${item.quantity}
                </p>
              </td>
              <td style="padding: 12px 0; text-align: right; font-size: 14px;">${item.price}</td>
            </tr>
          `).join('')}
        </table>

        <div style="margin-top: 24px; padding: 16px; background: #F5F0E6;">
          <p style="margin: 0 0 8px; font-size: 13px; color: #5a5a7a;">NEXT STEP</p>
          <p style="margin: 0; font-size: 14px;">Log in to the admin dashboard to confirm this order and update its status.</p>
        </div>

        <p style="margin-top: 20px; font-size: 12px; color: #C4AE96;">
          Manzil Noon — منزل نون
        </p>
      </div>
    `
    })
  } catch (emailErr) {
    console.error('Failed to send order notification email:', emailErr)
  }

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