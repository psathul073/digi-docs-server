import express from 'express';
import cors from 'cors';
import env from 'dotenv';
import checkAuth from './middleware/checkAuth.js';
import privateRoute from './routes/privateRoute.js';
import publicRoute from './routes/publicRoute.js';

const app = express();
const PORT = 5000;
env.config();

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true, // To send cookies
}));

app.use(express.json()); // Parses incoming JSON requests.
app.set('trust proxy', 1); // Important for Render working.

app.use('/user', checkAuth, privateRoute);

app.use('/public-user', publicRoute);


app.listen(PORT, () => console.log(`Server is running on ${PORT} ✅`));