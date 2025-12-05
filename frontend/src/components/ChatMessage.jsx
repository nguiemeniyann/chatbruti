import React, { useState, useEffect, useRef } from "react";
import BotAvatar from "./BotAvatar";
import { playTypewriterSound } from "../utils/typewriterSound";

const ChatMessage = ({ message }) => {
  const isBot = message.sender === "bot";
  const [displayedText, setDisplayedText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const charIndexRef = useRef(0);
  const timeoutsRef = useRef([]);

  useEffect(() => {
    // Nettoyage des anciens timeouts
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];

    if (isBot && message.isStreaming && message.text) {
      setIsStreaming(true);
      charIndexRef.current = 0;
      setDisplayedText("");

      const streamText = () => {
        if (charIndexRef.current < message.text.length) {
          const nextChar = message.text[charIndexRef.current];
          setDisplayedText((p) => p + nextChar);

          if (nextChar !== " " && nextChar !== "\n") {
            playTypewriterSound();
          }

          charIndexRef.current++;

          const delay =
            nextChar === " " || nextChar === "\n"
              ? 10
              : /[.!?]/.test(nextChar)
              ? 60
              : 30;

          const id = setTimeout(streamText, delay);
          timeoutsRef.current.push(id);
        } else {
          setIsStreaming(false);
        }
      };

      const firstId = setTimeout(streamText, 80);
      timeoutsRef.current.push(firstId);
    } else {
      setDisplayedText(message.text || "");
      setIsStreaming(false);
    }

    // Cleanup on unmount / changement de message
    return () => {
      timeoutsRef.current.forEach((id) => clearTimeout(id));
      timeoutsRef.current = [];
    };
  }, [isBot, message.text, message.isStreaming]);

  // Sécuriser le timestamp (Date ou string)
  const date =
    message.timestamp instanceof Date
      ? message.timestamp
      : new Date(message.timestamp);

  return (
    <div className={`flex mb-3 ${isBot ? "justify-start" : "justify-end"}`}>
      <div
        className={`flex max-w-[80%] ${
          isBot ? "flex-row" : "flex-row-reverse"
        }`}
      >
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isBot ? "mr-2" : "ml-2"}`}>
          {isBot ? (
            <BotAvatar
              expression={message.expression || "idle"}
              size="small"
              animated={false}
            />
          ) : (
            <div className="w-12 h-12 pixel-border bg-pixel-accent dark:bg-[#ff6f61b2] flex items-center justify-center text-base font-pixel text-white dark:text-black">
              U
            </div>
          )}
        </div>

        {/* Bubble */}
        <div className="flex flex-col">
          <div
            className={`px-4 py-3 pixel-border ${
              isBot
                ? "bg-white dark:bg-[#1a1a1a] text-black dark:text-white"
                : "bg-pixel-accent dark:bg-[#ff6f61b2] text-white dark:text-black"
            }`}
          >
            <p className="text-xs font-pixel mb-2 opacity-75">
              {isBot ? "CHAT’BRUTI 🤡" : "TOI"}
            </p>

            <p className="text-sm font-pixel whitespace-pre-wrap leading-relaxed">
              {displayedText}
              {isStreaming && (
                <span className="inline-block w-2 h-4 bg-current ml-1 pixel-blink">
                  |
                </span>
              )}
            </p>
          </div>

          <span
            className={`text-xs font-pixel text-black dark:text-white mt-2 ${
              isBot ? "text-left" : "text-right"
            }`}
          >
            [
            {date.toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
            ]
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
