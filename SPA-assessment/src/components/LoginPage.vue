<template>
    <div>
        <h2>Login</h2>
        <form @submit.prevent="handleLogin">
            <div>
            <label>Email</label>
            <input
                v-model="username"
                type="text"
                required
            />
            </div>
            <div>
            <label>Password</label>
            <input
                v-model="password"
                type="password"
                required
            />
            </div>
            <button type="submit">Login</button>
        </form>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { db, getDocs, collection, query, where } from '../firebase'; // Adjust path as needed
  
  const emit = defineEmits(['login-success']);

  // Define reactive variables. Vue automatically reflects these changes in DOM when these elements are updated. For e.g., when username in the DOM is updated, this variable is updated as well.
  const username = ref('');
  const password = ref('');
  
  const handleLogin = async () => {
    console.log('Entered username + password:', username.value, password.value);
    const userDocRef = collection(db, 'users');
  
    try {
      // Construct and execute query
      const q = query(
        userDocRef, 
        where("username", "==", username.value), 
        where("password", "==", password.value)
      );
      const querySnapshot = await getDocs(q);
  
      if (querySnapshot.docs.length > 0) {
        const userData = querySnapshot.docs[0].data();
        console.log("User logging in:", userData.username);
        
        // Store in localStorage
        localStorage.setItem('user', JSON.stringify(userData.username));
        
        // Emit event to parent component. The event name is 'login-success' and the data is userData.username
        emit('login-success', userData.username);
      } else {
        console.log("User does not exist.");
        alert("Invalid username or password.");
      }
    } catch (error) {
      console.error("Error getting user:", error);
      alert("Login error: " + error.message);
    }
  };
  </script>