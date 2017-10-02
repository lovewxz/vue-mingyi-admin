import storage from 'good-storage'
import { USER_KEY } from '../common/js/cache.js'

const state = {
  products: [],
  user: storage.get(USER_KEY, {}),
  loginInfo: {},
  projects: []
}

export default state
