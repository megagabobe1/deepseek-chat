const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config(); // Load environment variables

const app = express();
app.use(express.json());
app.use(cors());

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY; // API Key from .env

app.post("/chat", async (req, res) => {
    const userMessage = req.body.message;

    if (!userMessage) {
        return res.status(400).json({ error: "Message is required" });
    }

    try {
        const response = await axios.post(
            "https://api.deepseek.com/v1/chat/completions", // ✅ Correct DeepSeek API URL
            {
                model: "deepseek-chat",
                messages: [{ role: "user", content: userMessage }]
            },
            {
                headers: {
                    "Authorization": `Bearer ${DEEPSEEK_API_KEY}`, // ✅ Ensure this is correct
                    "Content-Type": "application/json"
                }
            }
        );

        const aiResponse = response.data.choices[0].message.content; // ✅ Extract AI response
        res.json({ response: aiResponse });
    } catch (error) {
        console.error("Error calling DeepSeek API:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to fetch AI response" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
