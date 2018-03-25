import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Button, Input, Select } from 'antd';
import DjSelect from '../dj-select/index';
import '../dj-select/style/index';
import DjCascader from '../dj-cascader/index';
import '../dj-cascader/style/index';


const InputGroup = Input.Group;
const Option = Select.Option;
const { ChannelType } = DjSelect;
const { RegionToCity } = DjCascader;

class StoreChooseFilter extends Component {
    state = {
        "reginoToCity": undefined,
        "channelType": undefined,
        "storageGroup": undefined,
        "keyWord": undefined,
        "status": "1",
    }
    
    componentDidMount() {
        this._handleSearch()
    }

    render() {

        return (
            <div style={{
                borderBottom: '1px solid #e3e3e3',
                margin: '0 0 16px',
                paddingBottom: '16px'
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
                            style={{ width: 200 }}
                        />
                    </div>
                    <div className="item-container">
                        <DjSelect.ChannelType
                            value={this.state.channelType}
                            placeholder='渠道类型'
                            onChange={(value) => this.setState({
                                channelType: value
                            })}
                            style={{ width: 120 }}
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
                        <Input
                            value={this.state.keyWord}
                            onChange={(e) => this.setState({
                                keyWord: e.target.value
                            })}
                            placeholder='门店名称或编码'
                            style={{ width: 150 }}
                        />
                    </div>
                    <div className="item-container">
                        <Button
                            type='primary'
                            onClick={this._handleSearch}
                        >搜索</Button>&nbsp;&nbsp;&nbsp;
                        <Button
                            type='default'
                            onClick={this._handleClear}
                        >清空</Button>&nbsp;&nbsp;&nbsp;
                    </div>
                </Row>

            </div>
        );
    }

    // api
    _handleSearch = () => {
        this.props.handleSearch(this._formatData(this.state));
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
        queryContent = this._filterObjectNull(queryContent);

        ret['queryContent'] = JSON.stringify(queryContent);
        return ret
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
        this.props.handleClear()
    }

}

StoreChooseFilter.propTypes = {
    handleSearch: PropTypes.func.isRequired,
    handleClear: PropTypes.func.isRequired
};

export default StoreChooseFilter;