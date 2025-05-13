export default {
    template: `
        <div class="d-flex justify-content-center align-items-center vh-100">
            <div class="col-md-4 border bg-light p-5 rounded shadow">
                <h3 class="text-center mb-4">Admin Login</h3>
                <div v-if="message" :class="'alert alert-' + category" role="alert">
                    {{ message }}
                </div>
                <form @submit.prevent="submitLogin">
                    <div class="form-group mb-3">
                        <input type="text" id="username" v-model="username" class="form-control" placeholder="Username" required>
                    </div>
                    <div class="form-group mb-3">
                        <input type="password" id="password" v-model="password" class="form-control" placeholder="Password" required>
                    </div>
                    <div class="form-group text-center mb-3">
                        <input type="submit" value="Login" class="btn btn-primary w-100">
                    </div>  
                </form>
            </div>
        </div>
    `,
    data() {
        return {
            username: null,
            password: null,
            message: null,      
            category: null,     
        };
    },
    methods: {
        async submitLogin() {
            try {
                const res = await fetch(location.origin + '/admin/login', 
                    {
                        method: 'POST', 
                        headers: {'Content-Type': 'application/json'}, 
                        body: JSON.stringify({ 'username': this.username, 'password': this.password })
                    });                
                if (res.ok) {
                    const data = await res.json();
                    this.$root.login('admin', data.access_token);
                    this.$router.push('/admin/dashboard');
                } else {
                    const errorData = await res.json();  
                    this.message = errorData.message; 
                    this.category = errorData.category; 
                }                
            } catch (error) {
                this.message = 'An unexpected error occurred.';
                this.category = 'danger';
            }
        }
    }
};