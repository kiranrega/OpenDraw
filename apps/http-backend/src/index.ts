import express, { json } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

require('dotenv').config();

const app = express()
app.use(json())

app.post('/signup', (req, res) => {
    const {username, password, email} = req.body

    const hashedPassword = bcrypt.hash(password, 10)

    /* store in DB the obj 
        {
            username,
            password: hashedPassword,
            email
        } 
    */
})

app.post('/signin', async (req, res) => {
    const {username, password} = req.body  

    const matchedPassword = await bcrypt.compare(password, 'encryptedpassword')
    if (matchedPassword) {
        const jwtSecret = process.env.JWT_SCREAT
        if (!jwtSecret) {
            return res.status(500).json({ error: 'JWT secret not configured' })
        }
        
        const token = jwt.sign({
            username
        }, jwtSecret)
        
        res.json({ token })
    } else {
        res.status(401).json({ error: 'Invalid credentials' })
    }
})

app.post('/createroom', (req, res) => {
    const {username, password} = req.body  
})


app.listen(3001)