import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Input, Select } from 'antd';
const Option = Select.Option;

import DjSelect from '../dj-select/index';
import '../dj-select/style/index';
const { ChannelType } = DjSelect;

class ChannelChooseFilter extends Component {
    state = {
        "channelType": undefined,
        "channelName": undefined,
        "channelCode": undefined,
    }
    filterObjectNull = (obj) => {
        let retObj = {};
        for (let key in obj) {
            if (obj[key] != null && obj[key] != undefined && obj[key] != '') {
                retObj[key] = obj[key]
            }
        }
        return retObj
    }
    handleClear = () => {
        this.props.handleClear()
    }
    handleSearch = (type) => {
        let params = this.filterObjectNull(this.state);
        this.props.handleSearch(params, type);
    }
    handleSelectClear = () => {
        this.props.handleSelectClear();
    }
    render() {
        return (
            <div style={{
                borderBottom: '1px solid #e3e3e3',
                margin: '0 0 16px',
                paddingBottom: '10px'
            }}>
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
                    <Input
                        value={this.state.channelName}
                        onChange={(e) => this.setState({
                            channelName: e.target.value
                        })}
                        placeholder='渠道名称'
                        style={{ width: 150 }}
                    />
                </div>
                <div className="item-container">
                    <Input
                        value={this.state.channelCode}
                        onChange={(e) => this.setState({
                            channelCode: e.target.value
                        })}
                        placeholder='渠道编码'
                        style={{ width: 150 }}
                    />
                </div>
                <div className="item-container">
                    <Button
                        type='primary'
                        onClick={() => this.handleSearch('clickSearch')}
                    >查询</Button>&nbsp;&nbsp;&nbsp;
                    <Button
                        type='default'
                        onClick={this.handleClear}
                    >清空条件</Button>&nbsp;&nbsp;&nbsp;
                    <Button
                        type='default'
                        onClick={this.handleSelectClear}
                    >清空已选</Button>&nbsp;&nbsp;&nbsp;
                </div>
            </div>
        );
    }
}

ChannelChooseFilter.propTypes = {
    handleSearch: PropTypes.func.isRequired,
    handleClear: PropTypes.func.isRequired
};

export default ChannelChooseFilter;