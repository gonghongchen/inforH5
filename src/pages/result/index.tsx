import { ComponentType } from 'react'
import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { observer, inject } from '@tarojs/mobx'
import { AtButton, AtNavBar, AtList, AtListItem, AtToast } from 'taro-ui'
import copy from 'copy-to-clipboard'
import localforage from 'localforage'
import areaData from '../../config/areaData'
import managerData from '../../config/managerData'

import './index.scss'

const meIcon = require('../../assets/images/me.png');
const locationIcon = require('../../assets/images/location.png');
const phoneIcon = require('../../assets/images/phone.png');

type PageStateProps = {
  areaStore: {
    area: string[],
  },
  baseStore: {
    isLogin: boolean
  }
}

interface Index {
  props: PageStateProps;
}

@inject('areaStore', 'baseStore')
@observer
class Index extends Component {
  areaManager: string = '暂无信息'
  location: string = ''
  managerData: {
    phone: string
  } = {
    phone: '暂无信息'
  }

  state = {
    showToast: false,
    copyStatus: true
  }

  constructor(props) {
    super(props);

    const { areaStore: { area }, baseStore: { isLogin } } = props;
    const { manager } = this.$router.params;
    if (!isLogin) {
      Taro.redirectTo({
        url: '/pages/index/index'
      })
      return;
    }
    if (manager === 'undefined') {
      this.areaManager = areaData[area[0]][area[1]];
      this.location = area[1];
    } else {
      this.areaManager = manager;
    }
    this.managerData = managerData[this.areaManager];
    this.saveManager();
  }

  saveManager = () => {
    localforage.getItem('managers').then((val: string[]) => {
      let managers = val || [];
      if (!managers.includes(this.areaManager)) {
        managers.push(this.areaManager);
        localforage.setItem('managers', managers);
      }
    });
  }

  render () {
    const { showToast, copyStatus } = this.state;
    const { phone } = this.managerData;
    return (
      <View className='result-index'>
        <AtNavBar
          color='#000'
          border={false}
          leftIconType='chevron-left'
          leftText='返回'
          onClickLeftIcon={this.goBack}
        />
        <View className='content animated zoomIn'>
          <View className='title-box'>
            <Text>查询结果</Text>
          </View>
          <AtList hasBorder={false}>
            {
              this.location !== '' && (
                <AtListItem
                  title={this.location}
                  thumb={locationIcon}
                />
              )
            }
            <AtListItem
              title={this.areaManager}
              thumb={meIcon}
            />
            <AtListItem
              title={phone}
              thumb={phoneIcon}
            />
          </AtList>
          <View className='call-btn-box'>
            <AtButton type='primary' size='small' onClick={this.onCall} circle className='call-btn'>拨打电话</AtButton>
            <AtButton type='secondary' size='small' onClick={() => this.onCopy(this.location, phone)} circle className='call-btn'>复制信息</AtButton>
          </View>
        </View>
        <AtToast isOpened={showToast} duration={1500} text={copyStatus ? '复制成功' : '复制失败'} status={copyStatus ? 'success' : 'error'}></AtToast>
      </View>
    )
  }

  goBack = () => {
    Taro.navigateBack({ delta: 1 });
  }

  onCall = () => {
    Taro.makePhoneCall({phoneNumber: this.managerData.phone.toString()});
  }

  onCopy =(location, phone) => {
    const copyStr = location === '' ? `片区经理：${this.areaManager}；联系手机：${phone}。` : `村委/变压器：${location}；片区经理：${this.areaManager}；联系手机：${phone}。`;
    const res = copy(copyStr);
    this.setState({
      showToast: true,
      copyStatus: res
    });
  }
}

export default Index as ComponentType
