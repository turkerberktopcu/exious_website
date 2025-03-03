// create-admin.js
// Run this script once to create an admin account

const { auth } = require('./firebase-config.js');
const { createUserWithEmailAndPassword } = require('firebase/auth');

// Replace with your desired admin credentials
const adminEmail = "admin@exius.com";
const adminPassword = "securepassword123";

// Create admin account
async function createAdminAccount() {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
    console.log("Admin account created successfully:", userCredential.user);
    console.log("Admin account created successfully!");
  } catch (error) {
    console.error("Error creating admin account:", error);
    console.log("Error creating admin account: " + error.message);
  }
}

// Run the function
createAdminAccount();