const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(express.json());

// ✅ Ensure CORS is enabled for Wix & Ngrok
app.use(cors({
    origin: "*",
    methods: ["POST", "GET", "OPTIONS"],
    allowedHeaders: ["Content-Type"]
}));

const OLLAMA_API_URL = "https://7e77-181-209-152-121.ngrok-free.app"; // ✅ MAKE SURE OLLAMA IS RUNNING LOCALLY

app.post("/chat", async (req, res) => {
    try {
        console.log("📩 Received request:", req.body);
        const { model, prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: "Message is required" });
        }

        // ✅ Fix: NO Thinking Out Loud
        const formattedPrompt = `
        You are a direct AI assistant.
        ONLY provide short and clear answers to the user's message.
        DO NOT include "<think>" tags or describe your thought process.
        DO NOT explain anything unless asked.
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
        aiResponse = aiResponse.replace(/<\/?think>/g, "").trim(); // ✅ Final Cleanup

        console.log("🤖 AI Response:", aiResponse);
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
    res.send("🚀 AI Chat Server is Running! Use it on your Wix site.");
});

// ✅ Keep Port 8080 & Allow External Access via Ngrok
const PORT = 8080;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server running at: http://localhost:${PORT}`);
});
