<template>
    <div>
        <div>
        <h1>Users</h1>
        <table>
            <thead>
                <tr>
                    <th>Username</th>
                    <th>Password</th>
                    <th>isAdmin</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="user in users" :key="user.id"
                    @click="handleRowClick(user)"
                    :class="{ 'highlight': selectedUser === user }" >
                    <td>{{ user.username }}</td>
                    <td>{{ user.password }}</td>
                    <td>{{ user.isAdmin }}</td>
                </tr>
            </tbody>
        </table>
        </div>
        <div>
        <form>
            <label for="username">Username:</label>
            <input type="text" id="username" name="username"><br><br>
            <label for="password">Password:</label>
            <input type="text" id="password" name="password"><br><br>
            <label for="isAdmin">isAdmin:</label>
            <input type="checkbox" id="isAdmin" name="isAdmin"><br><br>
            <button type="submit" @click.prevent="submitUser">Submit</button>
            <button type="update" @click.prevent="updateUser">Update</button>
            <button type="delete" @click.prevent="deleteUser">Delete</button>
        </form>
        </div>
    </div>
</template>

<script>
import { db, getDocs, collection, setDoc,addDoc, doc, getDoc, updateDoc, deleteDoc, query, where } from '../firebase';

export default {
    data() {
        return {
            users: [],
            selectedUser: null,
        };
    },
    created() {
        this.fetchUsers();
    },
    methods: {
        handleRowClick(user){
            this.selectedUser = user;

            document.getElementById('username').value = user.username;
            document.getElementById('password').value = user.password;
            document.getElementById('isAdmin').value = user.isAdmin;

        },

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

        async fetchUsers() {
            const usersDocRef = collection(db, 'users');
            this.users = [];

            try{
                const querySnapshot = await getDocs(usersDocRef);
                querySnapshot.forEach(doc => {

                    // if (doc.username != "admin"){
                    //     this.users.push({
                    //         id: doc.id,        // Document ID
                    //         ...doc.data()      // Document data (spread operator to include all fields)
                    //     });
                    // }

                    this.users.push({
                            id: doc.id,        // Document ID
                            ...doc.data()      // Document data (spread operator to include all fields)
                    });

                });
            } catch (error){
                console.error("Error getting flights:", error);
            }

            console.log("flights: ", this.flights);
        }
    }
};
</script>

<style scoped>
table {
    width: 100%;
    border-collapse: collapse;
}
.highlight {
    background-color: hsl(37, 67%, 57%); /* Light blue background */
}

th, td {
    border: 1px solid #ddd;
    padding: 8px;
}

th {
    background-color: #f2f2f2;
}
</style>