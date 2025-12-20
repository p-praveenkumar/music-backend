const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

/* ================= TEST ================= */
app.get("/", (req, res) => {
    res.send("YouTube Music Backend Running ✅");
});

/* ================= SEARCH SONGS ================= */
app.get("/search", async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) return res.json([]);

        if (!process.env.YOUTUBE_API_KEY) {
            console.error("❌ YOUTUBE_API_KEY missing");
            return res.status(500).json([]);
        }

        // 1️⃣ SEARCH
        const searchResponse = await axios.get(
            "https://www.googleapis.com/youtube/v3/search",
            {
                params: {
                    part: "snippet",
                    q: query,
                    type: "video",
                    maxResults: 15,
                    videoCategoryId: "10",
                    videoEmbeddable: "true",
                    regionCode: "IN",
                    safeSearch: "strict",
                    fields: "items(id/videoId,snippet/title,snippet/channelTitle,snippet/thumbnails/high/url)",
                    key: process.env.YOUTUBE_API_KEY
                }
            }
        );

        // ⚠️ VERY IMPORTANT FILTER
        const validItems = searchResponse.data.items.filter(
            item => item.id && item.id.videoId
        );

        if (validItems.length === 0) return res.json([]);

        const videoIds = validItems.map(item => item.id.videoId).join(",");

        // 2️⃣ DETAILS
        const detailsResponse = await axios.get(
            "https://www.googleapis.com/youtube/v3/videos",
            {
                params: {
                    part: "contentDetails,status",
                    id: videoIds,
                    fields: "items(id,contentDetails/duration,status/embeddable)",
                    key: process.env.YOUTUBE_API_KEY
                }
            }
        );

        // Map id → details
        const detailsMap = {};
        detailsResponse.data.items.forEach(v => {
            detailsMap[v.id] = v;
        });

        // 3️⃣ FINAL FILTER
        const songs = validItems.filter(item => {
            const video = detailsMap[item.id.videoId];
            if (!video) return false;

            if (!video.status.embeddable) return false;

            const duration = parseDuration(video.contentDetails.duration);
            if (duration < 60) return false;

            const title = item.snippet.title.toLowerCase();
            if (
                title.includes("trailer") ||
                title.includes("teaser") ||
                title.includes("movie") ||
                title.includes("shorts")
            ) return false;

            return true;
        }).map(item => ({
            videoId: item.id.videoId,
            title: item.snippet.title,
            channel: item.snippet.channelTitle,
            thumbnail: item.snippet.thumbnails.high.url
        }));

        res.json(songs);

    } catch (error) {
        console.error("SEARCH ERROR:", error.response?.data || error.message);
        res.status(500).json([]);
    }
});

/* ================= LATEST SONGS ================= */
app.get("/latest", async (req, res) => {
    try {
        const response = await axios.get(
            "https://www.googleapis.com/youtube/v3/search",
            {
                params: {
                    part: "snippet",
                    q: "latest telugu tamil hindi songs",
                    type: "video",
                    order: "date",
                    maxResults: 10,
                    videoCategoryId: "10",
                    videoEmbeddable: "true",
                    regionCode: "IN",
                    fields: "items(id/videoId,snippet/title,snippet/channelTitle,snippet/thumbnails/high/url)",
                    key: process.env.YOUTUBE_API_KEY
                }
            }
        );

        const songs = response.data.items
            .filter(item => item.id && item.id.videoId)
            .map(item => ({
                videoId: item.id.videoId,
                title: item.snippet.title,
                channel: item.snippet.channelTitle,
                thumbnail: item.snippet.thumbnails.high.url
            }));

        res.json(songs);

    } catch (error) {
        console.error("LATEST ERROR:", error.message);
        res.json([]);
    }
});

/* ================= HELPER ================= */
function parseDuration(iso) {
    let minutes = 0;
    let seconds = 0;

    const m = iso.match(/(\d+)M/);
    const s = iso.match(/(\d+)S/);

    if (m) minutes = parseInt(m[1]);
    if (s) seconds = parseInt(s[1]);

    return minutes * 60 + seconds;
}

/* ================= START ================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log("Backend running on port " + PORT);
});
