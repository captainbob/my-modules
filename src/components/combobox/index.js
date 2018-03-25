import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Select } from 'antd';
import { HttpUtil } from 'djmodules-utils/lib';

export default class Combobox extends Component {
    static propTypes = {
        getDataList: PropTypes.func,
        enableAll: PropTypes.bool
    }

    static defaultProps = {
        enableAll: true
    }

    state = {
        dataSource: []
    }

    componentDidMount() {
        if (this.props.getDataList) {
            this.props.getDataList().then(response => {
                this.setState({ dataSource: response });
            }).catch(err => {
            });
        }
    }

    render() {
        let dataSource = this.state.dataSource;
        if (this.props.enableAll) {
            dataSource = [{ label: '全部', value: undefined }, ...this.state.dataSource];
        }
        const options = dataSource.map((data, index) => {
            return <Select.Option value={data.value} key={index}>{data.label}</Select.Option>
        });

        if ((new Set(Object.keys(this.props))).has('value')) {
            const { value, ...props } = this.props;
            const notContainsValue = dataSource.reduce((pre, next) => {
                return next.value != value && pre;
            }, true);

            if (notContainsValue) {
                return <Select {...props}>
                    {options}
                </Select>
            } else {
                return <Select {...props} value={value}>
                    {options}
                </Select>
            }
        }
        return (
            <Select {...this.props}>
                {options}
            </Select>
        );
    }
}

const getComponent = (url, params) => {
    return class extends Component {
        render() {
            return (
                <Combobox {...this.props} getDataList={this.getDataList}></Combobox>
            )
        }

        getDataList = () => {
            return new Promise((resolve, reject) => {
                HttpUtil.promiseGet(url, params).then(response => {
                    if (Array.isArray(response)) {
                        resolve(response.map(item => {
                            return {
                                value: item.code || item.id,
                                label: item.value || item.name
                            };
                        }));
                    } else {
                        resolve([]);
                    }
                }).catch(err => {
                    reject(err);
                });
            });
        }
    }
}

Combobox.ChannelType = getComponent('brand/channel/get_channel_type_list');
Combobox.SupplierType = getComponent('brand/supplier/get_type_list');
Combobox.PayType = getComponent('brand/shop/get_pay_type_list');
Combobox.PropertyType = getComponent('brand/shop/get_property_type_list');
Combobox.ShopGrade = getComponent('brand/grade/get_list', { brandId: window.currentBrandId });