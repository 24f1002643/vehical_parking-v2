export default {
    template: `
        <div>
            <div class="d-flex justify-content-center align-items-center mt-3">
                <div v-if="message" :class="'alert alert-' + category" role="alert">
                    {{ message }}
                </div>
            </div>
            <div v-if="currentState === 'dashboard'">
                <div class="row mt-4">
                    <div class="col-12 text-center mb-4">
                        <button @click="changeState('add_lot')" class="btn btn-primary">
                            Add New Lot
                        </button>
                    </div>
                    <div class="row justify-content-center">
                        <div class="col-12 d-flex justify-content-center mb-4">
                            <div class="input-group w-50">
                                <input type="text" class="form-control" placeholder="Search parking name/location" v-model="searchQuery">
                            </div>
                        </div>
                        <div class="col-md-5 mb-4 mx-2" v-for="lot in filteredParkingLots" :key="lot.id">
                            <div class="card h-100 shadow-sm">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-center mb-2">
                                        <h5 class="card-title mb-0">{{ lot.name }}</h5>
                                        <div>
                                            <button @click="editLot(lot.id)" class="btn btn-sm btn-outline-primary me-1">Edit</button>
                                            <button @click="deleteLot(lot.id)" class="btn btn-sm btn-outline-danger">Delete</button>
                                        </div>
                                    </div>
                                    <p class="text mb-3">
                                        Address: {{ lot.address }}, {{ lot.pincode }}
                                    </p>
                                    <p class="text-success small mb-3">
                                        Occupied: {{ lot.occupied }}/{{ lot.number_of_spots }}
                                    </p>
                                    <div class="d-flex flex-wrap gap-2 mb-3">
                                        <button v-for="spot in lot.spots" :key="spot.id" 
                                                :class="['btn', 'btn-sm', spot.status === 'Occupied' ? 'btn-danger' : 'btn-success']" 
                                                @click="goToSpot(lot.id, spot.id)">
                                            {{ spot.status === 'Occupied' ? 'O' : 'A' }}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else-if="currentState === 'add_lot'">
                <div class="d-flex justify-content-center align-items-center vh-100">
                    <div class="col-md-4 border bg-light p-5 rounded shadow">
                        <h3 class="text-center mb-4">New Parking Lot</h3>
                        <form @submit.prevent="addLot">
                            <div class="form-group mb-3">
                                <input type="text" id="name" v-model="lot_name" class="form-control" placeholder="Name" autofocus required>
                            </div>
                            <div class="form-group mb-3">
                                <input type="text" id="address" v-model="lot_address" class="form-control" placeholder="Address" required>
                            </div>
                            <div class="form-group mb-3">
                                <input type="number" id="pincode" v-model="lot_pincode" class="form-control" placeholder="Pincode" required>
                            </div>
                            <div class="form-group mb-3">
                                <input type="number" id="price" v-model="lot_price" class="form-control" placeholder="Price" required>
                            </div>
                            <div class="form-group mb-3">
                                <input type="number" id="number_of_spots" v-model="lot_number_of_spots" class="form-control" placeholder="Maximum Spots" required>
                            </div>

                            <div class="d-grid gap-2 d-md-flex justify-content-md-center">
                                <input type="submit" value="Add" class="btn btn-primary px-4">
                                <button @click="changeState('dashboard')" class="btn btn-secondary px-4">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <div v-else-if="currentState === 'edit_lot'">
                <div class="d-flex justify-content-center align-items-center vh-100">
                    <div class="col-md-4 border bg-light p-5 rounded shadow">
                        <h3 class="text-center mb-4">Edit Parking Lot</h3>
                        <form @submit.prevent="updateLot">
                            <div class="form-group mb-3">
                                <input type="text" v-model="lot_name" class="form-control" placeholder="Name" required>
                            </div>
                            <div class="form-group mb-3">
                                <input type="text" v-model="lot_address" class="form-control" placeholder="Address" required>
                            </div>
                            <div class="form-group mb-3">
                                <input type="text" v-model="lot_pincode" class="form-control" placeholder="Pincode" required>
                            </div>
                            <div class="form-group mb-3">
                                <input type="number" v-model="lot_price" class="form-control" placeholder="Price" required>
                            </div>
                            <div class="form-group mb-3">
                                <input type="number" v-model="lot_number_of_spots" class="form-control" placeholder="Maximum Spots" required>
                            </div>

                            <div class="d-grid gap-2 d-md-flex justify-content-md-center">
                                <button type="submit" class="btn btn-primary px-4">Update</button>
                                <button @click="changeState('dashboard')" type="button" class="btn btn-secondary px-4">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <div v-else-if="currentState === 'spot_reservation'">
                <div class="d-flex justify-content-center align-items-center">
                    <div class="col-md-10">
                        <div class="card">
                            <div class="card-header bg-info text-white d-flex justify-content-between align-items-center mb-2">
                                <h3 class="text-center card-title m-0">Reservation History for Spot ID {{ reservation_spot_id }}</h3>
                                <div>
                                    <button @click="changeState('dashboard')" class="btn btn-sm btn-secondary me-1">Close</button>
                                    <button @click="deleteSpot(reservation_spot_id)" class="btn btn-sm btn-danger">Delete Spot</button>
                                </div>
                            </div>
                            <div class="card-body">
                                <table class="table table-striped mb-0 text-center">
                                    <thead>
                                        <tr>
                                            <th class="text-center">Spot ID</th>
                                            <th class="text-center">Occupied By</th>
                                            <th class="text-center">Vehicle Number</th>
                                            <th class="text-center">Parking Time</th>
                                            <th class="text-center">Leaving Time</th>
                                            <th class="text-center">Parking Cost</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="reservation in reservations" :key="reservation.id">
                                            <td>{{ reservation.spot_id }}</td>
                                            <td>{{ reservation.user_name }}</td>
                                            <td>{{ reservation.vehicle_number }}</td>
                                            <td>{{ formatDateTime(reservation.parking_time) }}</td>
                                            <td>{{ formatDateTime(reservation.leaving_time) }}</td>
                                            <td>{{ reservation.parking_cost ? reservation.parking_cost : 'N/A' }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            lots: {},
            reservations: {},
            reservation_spot_id: null,
            currentState: 'dashboard',
            message: null,
            messageTimer: null,
            category: null,
            searchQuery: '',


            // Add lot details
            lot_id: null,
            lot_name: null,
            lot_address: null,
            lot_pincode: null,
            lot_price: null,
            lot_number_of_spots: null,
        }
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
            if (!this.searchQuery) return Object.values(this.lots);

            const query = this.searchQuery.toLowerCase();
            return Object.values(this.lots).filter(lot =>
                lot.name.toLowerCase().includes(query) ||
                lot.address.toLowerCase().includes(query) ||
                lot.pincode.includes(query)
            );
        }
    },
    mounted() {
        this.fetchAdminDashboard();
    },
    methods: {
        async fetchAdminDashboard() {
            try {
                const res = await fetch(location.origin + '/admin/dashboard', 
                    {
                        method: 'POST', 
                        headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token')}, 
                    });

                const contentType = res.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    throw new Error('Response not JSON');
                }

                if (res.ok) {
                    const data = await res.json();
                    this.lots = data.lots_dict;
                    this.reservations = data.reservations;
                    this.message = data.message;
                    this.category = data.category;
                } else {
                    res.json().then(data => {
                        console.log(data);
                    });
                    console.log("Error"); 
                }                
            } catch (error) {
                console.log(error);
            }
        },
        changeState(newState) {
            this.lot_id = null;
            this.lot_name = null;
            this.lot_address = null;
            this.lot_pincode = null;
            this.lot_price = null;
            this.lot_number_of_spots = null;
            this.reservation_spot_id = null;

            this.currentState = newState;
        },
        async addLot() {
            try {
                const res = await fetch(location.origin + '/add-lot', {
                    method: 'POST', 
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    },
                    body: JSON.stringify({
                        'name': this.lot_name,
                        'address': this.lot_address,
                        'pincode': this.lot_pincode,
                        'price': this.lot_price,
                        'number_of_spots': this.lot_number_of_spots
                    })
                });
                if (res.ok) {
                    const data = await res.json();
                    this.message = data.message;
                    this.category = data.category;
                    this.fetchAdminDashboard();
                    this.changeState('dashboard');
                } else {
                    const err = await res.json();  
                    this.message = err.message; 
                    this.category = err.category;
                    this.fetchAdminDashboard();
                }
            } catch (error) {
                this.message = 'An unexpected error occurred.';
                this.category = 'danger';
            }            
        },
        editLot(lot_id) {
            this.changeState('edit_lot');

            const data = this.lots[lot_id];
            this.lot_id = lot_id;
            this.lot_name = data.name;
            this.lot_address = data.address;
            this.lot_pincode = data.pincode;
            this.lot_price = data.price;
            this.lot_number_of_spots = data.number_of_spots;
        },
        async updateLot() {
            try {
                const res = await fetch(`${location.origin}/update-lot/${this.lot_id}`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + localStorage.getItem('token')
                        },
                        body: JSON.stringify({
                            'id': this.lot_id,
                            'name': this.lot_name,
                            'address': this.lot_address,
                            'pincode': this.lot_pincode,
                            'price': this.lot_price,
                            'number_of_spots': this.lot_number_of_spots,
                        })
                });

                if (res.ok) {
                    const data = await res.json();
                    this.message = data.message;
                    this.category = data.category;
                    this.fetchAdminDashboard();
                    this.changeState('dashboard');
                } else {
                    const errorData = await res.json();
                    this.message = errorData.message;
                    this.category = 'danger';
                }
            } catch (error) {
                this.message = 'An unexpected error occurred';
                this.category = 'danger';
                console.error(error);
            }
        },
        async deleteLot(lot_id) {
            const confirmation = confirm("Are you sure you want to delete this parking lot?");
            if (confirmation) {
                try {
                    const res = await fetch(`${location.origin}/delete-lot/${lot_id}`,
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer ' + localStorage.getItem('token')
                            },
                    });
                    if (res.ok) {
                        const data = await res.json();
                        this.message = data.message;
                        this.category = data.category;
                        this.fetchAdminDashboard();
                    } else {
                        const errorData = await res.json();
                        this.message = errorData.message;
                        this.category = 'danger';
                    }
                } catch (error) {
                    this.message = 'An unexpected error occurred';
                    this.category = 'danger';
                    console.error(error);
                }
            }
        },
        async deleteSpot(spot_id) {
            const confirmation = confirm("Are you sure you want to delete this parking spot?");
            if (confirmation) {
                try {
                    const res = await fetch(`${location.origin}/delete-spot/${spot_id}`,
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer ' + localStorage.getItem('token')
                            },
                    });
    
                    if (res.ok) {
                        const data = await res.json();
                        this.message = data.message;
                        this.category = data.category;
                        this.fetchAdminDashboard();
                        this.changeState('dashboard');
                    } else {
                        const errorData = await res.json();
                        this.message = errorData.message;
                        this.category = 'danger';
                    }
                } catch (error) {
                    this.message = 'An unexpected error occurred';
                    this.category = 'danger';
                    console.error(error);
                }
            }
        },
        goToSpot(lot_id, spot_id) {
            this.changeState('spot_reservation');
            this.reservation_spot_id = spot_id;
            const lot = this.lots[lot_id];
            const spot = lot.spots[spot_id];
            this.reservations = spot.reservations;
        },
        formatDateTime(datetime) {
            if (!datetime) return 'N/A';
            return new Date(datetime).toLocaleString();
        },
    },
};

