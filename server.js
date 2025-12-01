const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

// Test route
app.get("/", (req, res) => {
    res.send("Backend running successfully!");
});

// Search songs
// ⭐ SEARCH SONGS (WORKING 2025)
app.get("/search", async (req, res) => {
    try {
        const query = req.query.q;

        // YouTube unofficial search API
        const url = `https://piped.video/api/v1/search?q=${query}`;

        const response = await axios.get(url);

        const cleaned = response.data
            .filter(item => item.type === "video")
            .map(item => ({
                id: item.id,
                title: item.title,
                thumbnail: item.thumbnail,
                author: item.uploaderName,
                duration: item.duration,
                url: `https://piped.video/v/${item.id}`
            }));

        res.json(cleaned);

    } catch (error) {
        console.log("SEARCH ERROR:", error.message);
        res.json({ error: "Search failed" });
    }
});


// Lyrics API
// ⭐ WORKING LYRICS API FOR TELUGU / TAMIL / HINDI / KANNADA / MALAYALAM
app.get("/lyrics", async (req, res) => {
    try {
        const title = req.query.title;

        const url = `https://some-random-api.com/lyrics?title=${title}`;

        const response = await axios.get(url);

        if (response.data && response.data.lyrics) {
            return res.json({ lyrics: response.data.lyrics });
        }

        res.json({ lyrics: "Lyrics not found" });

    } catch (error) {
        console.log("LYRICS ERROR:", error.message);
        res.json({ lyrics: "Lyrics not found" });
    }
});


app.listen(5000, () => {
    console.log("Backend server running on http://localhost:5000");
});

