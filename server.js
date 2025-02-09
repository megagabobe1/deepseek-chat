const express = require("express");
const cors = require("cors");
const axios = require("axios"); // Import axios for API requests
require("dotenv").config(); // Load environment variables

const app = express();
app.use(express.json());
app.use(cors());

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY; // Make sure this is set in Render's environment variables

app.post("/chat", async (req, res) => {
    const userMessage = req.body.message;

    if (!userMessage) {
        return res.status(400).json({ error: "Message is required" });
    }

    try {
        const response = await axios.post(
            "https://api.deepseek.com/chat", // Replace with DeepSeek's actual API endpoint
            {
                message: userMessage
            },
            {
                headers: {
                    "Authorization": `Bearer ${DEEPSEEK_API_KEY}`, // Use your API key
                    "Content-Type": "application/json"
                }
            }
        );

        const aiResponse = response.data.response; // Get AI-generated response

        res.json({ response: aiResponse });
    } catch (error) {
        console.error("Error calling DeepSeek API:", error);
        res.status(500).json({ error: "Failed to fetch AI response" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
