/**
 * K-DEEP XP - FIREBASE ENGINE
 * Optimized Production Version (Compat SDK)
 * Handles Authentication, Firestore Sync, and Auth State Persistence
 */

const firebaseConfig = {
    apiKey: "AIzaSyCBkFgB7KvNb-LChHyaMRi69WitFrpzgPM",
    authDomain: "k-deep-track.firebaseapp.com",
    projectId: "k-deep-track",
    storageBucket: "k-deep-track.firebasestorage.app",
    messagingSenderId: "396439029926",
    appId: "1:396439029926:web:97357139df0bda71570c67"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const provider = new firebase.auth.GoogleAuthProvider();

/**
 * Global Login Function
 * Prevents multiple popup instances using a concurrency flag
 */
let isLoggingIn = false;

window.signInWithGoogle = async function () {
    if (isLoggingIn) return;
    isLoggingIn = true;

    try {
        await auth.signInWithPopup(provider);
        console.log("Firebase: Login Successful");
    } catch (error) {
        console.error("Firebase: Login Error", error.message);
    } finally {
        isLoggingIn = false;
    }
};

/**
 * Global Logout Function
 */
window.logoutUser = function () {
    auth.signOut()
        .then(() => {
            console.log("Firebase: Logged Out Successfully");
        })
        .catch((error) => {
            console.error("Firebase: Logout Error", error.message);
        });
};

/**
 * Firestore Data Sync
 * Persists local state to the cloud mainframe
 */
window.saveUserData = async function (data) {
    const user = auth.currentUser;
    if (!user) return;

    try {
        await db.collection("users").doc(user.uid).set(data);
        console.log("Firebase: Data Synced to Firestore");
    } catch (err) {
        console.error("Firebase: Sync Error", err);
    }
};

/**
 * Unified Auth State Observer
 * Consolidates profile syncing, UI updates, and view refreshes into a single listener
 */
auth.onAuthStateChanged((user) => {
    const userBox = document.getElementById('user-box');
    const sidebarAvatar = document.querySelector('.sidebar-avatar');

    if (user) {
        console.log("Firebase: Authenticated as", user.displayName);

        // 1. Sync local profile with Firebase identity
        if (typeof K_Storage !== "undefined") {
            const data = K_Storage.getData();
            data.profile.name = user.displayName;
            data.profile.avatar = user.photoURL;
            K_Storage.save(data);
        }

        // 2. Update Header/Sidebar UI elements
        if (sidebarAvatar) sidebarAvatar.src = user.photoURL;
        
        if (userBox) {
            userBox.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px; padding: 10px; border-radius: 8px; background: rgba(255,255,255,0.05);">
                    <img src="${user.photoURL}" alt="Avatar" style="width: 40px; height: 40px; border-radius: 50%;">
                    <div>
                        <div style="font-weight: bold; font-size: 0.9rem;">${user.displayName}</div>
                        <div style="font-size: 0.75rem; opacity: 0.7;">${user.email}</div>
                    </div>
                </div>
            `;
        }

        // 3. Initialize App Logic
        if (window.K_App) {
            // Only init app core if it hasn't been initialized yet
            if (typeof K_App.init === "function") K_App.init();

            // Refresh specific modules if they are currently being viewed
            const activeView = K_App.currentView;
            if (activeView === 'settings' && typeof K_Settings !== "undefined") K_Settings.init();
            if (activeView === 'dashboard' && typeof K_Dashboard !== "undefined") K_Dashboard.init();
        }
    } else {
        console.log("Firebase: User Logged Out");

        // Reset UI to guest state
        if (userBox) {
            userBox.innerHTML = `<div style="padding: 10px; text-align: center; color: #a1a1aa; font-size: 0.8rem;">Not Logged In</div>`;
        }
        if (sidebarAvatar) sidebarAvatar.src = "image/default-avatar.png"; // Fallback image
    }
});