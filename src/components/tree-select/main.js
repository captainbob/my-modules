import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TreeSelect } from 'antd';
import { HttpUtil } from 'djmodules-utils';
const Ajax = HttpUtil.ajax;

import './style/style.css';

import { DataProvider, BaseDataProvider, CachedBaseDataProvider } from 'djmodules-utils/lib'

class MyDataProvider extends DataProvider {
    constructor() {
        super();
        this.proxy = new BaseDataProvider('goodsx/scustomcat/get_tree', { method: 'GET' })
    }

    getData(success, error) {
        this.proxy.getData(response => {
            if (response.status === 'success') {
                let result = response.resultObject;
                if (result.constructor == Object) {
                    result = result.children;
                }
                success(result ? result : []);
            } else {
                error(response.exceptionMessage);
            }
        }, error => { })
    }
}

const treeProvider = new CachedBaseDataProvider(new MyDataProvider());

class TreeSelectList extends Component {

    constructor(props) {
        super(props);
        this.state = {
            searchItem: {
                //  默认 || 当前值
                currentValue: {},
                // 商品类目
                treeData: []
            }
        }

        /* 
         * 更新主状态数据（用在子组件操作）
         */
        this.updateStateData = (data) => {
            if (data instanceof Object) {
                this.setState(data);
            }
        }
        /**
         * 请求树数据接口
         */
        this.requestData = (childKey) => {
            /*
            *商品类目
            */
            let props = this.props;
            treeProvider.getData((result) => {
                let treeData = [];
                let listObj = result;
                if (childKey) {
                    if (['[', '.'].indexOf(childKey.substring(0, 1)) < 0) {
                        childKey = '.' + childKey;
                    }
                    listObj = eval('result' + childKey);
                }
                if (listObj) {
                    treeData = listObj;
                }
                // 提取并更新状态数据
                this.extreactData(treeData);
            }, (error) => {
                this.extreactData([]);
                //console.log("error", error);
            });

        }
        /*
         * 提取指定键数据
         */
        this.extreactData = (data, labelKey, valueKey, childrenKey) => {
            labelKey = labelKey ? labelKey : 'name';
            valueKey = valueKey ? valueKey : 'sourceObj';
            childrenKey = childrenKey ? childrenKey : 'children';
            if (data.constructor !== Array) {
                return [];
            }

            //更新商品类目
            let searchItem = this.state.searchItem;
            // 提取数据并更新到状态数据下
            if (data && data.length) {
                searchItem.treeData = data.map((item, i) => {
                    let itm;
                    if (item[childrenKey] && item[childrenKey].length) {
                        itm = item[childrenKey].map((itm, j) => {
                            return {
                                key: i + '-' + j,
                                label: itm[labelKey],
                                value: valueKey == 'sourceObj' && itm[valueKey] ? itm[valueKey].catCode : itm[valueKey]
                            }
                        });
                    }

                    return {
                        key: i,
                        label: item[labelKey] + (item[childrenKey] ? ' (' + item[childrenKey].length + ')' : ''),
                        value: valueKey == 'sourceObj' && item[valueKey] ? item[valueKey].catCode : item[valueKey],
                        children: itm ? itm : []
                    }
                });
            }
            this.updateStateData({ searchItem });
            return data;
        }

        /* 
         * 选项改变时，同步更新值 ，hideItem用到如类目上的选择需求
         */
        this.onChange = (text, keyName, hideItem) => {
            let props = this.props;
            let searchItem = this.state.searchItem;
            searchItem.currentValue[keyName] = text;
            this.updateStateData({ searchItem });
            if (hideItem) {
                this.hideSelectItem(keyName);
            }
            if (props.onChange && props.onChange instanceof Function) {
                props.onChange(text, keyName, hideItem);
            }
        }

        /*
         * 将树选项选中后显示数量（隐藏具体项）
         */
        this.hideSelectItem = (keyName) => {
            let el = this.refs[keyName];
            let lastEl = el.childNodes[0].childNodes[0].childNodes[0].lastChild;
            if (lastEl.tagName.toLowerCase() === 'ul') {
                lastEl = lastEl.lastChild;
            }
            lastEl = lastEl.childNodes[0];
            //读取选中数据的数量
            let len = this.state.searchItem.currentValue[keyName].length;
            if (len) {
                lastEl.setAttribute("data-tip", "已选中" + (len) + "项");
            } else {
                lastEl.removeAttribute("data-tip");
            }
        }
    }
    componentWillMount() {
        let props = this.props;
        // 渲染非接口数据
        if (props.data && props.data.constructor === Array) {
            this.extreactData(props.data, props.labelKey, props.valueKey, props.childrenKey);
        } else {
            // 请求接口数据
            this.requestData(props.childKey);
        }
    }
    render() {
        let props = this.props;
        let searchItem = this.state.searchItem;
        let treeCheckable = props.treeCheckable === false ? false : true;
        let multiple = treeCheckable ? true : false;
        let showItem = treeCheckable ? props.showItem : true;
        return (
            <div className={showItem === true ? '' : 'dj-hide-select-item'} ref="treeSelect">
                <TreeSelect
                    style={props.style ? props.style : { minWidth: 100 }}
                    onChange={(text, keyName, hideItem) => { this.onChange(text, 'treeSelect', showItem === true ? '' : '隐藏项显示数量') }}
                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                    treeData={searchItem.treeData}
                    placeholder={props.placeholder ? props.placeholder : ""}
                    multiple={multiple}
                    treeDefaultExpandAll={false}
                    dropdownMatchSelectWidth={false}
                    showSearch={true}
                    treeCheckable={treeCheckable}
                    allowClear={true}
                    treeNodeFilterProp="title"
                    getPopupContainer={props.getPopupContainer ? props.getPopupContainer : () => document.getElementsByClassName('dj-menu-content')[0]}
                />
            </div>
        )
    }
}

export default TreeSelectList;