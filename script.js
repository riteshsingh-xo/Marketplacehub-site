const form = document.getElementById("uploadForm");
const itemsContainer = document.getElementById("itemsContainer");
const searchBar = document.getElementById("searchBar");

function displayItems(filter = "") {
  db.collection("items")
    .orderBy("createdAt", "desc")
    .get()
    .then(snapshot => {
      itemsContainer.innerHTML = "";
      snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(item => item.name.toLowerCase().includes(filter.toLowerCase()))
        .forEach(item => {
          const div = document.createElement("div");
          div.className = "item";
          div.innerHTML = `
            <img src="${item.image}" alt="${item.name}" />
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            <p><strong>$${item.price}</strong></p>
            <button onclick="buyItem('${item.id}')">Buy Now</button>
          `;
          itemsContainer.appendChild(div);
        });
    });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("itemName").value;
  const description = document.getElementById("itemDescription").value;
  const price = document.getElementById("itemPrice").value;
  const imageFile = document.getElementById("itemImage").files[0];

  const storageRef = storage.ref(`images/${Date.now()}_${imageFile.name}`);
  await storageRef.put(imageFile);
  const imageUrl = await storageRef.getDownloadURL();

  await db.collection("items").add({
    name,
    description,
    price,
    image: imageUrl,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  form.reset();
  displayItems(searchBar.value);
});

function buyItem(itemId) {
  const confirmDelete = confirm("Do you want to purchase (delete) this item?");
  if (confirmDelete) {
    db.collection("items").doc(itemId).delete().then(() => {
      alert("Item purchased!");
      displayItems(searchBar.value);
    });
  }
}

searchBar.addEventListener("input", () => displayItems(searchBar.value));
displayItems();
