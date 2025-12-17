const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

// Test route
app.get("/", (req, res) => {
    res.send("YouTube Music Backend Running ✅");
});

/*
 SEARCH SONGS
 Uses Piped (YouTube proxy)
*/
app.get("/search", async (req, res) => {
    try {
        const query = req.query.q;

        const url = `https://piped.video/api/v1/search?q=${encodeURIComponent(query)}&filter=videos`;

        const response = await axios.get(url);

        const songs = response.data.items.map(item => ({
            id: item.id,
            title: item.title,
            thumbnail: item.thumbnail,
            duration: item.duration,
            artist: item.uploaderName,
            audioUrl: `https://piped.video/latest_version?id=${item.id}&itag=251`
        }));

        res.json(songs);
    } catch (error) {
        console.log("SEARCH ERROR:", error.message);
        res.json({ error: "Search failed" });
    }
});

/*
 LYRICS API
*/
app.get("/lyrics", async (req, res) => {
    try {
        const title = req.query.title;

        const url = `https://some-random-api.com/lyrics?title=${encodeURIComponent(title)}`;

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

// Render port fix
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log("Backend running on port " + PORT);
});
