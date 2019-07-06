import { ComponentType } from 'react'
import Taro, { Component } from '@tarojs/taro'
import { View, Text, Image } from '@tarojs/components'
import { observer, inject } from '@tarojs/mobx'
import { AtButton, AtTag, AtDivider, AtDrawer, AtRadio } from 'taro-ui'
import localforage from 'localforage'
import areaData from '../../config/areaData'

import './index.scss'

const Logo = require('../../assets/images/logo.png');
const electricIcon = require('../../assets/images/electric.png');
const electricIcon2 = require('../../assets/images/electric2.png');

type PageStateProps = {
  areaStore: {
    area: string[],
    setArea: Function,
    resetArea: Function,
  },
  baseStore: {
    setLogin: Function
  }
}

interface Index {
  props: PageStateProps;
}

@inject('areaStore', 'baseStore')
@observer
class Index extends Component {
  admins: string[] = []
  streets: string[] = []
  drawerData = [Object.keys(areaData), []] // 选项数据：0 供电所；1 街道。
  selectedOptionIndex: [undefined | number, undefined | number] = [undefined, undefined]  // 当前选中的值的索引：0 供电所；1 街道。
  state = {
    managersHistory: [],
    showDrawer: false,
    curDrawerType: 0, // 当前选项类型：0 供电所；1 街道
  }

  constructor(props) {
    super(props);

    props.baseStore.setLogin(true); // 进入首页后设置已登录标识，是为了保证在结果页刷新页面时页面能正常跳转到首页
    this.setManagersRecord();
  }

  setManagersRecord = () => {
    localforage.getItem('managers').then((val: string[]) => {
      this.setState({
        managersHistory: val || []
      });
    });
  }

  render () {
    const { areaStore: { area } } = this.props;
    const { managersHistory, showDrawer, curDrawerType } = this.state;
    const managersHistoryLen = managersHistory.length;
    const curAdmin = area[0];
    const curStreet = area[1];
    
    return (
      <View className='index'>
        <View className='logo'>
          <Image src={Logo} className='logo-pic' />
        </View>
        <View className='form-box'>
          <View className='form-item' onClick={() => this.showDrawer(0)}>
            <Image src={electricIcon} className='item-icon' />
            {
              curAdmin === '' ? <Text className='item-text-unselect'>请选择供电所</Text> :
              <Text className='item-text'>{ `已选：${curAdmin}` }</Text>
            }
            <View className='item-button'>
              <View className={`at-icon at-icon-${curAdmin ? 'check ' : 'add'} item-button-icon`}></View>
            </View>
          </View>
          <View className='form-item' onClick={() => this.showDrawer(1)}>
            <Image src={electricIcon2} className='item-icon' />
            {
              curStreet === '' ? <Text className='item-text-unselect'>请选择村委/变压器</Text> :
              <Text className='item-text'>{ `已选：${curStreet}` }</Text>
            }
            <View className='item-button'>
              <View className={`at-icon at-icon-${curStreet ? 'check ' : 'add'} item-button-icon`}></View>
            </View>
          </View>
        </View>
        <AtButton type='primary' onClick={this.gotoResult} disabled={curAdmin === '' || curStreet == ''}>查询</AtButton>
        <View className='record-box'>
          <View className='record-title-box'>
            <AtDivider content='查询历史' />
          </View>
          <View className='record-tags-box'>
            {
              managersHistoryLen === 0 ? <Text className='record-no-tips'>暂无查询历史</Text> :
              managersHistory.map((name, index) => <AtTag type='primary' circle className={managersHistoryLen - 1 === index ? '' : 'record-tag'} onClick={(e) => this.gotoResult(e, name)}>{name}</AtTag>)
            }
          </View>
        </View>
        <AtDrawer
          show={showDrawer} 
          mask
        >
          <AtRadio
            options={this.drawerData[curDrawerType].map((val, i) => ({ label: val, value: i }))}
            value={this.selectedOptionIndex[curDrawerType]}
            onClick={this.onSelect}
          />
        </AtDrawer>
      </View>
    )
  }

  showDrawer = (i: number) => {
    this.setState({
      showDrawer: true,
      curDrawerType: i,
    });
  }

  getStreets = (curAdmin, curStreet): number => {
    if (curAdmin === '') {
      return 0;
    }
    this.streets = Object.keys(areaData[curAdmin]);
    const curStreetIndex = curStreet === '' ? 0 : this.streets.indexOf(curStreet);

    return curStreetIndex;
  }
  
  onSelect = (i: number) => {
    const { areaStore } = this.props;
    const { curDrawerType } = this.state;
    const { area } = areaStore;
    const val = this.drawerData[curDrawerType][i];
    if (curDrawerType === 0) {
      // 选择了供电所后：
      this.drawerData[1] = Object.keys(areaData[val]);  // 设置街道选项
      // 清除街道选择记录：
      if (area[0] !== val && area[1] !== '') {
        this.selectedOptionIndex[1] = undefined;
        areaStore.resetArea(1);
      }
    }
    this.selectedOptionIndex[curDrawerType] = i;
    this.setState({
      showDrawer: false,
    });
    areaStore.setArea(curDrawerType, val);
  }

  gotoResult = (e, name?: string) => {
    Taro.navigateTo({
      url: `/pages/result/index?manager=${name}`
    })
  }
}

export default Index as ComponentType
