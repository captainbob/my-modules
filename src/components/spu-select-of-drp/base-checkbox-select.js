import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Checkbox, Select } from 'antd';
import TableView from './table';
import { deepEqual } from 'djmodules-utils';
export default class BaseSelectView extends Component {
    state = {
        selectFlag: "1", // 1 选择本页，2 选择全部
        selectThisPageFlag: false,
        selectAllPageFlag: false,
        selectedIds: this.props.selectedList || [],
    }

    selectedIdsSet = new Set()

    componentWillReceiveProps(nextProps) {
        if (!deepEqual(nextProps.selectedList, this.state.selectedIds)) {
            console.log(1)
            this.setState({
                selectedIds: nextProps.selectedList
            });
        }
    }

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
                        <Select.Option value='1'>选择本页</Select.Option>
                        <Select.Option value='2'>选择全部</Select.Option>
                    </Select>
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
    asyncSetState = (data) => {
        return new Promise((resolve) => {
            this.setState(data, () => {
                if (typeof this.props.onChange == 'function') {
                    let state = Object.assign({}, this.state);
                    this.props.onChange(state)
                }
                resolve()
            });
        })
    }
    onChangeSelectFlag = (value) => {
        this.asyncSetState({
            selectFlag: value
        }).then(() => {
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
            this.props.dataSource.forEach(v => this.selectedIdsSet.add(v.id));
        } else {
            this.props.dataSource.forEach(v => this.selectedIdsSet.delete(v.id));
        }
        this.asyncSetState({
            selectAllPageFlag: false,
            selectThisPageFlag: flag,
            selectedIds: Array.from(this.selectedIdsSet)
        });
        console.log(this.selectedIds);
    }
    // 全选全部操作
    toggleSelectAllPage = (flag) => {
        this.selectedIdsSet.clear();
        this.asyncSetState({
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
        this.asyncSetState({
            selectedIds: Array.from(this.selectedIdsSet)
        }).then(() => {
            this.monitorSelectThisPageStatus();
        });
    }
    // 监控单选造成的全选
    monitorSelectThisPageStatus = () => {
        if (this.props.dataSource.length == 0) {
            this.asyncSetState({
                selectThisPageFlag: false
            });
            return;
        }
        const notSelectedData = this.props.dataSource.find((v) => {
            return !this.state.selectedIds.includes(v.id)
        });
        if (!!!notSelectedData !== this.state.selectThisPageFlag)
            this.asyncSetState({
                selectThisPageFlag: !!!notSelectedData
            });
    }
    // 清除操作
    toInitialState = () => {
        this.asyncSetState({
            selectThisPageFlag: false,
            selectAllPageFlag: false,
            selectedIds: []
        }).then(() => {
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
};
