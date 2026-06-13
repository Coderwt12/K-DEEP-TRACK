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

// Services
const auth = firebase.auth();
const db = firebase.firestore();

const googleProvider = new firebase.auth.GoogleAuthProvider();

window.auth = auth;
window.db = db;


// Google Login

window.signInWithGoogle = function () {

    auth.signInWithPopup(googleProvider)

        .then((result) => {

            console.log("User Name:", result.user.displayName);

            console.log("Email:", result.user.email);

            console.log("Photo:", result.user.photoURL);

        })

        .catch((error) => {

            console.error(error);

        });

};


// Logout

window.logoutUser = function () {

    auth.signOut()

        .then(() => {

            console.log("Logged out");

        })

        .catch((error) => {

            console.error(error);

        });

};

auth.onAuthStateChanged(function (user) {

    const box = document.getElementById("user-box");

    // Agar settings page open nahi hai
    if (!box) return;

    if (user) {

        box.innerHTML = `
            <img src="${user.photoURL}"
            width="60"
            height="60"
            style="border-radius:50%;">

            <h3>${user.displayName}</h3>

            <p>${user.email}</p>
        `;

    }

    else {

        box.innerHTML = "Not Logged In";

    }

});
``