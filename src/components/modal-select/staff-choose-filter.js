import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Button, Input, Select } from 'antd';
import AuthSelect from '../auth-select/index';
import '../auth-select/style/index';
import AsyncLikeSelect from '../async-like-select/index';
import '../async-like-select/style/index';
import AutoCompleteInput from '../auto-complete-input/index';
import '../auto-complete-input/style/index'

const InputGroup = Input.Group;
const Option = Select.Option;
const { DeptSelect, RoleSelect } = AuthSelect;
const { StoreWareHouse, Staff } = AsyncLikeSelect;
const { StaffLike } = AutoCompleteInput
class staffChooseFilter extends Component {
    static defaultProps = {
        fixFilterDisabledList: [],
        fixFilterDisabledText: {},
    }
    state = {
        "dakeyWord": this.props.fixFilterDisabledText['dakeyWord'] || undefined,
        "roleId": undefined,
        "status": "",
        "depIds": undefined,
        "storeWare": {
            label: undefined,
            key: undefined
        },
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
    handleSelectClear = () => {
        this.props.handleSelectClear();
    }
    formatData = (data) => {
        let ret = {};
        let state = this.state;
        ret["dakeyWord"] = state.dakeyWord;
        ret["depId"] = state.depIds;
        ret["status"] = state.status;
        ret["roleId"] = state.roleId;
        ret["storageId"] = state.storageId;
        if (state.storeWare.key) {
            ret["storageId"] = state.storeWare.key
        }
        return ret
    }
    handleSearch = (type) => {
        let params = this.formatData(this.state);
        this.props.handleSearch(params, type);
    }
    render() {
        const { fixFilterDisabledList, fixFilterDisabledText } = this.props;
        return (
            <div style={{
                borderBottom: '1px solid #e3e3e3',
                margin: '0 0 16px',
                paddingBottom: '10px'
            }}>
                <Row>
                    <Col className="item-container" span={6}>
                        <Col className='row-label' span={8}>模糊:</Col>
                        <Col className='row-content' span={16} style={{ position: "relative" }}>
                            <AutoCompleteInput.StaffLike
                                placeholder='姓名/工号/手机号'
                                disabled={fixFilterDisabledList.includes("dakeyWord")}
                                style={{ width: '100%' }}
                                onChange={(e) => this.setState({ dakeyWord: e.target.value })}
                                value={this.state.dakeyWord}
                            />
                        </Col>
                    </Col>
                    <Col className="item-container" span={6}>
                        <Col className='row-label' span={8}>角色:</Col>
                        <Col className='row-content' span={16}>
                            <RoleSelect
                                onChange={(value) => {
                                    this.setState({ roleId: value }
                                    )
                                }}
                                disabled={fixFilterDisabledList.includes("roleId")}
                                defaultValue={fixFilterDisabledText['roleId'] || undefined}
                                style={{ width: "100%" }}
                                placeholder="按角色"
                            />
                        </Col>
                    </Col>
                    <Col className="item-container" span={6}>
                        <Col className='row-label' span={8}>状态:</Col>
                        <Col className='row-content' span={16}>
                            <Select
                                value={this.state.status}
                                onChange={(value) => this.setState({ status: value })}
                                style={{ width: '100%' }}
                                disabled={fixFilterDisabledList.includes("status")}
                                defaultValue={fixFilterDisabledText['status'] || undefined}
                            >
                                <Select.Option value="">全部</Select.Option>
                                <Select.Option value="1">已激活</Select.Option>
                                <Select.Option value="0">未激活</Select.Option>
                                <Select.Option value="2">已离职</Select.Option>
                            </Select>
                        </Col>
                    </Col>
                    <Col className="item-container" span={6}>
                        <Col className='row-label' span={8}>所在部门:</Col>
                        <Col className='row-content' span={16}>
                            <DeptSelect value={this.state.depIds}
                                onChange={(value) => this.setState({ depIds: value })} style={{ width: "100%" }}
                                placeholder="按部门" parentId={""}
                                disabled={fixFilterDisabledList.includes("depIds")}
                                defaultValue={fixFilterDisabledText['depIds'] || undefined}
                            />
                        </Col>
                    </Col>
                    <Col className="item-container" span={6}>
                        <Col className='row-label' span={8}>所在店仓:</Col>
                        <Col className='row-content' span={16}>
                            <StoreWareHouse
                                showCount={10}
                                style={{ width: '100%' }}
                                labelInValue={true}
                                value={this.state.storeWare}
                                disabled={fixFilterDisabledList.includes("storeWare")}
                                defaultValue={fixFilterDisabledText['storeWare'] || undefined}
                                onChange={(value = {
                                    label: '',
                                    key: ''
                                }) => {
                                    this.setState({
                                        storeWare: value
                                    })
                                }}
                            />
                        </Col>
                    </Col>
                    <Col span={12} >
                        <Col offset={4}>
                            <Button
                                type='primary'
                                onClick={() => this.handleSearch('clickSearch')}
                            >查询</Button>&nbsp;&nbsp;&nbsp;
                            <Button
                                type='default'
                                onClick={this.handleClear}
                            >清空</Button>&nbsp;&nbsp;&nbsp;
                             <Button
                                type='default'
                                onClick={this.handleSelectClear}
                            >清空已选</Button>&nbsp;&nbsp;&nbsp;
                        </Col>
                    </Col>
                </Row>
            </div>
        );
    }
}

staffChooseFilter.propTypes = {
    handleSearch: PropTypes.func.isRequired,
    handleClear: PropTypes.func.isRequired,
};

export default staffChooseFilter;