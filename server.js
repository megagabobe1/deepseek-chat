const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();  // Load environment variables

const app = express();
app.use(express.json());

app.use(
    cors({
        origin: "*",  // Allow all origins (for Wix)
        methods: ["POST", "GET", "OPTIONS"],
        allowedHeaders: ["Content-Type"],
    })
);

// ✅ Use Ngrok URL (set via Environment Variable)
const OLLAMA_API_URL = process.env.OLLAMA_API_URL || "https://411d-181-209-152-121.ngrok-free.app/api/generate";

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

        // Send request to Ollama via Ngrok
        const response = await axios.post(
            OLLAMA_API_URL,
            {
                model: model || "deepseek-r1:8b",
                prompt: formattedPrompt,
                stream: false
            }
        );

        let aiResponse = response.data.response || "";
        aiResponse = aiResponse.replace(/<\/?think>/g, "").trim();

        console.log("Clean AI Response:", aiResponse);
        res.json({ model: model, response: aiResponse, done: response.data.done });

    } catch (error) {
        console.error("Error calling Ollama API:", error.response?.data || error.message);
        res.status(500).json({ error: "Error calling Ollama API" });
    }
});

// ✅ Handle OPTIONS Preflight Requests (Important for CORS)
app.options("/chat", (req, res) => {
    res.sendStatus(200);
});

// ✅ Serve the Chatbox
app.get("/", (req, res) => {
    res.send("🚀 AI Chat Server is Running! Use it on your Wix site.");
});

// ✅ Start Server on Render
const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server running at: http://localhost:${PORT}`);
});
