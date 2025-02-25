const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");

const app = express();
app.use(express.json());

// ✅ FIX: Allow CORS from anywhere (for testing, restrict later)
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"]
}));

const OLLAMA_API_URL = "https://4029-181-209-152-121.ngrok-free.app/api/generate";

// ✅ Serve Static Files from Public Folder
app.use(express.static(path.join(__dirname, "public")));

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

// ✅ Fix: Serve `index.html` When Accessing the Root URL
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server running at: http://localhost:${PORT}`);
});
