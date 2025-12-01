const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

// Test route
app.get("/", (req, res) => {
    res.send("Backend running successfully!");
});


// ⭐ SEARCH SONGS (100% WORKING 2025)
app.get("/search", async (req, res) => {
    try {
        const query = req.query.q;

        // Correct Saavn endpoint
        const url = `https://saavn.dev/api/search/songs?query=${query}`;

        const response = await axios.get(url);

        // Correct structure
        const songs = response.data.data.results;

        res.json(songs);
    } catch (error) {
        console.log("SEARCH ERROR:", error.message);
        res.json({ error: "Search API failed" });
    }
});


// ⭐ LYRICS (100% WORKING 2025)
// Uses Saavn official metadata → lyrics included!
app.get("/lyrics", async (req, res) => {
    try {
        const songId = req.query.id;

        // Song details API
        const url = `https://saavn.dev/api/songs/${songId}`;

        const response = await axios.get(url);

        if (
            response.data &&
            response.data.data &&
            response.data.data[0] &&
            response.data.data[0].lyrics
        ) {
            const lyrics = response.data.data[0].lyrics
                .replace(/<br>/g, "\n")
                .replace(/<\/?[^>]+(>|$)/g, "");

            return res.json({ lyrics });
        }

        res.json({ lyrics: "Lyrics not found" });

    } catch (error) {
        console.log("LYRICS ERROR:", error.message);
        res.json({ lyrics: "Lyrics not found" });
    }
});


// ⭐ RENDER PORT FIX
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log("Backend running on port " + PORT);
});
