export default {
    template: `
        <div class="d-flex justify-content-center align-items-center vh-100">
            <div class="col-md-4 border bg-light p-5 rounded shadow">
                <h3 class="text-center mb-4">Register</h3>

                <div v-if="message" :class="'alert alert-' + category" role="alert">
                    {{ message }}
                    <div v-if="countdown > 0 && category === 'success'">
                        Redirecting to login in {{ countdown }}...
                    </div>
                </div>

                <form @submit.prevent="submitRegister">
                    <div class="form-group mb-3">
                        <input type="text" id="name" v-model="name" class="form-control" placeholder="Name" autofocus required>
                    </div>
                    <div class="form-group mb-3">
                        <input type="text" id="username" v-model="username" class="form-control" placeholder="Username" required>
                    </div>
                    <div class="form-group mb-3">
                        <input type="email" id="email" v-model="email" class="form-control" placeholder="Email" required>
                    </div>
                    <div class="form-group mb-4">
                        <input type="password" id="password" v-model="password" class="form-control" placeholder="Password" required>
                    </div>

                    <div class="d-grid gap-2 d-md-flex justify-content-md-center">
                        <input type="submit" value="Register" class="btn btn-primary px-4">
                        <router-link to="/login" class="btn btn-secondary px-4">Cancel</router-link>
                    </div>
                </form>
            </div>
        </div>
    `,
    data() {
        return {
            name: null,
            username: null,
            email: null,
            password: null,
            message: null,      
            category: null,
            countdown: 0,
            countdownInterval: null           
        } 
    },
    methods: {
        async submitRegister() {
            try {
                const res = await fetch(location.origin+'/register', {
                    method: 'POST', 
                    headers: {'Content-Type': 'application/json'}, 
                    body: JSON.stringify({
                        'name': this.name,
                        'username': this.username,
                        'email': this.email,
                        'password': this.password
                    })
                });
                if (res.ok) {
                    const data = await res.json();
                    this.message = data.message;
                    this.category = data.category;
                    
                    if (this.countdownInterval) {
                        clearInterval(this.countdownInterval);
                    }
                    this.countdown = 5;
                    this.countdownInterval = setInterval(() => {
                        this.countdown--;
                        if (this.countdown <= 0) {
                            clearInterval(this.countdownInterval);
                            this.$router.push('/login');
                        }
                    }, 1000);
                } else {
                    const err = await res.json();  
                    this.message = err.message; 
                    this.category = err.category;
                }
            } catch (error) {
                this.message = 'An unexpected error occurred.';
                this.category = 'danger';
            }            
        }
    },
    beforeUnmount() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
    }
}