import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Select, message, Spin } from 'antd';

import './style/style.css';
import { ChannelDataProvider } from './provider/get-channel';
import { CndBaseDataProvider } from './provider/cnd-base';
import { SupplierDataProvider } from './provider/get-supplier';
import { StaffDataProvider } from './provider/staff';
import { StoreDataProvider } from './provider/get-store';
import { GoodsDataProvider } from './provider/goods';
import { MerchantDataProvider } from './provider/merchant';
import { CompanysDataProvider } from './provider/company';

const Option = Select.Option;
let timeout;
let currentValue;
// 范围 // 商品的基础信息
class BaseAsyncSelect extends Component {
    static defaultProps = {
        defaultAjaxOptions: {}
    }

    constructor(props) {
        super(props);
        this.state = {
            data: [],
            selectedValue: false,
            loading: false,
            allData: [],
        }
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.value != this.props.value) {
            this.handleSearch(nextProps.value)
        }
    }
    render() {
        let { onChange: _onChange, ...props } = this.props;
        let { data } = this.state;
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
            <div style={{ display: 'inline-block', position: 'relative', width }} >
                <Select
                    value={props.value}
                    showSearch
                    allowClear={true}
                    placeholder={props.placeholder ? props.placeholder : '输入关键字'}
                    notFoundContent={this.state.loading ? <Spin size="small" /> : null}
                    showArrow={false}
                    filterOption={false}
                    dropdownMatchSelectWidth={false}
                    onChange={this.handleChange}
                    onSearch={(text) => { this.handleSearch(text, props.showCount || '') }}
                    {...props}
                    style={props.style ? style : { width: '100%', minWidth: '100%' }}
                >
                    {data}
                </Select>
            </div>
        )
    }
    handleSearch = (value, showCount = 10) => {
        this.setState({ loading: true });

        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
        currentValue = value;

        if (!value) {
            this.setState({ selectedValue: '', loading: false });
        } else {
            timeout = setTimeout(() => {
                let valueObj = {
                    value: value,
                };
                if (this.props.veidoo) {
                    valueObj["veidoo"] = this.props.veidoo
                }
                valueObj = Object.assign({}, this.props.defaultAjaxOptions, valueObj);

                this.props.provider.getData(valueObj, showCount, (res) => {
                    let list = res.list || [];
                    if (currentValue == value) {
                        if (this.props.likeValue) {
                            list.unshift({
                                value: value,
                                label: value,
                            })
                        }
                        this.setState({
                            loading: false,
                            data: list,
                            allData: res.data,
                        });
                    }
                }, (err) => {
                    message.error(err)
                });
            }, 300);

        }
    }
    handleChange = (value) => {
        this.setState({ selectedValue: value, loading: false });
        let props = this.props;
        let _value;
        if (props.onChange && props.onChange instanceof Function) {
            if (typeof value == 'object') {
                _value = value.key
            } else {
                _value = value
            }
            const selectedData = this.state.allData.filter(v => {
                return v._id == _value
            })
            props.onChange(value, selectedData);
        }
    }
}

// 商品的基础信息各模块
// multiple 是否多选
const getComponent = (provider) => {
    return class extends Component {
        render() {
            return <BaseAsyncSelect provider={provider} {...this.props} />
        }
    }
}
// 0：代理商，1：加盟商，2：直营，3：联营
// 联营商
const jointChannelDataProvider = new ChannelDataProvider("3");
// 经销商
const dealersChannelDataProvider = new ChannelDataProvider("0,1");
// 所有的渠道类型
const allChannelDataProvider = new ChannelDataProvider("0,1,2,3")
// 大区
const bigAreaDataProvider = new CndBaseDataProvider(2);
// 小区
const smallAreaDataProvider = new CndBaseDataProvider(3);
// 店
const storeDataProvider = new CndBaseDataProvider(4, 1);
// 仓
const warehouseDataProvider = new CndBaseDataProvider(4, 2);
// 店仓
const storeWarehouseDataProvider = new CndBaseDataProvider(4, '');
// 渠道
const channelDataProvider = new CndBaseDataProvider(5, '')
// 供应商
const supplierDataProvider = new SupplierDataProvider('1');
// 员工
const staffDataProvider = new StaffDataProvider();
// 店铺（含渠道id）
const storeWithChannelIdDataProvider = new StoreDataProvider();
// 商品
const goodsDataProvider = new GoodsDataProvider();
// 货号
const merchantDataProvider = new MerchantDataProvider();
// 公司
const companysDataProvider = new CompanysDataProvider();


export default {
    JointChannel: getComponent(jointChannelDataProvider),
    DealersChannel: getComponent(dealersChannelDataProvider),
    AllChannel: getComponent(allChannelDataProvider),
    BigArea: getComponent(bigAreaDataProvider),
    SmallArea: getComponent(smallAreaDataProvider),
    Store: getComponent(storeDataProvider),
    WareHouse: getComponent(warehouseDataProvider),
    StoreWareHouse: getComponent(storeWarehouseDataProvider),
    Channel: getComponent(channelDataProvider),
    Supplier: getComponent(supplierDataProvider),
    Staff: getComponent(staffDataProvider),
    StoreWithChannel: getComponent(storeWithChannelIdDataProvider),
    Goods: getComponent(goodsDataProvider),
    MerchantCode: getComponent(merchantDataProvider),
    Companys: getComponent(companysDataProvider),
}