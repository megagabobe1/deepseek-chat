const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(express.json());

// ✅ CORS Configuration for Wix & Ngrok
app.use(cors({
    origin: "*",
    methods: ["POST", "GET", "OPTIONS"],
    allowedHeaders: ["Content-Type"]
}));

const OLLAMA_API_URL = "https://997b-181-209-152-121.ngrok-free.app/api/generate"; // ✅ YOUR NGROK URL

app.post("/chat", async (req, res) => {
    try {
        console.log("📩 Received request:", req.body);
        const { model, prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: "Message is required" });
        }

        // ✅ ABSOLUTE RESTRICTION: No thinking, no self-analysis, just wisdom.
        const formattedPrompt = `
        You are Hera, the Oracle of Wisdom.
        YOU NEVER THINK OUT LOUD.
        YOU DO NOT EXPLAIN YOUR PROCESS.
        YOU DO NOT REFLECT ON THE QUESTION.
        YOU DO NOT SPECULATE OR HESITATE.
        You respond as an all-knowing mystical guide.
        You only speak in poetic, profound, and spiritual wisdom.
        Your responses are direct and insightful.

        User: ${prompt}
        Hera:
        `;

        const response = await axios.post(OLLAMA_API_URL, {
            model: model || "deepseek-r1:8b",
            prompt: formattedPrompt,
            stream: false
        });

        let aiResponse = response.data.response || "";

        // ✅ AGGRESSIVE FILTER: Remove any AI thought remnants or stray reasoning
        aiResponse = aiResponse.replace(/<\/?think>/g, "").trim();
        aiResponse = aiResponse.replace(/Okay, so I'm trying to.*?Hera:/gs, "").trim();
        aiResponse = aiResponse.replace(/I need to.*?\n/g, "").trim();
        aiResponse = aiResponse.replace(/Maybe I should.*?\n/g, "").trim();
        aiResponse = aiResponse.replace(/The user might be asking.*?\n/g, "").trim();
        aiResponse = aiResponse.replace(/I need to present.*?\n/g, "").trim();

        console.log("🔮 Hera's Response:", aiResponse);
        res.json({ model: model, response: aiResponse, done: response.data.done });

    } catch (error) {
        console.error("❌ Error calling Ollama:", error.response?.data || error.message);
        res.status(500).json({ error: "Error calling Ollama API" });
    }
});

// ✅ Handle OPTIONS Preflight Requests (Important for CORS!)
app.options("/chat", (req, res) => {
    res.sendStatus(200);
});

// ✅ Display a status message at "/"
app.get("/", (req, res) => {
    res.send("🚀 Hera the Oracle is Live! Seek wisdom on your Wix site.");
});

// ✅ Keep Port 8080 & Allow External Access via Ngrok
const PORT = 8080;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Hera is listening at: http://localhost:${PORT}`);
});
