const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

// ================= TEST ROUTE =================
app.get("/", (req, res) => {
    res.send("Music backend is running ✅");
});

// ================= YOUTUBE SEARCH (WITH FALLBACKS) =================
app.get("/search", async (req, res) => {
    const query = req.query.q;

    if (!query) {
        return res.json({ error: "Query missing" });
    }

    // Multiple working Piped instances (fallback system)
    const PIPED_APIS = [
        "https://pipedapi.kavin.rocks",
        "https://pipedapi.syncpundit.io",
        "https://piped.lunar.icu"
    ];

    for (let base of PIPED_APIS) {
        try {
            const url = `${base}/api/v1/search?q=${encodeURIComponent(query)}&filter=videos`;

            const response = await axios.get(url, { timeout: 8000 });

            if (!response.data || !response.data.items) continue;

            const songs = response.data.items.map(item => ({
                id: item.id,
                title: item.title,
                artist: item.uploaderName,
                thumbnail: item.thumbnail,
                duration: item.duration,
                audioUrl: `${base}/latest_version?id=${item.id}&itag=251`
            }));

            // If we got songs, return immediately
            if (songs.length > 0) {
                return res.json(songs);
            }

        } catch (err) {
            console.log(`❌ Failed from ${base}`);
        }
    }

    // If all APIs fail
    res.json({ error: "All search servers failed. Try again later." });
});

// ================= LYRICS (BEST FREE OPTION) =================
app.get("/lyrics", async (req, res) => {
    try {
        const title = req.query.title;
        if (!title) return res.json({ lyrics: "Lyrics not found" });

        const url = `https://some-random-api.com/lyrics?title=${encodeURIComponent(title)}`;
        const response = await axios.get(url, { timeout: 8000 });

        if (response.data && response.data.lyrics) {
            return res.json({ lyrics: response.data.lyrics });
        }

        res.json({ lyrics: "Lyrics not found" });

    } catch (error) {
        res.json({ lyrics: "Lyrics not found" });
    }
});

// ================= RENDER PORT =================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log("Backend running on port " + PORT);
});
