<template>
    <div>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Password</th>
                        <th>isAdmin</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="user in paginatedUsers" :key="user.id"
                        @click="handleRowClick(user)"
                        :class="{ 'highlight': selectedUser === user }" >
                        <td>{{ user.username }}</td>
                        <td>{{ user.password }}</td>
                        <td>{{ user.isAdmin }}</td>
                    </tr>
                </tbody>
            </table>
            <div class="pagination">
                <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
                <span>Page {{ currentPage }} of {{ totalPages }}</span>
                <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
            </div>
        </div>
        <div class="user-input">
            <form>
                <label for="username">Username:</label>
                <input class = "input-text" type="text" id="username" name="username"><br><br>
                <label for="password">Password:</label>
                <input class = "input-text" type="text" id="password" name="password"><br><br>
                <label for="isAdmin">isAdmin:</label>
                <input type="checkbox" id="isAdmin" name="isAdmin"><br><br>
                <button type="submit" class="user-button" @click.prevent="submitUser">Submit</button>
                <button type="update" class="user-button" @click.prevent="updateUser">Update</button>
                <button type="delete" class="user-button" @click.prevent="deleteUser">Delete</button>
            </form>
        </div>
    </div>
</template>

<script>
import { db, getDocs, collection, setDoc, addDoc, doc, getDoc, updateDoc, deleteDoc, query, where } from '../firebase';

export default {
    //In Vue, variables in data are reactive. When they are updated, the corresponding elements in DOM are updated.
    data() {
        return {
            users: [], //Retrieved users from firebase
            selectedUser: null, //Selected user from the table in <div class="user-input">
            currentPage: 1, //Default page of the table when the app is loaded.
            pageSize: 5, // Number of users per page
        };
    },

    //Vue computed properties are used to define a property that is dependent on other properties.
    //These properties are updated when the dependent properties are updated.
    computed: {
        /*
        function totalPages()
        returns: int no_of_pages
        parameters: None
        
        calculates number of pages needed to display all the flights in the table.
        */
        totalPages() {
            return Math.ceil(this.users.length / this.pageSize);
        },
        /*
        function paginatedFlights()
        returns: array{} flights
        parameters: None
        
        returns the flights for the current page
        */   
        paginatedUsers() {
            const start = (this.currentPage - 1) * this.pageSize;
            const end = start + this.pageSize;
            return this.users.slice(start, end);
        },
    },
    created() {
        this.fetchUsers(); //Get all users from firebase
    },
    methods: {
        /*
        function nextPage()
        returns: None
        parameters: None

        Flips the table to the next page.
        */
        nextPage() {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
            }
        },

        /*
        function prevPage()
        returns: None
        parameters: None

        Flips the table to the prev page.
        */   
        prevPage() {
            if (this.currentPage > 1) {
                this.currentPage--;
            }
        },
        /*
        function handleRowClick()
        returns: None
        parameters: User user

        When a row in the table is clicked, the user details fill up the form in <div class="user-input">.
        */       
        handleRowClick(user){
            this.selectedUser = user;

            document.getElementById('username').value = user.username;
            document.getElementById('password').value = user.password;
            document.getElementById('isAdmin').checked = user.isAdmin;
        },
        /*
        function submitUser()
        returns: None
        parameters: None

        Gets the filled in user-details from <div class="user-input">, then added to firebase.
        All fields must be filled.
        Once user is added, refresh the table with new set of users.
        */
        async submitUser(){
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const isAdmin = document.getElementById('isAdmin').checked;

            if (username === "" || password === ""){
                alert("Please enter a username and password.");
                return;
            }

            try{
                await setDoc(doc(db, 'users', username), {
                    username: username,
                    password: password,
                    isAdmin: isAdmin
                });

                console.log("Successfully added user.");
            } catch (error){
                console.error("Error adding document: ", error);
            }

            this.fetchUsers();
        },

        /*
        function updateUser()
        returns: None
        parameters: None

        Gets documentID & the filled in user-details from <div class="user-input">.
        Updates the documentID in firebase with the user-details
        All fields must be filled.
        Once user is updated, refresh the table with new set of users.
        */
        async updateUser(){
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const isAdmin = document.getElementById('isAdmin').checked;

            try{
                await updateDoc(doc(db, 'users', username), {
                    username: username,
                    password: password,
                    isAdmin: isAdmin
                });

                console.log("Successfully updated user.");
            } catch (error){
                console.error("Error updating document: ", error);
                alert("User does not exist.");
            }

            this.fetchUsers();
        },

        /*
        function deleteUser()
        returns: None
        parameters: None

        Gets documentID & the filled in user-details from <div class="user-input">.
        Deletes the documentID in firebase.
        Once user is deleted, refresh the table with new set of users.
        */
        async deleteUser(){
            const username = document.getElementById('username').value;

            if (username ==='admin'){
                alert("Cannot delete admin user.");
                return;
            }

            try{
                await deleteDoc(doc(db, 'users', username));
                console.log("Successfully deleted user."); 
            } catch (error){
                console.error("Error deleting document: ", error);
            }

            this.fetchUsers();
        },

        /*
        function fetchUsers() 
        returns: None
        parameters: None

        Fetch all the users from firebase
        */
        async fetchUsers() {
            const usersDocRef = collection(db, 'users');
            this.users = [];

            try{
                const querySnapshot = await getDocs(usersDocRef);
                querySnapshot.forEach(doc => {
                    this.users.push({
                        id: doc.id,        // Document ID
                        ...doc.data()      // Document data (spread operator to include all fields)
                    });
                });
                
                // This will ensure the table has a fixed size even with fewer rows
                this.ensureTableSize();
                
            } catch (error){
                console.error("Error getting users:", error);
            }
        },

        /*
        function ensureTableSize() 
        returns: None
        parameters: None

        If the data is not enough to fill the whole table page, pad the table with empty values.
        */        
        ensureTableSize() {
            // Calculate how many empty rows we need to add
            const currentRowCount = this.users.length;
            
            if (currentRowCount % this.pageSize !== 0 || currentRowCount === 0) {
                const rowsToAdd = this.pageSize - (currentRowCount % this.pageSize);
                
                // Add empty placeholder rows
                for (let i = 0; i < rowsToAdd; i++) {
                    this.users.push({
                        id: `placeholder-${i}`,
                        username: '',
                        password: '',
                        isAdmin: '',
                    });
                }
            }
        }
    }
};


