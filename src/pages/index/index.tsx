import React, {useState} from 'react';
import * as Taro from '@tarojs/taro'
import { View } from '@tarojs/components'
import { AtButton, AtLoadMore } from 'taro-ui'
import {book as Fetch} from '@/api/index'
import "taro-ui/dist/style/components/button.scss" // 按需引入
import './index.less'



const Index = () => {
  const [ isbn, setIsbn ] = useState({
    scanType: '',
    isbnNum: '',
  })
  const scanIsbn = () => {
    // 允许从相机和相册扫码
    Taro.scanCode({
      success: ({scanType, result}) => {
        setIsbn({
          scanType,
          isbnNum: result
        })
        getBookDetailFromIsbn()
      },
      fail:() => {

      }
    })
  }

  // 获取图书详情
  const getBookDetailFromIsbn = async () => {
    const {code,data} = await Fetch.getBookDetail(isbn)
    if (code !== 0) return
    alert(data)
  }
  return (
    <View className='index'>
      <AtButton type='primary' circle onClick={scanIsbn}>扫码</AtButton>
      <View>扫码标识{isbn.scanType}</View>
      <View>扫码结果{isbn.isbnNum}</View>
    </View>
  )
}

export default Index
