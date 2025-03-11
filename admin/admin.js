import { auth, db } from '../firebase-config.js';
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";

document.getElementById('adminLogin').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    document.getElementById('login').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    loadInventory();
  } catch (error) {
    alert('Credenciales incorrectas');
  }
});

const loadInventory = () => {
  const unsub = onSnapshot(doc(db, "menu", "tamales"), (doc) => {
    console.log("Inventario actualizado:", doc.data());
  });
};
