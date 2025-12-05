import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  getUserConversations,
  deleteConversation,
} from "../services/conversationService";

const ConversationHistory = ({
  onLoadConversation,
  currentConversationId,
}) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadConversations();
    } else {
      setConversations([]);
    }
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;
    try {
      const userConversations = await getUserConversations(user.id);
      setConversations(
        userConversations.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
      );
    } catch (err) {
      console.error("Erreur lors du chargement de l'historique :", err);
    }
  };

  const handleDelete = async (conversationId, e) => {
    e.stopPropagation();
    if (
      !confirm("Êtes-vous sûr de vouloir supprimer cette conversation du chaos ?")
    ) {
      return;
    }

    try {
      await deleteConversation(conversationId);
      await loadConversations();

      if (conversationId === currentConversationId) {
        onLoadConversation([], "");
      }
    } catch (err) {
      console.error("Erreur suppression conversation :", err);
      alert("Impossible de supprimer cette conversation.");
    }
  };

  const handleLoad = (conversation) => {
    onLoadConversation(conversation.messages, conversation.id);
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <>
      {/* Bouton pour ouvrir la fenêtre d'historique */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="pixel-button bg-pixel-accent dark:bg-[#ff6f61b2] text-black px-4 py-3 text-xs md:text-sm"
      >
        📜 HISTORIQUE
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1a1a1a] pixel-border max-w-2xl w-full max-h-[80vh] flex flex-col">
            {/* Header de la popup */}
            <div className="flex justify-between items-center px-5 py-4 border-b-4 border-black dark:border-white">
              <h2 className="text-xs md:text-sm font-pixel text-black dark:text-white pixel-text">
                [ HISTORIQUE DES DÉLIRES ]
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-xl font-pixel text-black dark:text-white hover:opacity-70"
              >
                ×
              </button>
            </div>

            {/* Contenu */}
            <div className="flex-1 overflow-y-auto p-4">
              {conversations.length === 0 ? (
                <p className="text-center text-sm font-pixel text-black dark:text-white opacity-75 py-8">
                  AUCUN DÉLIRE SAUVEGARDÉ
                </p>
              ) : (
                <div className="space-y-3">
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => handleLoad(conv)}
                      className={`pixel-border p-3 cursor-pointer transition-all ${
                        conv.id === currentConversationId
                          ? "bg-pixel-accent dark:bg-[#50a0ff] text-black"
                          : "bg-white dark:bg-black text-black dark:text-white hover:bg-[#f5f5f5] dark:hover:bg-[#050505]"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          <h3 className="font-pixel text-xs md:text-sm mb-1 truncate">
                            {conv.title}
                          </h3>
                          <p className="text-[10px] md:text-xs font-pixel opacity-80">
                            {conv.messages.length} MESSAGE
                            {conv.messages.length > 1 ? "S" : ""}
                          </p>
                          <p className="text-[10px] font-pixel opacity-60 mt-1">
                            [
                            {new Date(
                              conv.updatedAt
                            ).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            ]
                          </p>
                        </div>

                        <button
                          onClick={(e) => handleDelete(conv.id, e)}
                          className="text-xs md:text-sm font-pixel text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          title="Supprimer"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t-4 border-black dark:border-white">
              <p className="text-[10px] md:text-xs font-pixel text-black dark:text-white text-center">
                [{conversations.length}] DÉLIRE
                {conversations.length > 1 ? "S" : ""} ENREGISTRÉ
                {conversations.length > 1 ? "S" : ""}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ConversationHistory;
