export default {
    template: `
        <!-- Users -->
        <div class="d-flex justify-content-center mt-5">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header bg-info text-white d-flex align-items-center justify-content-between">
                        <h3 class="text-center w-100 card-title m-0">Registered Users</h3>
                    </div>
                    <div class="card-body">
                        <table class="table table-striped mb-0 text-center">
                            <thead>
                                <tr>
                                    <th class="text-center">ID</th>
                                    <th class="text-center">Name</th>
                                    <th class="text-center">Username</th>
                                    <th class="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="user in users" :key="user.id">
                                    <td>{{ user.id }}</td>
                                    <td>{{ user.name }}</td>
                                    <td>{{ user.username }}</td>
                                    <td>
                                        <button @click="toggleBlock(user.id)" 
                                                :class="['btn', user.blocked ? 'btn-secondary' : 'btn-danger']">
                                            {{ user.blocked ? 'Unblock' : 'Block' }}
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            users: {},
            message: null,
            category: null,
        };
    },
    mounted() {
        this.fetchUsers();
    },
    methods: {
        async fetchUsers() {
            try {
                const res = await fetch(location.origin + '/admin/users', 
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
                    this.users = data.user_dict;
                    this.message = data.message;
                    this.category = data.category;
                } else {
                    res.json().then(data => {
                        console.log(data);
                    });
                    console.log("Error1"); 
                }                
            } catch (error) {
                console.log(error);
            }
        },
        async toggleBlock(userId) {
            try {
                if (!this.users[userId]) {
                    console.error(`User ${userId} not found`);
                    return;
                }

                const currentStatus = this.users[userId].blocked;
                const res = await fetch(`/admin/toggle-block/${userId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    this.users[userId].blocked = !currentStatus;
                    this.message = data.message;
                    this.category = data.category;
                } else {
                    const errorData = await res.json();
                    console.error(errorData.message || "Failed to update block status");
                    this.message = errorData.message || "Operation failed";
                    this.category = "danger";
                }
            } catch (error) {
                console.error("Error:", error);
                this.message = "Network error occurred";
                this.category = "danger";
            }
        },
    }
};