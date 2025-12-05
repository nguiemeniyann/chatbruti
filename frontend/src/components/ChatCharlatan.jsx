import React, { useState, useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";
import BotAvatar from "./BotAvatar";
import AIStatus from "./AIStatus.jsx";
import { useAuth } from "../contexts/AuthContext";
import {
  generateResponse,
  getWelcomeMessage,
  getTypingMessage,
} from "../utils/chatEngine";
import {
  createConversation,
  updateConversationMessages,
} from "../services/conversationService";

const ChatCharlatan = ({
  onUserMessage,
  onTypingChange,
  initialMessages,
  conversationId,
}) => {
  const [messages, setMessages] = useState(initialMessages || []);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingMessage, setTypingMessage] = useState("");
  const [avatarExpression, setAvatarExpression] = useState("idle");
  const [currentConversationId, setCurrentConversationId] = useState(
    conversationId || null
  );
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  // Mettre à jour le conversationId quand il change
  useEffect(() => {
    setCurrentConversationId(conversationId || null);
  }, [conversationId]);

  // Charger les messages initiaux ou le message de bienvenue
  useEffect(() => {
    if (initialMessages && initialMessages.length > 0) {
      setMessages(initialMessages);
      return;
    }

    if (!conversationId) {
      const loadWelcome = async () => {
        const welcomeResponse = await getWelcomeMessage();
        const welcomeMsg = {
          id: "0",
          text: welcomeResponse.text,
          sender: "bot",
          timestamp: new Date(),
          expression: welcomeResponse.expression,
          isStreaming: true,
        };

        setMessages([welcomeMsg]);
        setAvatarExpression(welcomeResponse.expression);

        const estimatedTime = welcomeResponse.text.length * 30;

        setTimeout(() => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === welcomeMsg.id ? { ...msg, isStreaming: false } : msg
            )
          );
        }, estimatedTime);

        setTimeout(() => setAvatarExpression("idle"), estimatedTime + 1000);
      };

      loadWelcome();
    } else {
      setMessages([]);
    }
  }, [initialMessages, conversationId]);

  // Sauvegarder les messages quand ils changent
  useEffect(() => {
    if (!user || messages.length === 0) return;

    const saveMessages = async () => {
      if (messages.length === 1 && messages[0].sender === "bot") return;

      if (
        initialMessages &&
        initialMessages.length > 0 &&
        messages.length === initialMessages.length
      ) {
        return;
      }

      let convId = currentConversationId;

      if (!convId) {
        const firstUserMessage = messages.find((m) => m.sender === "user");
        const title = firstUserMessage
          ? firstUserMessage.text.substring(0, 50) +
            (firstUserMessage.text.length > 50 ? "..." : "")
          : "Nouvelle conversation";

        const newConv = await createConversation(user.id, title);
        convId = newConv.id;
        setCurrentConversationId(convId);
      }

      await updateConversationMessages(convId, messages);
    };

    const timeoutId = setTimeout(saveMessages, 1000);
    return () => clearTimeout(timeoutId);
  }, [messages, user, currentConversationId, initialMessages]);

  const scrollToBottom = (force = false) => {
    const container = messagesEndRef.current?.parentElement;
    if (!container) return;

    const isNearBottom =
      container.scrollHeight -
        container.scrollTop -
        container.clientHeight <
      100;

    if (force || isNearBottom) {
      setTimeout(() => {
        container.scrollTop = container.scrollHeight;
      }, 50);
    }
  };

  // Auto-scroll pendant le streaming
  useEffect(() => {
    if (messages.some((m) => m.isStreaming)) {
      const interval = setInterval(() => {
        scrollToBottom(true);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);
    setAvatarExpression("thinking");

    if (onUserMessage) {
      onUserMessage(inputValue);
    }
    if (onTypingChange) {
      onTypingChange(true);
    }

    scrollToBottom(true);

    const typingMsg = await getTypingMessage();
    setTypingMessage(typingMsg);

    const conversationHistory = messages
      .filter((m) => m.sender === "bot" || m.sender === "user")
      .map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text,
      }));

    conversationHistory.push({
      role: "user",
      content: inputValue,
    });

    try {
      const response = await generateResponse(inputValue, conversationHistory);

      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        sender: "bot",
        timestamp: new Date(),
        expression: response.expression,
        isStreaming: true,
      };

      setMessages((prev) => [...prev, botMessage]);
      setAvatarExpression(response.expression);

      const estimatedTime = response.text.length * 30;

      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMessage.id ? { ...msg, isStreaming: false } : msg
          )
        );
      }, estimatedTime);

      setTimeout(() => setAvatarExpression("idle"), estimatedTime + 1000);

      scrollToBottom(true);
    } catch (error) {
      console.error("Error generating response:", error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: "Désolé, Chat’Bruti vient de trébucher sur un câble. Réessaie 🤡",
        sender: "bot",
        timestamp: new Date(),
        expression: "confused",
      };
      setMessages((prev) => [...prev, errorMessage]);
      setAvatarExpression("confused");
    } finally {
      setIsTyping(false);
      setTypingMessage("");
      if (onTypingChange) {
        onTypingChange(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-[#f5f5f5] dark:bg-[#1a1a1a] pixel-border overflow-hidden">
      {/* En-tête du chat avec avatar */}
      <div className="bg-white dark:bg-[#1a1a1a] border-b-4 border-black dark:border-white px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="mr-4">
            <BotAvatar
              expression={avatarExpression}
              size="medium"
              animated={true}
            />
          </div>
          <div>
            <h3 className="text-black dark:text-white font-pixel text-base pixel-text">
              CHAT’BRUTI
            </h3>
            <p className="text-pixel-accent dark:bg-[#ff6f61b2] text-sm font-pixel mb-1">
              &gt; BOT DU NON-SENS &lt;
            </p>
            <AIStatus />
          </div>
        </div>
      </div>

      {/* Zone de messages */}
      <div className="h-[500px] overflow-y-auto px-5 py-4 bg-white dark:bg-black">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {/* Indicateur de typing */}
        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="flex items-center">
              <div className="mr-3">
                <BotAvatar expression="thinking" size="small" animated={true} />
              </div>
              <div className="bg-white dark:bg-[#1a1a1a] pixel-border px-4 py-3">
                <p className="text-pixel-accent dark:bg-[#ff6f61b2] text-sm font-pixel pixel-blink">
                  {typingMessage || "> CHAT’BRUTI DÉRAILLE... <"}
                </p>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Zone de saisie */}
      <div className="bg-white dark:bg-[#1a1a1a] border-t-4 border-black dark:border-white px-5 py-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="> BALANCE TON NON-SENS..."
            className="flex-1 pixel-input"
            disabled={isTyping}
          />
          <button
            onClick={handleSendMessage}
            disabled={isTyping || !inputValue.trim()}
            className="pixel-button bg-pixel-accent dark:bg-[#ff6f61b2] text-black px-5 py-3 text-sm font-pixel disabled:opacity-50 disabled:cursor-not-allowed"
          >
            SEND
          </button>
        </div>
        <p className="text-black dark:text-white text-xs font-pixel mt-3 text-center">
          [ENTRÉE] POUR ENVOYER
        </p>
      </div>
    </div>
  );
};

export default ChatCharlatan;
