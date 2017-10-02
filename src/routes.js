import Vue from 'vue'
import VueRouter from 'vue-router'
import store from './vuex'
import Login from './views/Login.vue'
import NotFound from './views/404.vue'
import Home from './views/Home.vue'
import Products from './views/shoplist/products.vue'
import Project from './views/project/project.vue'

Vue.use(VueRouter)

let routes = [
  {
    path: '/',
    redirect: '/login',
    hidden: true
  },
  {
    path: '/login',
    component: Login,
    name: '',
    hidden: true
  },
  {
    path: '/404',
    component: NotFound,
    name: '',
    hidden: true
  },
  {
    path: '/',
    component: Home,
    name: '',
    iconCls: 'fa fa-id-card-o',
    leaf: true,
    children: [
      { path: '/projects', component: Project, name: '项目产品',meta: { requiresAuth: true } }
       ]
  },
  {
    path: '/',
    component: Home,
    name: '',
    iconCls: 'fa fa-id-card-o',
    leaf: true,
    children: [
      { path: '/products', component: Products, name: '宝贝详情',meta: { requiresAuth: true } }
       ]
  },
  {
    path: '*',
    hidden: true,
    redirect: { path: '/404' }
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  const token = store.getters.user.token
  if (to.meta.requiresAuth) {
    if (token) {
      next()
    } else {
      next({
        path: '/login',
        query: { redirect: to.path }
      })
    }
  } else {
    next()
  }
})

export default router;
