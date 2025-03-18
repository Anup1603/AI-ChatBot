import React, { useState, useEffect } from "react";
import axios from "axios";
import { marked } from "marked";
import "./App.css";

const Chatbot = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch chat history from backend
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get("http://localhost:3600/chat/history");

        if (response.data && response.data.length > 0) {
          // Format chat history properly
          const formattedMessages = response.data
            .map((chat) => [
              {
                _id: chat._id + "-user",
                text: chat.userMessage,
                sender: "user",
              },
              { _id: chat._id + "-bot", text: chat.botResponse, sender: "bot" },
            ])
            .flat(); // Flatten array to avoid nested arrays

          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error("Error fetching chat history:", error);
      }
    };

    fetchHistory();
  }, []);

  // const sendMessage = async (e) => {
  //   e.preventDefault();
  //   if (!input.trim()) return;

  //   const userMessage = {
  //     _id: Date.now() + "-user",
  //     text: input,
  //     sender: "user",
  //   };
  //   setMessages((prevMessages) => [...prevMessages, userMessage]); // Add user message
  //   setInput("");
  //   setIsLoading(true);

  //   try {
  //     const apiResponse = await axios.post("http://localhost:5000/chat", {
  //       message: input,
  //     });

  //     const botResponse = {
  //       _id: Date.now() + "-bot",
  //       text:
  //         apiResponse.data.choices?.[0]?.message?.content ||
  //         "No response received.",
  //       sender: "bot",
  //     };

  //     setMessages((prevMessages) => [...prevMessages, botResponse]); // Add bot response
  //   } catch (error) {
  //     setMessages((prevMessages) => [
  //       ...prevMessages,
  //       {
  //         _id: Date.now() + "-error",
  //         text: "Error: " + error.message,
  //         sender: "bot",
  //       },
  //     ]);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      _id: Date.now() + "-user",
      text: input,
      sender: "user",
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]); // Add user message
    setInput("");
    setIsLoading(true);

    try {
      const apiResponse = await axios.post("http://localhost:3600/chat", {
        message: input,
      });

      // Extract the bot's response correctly
      const botText = apiResponse.data.bot || "No response received from AI.";

      const botResponse = {
        _id: Date.now() + "-bot",
        text: botText,
        sender: "bot",
      };

      setMessages((prevMessages) => [...prevMessages, botResponse]); // Add bot response
    } catch (error) {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          _id: Date.now() + "-error",
          text: "Error: " + error.message,
          sender: "bot",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      <h2>AI ChatBot</h2>

      {/* Conditionally render chat history if available */}
      <div className="chat-box">
        {messages.length > 0 ? (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`chat-message ${
                msg.sender === "user" ? "chat-user" : "chat-bot"
              }`}
            >
              <div
                className="message-content"
                dangerouslySetInnerHTML={{
                  __html: msg.sender === "bot" ? marked(msg.text) : msg.text,
                }}
              />
            </div>
          ))
        ) : (
          <p className="no-history">No chat history available.</p>
        )}

        {isLoading && (
          <div className="chat-message chat-bot">
            <div className="message-content">Typing...</div>
          </div>
        )}
      </div>

      <form onSubmit={sendMessage} className="chat-input-container">
        <input
          type="text"
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your question"
          disabled={isLoading}
        />
        <button type="submit" className="chat-send" disabled={isLoading}>
          {isLoading ? "Sending..." : "Ask!"}
        </button>
      </form>
    </div>
  );
};

export default Chatbot;
