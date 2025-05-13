const temp1 = `    
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <router-link to="/" class="navbar-brand">Vehicle Parking</router-link>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ms-auto">
                <!-- Admin -->
                <template v-if="isAdmin">
                    <li class="nav-item">
                        <router-link to="/admin/dashboard" class="nav-link">Home</router-link>
                    </li>
                    <li class="nav-item">
                        <router-link to="/admin/profile" class="nav-link">Profile</router-link>
                    </li>
                    <li class="nav-item">
                        <router-link to="/admin/search" class="nav-link">Search</router-link>
                    </li>
                    <li class="nav-item">
                        <router-link to="/admin/summary" class="nav-link">Summary</router-link>
                    </li>                        
                </template>
                
                <!-- User -->
                <template v-if="isUser">
                    <li class="nav-item">
                        <router-link to="/user/dashboard" class="nav-link">Home</router-link>
                    </li>
                    <li class="nav-item">
                        <router-link to="/user/search" class="nav-link">Search</router-link>
                    </li>
                    <li class="nav-item">
                        <router-link to="/user/summary" class="nav-link">Summary</router-link>
                    </li>
                </template>

                <!-- Logout -->
                <li class="nav-item">
                    <router-link to="/logout" class="nav-link">Logout</router-link>
                </li>
            </ul>
        </div>
    </nav>
`

const temp2 = `
    <nav class="navbar navbar-expand-lg navbar-light bg-light px-4 shadow-sm">
        <router-link to="/" class="navbar-brand me-4 fw-bold fs-4">Vehicle Parking</router-link>

        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ms-auto d-flex align-items-center gap-3">
                <!-- Admin -->
                <template v-if="isAdmin">
                    <li class="nav-item">
                        <router-link to="/admin/dashboard" class="nav-link px-3">Home</router-link>
                    </li>
                    <li class="nav-item">
                        <router-link to="/admin/search" class="nav-link px-3">Search</router-link>
                    </li>
                    <li class="nav-item">
                        <router-link to="/admin/summary" class="nav-link px-3">Summary</router-link>
                    </li>
                </template>

                <!-- User -->
                <template v-if="isUser">
                    <li class="nav-item">
                        <router-link to="/user/dashboard" class="nav-link px-3">Home</router-link>
                    </li>
                    <li class="nav-item">
                        <router-link to="/user/search" class="nav-link px-3">Search</router-link>
                    </li>
                    <li class="nav-item">
                        <router-link to="/user/summary" class="nav-link px-3">Summary</router-link>
                    </li>
                </template>

                <!-- Logout -->
                <li class="nav-item">
                    <router-link to="/logout" class="nav-link px-3 text-danger">Logout</router-link>
                </li>
            </ul>
        </div>
    </nav>
`


export default {
    props: ['userRole'],
    computed: {
        isAdmin() {
            return this.userRole === 'admin';
        },
        isUser() {
            return this.userRole === 'user';
        },
    },
    template: temp2,
};