</script>
<style scoped>
.input-text{
    margin:5px;
}
.table-container {
    max-height: 500px; /* Fixed height for the table container */
    width: 100%;
    border: 1px solid #ddd;
    border-radius: 5px;
    overflow-y: auto;
    margin-bottom: 20px;
}

table {
    width: 100%;
    border-collapse: collapse;
}

thead {
    position: sticky;
    top: 0;
    z-index: 1;
}

.highlight {
    background-color: hsl(37, 67%, 57%); /* Light blue background */
}

th, td {
    border: 1px solid #ddd;
    padding: 8px;
    height: 3em; /* Fixed row height */
}

th {
    background-color: #f2f2f2;
}

tr {
    height: 3em; /* Make sure all rows are the same height */
}

/* Empty cell styling */
td:empty {
    height: 3em;
}

/* Pagination controls */
.pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin: 15px 0;
    padding: 5px;
}

.pagination button {
    padding: 5px 10px;
    background-color: #0bb380;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.pagination button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
}

.pagination span {
    font-size: 14px;
    padding: 0 5px;
}

/*styling for user-input*/
.user-input {
    display: flex;
    flex-direction: row;
    gap: 20px;
    margin: 20px 0;
    padding: 15px; /* Add padding inside the box */
    border: 1px solid #ccc; /* Light grey border */
    border-radius: 8px; /* Slightly rounded corners */
    background-color: #f8f8f8; /* Light grey background */
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1); /* Optional subtle shadow */
}

.user-button {
    margin: 20px;
    padding: 10px 20px; /* Add padding for a better button shape */
    background-color: #0bb380; /* Primary blue color */
    color: white; /* White text */
    border: 1px solid #0056b3; /* Slightly darker border */
    border-radius: 5px; /* Rounded corners */
    cursor: pointer; /* Show pointer on hover */
    font-size: 16px; /* Adjust text size */
    transition: background-color 0.3s ease, transform 0.2s ease; /* Smooth transition */
}

.user-button:hover {
    background-color: #0056b3; /* Darker blue on hover */
    transform: scale(1.05); /* Slightly increase size on hover */
}

.user-button:active {
    background-color: #22aa07; /* Even darker blue when clicked */
    transform: scale(0.98); /* Slightly shrink when clicked */
}
</style>