import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  getUserConversations,
  deleteConversation,
  createConversation,
} from "../services/conversationService";

const ConversationSidebar = ({
  onLoadConversation,
  currentConversationId,
  onNewConversation,
  onSidebarToggle,
}) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    setIsOpen(!!user);
  }, [user]);

  useEffect(() => {
    onSidebarToggle?.(isOpen);
  }, [isOpen]);

  useEffect(() => {
    if (user) loadConversations();
    else setConversations([]);
  }, [user]);

  const loadConversations = async () => {
    try {
      const data = await getUserConversations(user.id);
      setConversations(data);
    } catch (e) {
      console.error("Erreur chargement conversations:", e);
    }
  };

  const handleDelete = async (conversationId, e) => {
    e.stopPropagation();
    if (!confirm("Supprimer ce chef-d'œuvre du chaos ?")) return;

    try {
      await deleteConversation(conversationId);
      await loadConversations();

      if (conversationId === currentConversationId) {
        onNewConversation();
      }
    } catch (e) {
      alert("Erreur lors de la suppression.");
    }
  };

  const handleLoad = (conv) => {
    onLoadConversation(conv.messages, conv.id);
  };

  if (!user) return null;

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed z-30 bg-white dark:bg-[#1a1a1a] pixel-border px-3 py-2 text-pixel-accent dark:bg-[#ff6f61b2]  font-pixel text-sm hover:bg-pixel-accent hover:text-white dark:hover:text-black transition-all ${
          isOpen ? "left-[280px] top-4" : "left-0 top-4"
        }`}
      >
        {isOpen ? "◀" : "▶"}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-white dark:bg-[#1a1a1a] border-r-4 border-black dark:border-white shadow-2xl z-20 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ width: "280px" }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b-4 border-black dark:border-white">
            <button
              onClick={onNewConversation}
              className="w-full pixel-button bg-pixel-accent dark:bg-[#ff6f61b2] text-black px-4 py-3 text-sm font-pixel mb-3 hover:opacity-90"
            >
              + NOUVEAU DÉLIRE
            </button>

            <h2 className="text-base font-pixel text-black dark:text-white pixel-text">
              [ CONVERSATIONS DU CHAOS ]
            </h2>
          </div>

          {/* Conversations list */}
          <div className="flex-1 overflow-y-auto p-3">
            {conversations.length === 0 ? (
              <p className="text-center text-black dark:text-white py-8 text-sm font-pixel opacity-75">
                AUCUN DÉLIRE ENREGISTRÉ
              </p>
            ) : (
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => handleLoad(conv)}
                    className={`p-3 pixel-border cursor-pointer transition-all group ${
                      conv.id === currentConversationId
                        ? "bg-pixel-accent dark:bg-[#ff6f61b2] text-white dark:text-black"
                        : "bg-white dark:bg-[#1a1a1a] hover:bg-[#f5f5f5] dark:hover:bg-black text-black dark:text-white"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-pixel text-sm truncate">
                          {conv.title}
                        </h3>
                        <p className="text-xs font-pixel opacity-75">
                          [
                          {new Date(conv.updatedAt).toLocaleDateString("fr-FR", {
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
                        className="opacity-0 group-hover:opacity-100 text-pixel-accent dark:bg-[#ff6f61b2] hover:opacity-75 text-base font-pixel transition-opacity"
                        title="Supprimer"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer count */}
          <div className="p-4 border-t-4 border-black dark:border-white">
            <p className="text-xs font-pixel text-black dark:text-white text-center">
              [{conversations.length}] DÉLIRE
              {conversations.length > 1 ? "S" : ""}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConversationSidebar;
