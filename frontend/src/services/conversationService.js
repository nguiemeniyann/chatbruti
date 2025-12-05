// src/services/conversationService.js
import { db } from "./database";

/**
 * Récupère toutes les conversations d'un utilisateur
 */
export async function getUserConversations(userId) {
  try {
    await db.init();
    return await db.getUserConversations(userId);
  } catch (error) {
    console.error("Error loading conversations:", error);
    return [];
  }
}

/**
 * Sauvegarde une conversation complète
 */
export async function saveConversation(conversation) {
  try {
    await db.init();
    await db.updateConversation(conversation);
  } catch (error) {
    console.error("Error saving conversation:", error);
  }
}

/**
 * Crée une nouvelle conversation
 */
export async function createConversation(userId, title) {
  const conversation = {
    id: Date.now().toString(),
    userId,
    title,
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.init();
  await db.createConversation(conversation);
  return conversation;
}

/**
 * Met à jour les messages d'une conversation
 */
export async function updateConversationMessages(conversationId, messages) {
  try {
    await db.init();
    const conversation = await db.getConversationById(conversationId);

    if (conversation) {
      conversation.messages = messages;
      conversation.updatedAt = new Date().toISOString();
      await db.updateConversation(conversation);
    }
  } catch (error) {
    console.error("Error updating conversation:", error);
  }
}

/**
 * Supprime une conversation
 */
export async function deleteConversation(conversationId) {
  try {
    await db.init();
    await db.deleteConversation(conversationId);
  } catch (error) {
    console.error("Error deleting conversation:", error);
  }
}

/**
 * Récupère une conversation par son ID
 */
export async function getConversationById(conversationId) {
  try {
    await db.init();
    return await db.getConversationById(conversationId);
  } catch (error) {
    console.error("Error loading conversation:", error);
    return null;
  }
}
