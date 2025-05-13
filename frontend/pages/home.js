export default {
    template: `
        <div class="d-flex justify-content-center align-items-center vh-100">
            <div class="col-md-4 text-center border rounded p-4 bg-light shadow">
                <h3 class="mb-4">Vehicle Parking</h3>
                
                <div class="d-grid gap-3">
                    <router-link to="/admin/login" class="btn btn-outline-primary">Admin Login</router-link>
                    <router-link to="/login" class="btn btn-outline-secondary">User Login</router-link>
                </div>
            </div>
        </div>
    `,
}