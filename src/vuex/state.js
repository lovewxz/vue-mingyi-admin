import storage from 'good-storage'
import { USER_KEY } from '../common/js/cache.js'

const state = {
  user: storage.get(USER_KEY, {}),
  loginInfo: {},
}

export default state
