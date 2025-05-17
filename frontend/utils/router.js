import home from "../pages/home.js";
import login from "../pages/login.js";
import register from "../pages/register.js";
import adminLogin from "../pages/adminLogin.js";
import adminDashboard from "../pages/adminDashboard.js"
import adminUsers from "../pages/adminUsers.js"

const routes = [
    {path : '/', component : home},
    {path : '/login', component : login},
    {path : '/register', component : register},
    {path : '/admin/login', component : adminLogin},
    {path : '/admin/dashboard', component : adminDashboard},
    {path : '/admin/users', component : adminUsers},
    {path : '/logout', component : {
        template : `
        <div>
            <h3>Logging out...</h3>
        </div>
        `,
        mounted() {
            this.$root.logout();
        }
    }}
]

const router = new VueRouter({
    // mode: "history",
    routes: routes,
})

export default router;