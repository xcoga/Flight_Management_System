<template>
    <div class="flights-view">
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Tail Number</th>
                        <th>Flight ID</th>
                        <th>Takeoff Time</th>
                        <th>Landing Time</th>
                        <th>Duration (in minutes)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="flight in paginatedFlights" :key="flight.id"
                     @click="handleRowClick(flight)"
                     :class="{ 'highlight': selectedFlight === flight }" >
                        <td>{{ flight.tailNumber  }}</td>
                        <td>{{ flight.flightID }}</td>
                        <td>{{ formatDateTime(flight.takeOff)}} </td>
                        <td>{{ formatDateTime(flight.landing)}}</td>
                        <td>{{ flight.duration }}</td>
                    </tr>
                </tbody>
            </table>
            <div class="pagination">
                <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
                <span>Page {{ currentPage }} of {{ totalPages }}</span>
                <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
            </div><br>
        </div>
        <div class="user-container">
            <div label="user-input">
                <form>
                    <label for="tailNumber">Tail Number:</label>
                    <input type="text" id="tailNumber" name="tailNumber"><br>
                    <label for="flightID">Flight ID:</label>
                    <input type="number" id="flightID" name="flightID"><br>
                    <label for="takeOff">Takeoff Time:</label>
                    <input type="datetime-local" id="takeOff" name="takeOff"><br>
                    <label for="landing">Landing Time:</label>  
                    <input type="datetime-local" id="landing" name="landing"><br>
                    <div class="button-group">
                        <button type="submit" @click.prevent="submitFlight">Submit</button>
                        <button type="update" @click.prevent="updateFlight">Update</button>
                        <button type="delete" @click.prevent="deleteFlight">Delete</button>
                    </div>
                </form>
                <form>
                    <label for="search">Search By ID:</label>
                    <input type="number" id="searchID"><br>
                    <div class="button-group">
                        <button type="submit" @click.prevent="searchFlight">Search</button>
                        <button class ="reset-button" @click="fetchFlights">Reset View</button>
                    </div>                    
                </form>
            </div>
        </div>

    </div>
</template>

<script>
import { db, getDocs, collection, addDoc, doc, setDoc, getDoc, updateDoc, deleteDoc, query, where, limit } from '../firebase';

export default {
    //Values in data are reactive. When the data changes, the view updates.
    data() {
        return {
            flights: [], // Array of retrieved flights
            currentPage: 1,
            pageSize: 8,
            selectedFlight: null,
        };
    },
    //Vue computed properties are used to define a property that is dependent on other properties.
    //These properties are updated when the dependent properties are updated.
    computed: {
        totalPages() {
            return Math.ceil(this.flights.length / this.pageSize);
        },
        paginatedFlights() {
            const start = (this.currentPage - 1) * this.pageSize;
            const end = start + this.pageSize;
            return this.flights.slice(start, end);
        },
    },
    //Upon creation of the view, execute the following. Creation hook
    created() {
        this.fetchFlights();
    },
    methods: {
        nextPage() {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
            }
        },

        prevPage() {
            if (this.currentPage > 1) {
                this.currentPage--;
            }
        },
        async searchFlight(){
            const flightID = document.getElementById('searchID').value;
            const q = query(collection(db, "flights"), where("flightID", "==", flightID));
            
            try{
                const querySnapshot = await getDocs(q);
                this.flights = [];
                querySnapshot.forEach((doc) => {
                    this.flights.push({
                            id: doc.id,        // Document ID
                            ...doc.data()      // Document data (spread operator to include all fields)
                    });
                });
            } catch(error){
                console.log("search flight error: ", error);
            }

        },

        async deleteFlight(){
            await deleteDoc(doc(db, 'flights', this.selectedFlight.id));
            await this.fetchFlights();
        },
        calculateDuration(takeOff, landing) {
            var takeOff = new Date(takeOff);
            var landing = new Date(landing);

            var durationMs = landing - takeOff; 
            var duration = Math.floor(durationMs / 60000);
            return duration;
        },
        

        async submitFlight() {
            var tailNumber = document.getElementById('tailNumber').value;
            var flightID = document.getElementById('flightID').value;
            var takeOff = document.getElementById('takeOff').value;
            var landing = document.getElementById('landing').value;
            var duration = 0;
            console.log("entered submit flight");
            
            if (takeOff > landing) {
                console.log("takeoff later than landing");
                alert('Takeoff time cannot be after landing time.');
                return false;
            }

            // Calculate duration in minutes
            var duration = this.calculateDuration(takeOff, landing);
            

            //Enforce filling in of all fields
            if (tailNumber === '' || flightID === '' || takeOff === '' || landing === '' || duration === '') {
                alert('Please fill in all fields.');
                return false;
            }



            let flightDocRef = await addDoc(collection(db,'flights'), {
                tailNumber: tailNumber,
                flightID: flightID,
                takeOff: takeOff,
                landing: landing,
                duration: duration
            });

            alert('Flight submitted successfully.');

            //Reactive update to array. This will update the view.
            await this.fetchFlights();
        },


        async checkExists() {
            let docRef = doc(db, 'flights', this.selectedFlight.id);

            try {
                const doc = await getDoc(docRef);
                if (doc.exists()) {
                    return true;
                } else {
                    return false;
                }
            }
            catch (error) {
                console.error('Error checking if document exists:', error);
            }
        },

        async updateFlight() {
            var tailNumber = document.getElementById('tailNumber').value;
            var flightID = document.getElementById('flightID').value;
            var takeOff = document.getElementById('takeOff').value;
            var landing = document.getElementById('landing').value;
            var duration = 0;

            if (takeOff > landing) {
                console.log("takeoff later than landing");
                alert('Takeoff time cannot be after landing time.');
                return false;
            }

            //Enforce filling in of all fields
            if (tailNumber === '' || flightID === '' || takeOff === '' || landing === '' || duration === '') {
                alert('Please fill in all fields.');
                return false;
            }

            //Update the flight in the database
            var duration = this.calculateDuration(takeOff, landing);
            
            try {
                //flightID is a string
                const flightDocRef = doc(db, 'flights', this.selectedFlight.id);

                console.log("flightDocRef: ", flightDocRef);
                await updateDoc(flightDocRef, {
                    duration: duration,                   
                    flightID: flightID,
                    landing: landing,
                    tailNumber: tailNumber,
                    takeOff: takeOff,                    
                });

                alert('Flight updated successfully.');
            } catch (error) {
                console.error('Error updating flight:', error);
                alert("Error updating flight: ", error);
            }

            //Reactive update to array. This will update the view.
            await this.fetchFlights();
        },
        

        //format the date time into the readable format in the table
        formatDateTime(dateString) {
            if (!dateString) return ""; // Handle empty values

            let dateObj = new Date(dateString);

            console.log("dateObj: ", dateObj);  
            
            let options = { hour: '2-digit', minute: '2-digit', hour12: false };
            let formattedTime = dateObj.toLocaleTimeString('en-GB', options); // 24-hour time format

            let dateOptions = { day: '2-digit', month: 'short', year: 'numeric' };
            let formattedDate = dateObj.toLocaleDateString('en-GB', dateOptions);

            return `${formattedTime} - ${formattedDate}`;
        },
        

        //Reformat the date string into format in input field 'Takeoff' & 'Landing'.
        reformatDate(inputString) {
            // Parse the input string into a Date object
            const date = new Date(inputString);

            // Get the year, month, day, hours, and minutes
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-based, so add 1
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');

            // Return the formatted string
            return `${year}-${month}-${day}T${hours}:${minutes}`;
        },

        async fetchFlights(){

            const flightDocRef = collection(db, 'flights');
            this.flights = [];

            try{
                const querySnapshot = await getDocs(flightDocRef);
                querySnapshot.forEach(doc => {
                    this.flights.push({
                        id: doc.id,        // Document ID
                        ...doc.data()      // Document data (spread operator to include all fields)
                    });
                });
            } catch (error){
                console.error("Error getting flights:", error);
            }

            console.log("flights: ", this.flights);

            //This is to Make sure table size is the same in Display
            const rowsPresent = this.flights.length % this.pageSize;

            if (rowsPresent !== 0 || this.flights.length == 0)  {
                const rowsToAdd = this.pageSize - rowsPresent;
                
                for (let i = 0; i < rowsToAdd; i++) {
                    this.flights.push({});  
                }
                console.log("flights: ", this.flights);
            }



        },

        handleRowClick(flight) {
            this.selectedFlight = flight;

            document.getElementById('tailNumber').value = flight.tailNumber;
            document.getElementById('flightID').value = flight.flightID;
            document.getElementById('takeOff').value = this.reformatDate(flight.takeOff);
            document.getElementById('landing').value = this.reformatDate(flight.landing);

        }
    },


};
</script>


