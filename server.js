const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Root test
app.get("/", (req, res) => {
    res.send("Backend Connected Successfully! 🚀");
});

// ⭐ WORKING SEARCH API
app.get("/search", async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ error: "Search query required" });
        }

        const apiURL = `https://saavn.dev/api/search/songs?query=${encodeURIComponent(
            query
        )}`;

        const result = await axios.get(apiURL);

        return res.json(result.data);
    } catch (error) {
        console.log("❌ SEARCH ERROR:", error.message);
        return res.status(500).json({
            error: "Search failed",
            message: error.message,
        });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🔥 Server running at http://localhost:${PORT}`));
