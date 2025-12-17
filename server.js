const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

// Test route
app.get("/", (req, res) => {
    res.send("YouTube Music Backend Running ✅");
});

// ✅ OFFICIAL YOUTUBE SEARCH API
app.get("/search", async (req, res) => {
    try {
        const query = req.query.q;

        const response = await axios.get(
            "https://www.googleapis.com/youtube/v3/search",
            {
                params: {
                    part: "snippet",
                    q: query,
                    type: "video",
                    maxResults: 10,
                    key: process.env.YOUTUBE_API_KEY
                }
            }
        );

        const songs = response.data.items.map(item => ({
            videoId: item.id.videoId,
            title: item.snippet.title,
            channel: item.snippet.channelTitle,
            thumbnail: item.snippet.thumbnails.high.url
        }));

        res.json(songs);

    } catch (error) {
        console.log("SEARCH ERROR:", error.response?.data || error.message);
        res.json({ error: "YouTube search failed" });
    }
});

// Render port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log("Backend running on port " + PORT);
});
