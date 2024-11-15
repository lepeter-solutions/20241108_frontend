function getCardTemplate() {
  return document.getElementById("card-template").content.cloneNode(true);
}

function getUserProfile(id) {
  return `http://localhost:3000/users/${id}/profile`;
}

function createCard(data) {
  const card = getCardTemplate();
  const root = card.children[0];
  card.querySelector(".email").textContent = data.email;
  card.querySelector(".age").textContent = data.age;
  card.querySelector(".pfp").src = getUserProfile(data.id);

  card
    .querySelector(".delete")
    .addEventListener("click", () => deleteButton(data));
  card.querySelector(".edit").addEventListener("click", () => {
    editButton(root, data);
  });

  return card;
}

async function deleteButton(user) {
  let response = await fetch(`http://localhost:3000/users/${user.id}`, {
    method: "DELETE",
  });
  reloadAllCards();
}

async function editButton(card, data) {
  console.log("Edit button clicked");
  console.log(card);
  const emailField = card.querySelector(".email");
  const ageField = card.querySelector(".age");
  const pfpField = card.querySelector(".pfp");
  const editBtn = card.querySelector(".edit");
  emailField.contentEditable = true;
  ageField.contentEditable = true;
  editBtn.textContent = "Save";
  //make editbutton green
  editBtn.style.backgroundColor = "green";
  editBtn.addEventListener("click", async () => {
    emailField.contentEditable = false;
    ageField.contentEditable = false;
    editBtn.textContent = "Edit";
    editBtn.style.backgroundColor = "blue";
    let updatedUser;
    if (Number.isInteger(parseInt(ageField.textContent.trim()))) {
      updatedUser = {
        email: emailField.textContent,
        age: parseInt(ageField.textContent.trim()),
      };
      // Handle the updatedUser object as needed
    } else {
      showError("Invalid age");
      reloadAllCards();
      return;
    }
    let response = await fetch(`http://localhost:3000/users/${data.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedUser),
    });
    let serverResponse = await response.json();
    if (response.ok) {
      showSuccess("User updated successfully");
      reloadAllCards();
    } else {
      showError("Failed to create user " + serverResponse.message);
      reloadAllCards();
    }
  });
}

async function reloadAllCards() {
  let response = await fetch("http://localhost:3000/users");
  let data = await response.json();
  console.log(data);
  const cardContainer = document.getElementById("card-container");
  cardContainer.innerHTML = "";
  data.forEach((user) => {
    cardContainer.appendChild(createCard(user));
  });
}

function showError(message) {
  const errorPopup = document.getElementById("error-popup");
  const errorMessage = document.getElementById("error-message");
  errorMessage.textContent = message;
  errorPopup.classList.remove("hidden");
  let hideBtn = document.querySelector("#error-popup button");
  hideBtn.addEventListener("click", hideError);
}

function hideError() {
  const errorPopup = document.getElementById("error-popup");
  errorPopup.classList.add("hidden");
}

function showSuccess(message) {
  const successPopup = document.getElementById("success-popup");
  const successMessage = document.getElementById("success-message");
  successMessage.textContent = message;
  successPopup.classList.remove("hidden");
  let hideBtn = document.querySelector("#success-popup button");
  hideBtn.addEventListener("click", hideSuccess);
}

function hideSuccess() {
  const successPopup = document.getElementById("success-popup");
  successPopup.classList.add("hidden");
}

async function uploadNewPfp(userId, pfpFile) {
  if (!pfpFile) {
    return;
  }

  let formData = new FormData();
  formData.append("file", pfpFile);
  console.log(userId, pfpFile);
  let response = await fetch(`http://localhost:3000/users/${userId}/profile`, {
    method: "PUT",
    body: formData,
  });

  if (response.ok) {
    reloadAllCards();
    showSuccess("Profile picture uploaded successfully");
  } else {
    showError("Failed to upload profile picture");
  }
}

async function uploadNewData(pfp, email, age) {
  let user = JSON.stringify({ email, age: Number(age) });
  let response = await fetch("http://localhost:3000/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: user,
  });

  let serverResponse = await response.json();

  if (response.ok) {
    showSuccess("User created successfully");
    reloadAllCards();
    uploadNewPfp(serverResponse.id, pfp);
  } else {
    showError("Failed to create user " + serverResponse.message);
  }
}

async function getIdByEmail(email) {
  let response = await fetch("http://localhost:3000/users");
  let data = await response.json();
  let id = -1;
  data.forEach((user) => {
    if (user.email === email) {
      return user.id;
    }
  });
}

function clearFields() {
  document.getElementById("email").value = "";
  document.getElementById("age").value = "";
  document.getElementById("pfp").value = "";
}

function addCard() {
  let pfp = document.getElementById("pfp").files[0];
  let email = document.getElementById("email").value;
  let age = document.getElementById("age").value;
  console.log(email, age);
  clearFields();
  uploadNewData(pfp, email, age);
}

function loadCards() {
  reloadAllCards();
}

document.addEventListener("DOMContentLoaded", function () {
  loadCards();
  document.getElementById("add").addEventListener("click", addCard);
});
