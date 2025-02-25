const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(express.json());

// ✅ Fix CORS issue
app.use(cors({
    origin: "*",
    methods: ["POST", "GET", "OPTIONS"],
    allowedHeaders: ["Content-Type"]
}));

// ✅ Replace Ollama with DeepSeek API (publicly available)
const API_URL = "https://api.deepseek.com/v1/completions"; // Replace with actual API endpoint

app.post("/chat", async (req, res) => {
    try {
        console.log("Received request:", req.body);
        const { model, prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: "Message is required" });
        }

        const response = await axios.post(API_URL, {
            model: "deepseek-chat",
            messages: [{ role: "user", content: prompt }]
        }, {
            headers: {
                "Authorization": `Bearer YOUR_DEEPSEEK_API_KEY`, // Replace with your DeepSeek API Key
                "Content-Type": "application/json"
            }
        });

        res.json({ model: model, response: response.data.choices[0].message.content });

    } catch (error) {
        console.error("Error calling DeepSeek API:", error.message);
        res.status(500).json({ error: "Error calling DeepSeek API" });
    }
});

// ✅ Serve Chatbox on "/"
app.use(express.static("public"));

// ✅ Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server running at: https://deepseek-chat.onrender.com`);
});
