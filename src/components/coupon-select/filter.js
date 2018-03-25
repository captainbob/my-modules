import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Input, Select } from 'antd';

const Option = Select.Option;

class FilterView extends Component {
    state = {
        name: undefined,
        type: "",
    }

    componentDidMount() {
        this._handleSearch()
    }

    render() {
        return (
            <div>
                &nbsp;&nbsp;&nbsp;名称:&nbsp;&nbsp;&nbsp;
                <Input
                    value={this.state.name}
                    onChange={(e) => this.setState({
                        name: e.target.value
                    })}
                    style={{ width: 150 }}
                    placeholder="请输入优惠券名称"
                />
                &nbsp;&nbsp;&nbsp;类型:&nbsp;&nbsp;&nbsp;
                <Select
                    value={this.state.type}
                    onChange={(value) => {
                        this.setState({
                            type: value
                        })
                    }}
                    style={{ width: 150 }}
                >
                    <Option value="">请选择优惠券类型</Option>
                    <Option value="1">现金券</Option>
                    <Option value="2">折扣券</Option>
                </Select>
                &nbsp;&nbsp;&nbsp;
                <Button
                    type='primary'
                    onClick={this._handleSearch}
                >搜索</Button>&nbsp;&nbsp;&nbsp;
                <Button
                    type='default'
                    onClick={this._handleClear}
                >清空</Button>&nbsp;&nbsp;&nbsp;
            </div>
        );
    }

    // api
    _handleSearch = () => {
        this.props.handleSearch(this._formatData(this.state));
    }

    _formatData = (data) => {
        let ret = {}, queryContent = {};
        const { invaldType } = this.props;

        queryContent['name'] = data.name;
        queryContent['type'] = data.type;
        queryContent["invaldType"] = invaldType;
        queryContent["issuePattern"] = 2;
        queryContent["statuss"] = [1, 2];

        queryContent = this.filterObjectNull(queryContent)

        return queryContent
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

    _handleClear = () => {
        this.setState({
            name: undefined,
            type: "",
        }, () => {
            this._handleSearch()
        });
    }
}

FilterView.defaultProps = {
    invaldType: 2,   // 去除过期的优惠券
}

FilterView.propTypes = {
    handleSearch: PropTypes.func.isRequired,
    invaldType: PropTypes.number,          // 去除某一类型的优惠券

};

export default FilterView;