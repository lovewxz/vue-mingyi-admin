import * as types from './mutation-types'

const mutations = {
  [types.SET_USER](state,user) {
    state.user = user
  },
  [types.LOGIN](state,loginInfo) {
    state.loginInfo = loginInfo
  },
  [types.SET_LOGINSHOW](state,loginShow) {
    state.loginShow = loginShow
  }
}

export default mutations
