<template>
    <div class="flex items-center justify-center min-h-screen bg-gray-100">
      <div class="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h2 class="text-2xl font-bold text-center text-gray-700">Login</h2>
        <form @submit.prevent="handleLogin" class="mt-6">
          <div class="mb-4">
            <label class="block text-gray-700">Email</label>
            <input
              v-model="username"
              type="text"
              required
              class="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <div class="mb-4">
            <label class="block text-gray-700">Password</label>
            <input
              v-model="password"
              type="password"
              required
              class="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <button
            type="submit"
            class="w-full px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
          >
            Login
          </button>
        </form>
      </div>
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