import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Checkbox, Select } from 'antd';
import { deepEqual } from 'djmodules-utils';
import { isArray } from 'lodash';

export default function addSelect(rowKey) {
    return function (target) {
        return class extends BaseSelectView {
            constructor(props, context) {
                super(props, context);
                this.target = target
                this.rowKey = rowKey
            }
        }
    }
}

class BaseSelectView extends Component {
    constructor(props) {
        super(props);
        let selectState = this.props.selectState || {};

        this.state = Object.assign({
            selectFlag: "1", // 1 选择本页，2 选择全部
            selectThisPageFlag: false,
            selectAllPageFlag: false,
            selectedIds: []
        }, { selectedIds: selectState.selectedIds || [] })
        this.selectedIdsSet = new Set()
        this.state.selectedIds.forEach(v => {
            this.selectedIdsSet.add(v)
        })
        this.setState({
            selectedIds: Array.from(this.selectedIdsSet)
        });

    }

    componentWillReceiveProps(nextProps) {
        if (!deepEqual(nextProps.selectState, this.state)) {
            this.setState({
                ...Object.assign({}, this.state, nextProps.selectState)
            }, () => {
                this.selectedIdsSet.clear();
                this.state.selectedIds.forEach(v => {
                    this.selectedIdsSet.add(v)
                })
            });
        }
    }

    render() {
        let { selectThisPageFlag, selectAllPageFlag } = this.state;
        let style = Object.assign({
            display: 'inline-block',
            width: '100%',
        }, this.props.style);
        const childrenWithProps = React.Children.map(this.props.children,
            (child) => React.cloneElement(child, {
                doSomething: this.doSomething
            })
        );

        return (
            <div style={style}>
                <div style={{ marginBottom: 10, display: "flex", alignItems: "center" }}>
                    <Checkbox
                        checked={this.state.selectFlag == '1' ? selectThisPageFlag : selectAllPageFlag}
                        onChange={(e) => this.onChangeCheckboxPageFlag(e.target.checked)}
                        style={{ flex: '0 0 auto' }}
                    >{this.props.showType == 1 ? "本页" : undefined}</Checkbox>
                    {this.props.showType == 1 ? undefined :
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
                        </Select>}
                    <div style={{ width: '100%' }}>
                        {this.props.extra}
                    </div>
                </div>
                {React.createElement(this.target, {
                    ...this.props,
                    rowSelect: {
                        state: { ...this.state },
                        toggleSelectItem: this.toggleSelectItem,
                        onCheck: this.onCheck,
                        changePage: this.changePage,
                    }
                })}
            </div>
        );
    }
    // 异步设置状态
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
    // 改变选择全部和本页的select
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
    // 全选标志-改变
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
            this.props.dataSource.forEach(v => this.selectedIdsSet.add(v[this.rowKey]));
        } else {
            this.props.dataSource.forEach(v => this.selectedIdsSet.delete(v[this.rowKey]));
        }
        this.asyncSetState({
            selectAllPageFlag: false,
            selectThisPageFlag: flag,
            selectedIds: Array.from(this.selectedIdsSet)
        });
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
            return !this.state.selectedIds.includes(v[this.rowKey])
        });
        if (!!!notSelectedData !== this.state.selectThisPageFlag)
            this.asyncSetState({
                selectThisPageFlag: !!!notSelectedData
            });
    }
    // 翻页操作
    changePage = () => {
        this.monitorSelectThisPageStatus();
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
    // 选择操作
    onCheck = (record) => {
        const { selectAllPageFlag, selectThisPageFlag, selectedIds } = this.state;
        let checked = selectedIds.includes(record[this.rowKey]);
        if (selectAllPageFlag) {
            checked = !selectedIds.includes(record[this.rowKey])
        }
        return (
            <div onClick={(e => {
                e.stopPropagation();
            })}>
                <Checkbox
                    checked={checked}
                    onChange={(e) => {
                        this.toggleSelectItem(record[this.rowKey])
                    }}
                />
            </div>
        )
    }
}
BaseSelectView.defaultProps = {
    dataSource: [],
    showType: 2,// 只有本页 1，有本页和全部 2
}
BaseSelectView.propTypes = {
    dataSource: PropTypes.array,
    onChange: PropTypes.func,
    showType: PropTypes.oneOf([1, 2])
};
