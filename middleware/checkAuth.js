import admin from "../config/firebase.js";

// Middleware to check Firebase Auth token.
const checkAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization || '';

    const token = authHeader.split('Bearer ')[1];

    if (!token) return res.status(401).send('No token');

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Token error:', error);
        return res.status(401).send('Invalid token');
    }

};

export default checkAuth