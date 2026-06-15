/**
 * STORAGE ENGINE
 * Handles all CRUD operations using localStorage
 */

const STORAGE_KEY = 'K_DEEP_USER_DATA';

const K_Storage = {
    // Initial Data Structure
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

    // Save Data to Local Storage
    save(data) {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(data)
        );

        if (window.auth && window.auth.currentUser) {

            window.saveUserData(data);

        }

    },

    // Retrieve Data
    getData() {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) {
            this.save(this.initialData);
            return this.initialData;
        }
        return JSON.parse(data);
    },

    // Update specific keys
    updateProfile(updates) {
        const data = this.getData();
        data.profile = { ...data.profile, ...updates };
        this.save(data);
        return data.profile;
    },

    // Habits CRUD
    addHabit(habit) {
        const data = this.getData();
        const newHabit = {
            id: Date.now(),
            name: habit.name,
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

    // Study Log CRUD
    addStudyLog(log) {
        const data = this.getData();
        const newLog = {
            id: Date.now(),
            subject: log.subject,
            duration: log.duration, // minutes
            xpEarned: log.xpEarned,
            timestamp: new Date().toISOString()
        };
        data.studyLogs.push(newLog);
        this.save(data);
        return newLog;
    },

    // Journal CRUD
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
            data.journal[index] = journalData;
        } else {
            data.journal.push(journalData);
        }

        this.save(data);
        return journalData;
    }
};