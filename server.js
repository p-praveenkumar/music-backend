const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

// Test route
app.get("/", (req, res) => {
    res.send("Backend running successfully!");
});

// ⭐ SEARCH SONGS (WORKING 2025)
app.get("/search", async (req, res) => {
    try {
        const query = req.query.q;

        const url = `https://saavn.cloud/api/search/songs?query=${query}`;

        const response = await axios.get(url);

        const songs = response.data.data.results;

        res.json(songs);
    } catch (error) {
        console.log("SEARCH ERROR:", error.message);
        res.json({ error: "Search API failed" });
    }
});

// ⭐ LYRICS API (100% working)
app.get("/lyrics", async (req, res) => {
    try {
        const songId = req.query.id;

        const url = `https://saavn.cloud/api/songs/${songId}`;

        const response = await axios.get(url);

        const song = response.data.data[0];

        if (song.lyrics) {
            const lyrics = song.lyrics
                .replace(/<br>/g, "\n")
                .replace(/<\/?[^>]+>/g, "");
            return res.json({ lyrics });
        }

        res.json({ lyrics: "Lyrics not found" });
    } catch (error) {
        console.log("LYRICS ERROR:", error.message);
        res.json({ lyrics: "Lyrics not found" });
    }
});

// Render Port Fix
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log("Backend running on port " + PORT);
});
