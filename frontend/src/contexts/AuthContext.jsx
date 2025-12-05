import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "../services/database";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // --- utilitaire pour synchroniser user + localStorage ---
  const persistUser = (userData) => {
    setUser(userData);
    localStorage.setItem("currentUser", JSON.stringify(userData));
  };

  // Initialiser la base de données et charger l'utilisateur
  useEffect(() => {
    const init = async () => {
      try {
        await db.init();

        // Charger l'utilisateur depuis localStorage
        const savedUser = localStorage.getItem("currentUser");
        if (savedUser) {
          try {
            const userData = JSON.parse(savedUser);

            // S'assurer que les champs gamification existent
            const hydrated = {
              ...userData,
              xp: userData.xp ?? 0,
              level: userData.level ?? 1,
              messagesCount: userData.messagesCount ?? 0,
              longestCombo: userData.longestCombo ?? 0,
              badges: userData.badges ?? [],
            };

            setUser(hydrated);
            localStorage.setItem("currentUser", JSON.stringify(hydrated));
          } catch (error) {
            console.error("Error loading user:", error);
            localStorage.removeItem("currentUser");
          }
        }
      } catch (error) {
        console.error("Error initializing database:", error);
      } finally {
        setIsInitialized(true);
      }
    };
    init();
  }, []);

  // --- LOGIN ---
  const login = async (username, password) => {
    try {
      await db.init();
      const foundUser = await db.findUserByUsernameOrEmail(username);

      if (foundUser && foundUser.password === password) {
        const userData = {
          id: foundUser.id,
          username: foundUser.username,
          email: foundUser.email,
          createdAt: foundUser.createdAt,
          // Champs gamification (avec valeurs par défaut si absent en DB)
          xp: foundUser.xp ?? 0,
          level: foundUser.level ?? 1,
          messagesCount: foundUser.messagesCount ?? 0,
          longestCombo: foundUser.longestCombo ?? 0,
          badges: foundUser.badges ?? [],
        };

        persistUser(userData);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  // --- SIGNUP ---
  const signup = async (username, email, password) => {
    try {
      await db.init();

      // Vérifier si l'utilisateur ou l'email existe déjà
      const existingUser = await db.getUserByUsername(username);
      if (existingUser) {
        throw new Error("Ce nom d'utilisateur est déjà pris");
      }

      const existingEmail = await db.getUserByEmail(email);
      if (existingEmail) {
        throw new Error("Cet email est déjà utilisé");
      }

      const now = new Date().toISOString();

      const newUser = {
        id: Date.now().toString(),
        username,
        email,
        password, // ⚠️ en prod on hashe
        createdAt: now,
        // Champs gamification par défaut
        xp: 0,
        level: 1,
        messagesCount: 0,
        longestCombo: 0,
        badges: [],
      };

      await db.createUser(newUser);

      const userData = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        createdAt: newUser.createdAt,
        xp: newUser.xp,
        level: newUser.level,
        messagesCount: newUser.messagesCount,
        longestCombo: newUser.longestCombo,
        badges: newUser.badges,
      };

      persistUser(userData);
      return true;
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  // --- LOGOUT ---
  const logout = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
  };

  // --- GAMIFICATION : fonctions utilitaires ---

  // Ajoute de l'XP et gère le level-up
  const addXP = (amount) => {
    if (!user || !amount) return;

    setUser((prev) => {
      if (!prev) return prev;

      const currentXP = prev.xp ?? 0;
      const currentLevel = prev.level ?? 1;

      const newXP = currentXP + amount;

      // Exemple de formule : 100 XP par niveau
      const computedLevel = Math.floor(newXP / 100) + 1;
      const levelUp = computedLevel > currentLevel;

      const updated = {
        ...prev,
        xp: newXP,
        level: computedLevel,
      };

      // On peut attribuer un badge sur Level Up
      if (levelUp) {
        const badges = new Set(updated.badges ?? []);
        badges.add(`LEVEL_${computedLevel}`);
        updated.badges = Array.from(badges);
      }

      localStorage.setItem("currentUser", JSON.stringify(updated));
      return updated;
    });
  };

  // Incrémente le nombre de messages envoyés
  const incrementMessages = () => {
    if (!user) return;

    setUser((prev) => {
      if (!prev) return prev;

      const newCount = (prev.messagesCount ?? 0) + 1;
      const updated = {
        ...prev,
        messagesCount: newCount,
      };

      localStorage.setItem("currentUser", JSON.stringify(updated));
      return updated;
    });
  };

  // Met à jour le plus long combo de messages (si tu veux gérer ça côté chat)
  const updateLongestCombo = (comboValue) => {
    if (!user) return;

    setUser((prev) => {
      if (!prev) return prev;

      const currentLongest = prev.longestCombo ?? 0;
      const updated = {
        ...prev,
        longestCombo: comboValue > currentLongest ? comboValue : currentLongest,
      };

      localStorage.setItem("currentUser", JSON.stringify(updated));
      return updated;
    });
  };

  // Débloque un badge (par ID)
  const unlockBadge = (badgeId) => {
    if (!user || !badgeId) return;

    setUser((prev) => {
      if (!prev) return prev;

      const existingBadges = prev.badges ?? [];
      if (existingBadges.includes(badgeId)) return prev;

      const updated = {
        ...prev,
        badges: [...existingBadges, badgeId],
      };

      localStorage.setItem("currentUser", JSON.stringify(updated));
      return updated;
    });
  };

  // Réinitialiser la progression gamifiée (sans supprimer le compte)
  const resetProgress = () => {
    if (!user) return;

    const resetUser = {
      ...user,
      xp: 0,
      level: 1,
      messagesCount: 0,
      longestCombo: 0,
      badges: [],
    };

    persistUser(resetUser);
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white font-pixel">
        [ LOADING CHAT’BRUTI USER DATA... ]
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        // Gamification
        addXP,
        incrementMessages,
        unlockBadge,
        updateLongestCombo,
        resetProgress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
