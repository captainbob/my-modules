import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Select, message, Spin } from 'antd';
const Option = Select.Option;
import { HttpUtil } from 'djmodules-utils';
const Ajax = HttpUtil.ajax;

import './style/style.css';

let timeout;
let currentValue;

class AsyncSelect extends Component {

    constructor(props) {
        super(props);
        this.state = {
            data: [],
            selectedValue: false,
            loading: false
        }
        this.formatter = (queryType, data) => {
            switch (Number(queryType)) {
                case 2:
                case 3:
                    return data.map((v, i) => {
                        return Object.assign({}, v, {
                            value: this.props.valueText ? (v.name || v.label) : (v.id || v.value),  //如果开启value=label时
                            label: v.name || v.label,       //v.label 是保留言输入的值在搜索框
                            key: i,
                        })
                    });
                case 4:
                    return data.map((v, i) => {
                        return Object.assign({}, v, {
                            value: this.props.valueText ? (v.name || v.label) : (v.storageId || v.value),
                            label: v.name || v.label,
                            key: i,
                        })
                    })
                case 5:
                    return data.map((v, i) => {
                        return Object.assign({}, v, {
                            value: this.props.valueText ? (v.channelName || v.label) : (v.channelId || v.value),
                            label: v.channelName || v.label,
                            key: i,
                        })
                    })
                default:
                    return data
            }
        }

        this.fetch = (value, type, showCount, callback) => {
            let keepText = this.props.keepText;
            let _this = this;
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            currentValue = value;
            type = type ? type : 'StoreData';
            let queryType = 4, storageType = '';
            if (type === 'BigAreaData') {
                // 大区
                queryType = 2;
            } else if (type === 'SmallAreaData') {
                // 小区
                queryType = 3;
            } else if (type === 'StoreData') {
                // 店
                storageType = 1;
            } else if (type === 'WarehouseData') {
                // 仓
                storageType = 2;
            } else if (type === 'StoreWarehouseData') {
                //店仓
                queryType = 4;
                storageType = '';
            } else if (type == 'ChannelData') {
                queryType = 5;
                storageType = ''
            }
            if (showCount instanceof Function) {
                callback = showCount;
                showCount = '';
            }
            function fake() {
                _this.setState({ loading: true });
                Ajax('brand/base/cnd_query', {
                    method: 'GET',
                    data: {
                        brandId: currentBrandId,
                        queryType: queryType,
                        storageType: storageType,
                        keyWords: value,
                        type: type,
                        showCount
                    },
                }).then(response => response[type] ? response[type] : response)
                    .then((result) => {
                        _this.setState({ loading: false });
                        if (result.status === 'success') {
                            result = result.resultObject || [];
                            let data = [];
                            if (keepText) {
                                result.unshift({ label: value, value });
                            }
                            if (result) {
                                data = _this.formatter(queryType, result);
                            }
                            callback(data);
                        } else {
                            message.error(result.exceptionMessage);
                        }
                    });
            }

            timeout = setTimeout(fake, 300);
        }

    }
    handleChange = (value) => {
        this.setState({ selectedValue: value, loading });
        let props = this.props;
        if (props.onChange && props.onChange instanceof Function) {
            props.onChange(value);
        }
    }
    handleSearch = (value, type, showCount) => {
        if (!value) {
            clearTimeout(timeout);
            this.setState({ data: [], selectedValue: '', loading: false });
        } else {
            this.fetch(value, type, showCount, (data) => {
                this.setState({ data });
            });
        }
    }
    componentWillMount() {

    }
    render() {
        let props = this.props;
        let data = this.state.data;
        if (data && data.constructor === Array) {
            data = data.map((item, i) => {
                return (
                    <Option key={i} value={item.value} data-value={item.label}>{item.label}</Option>
                )
            });
        }
        let width = !props.style ? 200 : props.style.width || 'auto';
        let style = Object.assign({}, props.style, { width: '100%', minWidth: '100%' });
        return (
            <div style={{ display: 'inline-block', position: 'relative', width }}>
                {!this.state.loading || this.props.loading === false ? '' :
                    <div style={{ position: 'absolute', zIndex: 1, right: 0, top: '50%', marginTop: -14 }}>
                        <Spin spinning={this.props.loading === false ? false : this.state.loading}>
                            <div style={{ width: 28, height: 28 }}></div>
                        </Spin>
                    </div>
                }
                <Select
                    showSearch
                    allowClear={true}
                    placeholder={props.placeholder ? props.placeholder : '输入关键字'}
                    notFoundContent=""
                    defaultActiveFirstOption={false}
                    showArrow={false}
                    filterOption={false}
                    dropdownMatchSelectWidth={false}
                    onChange={this.handleChange}
                    onSearch={(text, type) => { this.handleSearch(text, props.dataAlias, props.showCount || '') }}
                    {...props}
                    style={props.style ? style : { width: '100%', minWidth: '100%' }}
                >
                    {data}
                </Select>
            </div>
        )
    }
}

export default AsyncSelect;