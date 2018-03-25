import React, { Component, PropTypes } from 'react';
import { Cascader } from 'antd';
import { DataProvider, BaseDataProvider, CachedBaseDataProvider } from 'djmodules-utils/lib'

import { AreaDataProvider } from './data-provider';
import { RegionDataProviderToCity, RegionDataProviderToArea } from './provider/region-data-provider';
import CatTreeDataProvider from './provider/cat-tree-data-provider';
import ChannelTreeProvider from './provider/channel-tree-data-provider';

class DjCascader extends Component {
    state = {
        options: []
    }

    componentDidMount() {
        this.props.provider.getData((data) => {
            this.setState({
                options: data
            });
        })
    }

    loadData = (selectedOptions) => {
        const targetOption = selectedOptions[selectedOptions.length - 1];
        targetOption.loading = true;
        return new Promise((resolve, reject) => {
            this.props.provider.proxy.loadData(targetOption, (data) => {
                targetOption.loading = false;
                targetOption.children = data;
                this.setState({
                    options: [...this.state.options],
                }, () => {
                    resolve(data)
                });
            })
        })
    }
    render() {
        const { provider, ..._props } = this.props;

        return (
            <Cascader {..._props} options={this.state.options} allowClear loadData={this.loadData} />
        );
    }
}

DjCascader.propTypes = {
};
const getComponent = (provider) => {
    return class extends Component {
        render() {
            return (<DjCascader provider={provider} {...this.props} />)
        }
    }
}

// 大区小区的选择
let areaDataProviderInstance = new CachedBaseDataProvider(new AreaDataProvider())
// 类目
let catTreeDatsProviderInstance = new CachedBaseDataProvider(new CatTreeDataProvider());
// 渠道
let channelTreeDataProviderInstance = new CachedBaseDataProvider(new ChannelTreeProvider());

export { DjCascader };
export default {
    Area: getComponent(areaDataProviderInstance),
    Catelog: getComponent(catTreeDatsProviderInstance),
    Channel: getComponent(channelTreeDataProviderInstance),
};