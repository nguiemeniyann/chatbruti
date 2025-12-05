import React, { useEffect, useState } from "react";

/**
 * Expressions possibles :
 * 'idle' | 'thinking' | 'laughing' | 'smirking' | 'confused' | 'excited' | 'philosophical'
 *
 * On les mappe sur les 4 images de Chat’Bruti :
 *  - idle -> chatbruti_idle.png
 *  - thinking / philosophical -> chatbruti_philo.png
 *  - laughing / smirking -> chatbruti_tongue.png
 *  - excited / confused -> chatbruti_brain.png
 */

const AVATAR_SOURCES = {
  idle: "/chatbruti_idle.png",
  thinking: "/chatbruti_philo.png",
  philosophical: "/chatbruti_philo.png",
  laughing: "/chatbruti_tongue.png",
  smirking: "/chatbruti_tongue.png",
  excited: "/chatbruti_brain.png",
  confused: "/chatbruti_brain.png",
};

const BotAvatar = ({ expression = "idle", size = "medium", animated = true }) => {
  const [currentExpression, setCurrentExpression] = useState(expression);
  const [isBlinking, setIsBlinking] = useState(false);

  // Clignement / petit “sursaut” aléatoire
  useEffect(() => {
    if (!animated) return;

    const blinkInterval = setInterval(() => {
      if (Math.random() < 0.3) {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 180);
      }
    }, 2800);

    return () => clearInterval(blinkInterval);
  }, [animated]);

  useEffect(() => {
    setCurrentExpression(expression);
  }, [expression]);

  const sizeClasses = {
    small: "w-10 h-10",
    medium: "w-16 h-16",
    large: "w-24 h-24",
  };

  const getAnimationClass = () => {
    if (!animated) return "";

    switch (currentExpression) {
      case "laughing":
      case "smirking":
        return "animate-bounce";
      case "thinking":
      case "philosophical":
        return "animate-pulse";
      case "excited":
        return "animate-wiggle";
      case "confused":
        return "animate-tilt";
      default:
        return "animate-float"; // définie dans ton index.css
    }
  };

  const src =
    AVATAR_SOURCES[currentExpression] || AVATAR_SOURCES.idle;

  return (
    <div className="relative inline-block">
      <div
        className={`
          ${sizeClasses[size] || sizeClasses.medium}
          pixel-border
          bg-white dark:bg-black
          flex items-center justify-center
          overflow-hidden
          transition-all duration-200
          ${getAnimationClass()}
          ${isBlinking ? "scale-95" : "scale-100"}
        `}
      >
        <img
          src={src}
          alt={`Avatar Chat'Bruti - ${currentExpression}`}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Particules "cerveau qui pète" */}
      {animated && currentExpression === "excited" && (
        <>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-pixel-accent dark:bg-[#ff6f61b2] rounded-full animate-ping" />
          <div
            className="absolute -bottom-1 -left-1 w-2 h-2 bg-pixel-accent dark:bg-[#ff6f61b2] rounded-full animate-ping"
            style={{ animationDelay: "0.4s" }}
          />
        </>
      )}

      {/* Bulles de pensée */}
      {animated &&
        (currentExpression === "thinking" ||
          currentExpression === "philosophical") && (
          <div className="absolute -top-2 -right-2">
            <div className="flex gap-1">
              <div
                className="w-2 h-2 bg-pixel-accent rounded-full animate-bounce"
                style={{ animationDelay: "0s" }}
              />
              <div
                className="w-2 h-2 bg-pixel-accent rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              />
              <div
                className="w-2 h-2 bg-pixel-accent rounded-full animate-bounce"
                style={{ animationDelay: "0.4s" }}
              />
            </div>
          </div>
        )}
    </div>
  );
};

export default BotAvatar;
