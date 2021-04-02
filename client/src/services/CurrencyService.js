import Api from '@/services/Api'
import currencies from '@/currencies'

export default {
  async init () {
    let res = await Api().post('currencies')
    currencies.init(res.data)
  }
}
