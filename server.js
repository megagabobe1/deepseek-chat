const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");

const app = express();
app.use(express.json());

// ✅ Allow all CORS origins for now (adjust later if needed)
app.use(cors({
    origin: "*",
    methods: ["POST", "GET", "OPTIONS"],
    allowedHeaders: ["Content-Type"]
}));

const OLLAMA_API_URL = "http://localhost:11434/api/generate";

// ✅ Serve static files from "public" folder
app.use(express.static(path.join(__dirname, "public")));

// ✅ Chat API Endpoint
app.post("/chat", async (req, res) => {
    try {
        console.log("Received request:", req.body);
        const { model, prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: "Message is required" });
        }

        const formattedPrompt = `
        You are an AI assistant.
        ONLY provide direct responses to the user's message.
        DO NOT include "<think>" tags or descriptions of your thought process.
        DO NOT explain how you generate responses.
        DO NOT apologize—just answer concisely like a human.

        User: ${prompt}
        AI:
        `;

        const response = await axios.post(OLLAMA_API_URL, {
            model: model || "deepseek-r1:8b",
            prompt: formattedPrompt,
            stream: false
        });

        let aiResponse = response.data.response || "";
        aiResponse = aiResponse.replace(/<\/?think>/g, "").trim();

        console.log("Clean AI Response:", aiResponse);
        res.json({ model: model, response: aiResponse, done: response.data.done });

    } catch (error) {
        console.error("Error calling Ollama:", error.response?.data || error.message);
        res.status(500).json({ error: "Error calling Ollama API" });
    }
});

// ✅ Ensure "/" loads index.html properly
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ Allow external access via Render
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`✅ Server running at: http://localhost:${PORT}`);
});
