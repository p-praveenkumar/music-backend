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
// ⭐ WORKING 2025 SAAVN SEARCH API
app.get("/search", async (req, res) => {
    try {
        const query = req.query.q;
        const url = `https://saavn.dev/api/search/songs?query=${query}`;

        const response = await axios.get(url);

        // Real songs list:
        const songs = response.data.data.results;

        res.json(songs);

    } catch (error) {
        console.log("SEARCH ERROR:", error.message);
        res.json({ error: "Search API failed" });
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


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log("Backend running on port " + PORT);
});


