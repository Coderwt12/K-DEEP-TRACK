/**
 * K-DEEP XP - SIMPLE FIREBASE AUTH (COMPAT SDK)
 * Ensure these tags are in your index.html:
 * <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
 * <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
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
 */
let isLoggingIn = false;

window.signInWithGoogle = async function () {

    if (isLoggingIn) return;

    isLoggingIn = true;

    try {

        const result = await auth.signInWithPopup(provider);

        console.log("Login Successful");

    }

    catch (error) {

        console.log(error.message);

    }

    finally {

        isLoggingIn = false;

    }

};

/**
 * Global Logout Function
 */
window.logoutUser = function () {
    auth.signOut()
        .then(() => {
            console.log("Logged Out Successfully");
        })
        .catch((error) => {
            console.error("Logout Error:", error.message);
        });
};

/**
 * Auth State Observer
 */
auth.onAuthStateChanged((user) => {
    const userBox = document.getElementById('user-box');

    if (user) {
        // Console Logs
        console.log("Logged In");
        console.log("User:", user.displayName);

        // UI Update for #user-box
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
    } else {
        console.log("Not Logged In");

        // UI Update for #user-box
        if (userBox) {
            userBox.innerHTML = `
                <div style="padding: 10px; text-align: center; color: #a1a1aa; font-size: 0.8rem;">
                    Not Logged In
                </div>
            `;
        }
    }
});
window.saveUserData = async function(data){

    const user = auth.currentUser;

    if(!user) return;

    try{

        await db.collection("users")
        .doc(user.uid)
        .set(data);

        console.log("Data Saved To Firestore");

    }

    catch(err){

        console.log(err);

    }

}
auth.onAuthStateChanged((user) => {
    if (user) {
        // LocalStorage profile update (Photo sync fix)
        const data = K_Storage.getData();
        data.profile.name = user.displayName;
        data.profile.avatar = user.photoURL; // Photo URL yahan save hoga
        K_Storage.save(data);

        // Sidebar update
        const avatarImg = document.querySelector('.sidebar-avatar'); // Agar sidebar mein avatar img hai
        if(avatarImg) avatarImg.src = user.photoURL;

        console.log("Authenticated:", user.displayName);
        if (window.K_App) K_App.init(); 
    } else {
        console.log("Logged Out");
    }
});
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log("Authenticated:", user.displayName);
        // Sync local profile with firebase
        const data = K_Storage.getData();
        data.profile.name = user.displayName;
        data.profile.avatar = user.photoURL;
        K_Storage.save(data);

        // Sabse Important: Agar user Settings page par hai toh UI refresh karo
        if (window.K_App && K_App.currentView === 'settings') {
            K_Settings.init();
        }
        if (window.K_App && K_App.currentView === 'dashboard') {
            K_Dashboard.init();
        }
    } else {
        console.log("Logged Out");
    }
});