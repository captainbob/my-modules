import React, { Component } from 'react';
import { Input } from 'antd';
import PropTypes from 'prop-types';
import { HttpUtil } from 'djmodules-utils/lib';

export default class AutoCompleteInput extends Component {
    static propTypes = {
        getDataList: PropTypes.func,
        classPrefix: PropTypes.string
    }

    static defaultProps = {
        height: 35,
        classPrefix: 'dj-auto-complete-input'
    }

    state = {
        dataListVisible: false,
        dataList: []
    };

    timer = null;

    blurTimer = null;

    value = null;

    render() {
        const { style } = this.props;
        const dataList = this.state.dataList.map(item => {
            return <li onClick={(e) => { this.onItemClick(e, item) }}
                className={`${this.props.classPrefix}-data-list-item`}>{item}</li>;
        });

        return (
            <div style={Object.assign({ height: 35 }, style)} className={`${this.props.classPrefix}-container`}>
                <Input {...this.props} onChange={this.onChange}
                    autoComplete='off'
                    ref='input'
                    onBlur={this.onBlur}
                    onFocus={this.onFocus}></Input>
                <ul style={{ display: this.state.dataListVisible ? 'block' : 'none' }}
                    className={`${this.props.classPrefix}-data-list`}>
                    {dataList}
                </ul>
            </div>
        )
    }

    componentWillUnmount() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }

        if (this.blurTimer) {
            clearTimeout(this.blurTimer);
            this.blurTimer = null;
        }
    }

    onBlur = (e) => {
        this.blurTimer = setTimeout(() => {
            this.setState({ dataListVisible: false });
            clearTimeout(this.blurTimer);
            this.blurTimer = null;
        }, 500);
    }

    onFocus = () => {
        this.delaySearch();
    }

    onChange = (e) => {
        this.delaySearch();
        if (this.props.onChange) {
            this.props.onChange(e);
        }
    }

    delaySearch = () => {
        //delay search        
        if (!this.timer) {
            this.timer = setTimeout(() => {
                if (this.props.getDataList) {
                    this.props.getDataList(this.refs.input.props.value).then(response => {

                        if (response && response.length > 0) {
                            this.setState({
                                dataListVisible: true,
                                dataList: response
                            });
                        } else {
                            this.setState({
                                dataListVisible: false,
                                dataList: []
                            });
                        }
                        this.timer = null;
                    }).catch(err => {
                        this.timer = null;
                    });
                }
            }, 300);
        }
    }

    onItemClick = (e, value) => {
        if (this.props.onChange) {
            e.target = {
                value: value
            };
            this.props.onChange(e);
            this.setState({
                dataListVisible: false,
            });
        }
    }
}


//1 name 2 type 3 both
const getComponent = (url, type) => {
    return class extends Component {
        getDataList = (value) => {
            let params = this.props.params || {};
            const defaultParams = {
                brandId: window.currentBrandId,
                searchType: type,
                keyword: value,
                showCount: 10
            };
            params = Object.assign({}, defaultParams, params);
            if (value && value.length > 0) {
                return new Promise((resolve, reject) => {
                    HttpUtil.promiseGet(url, params).then(response => {
                        resolve(response.map(item => { return item.name; }))
                    }).catch(err => {
                        reject(err);
                    });
                });
            }
            return new Promise((resolve, reject) => {
                resolve([]);
            });
        }

        render() {
            return <AutoCompleteInput {...this.props} getDataList={this.getDataList}></AutoCompleteInput>
        }
    }
}

const getStaffLikeComponent = (url) => {
    return class extends Component {
        getDataList = (value) => {
            let params = this.props.params || {};
            const defaultParams = {
                brandId: window.currentBrandId,
                runCount: false,
                dakeyWord: value,
                veidoo: "mixData",
            };
            params = Object.assign({}, defaultParams, params);
            if (value && value.length > 0) {
                return new Promise((resolve, reject) => {
                    HttpUtil.promisePost(url, params).then(response => {

                        const results = response.results || [];
                        resolve(results.map(item => { return item.name; }))
                    }).catch(err => {
                        reject(err);
                    });
                });
            }
            return new Promise((resolve, reject) => {
                resolve([]);
            });
        }

        render() {
            return <AutoCompleteInput {...this.props} getDataList={this.getDataList}></AutoCompleteInput>
        }
    }
}
AutoCompleteInput.ChannelName = getComponent('brand/channel/get_search_suggestion', 1);
AutoCompleteInput.SupplierName = getComponent('brand/supplier/get_search_suggestion', 1);
AutoCompleteInput.ShopName = getComponent('brand/shop/get_search_suggestion', 1);
AutoCompleteInput.ShopNameType = getComponent('brand/shop/get_search_suggestion', 3);
AutoCompleteInput.StaffLike = getStaffLikeComponent('brand/staffback/get_list');