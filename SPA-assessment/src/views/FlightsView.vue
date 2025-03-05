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
                    <tr v-for="flight in paginatedFlights" :key="flight.id">
                        <td>{{ flight.tailNumber  }}</td>
                        <td>{{ flight.flightID }}</td>
                        <td>{{ flight.takeOff }}</td>
                        <td>{{ flight.landing }}</td>
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
    </div>
</template>

<script>
import { db, getDocs, collection, addDoc, doc, getDoc, updateDoc, deleteDoc, query, where } from '../firebase';
export default {
    data() {
        return {
            flights: [], // This should be populated with the retrieved values
            currentPage: 1,
            pageSize: 10
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
    //Upon creation of the view, execute the following.
    created() {
        this.fetchFlights();
    },
    methods: {
        prevPage() {
            if (this.currentPage > 1) {
                this.currentPage--;
            }
        },
        nextPage() {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
            }
        },

        async fetchFlights(){

            const flightDocRef = collection(db, 'flights');
            this.flights = [];

            try{
                const querySnapshot = await getDocs(flightDocRef);

                //TODO: Find a way to display date-time in the table.
                querySnapshot.forEach(doc => {
                    var flightData = doc.data();
                    //Convert from firebase timestamp to JS date object
                    flightData.takeOff = flightData.takeOff.toDate();
                    flightData.landing = flightData.landing.toDate();
                    this.flights.push(doc.data());
                });
            } catch (error){
                console.error("Error getting flights:", error);
            }

            console.log("flights: ", this.flights);

        },
    },


};
</script>


// "scoped" will Keep the style within this view.
<style scoped>
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
