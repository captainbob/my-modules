import React, { Component } from 'react';
import { Button, Checkbox, Radio, Popover, Icon, message, Spin } from 'antd';
import { Helper } from 'djmodules-utils';

export default class extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }
    componentDidMount() {
    }
    componentWillReceiveProps(nextProps) {
    }

    render() {
        let { setting, columns, filter } = this.props;
        let _style = { float: 'right', display: 'inline-block', cursor: 'pointer', margin: '7px 0 0 8px', lineHeight: '1em', fontSize: '16px', color: '#999999' };
        let _s = { defaultElement: <Icon type="setting" /> };
        if (setting && setting.constructor !== Object) {
            _s.type = setting;
            if (!(_s.type instanceof Array)) {
                _s.type = [_s.type];
            }
        } else if (setting && setting.constructor === Object) {
            _s = Object.assign({}, _s, setting);
            if (_s.type && !(_s.type instanceof Array)) {
                _s.type = [_s.type];
            }
        }
        let columnsList = this.columnsList() || []
        let _length = columnsList.filter(item => item.state).length;
        let minLength = 2;
        columnsList.forEach(item => {
            if (item.group.length > minLength) {
                minLength = item.group.length;
            }
        });
        minLength += 1.5;
        let spanStyle = { display: 'inline-block', minWidth: minLength + 'em', whiteSpace: 'nowrap' };
        if (columnsList && columnsList.length <= 5) {
            spanStyle = {};
        }
        const content = (
            <div>
                <Spin spinning={this.props.spin || false}>
                    <div>
                        <h4 style={{ marginBottom: 10 }}>
                            <Checkbox
                                checked={columnsList.length === _length && _length}
                                indeterminate={columnsList.length !== _length && _length}
                                onChange={(e) => {
                                    this.onChange(e.target.checked);
                                }}
                            ></Checkbox>
                            &nbsp;设置列
                        </h4>
                        {columnsList.map((item, i) => (
                            <span key={i} style={spanStyle}>
                                <Checkbox
                                    checked={item.state}
                                    onChange={(e) => {
                                        this.onChange(e.target.checked, i);
                                    }}
                                >{item.group}</Checkbox>
                            </span>
                        ))}
                    </div>
                    {!setting.save ? '' :   // || !this.state.filterGroup
                        <div style={{ marginTop: 10, textAlign: 'right' }}>
                            <span style={{ color: '#AAAAAA', fontWeight: '300' }}>默认只会临时生效 &nbsp;</span>
                            <Button
                                type="primary"
                                size="small"
                                onClick={() => {
                                    this.setState({
                                        visible: false,
                                    });
                                    let { filterGroup } = this.state;
                                    return this.props.onSave ? this.props.onSave(filterGroup) : null;
                                }}
                            >{typeof setting.save === 'string' ? setting.save : '保存'}</Button>
                        </div>
                    }
                </Spin>
            </div>
        )
        return (
            <Popover
                title={null}
                style={{ maxWidth: 300 }}
                placement="bottomRight"
                content={content}
                trigger="click"
                visible={this.state.visible}
                onVisibleChange={(visible) => {
                    this.setState({ visible });
                }}
            >
                <div
                    style={Object.assign(_style, _s.style || {})}
                >
                    {_s.defaultElement}
                </div>
            </Popover >
        );
    }
    columnsList() {
        let { setting, columns, filter } = this.props;
        // 分组
        columns = columns || [];
        const group = {};
        columns.forEach(item => {
            if (item && item.group) {
                // 去重读取分组
                if (filter && filter.length && filter.includes(item.group)) {
                    group[item.group] = false;
                } else {
                    group[item.group] = true;
                }
            }
        });
        let groupKey = Object.keys(group);
        let groupValue = Object.values(group);
        return !groupKey || !groupKey.length ? [] : groupKey.map((item, i) => {
            return {
                group: item,
                state: groupValue[i]
            }
        })
    }
    onChange(state, index) {
        let filterGroup = [].concat(this.columnsList());
        if (typeof index === 'number' && index >= 0) {
            filterGroup[index].state = state || false;
        } else {
            filterGroup = filterGroup.map(item => {
                item.state = state || false;
                return item;
            });
        }

        //console.log(columns)
        this.setState({ filterGroup });
        return this.props.onChange ? this.props.onChange({ filterGroup }) : null;
    }
}