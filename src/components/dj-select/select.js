import { Select } from 'antd';
import React, { Component } from 'react';
import { DataProvider, BaseDataProvider, CachedBaseDataProvider } from 'djmodules-utils/lib'

import {
    GoodsBasePropProvider,
    ChildBrandListProvider,
    StorageGradeProvider
} from './data-provider';
import ChannelBasePropProvider from './provider/channel-type';
import TacticBasePropProvider from './provider/tactic-type';
import ExpBasePropProvider from './provider/exp-list';
import OrderSourceBasePropProvider from './provider/order-source';
import {
    LocalDataProvider,
    RETURN_TYPE,
    STORAGE_TYPE,
    ORDER_TYPE,
    PAY_STATUS,
} from './data-local';
// 卡类型
import BrandCardBasePropProvider from './provider/brand-card-type';
const Option = Select.Option;
// 判断是不是 array
export function isArray(o) {
    return Object.prototype.toString.call(o) === '[object Array]';
}
// 生成options列表
const getOptions = (arr, isNeedAll = false) => {
    let ret = []
    if (isNeedAll) {
        ret.push(<Option key={0} value=''>全部</Option>)
    }
    if (isArray(arr)) {
        ret = ret.concat(arr.map((v, i) => {
            return (<Option key={i.toString(36)}
                value={typeof v.value !== 'undefined' && v.value != null ? v.value.toString() : v.text}>{v.text}</Option>)
        }))
    }
    return ret
}

// 范围 // 商品的基础信息
class BaseMultiSelect extends Component {
    static defaultProps = {
        showDefaultStyle: false,
    }

    state = {
        options: [],
        curText: '全部',
    }

    onChange = (value) => {
        let selectData;
        // 判断多选
        if (this.props._mode == 'multiple') {
            this.setState({
                curText: value.length == 0 ? '全部' : `已选择:${value.length}`
            })
            selectData = this.state.options.filter(v => value.includes(v.value))
        } else {
            selectData = this.state.options.find(v => value == v.value)
        }
        const { onChange } = this.props;
        if (typeof onChange == "function")
            onChange(value, selectData);
    }

    componentDidMount() {

        this.props.provider.getData(list => {
            this.setState({
                options: list[this.props._type],
            })
        })
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.value != this.props.value && this.props._mode == 'multiple') {
            const nextValue = nextProps.value || [];
            this.setState({
                curText: nextValue.length == 0 ? '全部' : `已选择:${nextValue.length}`
            })
        }
    }

    render() {
        const { _type, _mode, onChange: _onChange, isNeedAll, showDefaultStyle, ...props } = this.props;
        return (
            <div className={!showDefaultStyle ? 'djm-multi-select' : undefined} style={this.props.style}>
                {_mode == 'multiple' && !showDefaultStyle ? (
                    <div className='cur-select-text' data-value={this.state.curText}>{this.state.curText}</div>
                ) : []
                }
                <Select
                    onChange={this.onChange}
                    mode={_mode}
                    {...props}
                >
                    {getOptions(this.state.options, (typeof isNeedAll !== "undefined" ? isNeedAll : _mode != "multiple"))}
                </Select>
            </div>
        );
    }
}


// 商品的基础信息各模块
// multiple 是否多选
const getComponent = (type, provider, multiple = true) => {
    let _mode;
    if (multiple) {
        _mode = 'multiple';
    }
    return class extends Component {
        render() {
            return (
                <BaseMultiSelect _type={type} provider={provider} _mode={_mode} {...this.props} />
            )
        }
    }
}

// 各个goods provider类
const basePropsProvider = new CachedBaseDataProvider(new GoodsBasePropProvider());
const childBrandProvider = new CachedBaseDataProvider(new ChildBrandListProvider());
// 退货
const returnTypeProvider = new LocalDataProvider('returnType', RETURN_TYPE);
// 门店等级
const storageGradeProvider = new CachedBaseDataProvider(new StorageGradeProvider());
// 门店类型
const storageTypeProvider = new LocalDataProvider('storageType', STORAGE_TYPE);
// 渠道类型
const channelTypeProvider = new CachedBaseDataProvider(new ChannelBasePropProvider());
// 策略类型
const tacticTypeProvider = new CachedBaseDataProvider(new TacticBasePropProvider());
// 订单类型
const orderTypeProvider = new LocalDataProvider('orderType', ORDER_TYPE);
// 支付方式
const payStatusProvider = new LocalDataProvider('payStatus', PAY_STATUS);
// 卡类型
const brandCardTypeProvider = new CachedBaseDataProvider(new BrandCardBasePropProvider());
// 物流
const expListProvider = new CachedBaseDataProvider(new ExpBasePropProvider());
// 物流
const orderSourceexpListProvider = new CachedBaseDataProvider(new OrderSourceBasePropProvider());

export default {
    Ranges: getComponent('ranges', basePropsProvider),
    RangesSingle: getComponent('ranges', basePropsProvider, false),
    Year: getComponent('year', basePropsProvider),
    YearSingle: getComponent('year', basePropsProvider, false),
    Series: getComponent('series', basePropsProvider),
    SeriesSingle: getComponent('series', basePropsProvider, false),
    Section: getComponent('section', basePropsProvider),
    SectionSingle: getComponent('section', basePropsProvider, false),
    Season: getComponent('season', basePropsProvider),
    SeasonSingle: getComponent('season', basePropsProvider, false),
    Style: getComponent('style', basePropsProvider),
    StyleSingle: getComponent('style', basePropsProvider, false),
    Standard: getComponent('execute_standard', basePropsProvider),
    StandardSingle: getComponent('execute_standard', basePropsProvider, false),
    Fabric: getComponent('fabric_category', basePropsProvider),
    FabricSingle: getComponent('fabric_category', basePropsProvider, false),
    ChildBrands: getComponent('childBrand', childBrandProvider), //多选
    ChildBrand: getComponent('childBrand', childBrandProvider, false),
    ReturnType: getComponent('returnType', returnTypeProvider, false),
    StorageGrade: getComponent('storageGrade', storageGradeProvider, false),
    StorageType: getComponent('storageType', storageTypeProvider, false),
    ChannelType: getComponent('channelType', channelTypeProvider, false),
    OrderType: getComponent('orderType', orderTypeProvider, false),
    PayStatus: getComponent('payStatus', payStatusProvider, false),
    TacticType: getComponent("tacticType", tacticTypeProvider, false),
    BrandCardType: getComponent("brandCardType", brandCardTypeProvider, false),
    ExpList: getComponent("expList", expListProvider, false),
    OrderSourceSingle: getComponent("orderSource", orderSourceexpListProvider, false),
    OrderSource: getComponent("orderSource", orderSourceexpListProvider),
}
