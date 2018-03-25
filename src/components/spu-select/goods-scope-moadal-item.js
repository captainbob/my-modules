import React, { Component } from 'react';
import moment from "moment";
import {
    Row, Col, Button, message, Icon, Checkbox, Select,
    Input, Radio, Card, Tree, DatePicker, InputNumber
} from "antd";

import CatTree from '../cat-tree/index';
import '../cat-tree/style/index'
import DjSelect from '../dj-select/index';
import '../dj-select/style/index'

const RangePicker = DatePicker.RangePicker;
const CheckboxGroup = Checkbox.Group;
const { Option } = Select;

const { Year, Season, ChildBrands, Section } = DjSelect;
const { BrandCatTree } = CatTree;

//商品品牌
class GoodsBrand extends Component {
    onClose = () => {
        const { keyId, onClose, onChangeProp } = this.props;
        // 设置为默认值
        onChangeProp({ childBrandId: [] },{childBrandName:[]})
        // 关闭
        onClose(keyId)
    }
    render() {
        const { dataSource, onChangeProp } = this.props;
        return (
            <div>
                <Card title="商品品牌" extra={<Icon type="close" onClick={this.onClose} />} >
                    <ChildBrands
                        value={dataSource.childBrandId}
                        onChange={(value,text) => {
                            onChangeProp({ childBrandId: value },{childBrandName:text});
                        }}
                        placeholder="请选择商品品牌"
                        style={{ width: '100%' }}
                        showDefaultStyle
                    />
                </Card>
            </div>
        );
    }
}
//商品类目
class GoodsCategary extends Component {
    onClose = () => {
        const { keyId, onClose, onChangeProp } = this.props;
        // 设置为默认值
        onChangeProp({ goodsCategory: [] },{goodsCategoryName:[]})
        // 关闭
        onClose(keyId)
    }
    render() {
        const { dataSource, onChangeProp } = this.props;
        return (
            <div>
                <Card title="商品类目" extra={<Icon type="close" onClick={this.onClose} />} >
                    <BrandCatTree
                        value={dataSource.goodsCategory}
                        onChange={(value, label, extra, selectCatDatas) => {
                            onChangeProp({ goodsCategory: value },{goodsCategoryName:label})
                        }}
                        style={{ width: '100%' }}
                    />
                </Card>
            </div>
        );
    }
}

class GoodsSection extends Component {
    onClose = () => {
        const { keyId, onClose, onChangeProp } = this.props;
        // 设置为默认值
        onChangeProp({ goodsSection: [] },{goodsSectionName:[]})
        // 关闭
        onClose(keyId)
    }
    render() {
        const { dataSource, onChangeProp } = this.props;
        return (
            <div>
                <Card title="商品层" extra={<Icon type="close" onClick={this.onClose} />} >
                    <Section
                        value={dataSource.goodsSection}
                        onChange={(value,text) => {
                            onChangeProp({ goodsSection: value },{goodsSectionName:text})
                        }}
                        placeholder="请选择商品层"
                        style={{ width: '100%' }}
                        showDefaultStyle
                    />
                </Card>
            </div>
        );
    }
}

class YearLink extends Component {
    onClose = () => {
        const { keyId, onClose, onChangeProp } = this.props;
        // 设置为默认值
        onChangeProp({ yearLike: [] },{yearLikeName:[]})
        // 关闭
        onClose(keyId)
    }
    render() {
        const { dataSource, onChangeProp } = this.props;
        return (
            <div>
                <Card title="年份" extra={<Icon type="close" onClick={this.onClose} />} >
                    <Year
                        value={dataSource.yearLike}
                        onChange={(value,text) => {
                            onChangeProp({ yearLike: value },{yearLikeName:text})
                        }}
                        placeholder="请选择年份"
                        style={{ width: '100%' }}
                        showDefaultStyle
                    />
                </Card>
            </div>
        );
    }
}

class SeasonLike extends Component {
    onClose = () => {
        const { keyId, onClose, onChangeProp } = this.props;
        // 设置为默认值
        onChangeProp({ seasonLike: [] },{seasonLikeName:[]})
        // 关闭
        onClose(keyId)
    }
    render() {
        const { dataSource, onChangeProp } = this.props;
        return (
            <div>
                <Card title="季节" extra={<Icon type="close" onClick={this.onClose} />} >
                    <Season
                        value={dataSource.seasonLike}
                        onChange={(value,text) => {
                            onChangeProp({ 'seasonLike': value },{seasonLikeName:text})
                        }}
                        placeholder="请选择季节"
                        style={{ width: '100%' }}
                        showDefaultStyle
                    />
                </Card>
            </div>
        );
    }
}

export {
    GoodsBrand,
    GoodsCategary,
    GoodsSection,
    YearLink,
    SeasonLike
}