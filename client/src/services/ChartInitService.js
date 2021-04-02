import Api from '@/services/Api'

export default {
  init () {
    return Api().post('charts')
  }
}
