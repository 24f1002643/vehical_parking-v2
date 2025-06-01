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
    template: `
        <nav class="navbar navbar-expand-lg navbar-light bg-light px-4 shadow-sm">
            <template v-if="isAdmin">
                <router-link to="/admin/dashboard" class="navbar-brand me-4 fw-bold fs-4" style="color: red;">Welcome to Admin</router-link>
            </template>
            <template v-if="isUser">
                <router-link to="/user/dashboard" class="navbar-brand me-4 fw-bold fs-4" style="color: red;">Welcome to User</router-link>
            </template>
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
                            <router-link to="/admin/users" class="nav-link px-3">Users</router-link>
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
    `,
};