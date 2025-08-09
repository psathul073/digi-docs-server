import express, { json } from 'express';
import admin from '../config/firebase.js';

const router = express.Router();
const db = admin.firestore();

// Document image urls share ✅
router.get("/doc-urls", async (req, res) => {

    try {

        const { docId } = req.query;
        const querySnapshot = await db.collection('public_docs').doc(docId).get();

        if (querySnapshot.exists) {

            const docData = querySnapshot.data();
            const docURLs = docData.docFiles?.map((f) => (f.url));

            res.status(200).json({type: true, docURLs});
        }else{
            res.json({type: false, message: "Document not exists!"});
        }


    } catch (error) {
        console.log("Fetch doc urls error,", error);
        res.status(500).json({ type: false, message: "Server Error!" });
    }

});

export default router;