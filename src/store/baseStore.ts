import { observable } from 'mobx'

const baseStore = observable({
  isLogin: false as boolean,
  setLogin(status: boolean) {
    this.isLogin = status;
  }
})
export default baseStore