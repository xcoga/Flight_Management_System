<template>
  <div class="login-container">
    <div class="login-box">
      <h2>Login</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>Username</label>
          <input v-model="username" type="text" required />
        </div>
        <div class="form-group">
          <label>Password</label>
          <input v-model="password" type="password" required />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  </div>
</template>

<style scoped>

/* Ensure full-screen background */

.login-container {
  display: flex;
  justify-content: center; /* Center horizontally */
  align-items: center;     /* Center vertically */
  height: 100vh;           /* Full viewport height */
  width: 100vw;            /* Full viewport width */
  background-image: url("../assets/airplane_bg_2.jpeg");  /* Reference the imported image */
  background-size: cover;
  background-repeat: no-repeat;  /* Avoid repeating the background */
  background-position: center;  /* Center the background image */
}

.login-box {
  background: rgba(0, 0, 0, 0.4); /* Slight transparency background: rgba(255, 255, 255, 0.8);*/ 
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  width: 20vw;
  height: 30vh;
  text-align: center;
  color: white;
}

.form-group {
  margin-bottom: 15px;
}

input {
  width: 100%;
  padding-top:10px;
  padding-bottom:10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-top: 5px;
  background-color: rgba(255, 255, 255, 0.3);
  font-family: 'DynaPuff','Courier New', Courier, monospace; 
  color: white;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;
}

button:hover {
  background-color: #0056b3;
}
</style>


  
  <script setup>
  import { ref } from 'vue';
  import { db, getDocs, collection, query, where } from '../firebase'; 
  
  //Default emit
  const emit = defineEmits(['login-success']);

  // Define reactive variables. Vue automatically reflects these changes in DOM when these elements are updated. For e.g., when username in the DOM is updated, this variable is updated as well.
  const username = ref('');
  const password = ref('');
  
  /*
  function handleLogin()
  returns: None
  parameters: None
  emits an event "login-success", which the App.vue is listening out for.
  */
  const handleLogin = async () => {
    console.log('Entered username + password:', username.value, password.value);
    const userDocRef = collection(db, 'users');
  
    try {
      //Query to send to firebase
      const q = query(
        userDocRef, 
        where("username", "==", username.value), 
        where("password", "==", password.value)
      );
      const querySnapshot = await getDocs(q);
  
      if (querySnapshot.docs.length > 0) {
        const userData = querySnapshot.docs[0].data();
        console.log("User logging in:", userData.username);
        
        // Store in localStorage (browser cache/cookie)
        localStorage.setItem('user', JSON.stringify(userData.username));
        localStorage.setItem('isAdmin', JSON.stringify(userData.isAdmin));
        
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