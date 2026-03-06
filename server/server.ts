import express from "express"
import cors from "cors"
import mercadopago from "mercadopago"

const app = express()
app.use(cors())
app.use(express.json())

mercadopago.configure({
  access_token: "APP_USR-3209827620189845"
})

app.post("/create-payment", async (req, res) => {
  try {
    const payment = await mercadopago.preferences.create({
      items: [
        {
          title: "Pedido",
          quantity: 1,
          unit_price: 50
        }
      ]
    })

    res.json({ id: payment.body.id })
  } catch (error) {
    res.status(500).json({ error })
  }
})

app.listen(3001, () => {
  console.log("Servidor rodando na porta 3001")
})
