<template>
  <!-- Listens for login-success event, then executes the handleLoginSuccess function. -->
  <LoginPage v-if="!isAuthenticated" @login-success="handleLoginSuccess" />

  <div v-if="isAuthenticated" class="authenticated-container">


    <header class="app-header">
      <nav>
        <RouterLink to="/flights">Flights</RouterLink>
        <RouterLink to="/users">Users</RouterLink>
        <a href="#" @click.prevent="handleLogout" class="logout-link">Logout</a>
      </nav>
    </header>

    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { RouterLink, RouterView } from 'vue-router';
import LoginPage from "./components/LoginPage.vue";

const router = useRouter(); //Vue default router
const isAuthenticated = ref(false); //isAuthenticated checks if user is logged in. True: User is logged in
const userData = ref(null); //userData will be filled with user's username when logged in.

// Check for authentication when the component mounts
onMounted(() => {
  checkAuthentication();
});

/*
function checkAuthentication() 
returns: None
parameters: None

Checks if the user has logged in by checking isAuthenticated value.
User cannot access anything but login page when he is not authenticated.

If user logged in, redirect him into the app.
Else continue to stay in login page.
*/
const checkAuthentication = () => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    userData.value = JSON.parse(storedUser);
    isAuthenticated.value = true;
    // If user is authenticated but on login page, redirect to flights
    if (window.location.pathname === '/') {
      router.push('/flights');
    }
  } else {
    isAuthenticated.value = false;
    // If not authenticated and not on login page, redirect to login
    if (window.location.pathname !== '/') {
      router.push('/');
    }
  }
};

/*
function handleLoginSuccess() 
returns: None
parameters: user user

When the user logs in successfully:
  userData records the username
  isAuthenticated value is set to True.

  the user is routed to the 'flights' page of the app.
*/
const handleLoginSuccess = (user) => {
  userData.value = user;
  isAuthenticated.value = true;
  router.push('/flights');
};

/*
function handleLogout() 
returns: None
parameters: None

When the user logs out, clear userData and set isAuthenticated to False.
*/
const handleLogout = () => {
  localStorage.removeItem('user');
  userData.value = null;
  isAuthenticated.value = false;
  router.push('/');
};
</script>

<style scoped>
.authenticated-container {
  margin: 0; /* Remove any default margin */
  padding: 0; /* Remove any default padding */
  height: 100%; /* Ensure the container takes the full height */
}


.app-header {
  position: fixed;
  top: 0;
  left: 0 ;
  width: 100%;
  z-index: 1000;
  color: #d3571e;
}

nav {
  display: flex;
  font-size: 2.0rem !important;
  padding: 1rem !important;
  gap: 15px;
  justify-content: center !important;
  align-items: center !important;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
  background-color: rgb(124, 36, 224);  /* Set background to black */
  color: white;             /* Default text color */
}

nav a.router-link-exact-active {
  color: white;  /* Active link will be white */
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
  color: rgba(255, 255, 255, 0.7); /* Non-active links are slightly less white */
  text-decoration: none;  /* Remove underline */
  transition: color 0.3s ease;  /* Smooth color transition */
}

nav a:hover {
  color: #ff7f50;  /* Change color on hover*/
  background-color: rgba(255, 127, 80, 0.2); 
}

nav a:first-of-type {
  border: 0;
}

.logout-link {
  margin-left: auto;
  color: #dc2626;
}

.main-content {
  padding-top: 70px; 
}

</style>