require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const connectDB = require('./DB/connectDB');
const Chat = require('./models/chatModel');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

app.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: 'deepseek/deepseek-r1:free',
            messages: [{ role: 'user', content: message }]
        }, {
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const botResponse = response.data.choices?.[0]?.message?.content || "No response received.";

        // Save chat history to MongoDB
        const newChat = new Chat({
            userMessage: message,
            botResponse: botResponse,
        });
        await newChat.save();

        res.json(response.data);
        // console.log(`User: ${message}\nBot: ${botResponse}`);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching response from OpenRouter API' });
    }
});

app.get('/chat/history', async (req, res) => {
    try {
        const chats = await Chat.find();
        res.json(chats);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching chat history' });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
