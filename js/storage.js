/**
 * K-DEEP XP - STORAGE ENGINE
 * Handles all CRUD operations, localStorage persistence, and Cloud Sync triggers.
 */

const STORAGE_KEY = 'K_DEEP_USER_DATA';

const K_Storage = {
    /**
     * Initial Data Structure for New Users
     */
    initialData: {
        profile: {
            name: "Player One",
            level: 1,
            xp: 0,
            totalXp: 0,
            streak: 0,
            lastActive: null,
            badges: [],
            avatar: "",
            theme: "dark",
            accent: "#06b6d4"
        },
        habits: [],
        studyLogs: [],
        journal: [],
        settings: {
            theme: 'dark',
            notifications: true
        }
    },

    /**
     * Persist data to LocalStorage and trigger Firebase Cloud Sync if authenticated
     * @param {Object} data - The complete user data object
     */
    save(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

            // Background Cloud Sync if Firebase is initialized and user is logged in
            if (typeof firebase !== "undefined" && firebase.auth().currentUser && typeof window.saveUserData === "function") {
                window.saveUserData(data);
            }
        } catch (error) {
            console.error("Storage Error: Failed to save data", error);
        }
    },

    /**
     * Retrieve data from LocalStorage
     * Initializes storage with initialData if empty
     * @returns {Object} User data object
     */
    getData() {
        const rawData = localStorage.getItem(STORAGE_KEY);
        
        if (!rawData) {
            this.save(this.initialData);
            return this.initialData;
        }

        try {
            return JSON.parse(rawData);
        } catch (error) {
            console.error("Storage Error: Corrupted data found, resetting to default.", error);
            return this.initialData;
        }
    },

    /**
     * Updates profile properties and persists changes
     * @param {Object} updates - Object containing profile keys to update
     * @returns {Object} Updated profile object
     */
    updateProfile(updates) {
        const data = this.getData();
        data.profile = { ...data.profile, ...updates };
        this.save(data);
        return data.profile;
    },

    /**
     * Create a new Habit entry
     * @param {Object} habit - Habit details (name, icon, color)
     * @returns {Object} The newly created habit
     */
    addHabit(habit) {
        const data = this.getData();
        const newHabit = {
            id: Date.now(),
            name: habit.name || "Untitled Habit",
            icon: habit.icon || 'star',
            color: habit.color || '#06b6d4',
            streak: 0,
            completedDates: [], // Format: YYYY-MM-DD
            createdAt: new Date().toISOString()
        };
        
        data.habits.push(newHabit);
        this.save(data);
        return newHabit;
    },

    /**
     * Add a completed Study session log
     * @param {Object} log - Session details (subject, duration, xpEarned)
     * @returns {Object} The recorded log
     */
    addStudyLog(log) {
        const data = this.getData();
        const newLog = {
            id: Date.now(),
            subject: log.subject || "General",
            duration: log.duration || 0, // minutes
            xpEarned: log.xpEarned || 0,
            timestamp: new Date().toISOString()
        };
        
        data.studyLogs.push(newLog);
        this.save(data);
        return newLog;
    },

    /**
     * Saves or Updates a Journal entry for the current date
     * @param {Object} entry - Journal content (mood, wins, mistakes, etc.)
     * @returns {Object} The saved journal data
     */
    saveJournalEntry(entry) {
        const data = this.getData();
        const today = new Date().toISOString().split('T')[0];
        const index = data.journal.findIndex(j => j.date === today);

        const journalData = {
            date: today,
            ...entry,
            updatedAt: new Date().toISOString()
        };

        if (index > -1) {
            // Update existing entry for today
            data.journal[index] = { ...data.journal[index], ...journalData };
        } else {
            // Create new entry
            data.journal.push(journalData);
        }

        this.save(data);
        return journalData;
    }
};