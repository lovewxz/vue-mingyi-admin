import * as types from './mutation-types'
import service from '../common/js/axios'
import { USER_KEY } from '../common/js/cache'
import storage from 'good-storage'

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

export const tokenExpired = function ({ dispatch,commit }, params) {
  if (params) {
    dispatch('userLogout')
    commit(types.SET_LOGINSHOW, params)
  } else {
    commit(types.SET_LOGINSHOW, params)
  }
}
