import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login'
import Home from '../components/Home'
import Welcome from '../components/Welcome'
import Users from '../components/user/Users'
import Rights from '../components/rights/Rights'
import Roles from '../components/rights/Roles'
import Cate from '../components/goods/Cate'
import Params from '../components/goods/Params'
import List from '../components/goods/List'
import Addgood from '../components/goods/Addgood'
import Order from '../components/order/Order'
import Report from '../components/report/Report'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        redirect: "/login"
    },
    {
        path: '/login',
        component: Login
    },
    {
        path: '/home',
        component: Home,
        redirect: '/welcome',
        children: [
            {
                path: '/welcome',
                component: Welcome
            },
            {
                path: '/users',
                component: Users
            },
            {
                path: '/rights',
                component: Rights
            },
            {
                path: '/roles',
                component: Roles
            },
            {
                path: '/categories',
                component: Cate
            },
            {
                path: '/params',
                component: Params
            },
            {
                path: '/goods',
                component: List
            },
            {
                path:'/goods/add',
                component:Addgood
            },
            {
                path:'/orders',
                component:Order
            },
            {
                path:'/reports',
                component:Report
            }
           
        ]
    }
]
const router = new VueRouter({
    routes
})

//挂载路由导航守卫
router.beforeEach((to, from, next) => {
    //to将要访问的路径
    //from代表从哪个路径跳转而来
    //next 是个函数，表示放行 next("/login") 强制跳转
    if (to.path === '/login') return next();

    //获取token
    const tokenStr = window.sessionStorage.getItem("token")
    if (!tokenStr) return next('/login')
    next()
})

console.log(router);
export default router