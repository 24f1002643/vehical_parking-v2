export default {
    template: `
        <div>
            <div class="d-flex justify-content-center align-items-center mt-3">
                <div v-if="message" :class="'alert alert-' + category" role="alert">
                    {{ message }}
                </div>
            </div>

            <div class="d-flex justify-content-end mt-3 me-4">
                <button @click="exportCSV" class="btn btn-primary">
                    <span>Download Parking CSV</span>
                </button>
            </div>

            <div v-if="currentState === 'dashboard'">
                <div class="d-flex justify-content-center mt-5">
                    <div class="col-md-10">
                        <!-- Parking History Card -->
                        <div class="card mb-4">
                            <div class="card-header bg-info text-white d-flex align-items-center justify-content-between">
                                <h3 class="text-center w-100 card-title m-0">Recent Parking History</h3>
                            </div>
                            <div class="card-body">
                                <table class="table table-striped mb-0 text-center">
                                    <thead>
                                        <tr>
                                            <th class="text-center">ID</th>
                                            <th class="text-center">Parking Name</th>
                                            <th class="text-center">Parking Address</th>
                                            <th class="text-center">Vehicle Number</th>
                                            <th class="text-center">Parking Time</th>
                                            <th class="text-center">Leaving Time</th>
                                            <th class="text-center">Total Cost</th>
                                            <th class="text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="history in parking_history" :key="history.id">
                                            <td>{{ history.id }}</td>
                                            <td>{{ history.parking_name }}</td>
                                            <td>{{ history.parking_address }}</td>
                                            <td>{{ history.vehicle_number }}</td>
                                            <td>{{ formatDateTime(history.parking_time) }}</td>
                                            <td>{{ formatDateTime(history.leaving_time) }}</td>
                                            <td>{{ history.parking_cost ? history.parking_cost : 'N/A' }}</td>
                                            <td>
                                                <button 
                                                    v-if="!history.leaving_time"
                                                    class="btn btn-sm btn-primary"
                                                    @click="releaseVehicle(history.id, history.parking_cost)">
                                                    Release
                                                </button>
                                                <span v-else class="text-success fw-bold">Parked Out</span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- Search and Available Parking Lots Card -->
                        <div class="card">
                            <div class="card-header bg-info text-white d-flex align-items-center justify-content-between">
                                <h3 class="text-center w-100 card-title m-0">Available Parking Lots</h3>
                            </div>
                            <div class="card-body">
                                <!-- Search Bar -->
                                <div class="mb-3">
                                    <div class="input-group">
                                        <input type="text" class="form-control" placeholder="Search parking @location/pin code" v-model="searchQuery">
                                    </div>
                                </div>
                                
                                <!-- Parking Lots Table -->
                                <table class="table table-striped mb-0 text-center">
                                    <thead>
                                        <tr>
                                            <th class="text-center">ID</th>
                                            <th class="text-center">Address</th>
                                            <th class="text-center">Availability</th>
                                            <th class="text-center">Price (per hour)</th>
                                            <th class="text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="lot in filteredParkingLots" :key="lot.id">
                                            <td>{{ lot.id }}</td>
                                            <td>{{ lot.address }}, {{ lot.pincode }}</td>
                                            <td>{{ lot.available_spots }}</td>
                                            <td>{{ lot.price }}</td>
                                            <td>
                                                <button 
                                                    v-if="lot.available_spots > 0" 
                                                    class="btn btn-sm btn-success" 
                                                    @click="prepareBooking(lot.id)">
                                                    Book
                                                </button>
                                                <span v-else class="text-danger fw-bold">Full</span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else-if="currentState === 'book'">
                <div class="d-flex justify-content-center align-items-center vh-100">
                    <div class="col-md-4 border bg-light p-5 rounded shadow">
                        <h3 class="text-center mb-4">Book Parking Spot</h3>
                        <form @submit.prevent="bookParking">
                            <div class="form-group mb-3">
                                <input type="text" id="vehicle_number" v-model="vehicle_number" class="form-control" placeholder="Vehicle Number" autofocus required>
                            </div>
                            <div class="d-grid gap-2 d-md-flex justify-content-md-center">
                                <button @click="currentState = 'dashboard'" class="btn btn-secondary px-4">
                                    Cancel
                                </button>
                                <input type="submit" value="Book" class="btn btn-sm btn-success px-4">
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            parkingLots: [],
            parking_history: [],
            message: null,
            messageTimer: null,
            category: null,
            currentState: 'dashboard',
            searchQuery: '',

            // Book a lot
            vehicle_number: null,
            selectedLotId: null,
        };
    },
    watch: {
        message(newValue) {
            if (newValue) {
            clearTimeout(this.messageTimer);
            this.messageTimer = setTimeout(() => {
                this.message = null;
                this.category = null;
            }, 4000);
            }
        }
    },
    computed: {
        filteredParkingLots() {
            if (!this.searchQuery) return this.parkingLots;
            return this.parkingLots.filter(lot => 
                lot.address.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                lot.pincode.includes(this.searchQuery))
        }
    },
    mounted() {
        this.fetchUserDashboard();
    },
    methods: {
        changeState(newState) {
            this.currentState = newState;
        },
        async fetchUserDashboard() {
            try {
                const res = await fetch(location.origin + '/user/dashboard', 
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json', 
                            'Authorization': 'Bearer ' + localStorage.getItem('token')
                        },
                        body: JSON.stringify({
                            username: localStorage.getItem('username') || ''
                        })
                    });

                const contentType = res.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    throw new Error('Response not JSON');
                }

                if (res.ok) {
                    const data = await res.json();
                    this.parkingLots = data.parking_lots || [];
                    this.parking_history = data.parking_history || [];
                    this.message = data.message;
                    this.category = data.category;
                } else {
                    const data = await res.json();
                    console.log("Error:", data); 
                }                
            } catch (error) {
                console.log("Fetch error:", error);
            }
        },
        prepareBooking(lotId) {
            this.selectedLotId = lotId;
            this.currentState = 'book';
        },
        async bookParking() {
            try {
                const res = await fetch(location.origin + '/user/book', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json', 
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    },
                    body: JSON.stringify({
                        username: localStorage.getItem('username') || '',
                        lot_id: this.selectedLotId,
                        vehicle_number: this.vehicle_number
                    })
                });

                const contentType = res.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    throw new Error('Response not JSON');
                }

                if (res.ok) {
                    const data = await res.json();
                    this.message = data.message;
                    this.category = data.category;

                    // Reset form
                    this.fetchUserDashboard();
                    this.vehicle_number = '';
                    this.selectedLotId = null;
                    this.currentState = 'dashboard';
                } else {
                    const data = await res.json();
                    console.log("Error:", data);
                }
            } catch (error) {
                console.log("Booking error:", error);
            }
        },
        async releaseVehicle(parking_history_id, parking_cost) {
            const confirmation = confirm("Do you want to release your vehicle?")
            if (confirmation) {
                try {
                    const res = await fetch(location.origin + '/user/release-vehicle', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + localStorage.getItem('token')
                        },
                        body: JSON.stringify({
                            parking_history_id: parking_history_id,
                            parking_cost: parking_cost,
                        })
                    });
                    
                    const contentType = res.headers.get('content-type');
                    if (!contentType || !contentType.includes('application/json')) {
                        throw new Error('Response not JSON');
                    }
                    
                    if (res.ok) {
                        const data = await res.json();
                        this.message = data.message;
                        this.category = data.category;
                        
                        this.fetchUserDashboard();
                    } else {
                        const data = await res.json();
                        console.log("Error:", data);
                    }
                } catch (error) {
                    console.log("Booking error:", error);
                }
            }
        },
        async exportCSV() {
            try {
                const res = await fetch(location.origin + '/export-csv', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    },
                });

                const data = await res.json();
                this.message = data.message;
                this.category = data.category;

                if (!res.ok) return;

                const userId = JSON.parse(atob(localStorage.getItem('token').split('.')[1])).user_id;

                const pollUntilReady = async (attempt = 0) => {
                    if (attempt > 15) {
                        this.message = "Export timed out. Try again later.";
                        this.category = "danger";
                        return;
                    }

                    const check = await fetch(`${location.origin}/check-csv/${userId}`, {
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('token')
                        }
                    });

                    const status = await check.json();

                    if (status.ready) {
                        const link = document.createElement('a');
                        link.href = `${location.origin}/download-csv/${userId}`;
                        link.download = `parking_data_user_${userId}.csv`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    } else {
                        setTimeout(() => pollUntilReady(attempt + 1), 2000);
                    }
                };

                pollUntilReady();

            } catch (error) {
                this.message = 'An unexpected error occurred.';
                this.category = 'danger';
            }
        },
        formatDateTime(datetime) {
            if (!datetime) return 'N/A';
            return new Date(datetime).toLocaleString();
        },
    }
};