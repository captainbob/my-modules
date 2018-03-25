import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Checkbox, Select, Button, Popover, InputNumber } from 'antd';
import TableView from './table';
import BatchAddModal from './batch-add-modal';

export default class BaseSelectView extends Component {
    state = {
        selectFlag: "1", // 1 选择本页，2 选择全部
        selectThisPageFlag: false,
        selectAllPageFlag: false,
        selectedIds: []
    }

    selectedIdsSet = new Set()

    render() {
        let { selectThisPageFlag, selectAllPageFlag } = this.state;
        let style = Object.assign({
            display: 'inline-block',
            width: '100%',
        }, this.props.style);

        return (
            <div style={style}>
                <div style={{ marginBottom: 10 }}>
                    <Checkbox
                        checked={this.state.selectFlag == '1' ? selectThisPageFlag : selectAllPageFlag}
                        onChange={(e) => this.onChangeCheckboxPageFlag(e.target.checked)}
                    ></Checkbox>
                    <Select
                        value={this.state.selectFlag}
                        onChange={this.onChangeSelectFlag}
                        style={{
                            width: 80,
                            marginRight: 15
                        }}
                    >
                        <Select.Option value='1'>本页</Select.Option>
                        <Select.Option value='2'>全部</Select.Option>
                    </Select>
                    {this.props.type == 2 && this.props.showFGBtn ? (
                        <Popover
                            content={
                                <div style={{display: 'inline-block', padding: '3px 0px'}}>
                                    <InputNumber min={0} precision={2} placeholder="请输入" style={{width:'90px',marginRight:'5px'}}
                                        value={this.state.FGSelectPriceValue}
                                        onChange={(value)=>{
                                            this.setState({FGSelectPriceValue:value});
                                        }}
                                    />
                                    <a href="javascript:;" style={{lineHeight: '28px', padding: '0px 0px 0px 6px', display: 'inline-block'}} onClick={()=>{
                                        this.setState({popoverVisible:false},()=>{
                                            this.props.handleCPSelected(this.state.FGSelectPriceValue);
                                        })
                                    }}>确定</a>
                                </div>
                            }
                            trigger="click"
                            visible={this.state.popoverVisible ? true :false}
                            onVisibleChange={(visible)=>{
                                this.setState({popoverVisible:visible,FGSelectPriceValue:''})
                            }}
                            getPopupContainer={() => document.getElementsByClassName('dj-menu-content')[0]}
                        >
                            <a href="javascript:;" style={{marginRight:'10px'}}>批量设置换购价</a>
                        </Popover>
                    ) : undefined}
                    {this.props.type == 2 ? (
                        <a onClick={() => this.props.handleRemove()}>批量删除</a>
                    ) : undefined}
                    {this.props.type == 2 ? (
                        <BatchAddModal
                            handleOk={this.props.batchAddSpu}
                            style={{ float: "right" }} />
                    ) : undefined}
                </div>
                <div style={{
                    minHeight: this.props.scroll.y + 50,
                    maxHeight: this.props.scroll.y + 50,
                    overflow: "hidden",
                }}>
                    <TableView
                        rowSelectState={{ ...this.state }}
                        toggleSelectItem={this.toggleSelectItem}
                        {...this.props}
                    />
                </div>

            </div>
        );
    }
    showModal = () => {

    }
    onChangeSelectFlag = (value) => {
        this.setState({
            selectFlag: value
        }, () => {
            let { selectThisPageFlag, selectAllPageFlag } = this.state;
            var checked = selectAllPageFlag || selectThisPageFlag;
            if (checked && value == '1') {
                this.toggleSelectCurrentPage(true)
            }
            if (checked && value == '2') {
                this.toggleSelectAllPage(true)
            }
        });
    }
    onChangeCheckboxPageFlag = (checked) => {
        if (this.state.selectFlag == '1') {
            this.toggleSelectCurrentPage(checked)
        } else {
            this.toggleSelectAllPage(checked)
        }
    }
    // 全选本页操作
    toggleSelectCurrentPage = (flag) => {
        if (flag) {
            this.props.dataSource.forEach(v => {
                // 不能选择的列
                const notSelectIds = this.props.notSelectIds || []; //  在左边显示是不可以选择的状态
                let notSelectFlag = notSelectIds.includes(v.id);
                if (notSelectFlag) {
                    return;
                }
                this.selectedIdsSet.add(v.id)
            });
        } else {
            this.props.dataSource.forEach(v => this.selectedIdsSet.delete(v.id));
        }
        this.setState({
            selectAllPageFlag: false,
            selectThisPageFlag: flag,
            selectedIds: Array.from(this.selectedIdsSet)
        });
    }
    // 全选全部操作
    toggleSelectAllPage = (flag) => {
        this.selectedIdsSet.clear();
        this.setState({
            selectAllPageFlag: flag,
            selectThisPageFlag: false,
            selectedIds: []
        });
    }
    // 单选操作
    toggleSelectItem = (id) => {
        if (this.selectedIdsSet.has(id)) {
            this.selectedIdsSet.delete(id);
        } else {
            this.selectedIdsSet.add(id)
        }
        this.setState({
            selectedIds: Array.from(this.selectedIdsSet)
        }, () => {
            this.monitorSelectThisPageStatus();
        });
    }
    // 监控单选造成的全选
    monitorSelectThisPageStatus = () => {
        if (this.props.dataSource.length == 0) {
            this.setState({
                selectThisPageFlag: false
            });
            return;
        }
        const notSelectedData = this.props.dataSource.find((v) => {
            return !this.state.selectedIds.includes(v.id)
        });
        this.setState({
            selectThisPageFlag: !!!notSelectedData
        });
    }
    // 清除操作
    toInitialState = () => {
        this.setState({
            selectThisPageFlag: false,
            selectAllPageFlag: false,
            selectedIds: []
        }, () => {
            this.selectedIdsSet.clear()
        });
    }
}
BaseSelectView.defaultProps = {
    dataSource: []
}
BaseSelectView.propTypes = {
    dataSource: PropTypes.array,
    handleChange: PropTypes.func,
    type: PropTypes.oneOf([1, 2])
};
