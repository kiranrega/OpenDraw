import jwt from 'jsonwebtoken'

require('dotenv').config();

interface AuthRequest extends Request {
    headers: {
        [key: string]: string | undefined;
        authorization?: string;
    };
    body: {
        username: string
    }
}

interface AuthResponse extends Response {}

type NextFunction = () => void;

const jwtSecret = process.env.JWT_SCREAT

async function auth(req: AuthRequest, res: AuthResponse, next: NextFunction): Promise<void> {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 
    if (token && jwtSecret) {
        const decryptedUsername = jwt.verify(token, jwtSecret, (err, user) => {
        if (err) return res.status(403).send(); // Invalid token
        req.user = user;
        next(); 
      })
    }
}