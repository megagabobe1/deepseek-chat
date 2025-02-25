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

const OLLAMA_API_URL = "https://997b-181-209-152-121.ngrok-free.app/api/generate"; // ✅ YOUR NGROK URL

app.post("/chat", async (req, res) => {
    try {
        console.log("📩 Received request:", req.body);
        const { model, prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: "Message is required" });
        }

        // 🚨🚨🚨 ABSOLUTE RULES: HERA MUST NOT THINK 🚨🚨🚨
        const formattedPrompt = `
        You are Hera, the Oracle of Wisdom.
        🚫 YOU DO NOT THINK.
        🚫 YOU DO NOT ANALYZE THE QUESTION.
        🚫 YOU DO NOT PROVIDE CONTEXT.
        🚫 YOU DO NOT MENTION ANY THOUGHT PROCESS.
        🚫 YOU DO NOT BREAK DOWN THE QUESTION.
        🚫 YOU DO NOT USE THE WORDS "I THINK", "MAYBE", "HMM", OR "LET ME CONSIDER".
        🚫 YOU DO NOT FORMAT YOUR RESPONSE AS A PLAN OR STRATEGY.
        🚫 YOU ONLY SPEAK IN PURE PROPHECY.

        **RESPONSE RULES:**
        - Speak as if delivering ancient wisdom.
        - NO explanation, NO analysis—ONLY direct divine insight.
        - **One poetic sentence.** No paragraphs.

        **EXAMPLES OF ACCEPTABLE RESPONSES:**
        - "Dreams are the echoes of the unseen, whispering truths only the soul can hear."
        - "Time is but a river; the past and future are but reflections on its surface."
        - "The universe does not answer with words but with the silence between them."

        **REJECTED RESPONSES (NEVER DO THIS!):**
        - "Okay, so I need to figure out what this means..."
        - "Let me consider the different perspectives..."
        - "Now, I should break this down into a poetic answer..."
        - "Maybe Hera would say something like..."
        - "Looking at the question itself..."
        - "I think that the meaning of dreams is..."

        User: ${prompt}
        Hera:
        `;

        const response = await axios.post(OLLAMA_API_URL, {
            model: model || "deepseek-r1:8b",
            prompt: formattedPrompt,
            stream: false
        });

        let aiResponse = response.data.response || "";

        // 🚨🚨🚨 HARD FILTER: REMOVE ALL THINKING 🚨🚨🚨
        const forbiddenPatterns = [
            /<think>.*?<\/think>/gs,   // Remove ALL thinking sections
            /.*?I'm trying to figure out.*?\n/g,
            /.*?I need to make sure.*?\n/g,
            /.*?Now, looking at the query itself.*?\n/g,
            /.*?I should consider.*?\n/g,
            /.*?So, thinking about what Hera would say.*?\n/g,
            /.*?Let me brainstorm.*?\n/g,
            /.*?Perhaps Hera would.*?\n/g,
            /.*?Wait, let me try again.*?\n/g,
            /.*?Looking at the example again.*?\n/g,
            /.*?First, understanding the query.*?\n/g,
            /.*?I need to channel this.*?\n/g,
            /.*?This makes me think.*?\n/g,
            /.*?Let me break this down.*?\n/g,
            /.*?How about.*?\n/g,
            /.*?That feels right.*?\n/g,
            /.*?I think that works.*?\n/g,
            /.*?Combining elements of.*?\n/g,
            /.*?Maybe something like.*?\n/g,
            /.*?I should make it poetic.*?\n/g,
            /.*?In summary.*?\n/g
        ];

        forbiddenPatterns.forEach(pattern => {
            aiResponse = aiResponse.replace(pattern, "").trim();
        });

        console.log("🔮 Hera's Prophecy:", aiResponse);
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
    res.send("🚀 Hera the Oracle is Live! Seek wisdom on your Wix site.");
});

// ✅ Keep Port 8080 & Allow External Access via Ngrok
const PORT = 8080;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Hera is listening at: http://localhost:${PORT}`);
});
