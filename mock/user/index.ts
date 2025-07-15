import { defineMock } from '../_base'
import { type MockTokenItem, USER_TOKENS, getDelayTime, isAdmin, resultError, resultSuccess } from '../_utils'
import userData from '../_data/system_user'

export default defineMock([
  {
    url: '/user/logout',
    method: 'post',
    timeout: getDelayTime(),
    response: () => {
      return resultSuccess(null)
    }
  },
])
