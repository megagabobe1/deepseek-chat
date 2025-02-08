const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

// Enable CORS (important for Wix)
app.use(cors());

// Middleware to parse JSON
app.use(express.json());

// Test route for "/"
app.get("/", (req, res) => {
    res.send("Server is running!");
});

// Chatbot API route (POST request)
app.post("/chat", async (req, res) => {
    const userMessage = req.body.message;

    if (!userMessage) {
        return res.status(400).json({ error: "Message is required" });
    }

    // Simulate a chatbot response (replace with DeepSeek API)
    res.json({ response: `You said: ${userMessage}` });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
