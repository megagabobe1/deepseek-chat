const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(express.json());

// ✅ Allow requests from Wix (important for cross-origin requests)
app.use(cors({
    origin: "*",
    methods: ["POST", "GET", "OPTIONS"],
    allowedHeaders: ["Content-Type"]
}));

const OLLAMA_API_URL = "http://localhost:11434/api/generate";  // Running locally on your PC

app.post("/chat", async (req, res) => {
    try {
        console.log("Received request:", req.body);
        const { model, prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: "Message is required" });
        }

        // ✅ Force AI to only respond directly, removing all "thinking"
        const formattedPrompt = `
        You are an AI assistant. 
        - ONLY provide direct responses to the user's message. 
        - DO NOT include "<think>" tags or descriptions of your thought process.
        - DO NOT explain how you generate responses. 
        - DO NOT add reasoning—JUST answer concisely like a human would.

        User: ${prompt}
        AI:
        `;

        // Send request to Ollama (local model running on your PC)
        const response = await axios.post(OLLAMA_API_URL, {
            model: model || "deepseek-r1:8b",
            prompt: formattedPrompt,
            stream: false
        });

        let aiResponse = response.data.response || "";

        // ✅ Remove **all** "<think>" text from the AI response
        aiResponse = aiResponse.replace(/<\/?think>/g, "").trim();

        console.log("Clean AI Response:", aiResponse);
        res.json({ model: model, response: aiResponse, done: response.data.done });

    } catch (error) {
        console.error("Error calling Ollama:", error.response?.data || error.message);
        res.status(500).json({ error: "Error calling Ollama API" });
    }
});

// ✅ Handle OPTIONS Preflight Requests (important for CORS)
app.options("/chat", (req, res) => {
    res.sendStatus(200);
});

// ✅ Serve the Chatbox directly at "/"
app.get("/", (req, res) => {
    res.send("🚀 AI Chat Server is Running! Use it on your Wix site.");
});

// ✅ Allow external access via Render
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`✅ Server running at: http://localhost:${PORT}`);
});
