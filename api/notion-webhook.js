// api/notion-webhook.js
require("dotenv").config(); // For local testing; on Vercel uses env vars
const { updatePaletteCovers } = require("../script");

module.exports = async (req, res) => {
    if (req.method !== "POST") {
        return res.status(405).send("Method Not Allowed");
    }

    try {
        // 1) Simply call the function that updates *all* pages
        await updatePaletteCovers();

        // 2) Return success
        return res.status(200).json({ success: true });
    } catch (err) {
        console.error("Failed to update covers for entire DB", err);
        return res.status(500).json({ error: err.message });
    }
};
