import { observable } from 'mobx'

const initialArea: string[] = ['', ''];
const areaStore = observable({
  area: initialArea,
  setArea(i: number, val: string) {
    this.area[i] = val;
  },
  resetArea(i: number) {
    this.area[i] = '';
  }
})
export default areaStore