import { db } from '../utils/firebase.js';
import { doc, getDoc } from "firebase/firestore";

export const loadMenu = async () => {
  const docRef = doc(db, "menu", "tamales");
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const container = document.getElementById('menu-container');
    docSnap.data().items.forEach(item => {
      container.innerHTML += `
        <div class="menu-item">
          <h3>${item.name}</h3>
          <p>${item.description}</p>
          <p class="price">$${item.price}</p>
        </div>
      `;
    });
  }
};
