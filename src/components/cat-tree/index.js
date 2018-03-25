import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TreeSelect } from 'antd';
import { DataProvider, BaseDataProvider, CachedBaseDataProvider } from 'djmodules-utils/lib'

import GoodsBuffCatDataProvider from './modules/good-buffcat-data';
import CatDataProvider from './modules/cat-data';
import YearSeasonDataProvider from './modules/year-season';
import AreaSelect from './modules/area-select';
import BigcatDataProvider from "./modules/bigcat-data";
import RegionDataProvider from './modules/region-data';

class MainTreeSelect extends Component {
    state = {
        value: [],
        treeData: [],
        curText: this.props.value ? '已选择:' + this.props.value.length : ''
    }
    allData = {}

    componentDidMount() {
        if (this.props._type == "brandBuffCatTree")
            console.log("brandBuffCatTree");
        this.props.provider.getData((response) => {
            this.setState({
                treeData: response.list
            })
            this.allData = response.allData;
        })
    }

    asyncSetState = (state) => {
        return new Promise((reslove, reject) => {
            this.setState(state, () => {
                reslove()
            })
        })
    }
    /* 
     * 选项改变时，同步更新值 ，hideItem用到如类目上的选择需求
     */
    onChange = (value, label, extra) => {
        // 判断多选
        const { onChange, handleSelect } = this.props;
        if (this.props.multiple) {
            this.setState({
                value: value,
                curText: value.length == 0 ? undefined : `已选择:${value.length}`
            })
        }
        if (typeof onChange == 'function') {
            onChange(value, label, extra, this.getSelectedData(value), this.getSpecialData(value))
        }
        if (typeof handleSelect == 'function') {
            handleSelect(value, label, extra, this.getSelectedData(value), this.getSpecialData(value))
        }
    }

    getSelectedData = (value) => {
        let ret = {}

        value.forEach(id => {
            ret[id] = this.allData[id]
        })

        return ret
    }
    // value 已选的key
    getSpecialData = (value) => {
        let ret = {};
        if (this.props._type === "brandCatTree") {
            ret = this.getSearchDataForBrandCatTree(value)
        }
        if (this.props._type === "regionTree") {
            ret = this.getSearchDataForRegionTree(value)
        }
        // if (this.props._type === 'YearSeasonTree') {
        //     ret = this.getSearchDataForYearSeasonTree(value)
        // }
        return ret
    }
    // getSearchDataForYearSeasonTree = (value) => {
    //     let selectDatas = this.getSelectedData(value);
    //     let years = {}, seasons = {}, ret = [];

    //     for (let key in selectDatas) {
    //         years = this.allData[keys[0]];
    //         seasons = this.allData[keys[1]];
    //         ret.push({
    //             years,
    //             seasons
    //         })
    //     }
    //     return ret
    // }
    getSearchDataForRegionTree = (value) => {
        let selectDatas = this.getSelectedData(value);;
        let big = [], small = [];
        for (let key in selectDatas) {
            let sourceObj = selectDatas[key].sourceObj;
            if (sourceObj.level == 1) {
                big.push(sourceObj.id)
            } else if (sourceObj.level == 2) {
                small.push(sourceObj.id)
            }
        }
        return {
            big,
            small,
        }
    }
    getSearchDataForBrandCatTree = (value) => {
        let selectDatas = this.getSelectedData(value);;
        let catIds = [], customCatCodes = [];

        for (let key in selectDatas) {
            let sourceObj = selectDatas[key].sourceObj;
            if (sourceObj.catLevel == 0) {
                catIds.push(sourceObj.catId)
            } else {
                customCatCodes.push(sourceObj.catCode)
            }
        }

        return {
            catIds,
            customCatCodes
        }
    }

    render() {
        const from = this.props.hasOwnProperty("value");
        const { treeData } = this.state;
        const { onChange: _onChange, ...props } = this.props;
        let multiple = props.multiple === false ? false : true;
        let showItem = multiple;
        let curText = this.props.value ? '已选择:' + this.props.value.length : this.state.curText;
        return (
            <div className={showItem === true ? 'dj-hide-select-item' : ''} ref="treeSelect">
                {multiple ? (
                    <div className='cur-select-text'>{from ? (props.value ? curText : undefined) : curText}</div>
                ) : []
                }
                <TreeSelect
                    treeData={treeData}
                    onChange={this.onChange}
                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                    placeholder={props.placeholder ? props.placeholder : ""}
                    allowClear
                    showCheckedStrategy={TreeSelect.SHOW_ALL}
                    treeDefaultExpandAll={false}
                    treeCheckable={true}
                    dropdownMatchSelectWidth={true}
                    getPopupContainer={props.getPopupContainer ? props.getPopupContainer : () => document.getElementsByClassName('dj-menu-content')[0]}
                    style={props.style ? props.style : { width: '100%' }}
                    {...props}
                />
            </div>
        );
    }
}

MainTreeSelect.propTypes = {};

// 模块 是否多选
const getComponent = (provider, multiple = true, _type = "") => {
    return class extends Component {
        render() {
            return (
                <MainTreeSelect provider={provider} multiple={multiple} _type={_type}  {...this.props} />
            )
        }
    }
}

const goodsBuffCatDataProviderIns = new CachedBaseDataProvider(new GoodsBuffCatDataProvider());
const catDataProviderIns = new CachedBaseDataProvider(new CatDataProvider());
const bigcatDataProviderIns = new CachedBaseDataProvider(new BigcatDataProvider());
const regionDataProviderIns = new CachedBaseDataProvider(new RegionDataProvider());
const yearSeasonDataProviderIns = new CachedBaseDataProvider(new YearSeasonDataProvider());

export default {
    GoodsBuffCatTree: getComponent(goodsBuffCatDataProviderIns, true, "brandBuffCatTree"),
    BrandCatTree: getComponent(catDataProviderIns, true, "brandCatTree"),
    BrandBigCatTree: getComponent(bigcatDataProviderIns, true, "brandBigCatTree"),
    YearSeasonTree: getComponent(yearSeasonDataProviderIns, true, "YearSeasonTree"),
    RegionTree: getComponent(regionDataProviderIns, true, "regionTree"),
    AreaSelect: AreaSelect,
};