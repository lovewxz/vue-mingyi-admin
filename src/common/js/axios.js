import axios from 'axios'
import store from '../../vuex'
import router from '../../routes'

//设置全局axios默认值
axios.defaults.timeout = 5000 //5000的超时验证
axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8'

//创建一个axios实例
const instance = axios.create()
instance.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8'

axios.interceptors.request.use = instance.interceptors.request.use
//request拦截器
instance.interceptors.request.use(config => {
  //每次发送请求之前检测都vuex存有token,那么都要放在请求头发送给服务器
  if (store.getters.user.token) {
    config.headers.Authorization = `token ${store.getters.user.token}`
  }
  return config;
}, err => {
  return Promise.reject(err)
})
//respone拦截器
instance.interceptors.response.use(response => {
  return response;
}, error => { //默认除了2XX之外的都是错误的，就会走这里
  if (error.response) {
    switch (error.response.status) {
      case 401:
        store.dispatch('userLogout') //可能是token过期，清除它
        console.log(router.currentRoute)
        router.replace({ //跳转到登录页面
          path: '/login',
          query: {
            redirect: router.currentRoute.fullPath
          } // 将跳转的路由path作为参数，登录成功后跳转到该路由
        })
        break
     case 402:
       store.dispatch('tokenExpired', true)
    }
  }
  return Promise.reject(error.response)
})

export default {
  userLogin(data) {
    return instance.post('/admin/login', data)
  },
  fetchQiniuToken(params) {
    return instance.get('/qiniu/uptoken', {params})
  },
  fetchProject(params) {
    return instance.get('/admin/projects', {params}).then(res => {
      res = res.data
      if (res.success) {
        return {data: res.data.list, total: res.data.total}
      } else {
        return {err: res.err}
      }
    })
  },
  fetchProjectById(params) {
    return instance.get(`/admin/projects/${params}`).then(res => {
      res = res.data
      return res.success
        ? res.data
        : res.err
    })
  },
  putProject(params) {
    return instance.put('/admin/projects', params).then(res => {
      res = res.data
      return res
    })
  },
  delProject(params) {
    return instance.put('/admin/project/del', params).then(res => {
      res = res.data
      return res
    })
  },
  saveProject(params) {
    return instance.post('/admin/projects', params).then(res => {
      res = res.data
      return res
    })
  },
  fetchPcase(params) {
    return instance.get('/admin/pcases', {params}).then(res => {
      res = res.data
      if (res.success) {
        return {data: res.data.list, total: res.data.total}
      } else {
        return {err: res.err}
      }
    })
  },
  fetchPcaseById(params) {
    return instance.get(`/admin/pcases/${params}`).then(res => {
      res = res.data
      return res.success
        ? res.data
        : res.err
    })
  },
  putPcase(params) {
    return instance.put('/admin/pcases', params).then(res => {
      res = res.data
      return res
    })
  },
  delPcase(params) {
    return instance.put('/admin/pcase/del', params).then(res => {
      res = res.data
      return res
    })
  },
  savePcase(params) {
    return instance.post('/admin/pcases', params).then(res => {
      res = res.data
      return res
    })
  },
  fetchDoctor(params) {
    return instance.get('/admin/doctors', {params}).then(res => {
      res = res.data
      if (res.success) {
        return {data: res.data.list, total: res.data.total}
      } else {
        return {err: res.err}
      }
    })
  }
}
