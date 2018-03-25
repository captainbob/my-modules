/**
 * 已废弃，请使用SuperTable
 */
import React, { Component } from 'react';
import { Button, Table, Pagination, Checkbox, Radio, Popover, Modal, Icon, message, Dropdown, Menu, Spin } from 'antd';
import { Helper } from 'djmodules-utils';
import Setting from './setting';

const defaultOption = {
    alreadyAllChecked: false,   // 是否全选过
    checked: [],                // 选择的
    notChecked: [],             // 排序的
    checkedNum: 0,              // 选择的数量
}
export default class extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modalVisible: false,
            datas: [],
            attrKey: '',                  // 自定义属性键值
            columns: [],                  // 表头
            filter: [],              //过滤列
            selectType: '本页',
            option: Object.assign({}, defaultOption),
            page: {
                current: 1,                 // 当前第几页
                pageSize: 10,               // 每页数
                total: 1,                   // 记录总数
            },
            fullSwitch: false                // 全屏开关
        }
    }
    componentWillMount() {
        let { setting } = this.props;
        if (setting && setting.filter instanceof Array) {
            let _filter = setting.filter || [];
            let { filter } = this.state;
            // 支持对象和字符串
            filter = _filter.filter(item => {
                // 数组里如果是对象
                if (item instanceof Object) {
                    return !item.state;
                } else {
                    // 则直接返回
                    return true;
                }
            }).map(item => typeof item !== 'object' ? item : item.group);
            this.setState({ filter });
        }
    }
    componentDidMount() {
        // 填充默认值
        let { defaultValue } = this.props;
        if (defaultValue && defaultValue.constructor == Object) {
            let { option, selectType } = this.state;
            if (this.props.type === 'radio') {
                option.alreadyAllChecked = false;
                option.notChecked = [];
                if (defaultValue.checked && defaultValue.checked.length) {
                    option.checked = [defaultValue.checked[0]]; //现多也只选中第一条
                }
            } else if (defaultValue.checked && defaultValue.checked.length) {   // 选择时
                option.checked = defaultValue.checked;
                option.indeterminate = true;
            } else if (defaultValue.notChecked && defaultValue.notChecked.length) { // 排除时
                option.notChecked = defaultValue.notChecked;
                option.alreadyAllChecked = true;
                option.indeterminate = true;
            } else if (defaultValue.isAllCheck) {   //全部选中时
                option.alreadyAllChecked = true;
                option.checkedNum = this.props.page.total;
                selectType = "全部";
            }
            this.setState({ selectType, option }, () => {
                return this.props.onChange ? this.props.onChange(this.callbackData()) : null;
            });
        }
    }
    componentWillReceiveProps(nextProps) {
        let { current, pageSize, total } = nextProps.page;
        let datas = [].concat(nextProps.dataSource || []);// Helper.setKey(, '_index_');

        let option = this.state.option;
        if (nextProps.clearSelected) {
            option.alreadyAllChecked = false;
            option.checked = [];
            option.notChecked = [];
            option.checkedNum = 0;
        }
        let { checked, notChecked, alreadyAllChecked } = option;
        checked = checked.map(item => item[nextProps.attrKey]);
        notChecked = notChecked.map(item => item[nextProps.attrKey]);

        datas = datas.map((item, i) => {
            if (nextProps.attrKey) {
                item.key = item[nextProps.attrKey];
            }
            //如果 key值不正常时，则赋上索引
            if (!['number', 'string'].includes(typeof item.key)) {
                item.key = i;
            }
            // 若是全部，且点过全选，非排除项勾上；则勾上选择项
            if (alreadyAllChecked && !notChecked.includes(item[nextProps.attrKey])) {
                item._checked_ = true;
            } else if (checked.includes(item[nextProps.attrKey])) {
                item._checked_ = true;
            }
            return item;
        })
        this.setState({
            attrKey: nextProps.attrKey,
            page: {
                current,
                pageSize,
                total,
            },
            datas: datas,
            option,
            columns: [].concat(nextProps.columns)
        });
    }

    render() {
        let { columns, filter, datas, option, attrKey, selectType } = this.state;
        columns = columns.filter(item => {
            return !filter.includes(item.group);
        })
        let { current, pageSize, total } = this.state.page;
        let { mode, fullScreen, setting, tableAttr } = this.props;
        let _disab = option.alreadyAllChecked && this.props.allCheckToDisabled;
        let scrollY = document.body.clientHeight;
        // 设置功能
        let _style = { float: 'right', display: 'inline-block', cursor: 'pointer', margin: '7px 0 0 8px', lineHeight: '1em', fontSize: '16px', color: '#999999' };
        //全屏
        let _f = { fullScreen: 150, defaultElement: <Icon type="scan" /> };
        let fullScreenStyle = { position: 'fixed', zIndex: _f.zIndex || 12, top: 0, bottom: 0, left: 0, right: 0, padding: '10px 10px 0 10px', overflow: 'auto', background: '#FFFFFF' };
        if (fullScreen && fullScreen.constructor !== Object) {
            _f.diff = fullScreen;
            if (typeof _f.diff === "number") {
                _f.diff = fullScreen;
            } else {
                _f.diff = 150;
            }
            scrollY = document.body.clientHeight - _f.diff;
        } else if (fullScreen && fullScreen.constructor === Object) {
            _f = Object.assign({}, _f, fullScreen);
        }
        // 以前列表选择
        let currentCheckbox = <Checkbox
            style={{ opacity: this.isCurrentAllChecked() < 1 ? 1 : (mode == 'combine' ? 1 : .5) }}
            checked={this.isCurrentAllChecked() === 2}
            indeterminate={this.isCurrentAllChecked() === 1}
            disabled={_disab || (this.isExceedMax() === true && this.isCurrentAllChecked() !== 1) ? true : false}
            onChange={(e) => {
                let checked = e.target.checked;
                this.checkRecord(datas, checked, () => {
                    return this.props.onChange ? this.props.onChange(this.callbackData()) : null;
                });
            }}
        />;
        //attrKey未设置时，则不进行选择
        const _columns = (!attrKey ? [] : [{
            title: <div>
                {this.props.type === 'radio' || mode === 'combine' || datas.length < 2 || (this.props.isAllCheck && total <= datas.length) ? '' :
                    !attrKey || datas.length >= total ? currentCheckbox :
                        <Popover placement="right" title={null} content={<div style={{ color: '#888888' }}>当前列表</div>}>
                            {currentCheckbox}
                        </Popover>

                }
            </div>,
            dataIndex: 'id',
            key: '_id_',
            width: 20,
            //若列头第一项设置了fixed，则将选择框浮动到左侧
            fixed: !columns || !columns.length ? false : Object.keys(columns[0]).includes("fixed") ? 'left' : false,
            render: (text, item) => (
                <div>
                    {this.props.type === 'radio' ?
                        <div
                            onDoubleClick={() => {
                                this.setState({ eventType: 'doubleClick' }, () => {
                                    return this.props.onChange ? this.props.onChange(this.callbackData()) : null;
                                })
                            }}
                        >
                            <Radio
                                checked={item._checked_}
                                onChange={(e) => {
                                    let checked = e.target.checked;
                                    this.checkRecord(item, checked, () => {
                                        return this.props.onChange ? this.props.onChange(this.callbackData()) : null;
                                    });
                                }}
                            />
                        </div>
                        :
                        <Checkbox
                            checked={item._checked_}
                            disabled={_disab}
                            onChange={(e) => {
                                let checked = e.target.checked;
                                this.checkRecord(item, checked, () => {
                                    return this.props.onChange ? this.props.onChange(this.callbackData()) : null;
                                });
                            }}
                        />
                    }
                </div>
            )
        }]).concat(columns || []);
        // 弹窗表格
        let modalColumns = [].concat(columns.filter(item => item && item.modal));
        if (modalColumns.length) {
            modalColumns = modalColumns.concat([{
                title: <div style={{ textAlign: 'center' }}>操作</div>,
                dataIndex: '_',
                key: '_KEY_',
                width: 100,
                render: (text, item) =>
                    <div style={{ textAlign: 'center' }}>
                        {!option.alreadyAllChecked ?
                            <Button
                                size="small"
                                type="primary"
                                onClick={() => {
                                    this.checkRecord(item, false, () => {
                                        if (!option.checked.length && !option.notChecked.length) {
                                            this.setState({
                                                modalVisible: false
                                            });
                                            message.info('已全部取消');
                                        }
                                        return this.props.onChange ? this.props.onChange(this.callbackData()) : null;
                                    });
                                }}
                            ><Icon type="close" />取消选择</Button>
                            :
                            <Button
                                size="small"
                                type="primary"
                                onClick={() => {
                                    this.checkRecord(item, true, () => {
                                        if (!option.checked.length && !option.notChecked.length) {
                                            this.setState({
                                                modalVisible: false
                                            });
                                            message.info('已全部勾选');
                                        }
                                        return this.props.onChange ? this.props.onChange(this.callbackData()) : null;
                                    });
                                }}
                            ><Icon type="check" />选择</Button>
                        }
                    </div>
            }]);
        }
        const menu = (
            <Menu>
                {selectType == '本页' ? '' :
                    <Menu.Item key="0" style={{ padding: 0 }}>
                        <span style={{ display: 'block', padding: '6px 0 6px 2.2em' }} onClick={() => {
                            let { option, datas } = this.state;
                            if (option.alreadyAllChecked) {
                                option.checked = [];
                                option.notChecked = [];
                                option.alreadyAllChecked = false
                                option.checkedNum = 0;
                                datas = datas.map(item => {
                                    delete item._checked_;
                                    return item;
                                })
                            }
                            this.setState({
                                selectType: '本页',
                                option,
                                datas
                            })
                        }}>本页</span>
                    </Menu.Item>
                }
                {selectType == '全部' ? '' :
                    <Menu.Item key="1" style={{ padding: 0 }}>
                        <span style={{ display: 'block', padding: '6px 0 6px 2.2em' }} onClick={() => {
                            this.setState({ selectType: '全部' })
                        }}>全部</span>
                    </Menu.Item>
                }
            </Menu>
        );
        return (
            <div style={this.state.fullSwitch !== false ? fullScreenStyle : {}}>
                <Spin spinning={this.props.spin || false}>
                    <div>
                        <div style={{ marginBottom: 10 }}>
                            {this.props.type === 'radio' || this.props.isAllCheck === false || !attrKey ? '' :
                                <div style={{ float: 'left' }}>
                                    <div
                                        style={Object.assign({}, {
                                            display: 'inline-block',
                                            position: 'relative',
                                            marginRight: 10,
                                            border: '1px solid #DDDDDD',
                                            borderRadius: 3,
                                            transitionDuration: '300ms',
                                            whiteSpace: 'nowrap',
                                            width: !modalColumns.length || (!option.checked.length && !option.notChecked.length) ? (mode == 'combine' ? 70 : 65) : (mode == 'combine' ? 90 : 85)
                                        }, mode === 'combine' ? { lineHeight: '1em' } : {})}
                                    >
                                        {mode === 'combine' && selectType === '本页' ? <span style={{ display: 'inline-block', margin: '6px 0 6px 8px', position: 'relative', zIndex: 10 }}>{currentCheckbox}</span> :
                                            <Checkbox
                                                style={{ margin: mode == 'combine' ? '6px 0 6px 8px' : '4px 0 4px 8px', position: 'relative', zIndex: 10 }}
                                                checked={this.isAllChecked() === 2}
                                                indeterminate={this.isAllChecked() === 1}
                                                disabled={!datas.length || (this.props.max && this.props.max < total && this.isAllChecked() !== 1) ? true : false}
                                                onChange={(e) => {
                                                    let checked = e.target.checked;
                                                    this.isAllCheck(checked, () => {
                                                        return this.props.onChange ? this.props.onChange(this.callbackData()) : null;
                                                    })
                                                }}
                                            >
                                                {mode === 'combine' ? undefined :
                                                    <span style={{ fontWeight: this.isAllChecked() === 2 ? 'bold' : '' }}>
                                                        全部
                                </span>
                                                }
                                            </Checkbox>
                                        }
                                        {mode !== 'combine' ? undefined :
                                            <Dropdown overlay={menu} trigger={['click']}>
                                                <span style={{ cursor: 'pointer', paddingLeft: '2.2em', position: 'absolute', left: 0, zIndex: 5, width: '100%', height: '100%', lineHeight: '26px' }}>
                                                    {selectType}<Icon type="down" />
                                                </span>
                                            </Dropdown>
                                        }
                                        <label style={{
                                            transitionDuration: '600ms',
                                            opacity: !modalColumns.length || (!option.checked.length && !option.notChecked.length) ? 0 : 1,
                                            position: 'absolute', right: 0, top: 0, zIndex: 8, height: '100%', paddingTop: 6
                                        }}>
                                            {!modalColumns.length || (!option.checked.length && !option.notChecked.length) ? '' :
                                                <Icon
                                                    title={(!option.alreadyAllChecked ? '选择的' : '排除的') + '数据'}
                                                    style={{
                                                        color: '#666666', fontSize: '14px', verticalAlign: 'middle', cursor: 'pointer', margin: '0 6px 0 5px',
                                                    }}
                                                    type={!option.alreadyAllChecked ? "bars" : "file-add"}
                                                    onClick={() => {
                                                        this.setState({ modalVisible: true });
                                                    }}
                                                />
                                            }
                                        </label>
                                    </div>
                                </div>
                            }
                            {!this.props.content ? '' :
                                <div>
                                    {this.props.fullScreen ?
                                        <div style={Object.assign(_style, _f.style || {})}
                                            onClick={() => {
                                                this.fullScreen();
                                            }}
                                        >
                                            {this.state.fullSwitch ? _f.recoveryElement || _f.defaultElement : _f.defaultElement}
                                        </div>
                                        : ''
                                    }
                                    {this.props.setting ?
                                        <Setting
                                            setting={this.props.setting}
                                            columns={this.props.columns}
                                            filter={filter || []}
                                            spin={this.props.spin || false}
                                            onChange={(data) => {
                                                //console.log(data)
                                                let filter = data.filterGroup.filter(item => !item.state).map(item => item.group);
                                                this.setState({ eventType: 'settingChange', filter, filterGroup: data.filterGroup }, () => {
                                                    return this.props.onChange ? this.props.onChange(this.callbackData()) : null;
                                                });
                                            }}
                                            onSave={(data) => {
                                                this.setState({ eventType: 'settingSave' }, () => {
                                                    return this.props.onChange ? this.props.onChange(this.callbackData()) : null;
                                                });
                                            }}
                                        />
                                        : ''
                                    }
                                    {/* 自定义内容 */}
                                    {this.props.content}
                                </div>
                            }
                            <div style={{ clear: 'both', height: 0, overflow: 'hidden' }}></div>
                        </div>
                        <div>
                            <div>{this.props.headerContent}</div>
                            <Table
                                dataSource={datas}
                                columns={_columns}
                                pagination={false}
                                {...tableAttr}
                                scroll={Object.assign({}, tableAttr && tableAttr.scroll ? tableAttr.scroll : {}, this.state.fullSwitch ? { y: scrollY } : {})}
                            />
                            <div>{this.props.footerContent}</div>
                            <div style={{ marginTop: 10 }}>
                                {!this.props.page ? '' :
                                    <Pagination
                                        showTotal={total => `共 ${total}  条`}
                                        showQuickJumper
                                        showSizeChanger
                                        onShowSizeChange={(current, pageSize) => {
                                            if (this.props.onShowSizeChange) {
                                                this.props.onShowSizeChange(current, pageSize);
                                            }
                                            this.setState({
                                                eventType: 'pageSizeChange',
                                                page: Helper.updateKeyValue(this.state.page, {
                                                    'current': current,
                                                    'pageSize': pageSize
                                                })
                                            }, () => {
                                                if (!attrKey) {
                                                    this.isAllCheck(false, () => {
                                                        return this.props.onChange ? this.props.onChange(this.callbackData()) : null;
                                                    });
                                                } else {
                                                    return this.props.onChange ? this.props.onChange(this.callbackData()) : null;
                                                }
                                            })
                                        }}
                                        onChange={(current) => {
                                            if (this.props.onPageChange) {
                                                this.props.onPageChange(current);
                                            }
                                            this.setState({
                                                eventType: 'pageChange',
                                                page: Helper.updateKeyValue(this.state.page, {
                                                    'current': current
                                                })
                                            }, () => {
                                                if (!attrKey) {
                                                    this.isAllCheck(false, () => {
                                                        return this.props.onChange ? this.props.onChange(this.callbackData()) : null;
                                                    });
                                                } else {
                                                    return this.props.onChange ? this.props.onChange(this.callbackData()) : null;
                                                }
                                            })
                                        }}
                                        current={current}
                                        pageSize={pageSize}
                                        total={total}
                                        //  pageSizeOptions={[2, 3, 5, 10, 20, 30, 40, 50, 100, 300, 500]}
                                        {...this.props.paginationAttr}
                                    />
                                }
                            </div>
                        </div>
                        {!modalColumns.length ? '' :
                            <Modal
                                visible={this.state.modalVisible}
                                title={
                                    !option.alreadyAllChecked ?
                                        <span><Icon type="bars" />&nbsp;&nbsp;选择了&nbsp;{option.checked.length ? option.checked.length : ''}&nbsp;项<span style={{ color: '#999999', fontWeight: 'normal', fontSize: '12px' }}>（共 {total} 项）</span></span>
                                        :
                                        <span><Icon type="file-add" />&nbsp;&nbsp;选择了&nbsp;{option.notChecked.length ? total - option.notChecked.length : ''}&nbsp;项<span style={{ color: '#999999', fontWeight: 'normal', fontSize: '12px' }}>（可再选 {option.notChecked.length} 项，共 {total} 项）</span></span>}
                                onCancel={() => {
                                    this.setState({ modalVisible: false });
                                }}
                                footer={[
                                    <Button key="back"
                                        onClick={() => {
                                            this.setState({ modalVisible: false });
                                        }}
                                    >关闭</Button>,
                                ]}
                                {...this.props.modalAttr}
                            >
                                <div style={{ marginBottom: -20 }}>
                                    <Table
                                        size="middle"
                                        dataSource={!option.alreadyAllChecked ? option.checked : option.notChecked}
                                        columns={modalColumns} />
                                </div>
                            </Modal>
                        }
                    </div>
                </Spin>
            </div>
        );
    }

    // 选择全部记录,index 可以是数组，如[0,3,5]
    isAllCheck(checked, callback) {
        let { total } = this.state.page;
        if (this.props.max && this.props.max < total) {
            message.warning('设置了最大数，无法全部选择');
            return false;
        }
        let { datas, option } = this.state;
        datas.map(item => {
            item._checked_ = checked;
            return item;
        })
        option.alreadyAllChecked = checked;
        option.checked = [];
        option.notChecked = [];
        option.checkedNum = checked ? total : 0;
        this.setState({
            datas,
            option
        }, () => {
            return callback ? callback() : null;
        })
    }
    // 选择指定记录,items 可以是数组，如[0,3,5]
    checkRecord(items, checked, callback) {
        let state = Object.assign({}, this.state)
        let datas = state.datas;
        let { total } = state.page;
        let option = state.option;

        if (this.props.max && this.props.max < total) {
            let isExceedMax = this.isExceedMax(items);
            if (checked && this.isExceedMax() === true) {
                message.warning('最多可选 ' + this.props.max + ' 项');
                return false;
            }
            // 优先取剩余可选数
            items = isExceedMax ? isExceedMax : items;
            if (isExceedMax && isExceedMax.length) {
                message.warning('刚选了 ' + isExceedMax.length + ' 项，最多可选 ' + this.props.max + ' 项');
            }
        }
        items = items instanceof Array ? items : [items];
        let keys = items.map(item => item.key);
        datas = datas.map(item => {
            if (keys.includes(item.key)) {
                if (this.props.type == "radio") {
                    item._checked_ = true;
                    option.checked = [item];
                    option.notChecked = [];
                    option.alreadyAllChecked = false;
                    option.checkedNum = 1;
                } else {
                    item._checked_ = checked;
                }
            } else if (this.props.type == "radio") {
                delete item._checked_;
            }
            return item;
        });
        if (this.props.type !== "radio") {
            option = this.updateCheckRecord(items, checked);
        }
        this.setState({
            datas,
            option,
        }, () => {
            return callback ? callback() : null;
        });
    }
    // 更新记录,type=true push，type=false delete，item='clear'清除
    updateCheckRecord(item, type, callback) {
        let state = Object.assign({}, this.state);
        let { total } = state.page;
        let option = state.option;
        let { alreadyAllChecked, checkedNum } = option;
        if (item === 'clear') {
            option.checked = [];
            option.notChecked = [];
        } else {
            let arrKeyName = 'checked';
            if (alreadyAllChecked) {
                arrKeyName = 'notChecked';
                type = !type;
            }
            let keyValue = option[arrKeyName].map(itm => itm.key);
            item = Helper.toArray(item);
            item.forEach(itm => {
                if (type) {
                    if (!keyValue.includes(itm.key)) {
                        option[arrKeyName].push(itm);
                    }
                } else {
                    option[arrKeyName] = option[arrKeyName].filter(iem => iem.key != itm.key)
                }
            });
            if (alreadyAllChecked) {
                option.checkedNum = total - option.notChecked.length;
            } else {
                option.checkedNum = option.checked.length;
            }
        }
        return option;
    }

    // 判断当页项是否全部选择了
    isCurrentAllChecked() {
        let datas = this.state.datas;
        let length = datas.filter(item => {
            return item._checked_ && !item._disabled_;
        }).length;
        if (length && length === datas.length) {
            return 2    // 全选了
        } else if (length && length !== datas.length) {
            return 1;   // 有选中
        } else {
            return 0;   // 全未选
        }

    }
    // 判断全选状态,0全不选，1有选中，2全选中
    isAllChecked() {
        let currentCheck = this.isCurrentAllChecked();
        let { checkedNum } = this.state.option;
        let { total } = this.state.page;
        if (checkedNum && checkedNum === total) {
            return 2;
        } else if (checkedNum && checkedNum !== total) {
            return 1;
        } else {
            return 0;
        }
    }
    // 是否超过最大数
    isExceedMax(item) {
        let { checkedNum, alreadyAllChecked } = this.state.option;
        // if (item) {
        //     console.log(item, this.props.max, checkedNum)
        // }
        if (!item && this.props.max && this.props.max <= checkedNum) {
            return true;
        } else if (item && this.props.max) {
            item = Helper.toArray(item).filter(itm => alreadyAllChecked ? itm._checked_ : !itm._checked_);
            if (checkedNum + item.length > this.props.max) {
                // 返回可操作的
                item = item.filter((itm, i) => i < this.props.max - checkedNum);
            } else {
                return false;
            }
        } else {
            return false;
        }
        return item;
    }
    //全屏方法
    fullScreen(callback) {
        let { fullSwitch } = this.state;
        this.setState({
            eventType: !fullSwitch ? 'fullScreen' : 'recoveryScreen',
            fullSwitch: !fullSwitch
        }, () => {
            return this.props.onChange ? this.props.onChange(this.callbackData()) : null;
        });
    }
    // 回调数据
    callbackData() {
        let { alreadyAllChecked, notChecked, checked, checkedNum } = this.state.option;
        let { eventType, filterGroup } = this.state;
        this.setState({ eventType: '' });   //去除操作类型便于自动读取默认值
        let result = {
            eventType: eventType || 'check',
            checked,
            notChecked,
            totalNum: this.state.page.total,
            maxNum: this.props.max || 0,
            checkedNum,
            isAllCheck: checkedNum && checkedNum == this.state.page.total,
            page: this.state.page,
        }
        if (filterGroup) {
            result.filterGroup = filterGroup;
        }
        return result;
    }
}