import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import productRoutes from './api/products.js'
import authRoutes from './api/auth.js'
import orderRoutes from './api/orders.js'
import userRoutes from './api/users.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

// Routes
app.use('/api/products', productRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/users', userRoutes)

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Manzil Noon API is running' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app