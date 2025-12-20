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
                    key: process.env.YOUTUBE_API_KEY
                }
            }
        );

        const videoIds = searchResponse.data.items
            .map(item => item.id.videoId)
            .join(",");

        if (!videoIds) return res.json([]);

        const detailsResponse = await axios.get(
            "https://www.googleapis.com/youtube/v3/videos",
            {
                params: {
                    part: "snippet,contentDetails,status",
                    id: videoIds,
                    key: process.env.YOUTUBE_API_KEY
                }
            }
        );

        const songs = detailsResponse.data.items
            .filter(video => {
                const title = video.snippet.title.toLowerCase();
                if (
                    title.includes("trailer") ||
                    title.includes("teaser") ||
                    title.includes("movie") ||
                    title.includes("shorts") ||
                    title.includes("#shorts")
                ) return false;

                if (!video.status.embeddable) return false;

                const duration = parseDuration(video.contentDetails.duration);
                if (duration < 60) return false;

                return true;
            })
            .map(video => ({
                videoId: video.id,
                title: video.snippet.title,
                channel: video.snippet.channelTitle,
                thumbnail: video.snippet.thumbnails.high.url
            }));

        res.json(songs);

    } catch (error) {
        console.error("SEARCH ERROR:", error.message);
        res.status(500).json([]);
    }
});

/* ================= 🔥 ADD LATEST SONGS ROUTE HERE 🔥 ================= */
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

/* ================= START SERVER ================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log("Backend running on port " + PORT);
});
