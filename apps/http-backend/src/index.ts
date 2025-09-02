import express, { json } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { CreateSchema, SignInSchema } from '@repo/common/types'
import { prismaClient } from '@repo/db/client'
require('dotenv').config();

const app = express()
app.use(json())

app.post('/signup', async (req, res) => {
    const {username, password, email} = req.body

    const validations = CreateSchema.safeParse({ username, password, email });

    if (!validations.success) {
        res.send({
            message: "Incorrect format",
            error: validations.error.issues && validations.error.issues[0] && validations.error.issues[0].message
        })
    } else {
         const hashedPassword = await bcrypt.hash(password, 10)
         const User = prismaClient.user.create({
                data :{
                name: username,
                email,
                password: hashedPassword,
                photo: ""
            }
         })

            /* store in DB the obj 
                {
                    username,
                    password: hashedPassword,
                    email
                } 
            */
    }
})

app.post('/signin', async (req, res) => {
    const {email, password} = req.body  

     const validations = SignInSchema.safeParse({ email, password });

    if (!validations.success) {
        res.send({
            message: "Incorrect format",
            error: validations.error.issues && validations.error.issues[0] && validations.error.issues[0].message
        })
    } else {
    const matchedPassword = await bcrypt.compare(password, 'encryptedpassword')
    if (matchedPassword) {
        const jwtSecret = process.env.JWT_SCREAT
        if (!jwtSecret) {
            return res.status(500).json({ error: 'JWT secret not configured' })
        }
        
        const token = jwt.sign({
            email
        }, jwtSecret)
        
        res.json({ token })
    } else {
        res.status(401).json({ error: 'Invalid credentials' })
    }
    }
})

app.post('/room', (req, res) => {
    const {username, password} = req.body  
})


app.listen(3001)