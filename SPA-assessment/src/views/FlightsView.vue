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
            </div>
        </div>
        <div label="user-input">
            <form>
                <label for="tailNumber">Tail Number:</label>
                <input type="text" id="tailNumber" name="tailNumber"><br><br>
                <label for="flightID">Flight ID:</label>
                <input type="number" id="flightID" name="flightID"><br><br>
                <label for="takeOff">Takeoff Time:</label>
                <input type="datetime-local" id="takeOff" name="takeOff"><br><br>
                <label for="landing">Landing Time:</label>  
                <input type="datetime-local" id="landing" name="landing"><br><br>
                <button type="submit" @click.prevent="submitFlight">Submit</button>
                <button type="update" @click.prevent="updateFlight">Update</button>
            </form>

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
            pageSize: 10,
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


            let exists_bool = await this.checkExists(flightID);

            //Check if the flight ID already exists (our primary key)
            if (exists_bool == true) {
                alert('Flight ID already exists.');
                return false;
            }

            let flightDocRef = doc(db, 'flights', flightID);

            await setDoc(flightDocRef, {
                tailNumber: tailNumber,
                flightID: flightID,
                takeOff: takeOff,
                landing: landing,
                duration: duration
            })
            

            alert('Flight submitted successfully.');

            //Reactive update to array. This will update the view.
            this.fetchFlights();
        },


        async checkExists(flightID) {
            const flightDocRef = doc(db, 'flights', flightID);
            try {
                const docSnap = await getDoc(flightDocRef); 

                // Check if the document exists
                if (docSnap.exists()) {
                    console.log('Flight ID exists:', docSnap.data());
                    return true; // Document exists
                } else {
                    console.log('Flight ID does not exist');
                    return false; // Document does not exist
                }
            } catch (error) {
                console.error('Error checking flight ID by docRefID:', error);
                return false; // Handle error
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

            //Check if the flight ID already exists (our primary key)
            if (!await this.checkExists(flightID)) {
                alert('Flight ID does not exist.');
                return false;
            }

            //Update the flight in the database
            var duration = this.calculateDuration(takeOff, landing);
            
            try {
                //flightID is a string
                const flightDocRef = doc(db, 'flights', flightID);

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
            this.fetchFlights();
        },

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

        async fetchFlights(){

            const flightDocRef = collection(db, 'flights');
            this.flights = [];

            try{
                const querySnapshot = await getDocs(flightDocRef);
                querySnapshot.forEach(doc => {
                    this.flights.push(doc.data());
                });
            } catch (error){
                console.error("Error getting flights:", error);
            }

            console.log("flights: ", this.flights);

        },
        handleRowClick(flight) {
            this.selectedFlight = flight;
        }
    },


};
</script>


// "scoped" will Keep the style within this view.
<style scoped>
.highlight {
    background-color: hsl(37, 67%, 57%); /* Light blue background */
}
.flights-view {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.table-container {
    width: 100%;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th, td {
    border: 1px solid #ddd;
    padding: 8px;
}

th {
    background-color: #f2f2f2;
}

.pagination {
    margin-top: 10px;
    display: flex;
    justify-content: space-between;
    width: 100%;
}
</style>
