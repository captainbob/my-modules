import React, { Component, PropTypes } from 'react';
import { Cascader } from 'antd';
import { DataProvider, BaseDataProvider, CachedBaseDataProvider, deepEqual } from 'djmodules-utils/lib'
import { isArray } from 'lodash';
import { RegionDataProviderToCity, RegionDataProviderToArea } from '../provider/region-data-provider';
import { DjCascader } from '../cascader-main';

class RegionCascader extends DjCascader {
    constructor(props, context) {
        super(props, context);
    }

    componentDidMount() {
        let value = this.props.value
        if (isArray(value) && value.length > 0) {
            this.initRegionData(this.props.value);
        } else {
            this.props.provider.getData((data) => {
                this.setState({
                    options: data
                });
            })
        }
    }

    componentWillReceiveProps(nextProps) {
        try {
            if (!deepEqual(nextProps.value, this.props.value)) {
                this.initRegionData(nextProps.value);
            }
        } catch (error) {
            console.error(error);
        }
    }

    initRegionData = (value) => {
        if (!value) {
            return
        }
        let options = this.state.options;
        if (isArray(options) && options.length > 0) {
            this.recurseData(1, options, value);
        } else {
            this.props.provider.getData((data) => {
                this.setState({
                    options: data
                }, () => {
                    this.initRegionData(value)
                });
            })
        }
    }

    /**
     * 
     * @param {*} prevValue 上一级 值
     * @param {*array} curOptions  同级的值,
     * @param {*array} value 原来数据
     */
    recurseData = (prevValue, curOptions, value) => {
        try {
            if (!prevValue) {
                return
            }
            let index = value.indexOf(prevValue);
            if (index == value.length - 2) {
                return
            }
            let curValue = value[index + 1];
            let curOption = curOptions.find(v => v.value == curValue);
            if (isArray(curOption.children) && curOption.children.length > 0) {
                this.recurseData(curValue, curOption.children, value);
            } else {
                this.loadData([curOption]).then((data) => {
                    this.recurseData(curValue, data, value);
                })
            }
        } catch (error) {
            console.log("省市区错误:" + error)
        }
    }

}



const getComponent = (provider) => {
    return class extends Component {
        render() {
            return (<RegionCascader provider={provider} {...this.props} />)
        }
    }
}

// 省市区
let regionDataProviderToCityInstance = new CachedBaseDataProvider(new RegionDataProviderToCity());
let regionDataProviderToAreaInstance = new CachedBaseDataProvider(new RegionDataProviderToArea());

export default {
    RegionToCity: getComponent(regionDataProviderToCityInstance),
    RegionToArea: getComponent(regionDataProviderToAreaInstance),
};
