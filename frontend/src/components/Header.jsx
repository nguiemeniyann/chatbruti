// src/components/Header.jsx
import React from "react";
import AuthButton from "./AuthButton.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";

const Header = () => {
  const { user } = useAuth ? useAuth() : { user: null };

  const xp = user?.xp ?? 0;
  const level = user?.level ?? 1;
  const messages = user?.messagesCount ?? 0;
  const xpToNext = 100;
  const xpCurrentLevel = xp % xpToNext;
  const xpProgress = Math.min(
    100,
    Math.floor((xpCurrentLevel / xpToNext) * 100)
  );

  return (
    <header className="bg-white dark:bg-[#1a1a1a] border-b-4 border-black dark:border-white pixel-border w-full">
      <div className="container mx-auto px-4 py-5">
        {/* BARRE D'OUTILS + HUD EN HAUT */}
        <div className="flex justify-between items-center mb-4 gap-4">
          {/* Mini HUD joueur (si connecté) */}
          {user ? (
            <div className="hidden md:flex items-center gap-3 font-pixel text-[10px]">
              <div className="px-3 py-2 bg-black/5 dark:bg-white/5 border-2 border-black dark:border-white">
                <span className="block text-[9px] text-pixel-accent dark:bg-[#ff6f61b2] mb-1">
                  [ DRESSEUR ]
                </span>
                <span className="block text-xs text-black dark:text-white">
                  {user.username.toUpperCase()}
                </span>
              </div>

              <div className="px-3 py-2 bg-black/5 dark:bg-white/5 border-2 border-black dark:border-white">
                <span className="block text-[9px] text-pixel-accent dark:bg-[#ff6f61b2] mb-1">
                  [ LV / XP ]
                </span>
                <span className="block text-[10px] text-black dark:text-white">
                  LV.{level} • {xpCurrentLevel}/{xpToNext} XP
                </span>
                <div className="mt-1 w-40 h-2 bg-black/10 dark:bg-white/10 border border-black dark:border-white relative overflow-hidden">
                  <div
                    className="h-full bg-pixel-accent dark:bg-[#ff6f61b2]"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
              </div>

              <div className="px-3 py-2 bg-black/5 dark:bg-white/5 border-2 border-black dark:border-white">
                <span className="block text-[9px] text-pixel-accent dark:bg-[#ff6f61b2] mb-1">
                  [ STATS ]
                </span>
                <span className="block text-[10px] text-black dark:text-white">
                  MSG : {messages}
                </span>
              </div>
            </div>
          ) : (
            <div className="hidden md:block font-pixel text-[10px] text-pixel-accent dark:bg-[#ff6f61b2]">
              [ CONNECTE-TOI POUR DÉBLOQUER LES STATS &amp; BADGES ]
            </div>
          )}

          {/* Bouton Login / Quit */}
          <div className="flex justify-end items-center">
            <AuthButton />
          </div>
        </div>

        {/* CONTENU PRINCIPAL DU HEADER */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          {/* Logo Chat’Bruti */}
          <div className="flex justify-center md:justify-start w-full md:w-auto">
            <div className="w-20 h-20 md:w-24 md:h-24 pixel-border bg-white dark:bg-black flex items-center justify-center">
              <img
                src="/chatbruti_brain.png"
                alt="Logo Chat'Bruti"
                className="w-16 h-16 md:w-20 md:h-20 object-contain"
              />
            </div>
          </div>

          {/* Titre + sous-titre + bandeau */}
          <div className="flex-1 flex flex-col items-center md:items-center gap-3">
            <div className="text-center">
              <h1 className="text-sm md:text-lg lg:text-xl font-pixel text-black dark:text-white mb-2 pixel-text">
                [*] CHAT’BRUTI [*]
              </h1>
              <p className="text-xs md:text-sm font-pixel text-pixel-accent dark:bg-[#ff6f61b2] mb-2">
                &gt; CHATBOT DU NON-SENS TOTAL &lt;
              </p>
            </div>

            <div className="inline-block bg-pixel-accent dark:bg-[#ff6f61b2] text-white dark:text-black px-4 py-3 pixel-border font-pixel text-[10px] md:text-xs">
              [ NUIT DE L&apos;INFO – MODE CLOWN ACTIVÉ 🤡 ]
            </div>

            {/* Hint gamifié */}
            <p className="mt-1 text-[9px] md:text-[10px] font-pixel text-black/70 dark:text-white/70">
              PLUS TA QUESTION EST ABSURDE, PLUS TU REND LE BOT PUISSANT.
            </p>
          </div>

          {/* Bloc gamification rapide (visible aussi sur mobile si user) */}
          {user && (
            <div className="w-full md:w-52 mt-3 md:mt-0">
              <div className="pixel-border bg-white dark:bg-black px-3 py-3 font-pixel text-[9px]">
                <p className="text-pixel-accent dark:bg-[#ff6f61b2] mb-1">
                  [ OBJECTIF DU JOUR ]
                </p>
                <ul className="space-y-1 text-left">
                  <li>- 3 questions absurdes = +XP bonus</li>
                  <li>- 1 pavé &gt; 100 caractères = BADGE</li>
                  <li>- Fais rager Chat’Bruti pour monter de niveau.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
