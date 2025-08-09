import express, { json } from 'express';
import admin from '../config/firebase.js';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

const router = express.Router();
const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true }); // To prevents firestore undefined situation.

// Multer setup for temp memory storage.
const fileUpload = multer({ dest: 'temp/files' });

// Add documents ✅
router.post("/add-doc", fileUpload.any(), async (req, res) => {
    try {

        const uid = req.user.uid;
        const { docName } = req.body;

        // Check user already upload this doc.
        const docQuery = await db.collection("private_docs").where("userId", "==", uid).where("docName", "==", docName).get()

        // If no upload doc.
        if (docQuery.empty) {

            let docFiles;

            // Cloudinary uploads...
            const uploadPromises = req.files.map(async (file) => {

                const result = await cloudinary.uploader.upload(file.path, { folder: "docImages" });

                // Delete temp file.
                try { fs.unlinkSync(file.path); }
                catch (err) { console.error("File delete failed:", err); }

                // Upload file data...
                return {
                    public_id: result.public_id,
                    url: result.secure_url,
                    fieldname: file.fieldname,
                };

            });

            try {
                const uploadedFiles = await Promise.all(uploadPromises);
                console.log("Cloudinary file uploaded ✅");
                docFiles = uploadedFiles; // Add files array.

            } catch (error) {
                console.error("Cloudinary file upload error:", err);
            };

            // Upload data.
            await db.collection("private_docs").add({
                userId: uid,
                docName,
                docFiles,
                isPublic: false,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            res.status(200).json({ type: true, message: "Upload Successful!" })

        } else {
            res.json({ type: true, message: "Document is already added!" });
        }

    } catch (error) {
        console.log("Add doc error,", error);
        res.status(500).json({ type: false, message: "Server Error!" })
    }
});

// Fetch all documents ✅
router.get('/all-docs', async (req, res) => {
    try {
        const { limit = 10, lastCreatedAt, lastDocName, search = '' } = req.query;
        const uid = req.user.uid;

        let queryRef = db.collection('private_docs')
            .where('userId', '==', uid)
            .orderBy('docName')
            .orderBy('createdAt', 'desc')
            .limit(Number(limit));

        if (search) {
            queryRef = queryRef
                .where('docName', '>=', search)
                .where('docName', '<=', search + '\uf8ff');
        }

        if (lastCreatedAt && lastDocName) {
            const lastTimestamp = admin.firestore.Timestamp.fromMillis(Number(lastCreatedAt));
            queryRef = queryRef.startAfter(lastDocName, lastTimestamp);
        }

        const snapshot = await queryRef.get();

        const docs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        const lastVisible = snapshot.docs[snapshot.docs.length - 1];

        res.json({
            docs,
            nextCursor: lastVisible
                ? {
                    createdAt: lastVisible.data().createdAt.toMillis(),
                    docName: lastVisible.data().docName
                }
                : null,
            hasMore: snapshot.docs.length === Number(limit),
        });


    } catch (error) {
        console.log("Fetch all docs error,", error);
        res.status(500).json({ type: false, message: "Server Error!" });
    }

});

// Document to public ✅
router.post("/doc-to-public", async (req, res) => {
    try {
        const { docId } = req.query;
        const uid = req.user?.uid;

        if (!docId || !uid) {
            return res.status(400).json({ type: false, message: "Missing docId or user ID." });
        }

        const privateDocSnapshot = await db.collection('private_docs').doc(docId).get();
        const publicDocSnapshot = await db.collection('public_docs').doc(docId).get();

        if (privateDocSnapshot.exists && !publicDocSnapshot.exists) {
            const privateDoc = privateDocSnapshot.data();

            if (privateDoc.userId !== uid) {
                return res.json({ type: false, message: "You can only share your own documents." });
            }

            await db.collection('private_docs').doc(docId).set({ isPublic: true }, { merge: true });

            await db.collection('public_docs').doc(docId).set({
                ...privateDoc,
                sharedAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            return res.status(200).json({ type: true, message: "Document shared publicly!" });

        } else {
            return res.json({ type: true, message: "Already shared to public!" });
        }

    } catch (error) {
        console.log("Doc to public error,", error);
        return res.status(500).json({ type: false, message: "Server Error!" });
    }

});

// Document to private ✅
router.patch("/doc-to-private", async (req, res) => {
    try {
        const { docId } = req.query;
        const uid = req.user?.uid;

        if (!docId || !uid) {
            return res.status(400).json({ type: false, message: "Missing docId or user UID." });
        }

        const publicDocSnapshot = await db.collection('public_docs').doc(docId).get();

        if (!publicDocSnapshot.exists) {
            return res.json({ type: true, message: "No document exists!" });
        }

        const publicDoc = publicDocSnapshot.data();

        if (publicDoc.userId !== uid) {
            return res.json({ type: false, message: "You can only make your own documents private." });
        }

        await db.collection('private_docs').doc(docId).set({ isPublic: false }, { merge: true });
        await db.collection('public_docs').doc(docId).delete();

        return res.status(200).json({ type: true, message: "The document is now private." });

    } catch (error) {
        console.log("Doc to private error,", error);
        return res.status(500).json({ type: false, message: "Server Error!" });
    }

});

// Document update ✅
router.post("/doc-update", fileUpload.any(), async (req, res) => {
    try {

        const { docId } = req.query;
        const { docName } = req.body;
        const uid = req.user.uid;

        const docRef = db.collection("private_docs").doc(docId);
        const docSnapshot = await docRef.get();
        const copyDocRef = db.collection("public_docs").doc(docId);
        const copyDocSnapshot = await copyDocRef.get();

        // User validate.
        if (
            (docSnapshot.exists && docSnapshot.data().userId !== uid) &&
            (copyDocSnapshot.exists && copyDocSnapshot.data().userId !== uid)
        ) {
            req.files.forEach((file) => {
                try { fs.unlinkSync(file.path); }
                catch (err) { console.error("File delete failed:", err); }
            });

            return res.json({ type: false, message: "You can only update your own documents!" });
        }

        // Remove Cloudinary old doc images.
        await Promise.all(
            docSnapshot.data().docFiles.map(async (file) => {
                try {
                    if (file?.public_id) {
                        await cloudinary.uploader.destroy(file.public_id);
                        console.log(`✅ Deleted: ${file.public_id}`);
                    } else {
                        console.warn("⚠️ Skipped: Missing public_id in file", file);
                    }
                } catch (err) {
                    console.error(`❌ Failed to delete ${file?.public_id}:`, err.message);
                }
            })
        );

        // Upload new doc images.
        let docFiles;
        // Cloudinary uploads...
        const uploadPromises = req.files.map(async (file) => {

            const result = await cloudinary.uploader.upload(file.path, { folder: "docImages" });
            // Delete temp file.
            fs.unlinkSync(file.path);

            // Upload file data...
            return {
                public_id: result.public_id,
                url: result.secure_url,
                fieldname: file.fieldname,
            };

        });

        try {
            const uploadedFiles = await Promise.all(uploadPromises);
            console.log("Cloudinary new image uploaded ✅");
            docFiles = uploadedFiles; // Add files array.

        } catch (error) {
            console.error("Cloudinary image upload error:", err);
        };

        // Update private doc.
        await docRef.update({
            docName,
            docFiles,
        });

        // Update public doc if exists.
        if (copyDocSnapshot.exists) {
            copyDocRef.update({
                docName,
                docFiles,
            })
        }

        res.status(200).json({ type: true, message: "Document update successful !" });


    } catch (error) {
        console.log("Doc update error,", error);
        res.status(500).json({ type: false, message: "Server Error!" });
    }
});

// Document delete ✅
router.delete("/doc-delete", async (req, res) => {
    try {
        const { docId } = req.query;
        const uid = req.user.uid;

        const docRef = db.collection("private_docs").doc(docId);
        const docSnapshot = await docRef.get();
        const copyDocRef = db.collection("public_docs").doc(docId);
        const copyDocSnapshot = await copyDocRef.get();

        // User validate.
        if (
            (docSnapshot.exists && docSnapshot.data().userId !== uid) &&
            (copyDocSnapshot.exists && copyDocSnapshot.data().userId !== uid)
        ) {
            req.files.forEach((file) => {
                try { fs.unlinkSync(file.path); }
                catch (err) { console.error("File delete failed:", err); }
            });

            return res.json({ type: false, message: "You can only delete your own documents!" });
        }

        // Remove Cloudinary doc images.
        await Promise.all(
            docSnapshot.data().docFiles.map(async (file) => {
                try {
                    if (file?.public_id) {
                        await cloudinary.uploader.destroy(file.public_id);
                        console.log(`✅ Deleted: ${file.public_id}`);
                    } else {
                        console.warn("⚠️ Skipped: Missing public_id in file", file);
                    }
                } catch (err) {
                    console.error(`❌ Failed to delete ${file?.public_id}:`, err.message);
                }
            })
        );

        // Delete docs.
        await docRef.delete();
        await copyDocRef.delete();

        res.status(200).json({ type: true, message: "Document is deleted!" })


    } catch (error) {
        console.log("Doc delete error,", error);
        res.status(500).json({ type: false, message: "Server Error!" });
    }
});

export default router;