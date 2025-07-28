import express, { json } from 'express'

const app = express()
app.use(json())

app.get('/login', (req, res) => {
    res.send({message: "Login Sucessful"})
})

app.listen(3001)