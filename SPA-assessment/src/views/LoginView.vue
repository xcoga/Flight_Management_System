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
  
  <script>
  import { db, getDocs, collection, addDoc, doc, getDoc, updateDoc, deleteDoc, query, where } from '../firebase';

  export default {
    data() {
      return {
        username: '',
        password: ''
      };
    },
    methods: {

      /*This function checks the username and password and logs in the user.
      Checks with the database on Firebase.
      
      inputs:
      username: string
      password: string
      
      returns HomeView.vue*/
      async handleLogin() {
        console.log('Entered username + password:', this.username, this.password);
        const userDocRef = collection(db, 'users');

        try{

            //Construct and execute query.
            const q = query(userDocRef, where("username", "==", this.username), where("password", "==", this.password));
            const querySnapshot = await getDocs(q);
            console.log(querySnapshot.docs[0].data());

            const userData = querySnapshot.docs[0].data();


            if (querySnapshot){
                console.log("user logging in :", userData.username);
                localStorage.setItem('user', JSON.stringify(userData.username));

                //Uses the router instance created in main.js to navigate to the home page.
                this.$router.push('/home');
            }
            else{
                console.log("User does not exist.");
                alert("Invalid username or password.");
            } 
        } catch (error){
            console.error("Error getting user:", error);
        }

        
      }
    }
  };
  </script>