const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Test route for "/"
app.get("/", (req, res) => {
    res.send("Server is running!");
});

// Your chatbot API route
app.post("/chat", async (req, res) => {
    const userMessage = req.body.message;

    if (!userMessage) {
        return res.status(400).json({ error: "Message is required" });
    }

    res.json({ response: `You said: ${userMessage}` });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
