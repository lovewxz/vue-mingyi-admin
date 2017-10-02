import * as types from './mutation-types'
import service from '../common/js/axios'
import { USER_KEY } from '../common/js/cache'
import storage from 'good-storage'

export const fetchProducts = async function ({ commit }) {
  await service.fetchProducts().then(res => {
    if (res.data.success) {
      commit(types.SET_PRODUCTS, res.data.data)
    }
  })
}

export const saveProduct = async function ({ dispatch }, params) {
  await service.saveProduct(params).then(res => {
    if (res.data.success) {
      dispatch('fetchProducts')
    }
  })
}

export const putProduct = async function ({ dispatch }, params) {
  await service.putProduct(params).then(res => {
    if (res.data.success) {
      dispatch('fetchProducts')
    }
  })
}


export const delProduct = async function ({ dispatch }, params) {
  await service.delProduct(params).then(res => {
    if (res.data.success) {
      dispatch('fetchProducts')
    }
  })
}

export const userLogin = async function ({ commit }, params) {
  await service.userLogin(params).then(res => {
    if (res.data.success) {
      commit(types.SET_USER, res.data.data)
    }
    commit(types.LOGIN, res.data)
  })
}

export const userLogout = function ({ commit }) {
  storage.remove(USER_KEY)
  commit(types.SET_USER, {})
}


// 项目

export const fetchProject = async function ({ commit }, params) {
  await service.fetchProject(params).then(res => {
    res = res.data
    if (res.success) {
      commit(types.SET_PROJECTS, res.data)
    }
  })
}

export const saveProject = async function ({ dispatch }, params) {
  await service.saveProject(params).then(res => {
    if (res.data.success) {
      dispatch('fetchProject')
    }
  })
}

export const putProject = async function ({ dispatch }, params) {
  await service.putProject(params).then(res => {
    if (res.data.success) {
      dispatch('fetchProject')
    }
  })
}


export const delProject = async function ({ dispatch }, params) {
  await service.delProject(params).then(res => {
    if (res.data.success) {
      dispatch('fetchProject')
    }
  })
}
