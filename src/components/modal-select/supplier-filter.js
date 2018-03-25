import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Input, Select } from 'antd';
const Option = Select.Option;
import Combobox from '../combobox/index';

class SupplierFilter extends Component {
    state = {
        "supplierType": undefined,
        "supplierName": undefined,
        "supplierCode": undefined,
    }
    filterObjectNull = (obj) => {
        let retObj = {};
        for (let key in obj) {
            if (obj[key] != null && obj[key] != undefined && obj[key] != '') {
                retObj[key] = obj[key]
            }
        }
        return retObj;
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
                    <Combobox.SupplierType placeholder="供应商类型" style={{ width: 132 }}
                        onChange={(text) => {
                            this.setState({
                                supplierType: text
                            })
                        }}
                    ></Combobox.SupplierType>
                </div>
                <div className="item-container">
                    <Input
                        value={this.state.supplierName}
                        onChange={(e) => this.setState({
                            supplierName: e.target.value
                        })}
                        placeholder='供应商名称'
                        style={{ width: 150 }}
                    />
                </div>
                <div className="item-container">
                    <Input
                        value={this.state.supplierCodeLike}
                        onChange={(e) => this.setState({
                            supplierCodeLike: e.target.value
                        })}
                        placeholder='供应商编码'
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

SupplierFilter.propTypes = {
    handleSearch: PropTypes.func.isRequired,
    handleClear: PropTypes.func.isRequired
};

export default SupplierFilter;