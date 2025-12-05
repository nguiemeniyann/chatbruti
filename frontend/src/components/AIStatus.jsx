import React, { useEffect, useState } from "react";
import { getAvailableProvider } from "../services/aiService.js";

const AIStatus = () => {
  const [provider, setProvider] = useState("…");

  useEffect(() => {
    const load = async () => {
      try {
        const p = await getAvailableProvider();
        setProvider(p.toUpperCase());
      } catch {
        setProvider("LOCAL");
      }
    };
    load();
  }, []);

  return (
    <p className="font-pixel text-[10px] text-pixel-accent dark:text-[#FF6F61]">
      [ IA : {provider} ]
    </p>
  );
};

export default AIStatus;