// "scoped" will Keep the style within this view.
<style scoped>
.user-container {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    margin:20px;
    width: 95%;
    margin-top: 15px;
}

.user-container > div {
    flex: 1;
}

.reset-button {
  background-color: rgb(226, 51, 51)!important;
}

.reset-button:hover {
  background-color: #2980b9!important;
}

/* Style for the div with label="user-input" */
div[label="user-input"] {
    display: flex;
    flex-direction: row;
    gap: 20px;
}

div[label="user-input"] > form {
    flex: 1;
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 5px;
    background-color: #f9f9f9;
}

div[label="user-input"] label {
    display: inline-block;
    width: 120px;
    margin-bottom: 5px;
}

div[label="user-input"] input {
    width: calc(100% - 125px);
    padding: 5px;
    margin-bottom: 5px;
}

div[label="user-input"] button {
    margin-right: 10px;
    padding: 6px 12px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

div[label="user-input"] button:hover {
    background-color: #45a049;
}

div[label="user-input"] button[type="update"] {
    background-color: #2196F3;
}

div[label="user-input"] button[type="update"]:hover {
    background-color: #0b7dda;
}

div[label="user-input"] button[type="delete"] {
    background-color: #f44336;
}

div[label="user-input"] button[type="delete"]:hover {
    background-color: #d32f2f;
}


.highlight {
    background-color: hsl(37, 67%, 57%); 
}
.flights-view {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.table-container {
    width: 100%;
    max-height: 800px; 
    min-height: 50vh;
    overflow-y: auto; /* Enable vertical scrolling */
}

table {
    width: 100%;
    border-collapse: collapse;
    font-size: 15px; 

}

thead {
    position: sticky;
    top: 0;
    background-color: #f2f2f2;
    z-index: 1;
}

th, td {
    border: 1px solid #ddd;
    padding: 0.85em; /* This will scale with the font size */
    height: 1em; /* Base height equal to font size */
    vertical-align: middle; /* Centers text vertically */
}

th {
    background-color: #f2f2f2;
}

tr {
    height: 2.5em; /* Sets consistent row height relative to font size */
}

.pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px; /* Reduced spacing between elements */
    margin: 15px 0;
}

.pagination button {
    padding: 5px 10px;
    background-color: #4CAF50;
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
    padding: 0 5px; /* Reduced padding around the text */
}
</style>
