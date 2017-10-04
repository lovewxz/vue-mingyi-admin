import Vue from 'vue'
import VueRouter from 'vue-router'
import store from './vuex'
import Login from './views/Login'
import NotFound from './views/404'
import Home from './views/Home'
import Products from './views/shoplist/products'
import Project from './views/project/project'
import ProjectAddEdit from './views/project-add-edit/project-add-edit'

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
    name: '项目产品',
    iconCls: 'fa fa-id-card-o',
    children: [
      {
        path: '/projects',
        component: Project,
        name: '项目列表 ',
        meta: { requiresAuth: true }
      }, {
        path: '/projects/add',
        component: ProjectAddEdit,
        name: '添加项目',
        meta: { requiresAuth: true }
      }, {
        path: '/projects/edit/:id',
        component: ProjectAddEdit,
        hidden: true,
        meta: { requiresAuth: true }
      }
    ]
  },
  {
    path: '/',
    component: Home,
    name: '',
    iconCls: 'fa fa-id-card-o',
    leaf: true,
    children: [
      { path: '/products', component: Products, name: '宝贝详情', meta: { requiresAuth: true } }
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
