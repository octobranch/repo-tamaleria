document.getElementById("login-form").addEventListener("submit", function(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("error-message");

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            window.location.href = "dashboard.html"; // Redirigir al panel
        })
        .catch((error) => {
            errorMessage.textContent = "Error: " + error.message;
        });
});
