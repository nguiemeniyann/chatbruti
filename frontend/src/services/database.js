// src/services/database.js
// Service de base de données IndexedDB pour remplacer localStorage

const DB_NAME = "ChatbotDB";
const DB_VERSION = 1;

class DatabaseService {
  constructor() {
    /** @type {IDBDatabase | null} */
    this.db = null;
  }

  async init() {
    if (this.db) return; // déjà initialisé

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Store pour les utilisateurs
        if (!db.objectStoreNames.contains("users")) {
          const userStore = db.createObjectStore("users", { keyPath: "id" });
          userStore.createIndex("username", "username", { unique: true });
          userStore.createIndex("email", "email", { unique: true });
        }

        // Store pour les conversations
        if (!db.objectStoreNames.contains("conversations")) {
          const convStore = db.createObjectStore("conversations", {
            keyPath: "id",
          });
          convStore.createIndex("userId", "userId", { unique: false });
          convStore.createIndex("updatedAt", "updatedAt", { unique: false });
        }
      };
    });
  }

  /* ========== USERS ========== */

  async createUser(user) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["users"], "readwrite");
      const store = transaction.objectStore("users");
      const request = store.add(user);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getUserById(id) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["users"], "readonly");
      const store = transaction.objectStore("users");
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getUserByUsername(username) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["users"], "readonly");
      const store = transaction.objectStore("users");
      const index = store.index("username");
      const request = index.get(username);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getUserByEmail(email) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["users"], "readonly");
      const store = transaction.objectStore("users");
      const index = store.index("email");
      const request = index.get(email);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async findUserByUsernameOrEmail(identifier) {
    const byUsername = await this.getUserByUsername(identifier);
    if (byUsername) return byUsername;
    return await this.getUserByEmail(identifier);
  }

  /* ========== CONVERSATIONS ========== */

  async createConversation(conversation) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["conversations"], "readwrite");
      const store = transaction.objectStore("conversations");
      const request = store.add(conversation);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async updateConversation(conversation) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["conversations"], "readwrite");
      const store = transaction.objectStore("conversations");
      const request = store.put(conversation);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getConversationById(id) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["conversations"], "readonly");
      const store = transaction.objectStore("conversations");
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getUserConversations(userId) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["conversations"], "readonly");
      const store = transaction.objectStore("conversations");
      const index = store.index("userId");
      const request = index.getAll(userId);

      request.onsuccess = () => {
        const conversations = request.result || [];
        conversations.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        resolve(conversations);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteConversation(id) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["conversations"], "readwrite");
      const store = transaction.objectStore("conversations");
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const db = new DatabaseService();

// Initialiser la base de données au démarrage
db.init().catch(console.error);
