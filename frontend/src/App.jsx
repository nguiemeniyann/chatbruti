import React, { useState } from "react";
import Layout from "./components/Layout.jsx";
import ChatCharlatan from "./components/ChatCharlatan.jsx";
import ConversationSidebar from "./components/ConversationSidebar.jsx";
import ConversationHistory from "./components/ConversationHistory.jsx";

const App = () => {
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [initialMessages, setInitialMessages] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLoadConversation = (messages, conversationId) => {
    setCurrentConversationId(conversationId || null);
    setInitialMessages(messages || []);
  };

  const handleNewConversation = () => {
    setCurrentConversationId(null);
    setInitialMessages([]);
  };

  return (
    <>
      {/* Sidebar latérale des conversations */}
      <ConversationSidebar
        onLoadConversation={handleLoadConversation}
        currentConversationId={currentConversationId}
        onNewConversation={handleNewConversation}
        onSidebarToggle={(isOpen) => setSidebarOpen(isOpen)}
      />

      <Layout sidebarOpen={sidebarOpen}>
        <div className="flex flex-col gap-4">
          {/* Bouton / popup d'historique */}
          <div className="flex justify-end mb-2">
            <ConversationHistory
              onLoadConversation={handleLoadConversation}
              currentConversationId={currentConversationId}
            />
          </div>

          {/* Zone principale de chat */}
          <ChatCharlatan
            initialMessages={initialMessages || []}
            conversationId={currentConversationId}
          />
        </div>
      </Layout>
    </>
  );
};

export default App;
