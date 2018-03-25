import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Button, Input, Select } from 'antd';
import DjSelect from '../dj-select/index';
import '../dj-select/style/index';
import DjCascader from '../dj-cascader/index';
import '../dj-cascader/style/index';
import { deepEqual } from 'djmodules-utils';
import AsyncLikeSelect from '../async-like-select/index';
import CatTree from '../cat-tree/index';
import '../cat-tree/style/index';

const InputGroup = Input.Group;
const Option = Select.Option;
const { ChannelType } = DjSelect;
const { RegionToCity } = DjCascader;
const { AreaSelect } = CatTree;

class StoreChooseFilter extends Component {
    state = {
        "reginoToCity": undefined,
        "channelType": undefined,
        "storageGroup": undefined,
        "keyWord": undefined,
        "status": "1",
        "channelId": this.props.channelName, // 渠道商名称
        channelNameNotEdit: this.props.channelName && this.props.channelName.label,
    }
    componentWillReceiveProps(nextProps) {
        if (!deepEqual(nextProps.channelName, this.props.channelName)) {
            this.setState({
                channelId: nextProps.channelName
            });
        }
    }
    render() {
        const channelNameNotEdit = this.state.channelNameNotEdit; // 是否可以修改渠道名
        return (
            <div style={{
                borderBottom: '1px solid #e3e3e3',
                margin: '0 0 16px',
                paddingBottom: '10px'
            }}>
                <Row>
                    <div className="item-container">
                        <RegionToCity
                            changeOnSelect
                            placeholder='省市选择'
                            value={this.state.reginoToCity}
                            onChange={(value, selectedOptions) => {
                                this.setState({
                                    reginoToCity: value
                                });
                            }}
                            style={{ width: 142 }}
                        />
                    </div>
                    <div className="item-container">
                        <DjSelect.ChannelType
                            value={this.state.channelType}
                            placeholder='渠道类型'
                            onChange={(value) => this.setState({
                                channelType: value
                            })}
                            style={{ width: 100 }}
                        />
                    </div>
                    <div className="item-container">
                        <Select
                            placeholder='选择店仓联盟'
                            value={this.state.storageGroup}
                            onChange={(value) => this.setState({
                                storageGroup: value
                            })}
                            style={{ width: 120 }}
                        >
                            <Option value=''>全部</Option>
                            <Option value='1'>店仓联盟内</Option>
                            <Option value='0'>店仓联盟外</Option>
                        </Select>
                    </div>
                    <div className="item-container">
                        {
                            channelNameNotEdit ? <Input disabled style={{ width: 120 }} value={this.state.channelId.label} />
                                : <AsyncLikeSelect.Channel
                                    placeholder='渠道商名称'
                                    value={this.state.channelId}
                                    defaultActiveFirstOption={true}
                                    keepText={true}
                                    valueText={true}
                                    labelInValue={true}
                                    pageSize={12}
                                    style={{ width: 120 }}
                                    onChange={(value, data) => {
                                        this.setState({
                                            channelId: value
                                        });
                                    }}
                                />
                        }
                    </div>
                    <div className="item-container">
                        <Input
                            value={this.state.keyWord}
                            onChange={(e) => this.setState({
                                keyWord: e.target.value
                            })}
                            placeholder='门店名称或编码'
                            style={{ width: 120 }}
                        />
                    </div>
                    <div className="item-container">
                        <AreaSelect
                            onChange={(value) => {
                                this.setState({
                                    areaId: value
                                })
                            }}
                            placeholder='请选择大区或小区'
                            style={{ width: 130 }}
                        />
                    </div>
                    <div className="item-container">
                        <Button
                            type='primary'
                            onClick={() => this._handleSearch('clickSearch')}
                        >查询</Button>&nbsp;&nbsp;&nbsp;
                        <Button
                            type='default'
                            onClick={this._handleClear}
                        >清空条件</Button>&nbsp;&nbsp;&nbsp;
                        <Button
                            type='default'
                            onClick={this._handleSelectClear}
                        >清空已选</Button>&nbsp;&nbsp;&nbsp;
                    </div>
                </Row>
            </div>
        );
    }

    // api
    _handleSearch = (type) => {
        let params = Object.assign({}, this.state);
        this.props.handleSearch(this._formatData(params), type);
    }

    _formatData = (data) => {
        let ret = {}, queryContent = {}
        if (data.reginoToCity) {
            queryContent['provinceCode'] = data.reginoToCity[0];
            queryContent['cityCode'] = data.reginoToCity[1];
        }
        queryContent['channelType'] = data.channelType;
        queryContent['storageGroup'] = data.storageGroup;
        queryContent['keyWord'] = data.keyWord;
        queryContent['status'] = data.status;
        queryContent['channelId'] = data.channelId && data.channelId.key;
        queryContent['areaId'] = data.areaId;
        queryContent = this._filterObjectNull(queryContent);

        ret['queryContent'] = JSON.stringify(queryContent);
        return ret
    }
    _handleSelectClear = () => {
        this.props.handleSelectClear();
    }

    _filterObjectNull = (obj) => {
        let retObj = {};
        for (let key in obj) {
            if (obj[key] != null && obj[key] != undefined && obj[key] != '') {
                retObj[key] = obj[key]
            }
        }
        return retObj
    }

    _handleClear = () => {
        let channelNameNotEdit = this.state.channelNameNotEdit; // 不能修改渠道名，则将传入的渠道名作为参数
        let params = {
            currentPage: 1,
            showCount: 10,
            status: 1,
            channelId: this.state.channelId && this.state.channelId.key
        };
        channelNameNotEdit ? this.props.handleClear(this._filterObjectNull(params)) : this.props.handleClear();
    }
}

StoreChooseFilter.propTypes = {
    handleSearch: PropTypes.func.isRequired,
    handleClear: PropTypes.func.isRequired
};

export default StoreChooseFilter;