import * as types from './mutation-types'

const mutations = {
  [types.SET_PRODUCTS](state,products) {
    state.products = products
  },
  [types.SET_USER](state,user) {
    state.user = user
  },
  [types.LOGIN](state,loginInfo) {
    state.loginInfo = loginInfo
  },
  [types.SET_PROJECTS](state,projects) {
    state.projects = projects
  }
}

export default mutations
