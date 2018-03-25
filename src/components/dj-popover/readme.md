# 店+popover编写规范
### 使用情形
类似于商品标签的选择，没有确认按钮的那种，常用于搜索条件的情形

### 开发模式
有一个main-popover页面，封装了antd 的popover的功能，提供了3个属性
handleSelect: PropTypes.func.isRequired, // 点击选择时的触发函数

tipName: PropTypes.string, // 提示名称， 比如请选择 标签， 已选 什么标签等
    
title: PropTypes.string, // popover的表头

### 开发方式
新的popover写到popovers文件夹下，基本上这种形式的只有content的变化，所以这需要编写content的组件，
然后到index。js中透出改组件，
例如：
import React, { Component } from 'react';

import DjFilterPopover from './main-popover';

import DjGoodsTagPopoverContent from './popovers/goods-tag-popover';

const getComponent = content => props => （
        <DjFilterPopover {...props} content={content} title="商品标签" tipName="标签" />
    )


const GoodsTagPopover = getComponent(DjGoodsTagPopoverContent);

module.exports = {
    GoodsTagPopover
};