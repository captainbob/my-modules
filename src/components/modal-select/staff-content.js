import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
    Modal, Select, Button, Table, Avatar,
    Input, Pagination, Spin, Message
} from 'antd';
const Option = Select.Option;
import { HttpUtil } from 'djmodules-utils';
import StaffChooseFilter from './staff-choose-filter';
// import './style/index';

class StaffSelect extends Component {
    constructor(props) {
        super(props)
    }
    state = {
        filterKey: 0,
        visible: false,
        loading: false,
        queryData: {},         // table请求借口参数
        pagination: {},        // table 的分页数据
        staffData: [],       // table 数据
        selectKeys: [],    // 选中的id值，供表格显示样式
        checkData: [],         // 选中的data数据 供外部使用）
    }
    selectedIdsSet = new Set();    // 选中id存储
    componentWillReceiveProps(nextProps) {
        if (nextProps.selectKeys != this.props.selectKeys) {
            this.setState({
                selectKeys: nextProps.selectKeys
            })
        }
    }
    showModal = () => {
        const { canShow, canShowText } = this.props;
        if (canShow) {
            this.setState({
                visible: true,
            }, () => {
                this.getStaffList();
            });
        } else {
            Message.warning(canShowText)
        }
    }
    handleOk = (e) => {
        e.preventDefault();
        let { filterKey } = this.state;
        filterKey += 1;
        this.setState({
            filterKey: filterKey,
            visible: false,
        }, () => {
            this.props.handleSelect(this.state.checkData, this.state.selectKeys);
            if (this.props.onChange) {  // 初始化组件的onchange事件
                this.props.onChange(this.state.checkData, this.state.selectKeys);
            }
        })
    }
    handleCancel = (e) => {
        let { filterKey } = this.state;
        filterKey += 1;
        this.setState({
            filterKey: filterKey,
            visible: false,
        });
    }
    // 搜索查询
    handleSearch = (data, type) => {
        let queryData = data;
        queryData.currentPage = 1;
        queryData.showCount = 10;
        this.getStaffList(queryData, type);
    }
    // 清空筛选条件
    handleClear = (data) => {
        let { filterKey } = this.state;
        filterKey += 1;
        this.setState({
            filterKey: filterKey,
        });
        this.getStaffList(data, 'clickSearch');
    }
    // 清空已选项
    handleSelectClear = () => {
        this.selectedIdsSet.clear();
        this.setState({
            selectKeys: [],
            checkData: [],
        });
    }
    asyncSetState = (state) => {
        return new Promise((resolve, reject) => {
            this.setState(state, () => {
                resolve()
            })
        })
    }
    getStaffList = (data, type) => {
        return this.asyncSetState({
            loading: true,
        }).then(() => {
            let jsonData = data || { currentPage: 1, showCount: 10 };
            // 数据权限
            jsonData["veidoo"] = this.props.veidoo || "mixData";
            if (this.props.params) {  // 外部传入其他参数
                jsonData = Object.assign(jsonData, this.props.params);
            }
            if (this.props.extraAjaxData) {
                jsonData = Object.assign(jsonData, this.props.extraAjaxData);
            }

            HttpUtil.ajax('/rs/brand/staffback/get_list', {
                method: 'post',
                data: jsonData
            }).then((res) => {
                if (res.status == 'success') {
                    let resultObject = res.resultObject || {};
                    this.setState({
                        queryData: jsonData,
                        loading: false,
                        staffData: resultObject.results,
                        pagination: resultObject.pagination || {}
                    });
                } else {
                    let messageText = res.exceptionMessage || res.message || '请求错误';
                    Message.error(messageText)
                    this.setState({
                        loading: false
                    });
                }
            })
        });
    }
    changePage = (currentPage, showCount) => {
        let { queryData } = this.state;
        let queryDataCopy = Object.assign({}, queryData, {
            currentPage,
            showCount
        });
        this.getStaffList(queryDataCopy, 'changePage'); // 传翻页状态
    }
    onRowClick = (record, id) => {   // 单击table列事件
        const staffData = this.state.staffData;
        if (this.props.rowSelectType == 'radio') {
            this.setState({
                selectKeys: id.split(','),
                checkData: [record]
            });
        } else {
            if (this.selectedIdsSet.has(id)) {
                this.selectedIdsSet.delete(id);
            } else {
                this.selectedIdsSet.add(id);
            }
            const selectKeys = Array.from(this.selectedIdsSet);
            let { checkData } = this.state;
            let checkIds = (checkData || []).map(item => item.staffId);
            // 把之前已选的筛选出来
            checkData = checkData.filter(item => selectKeys.includes(item.staffId));
            // 再遍历一下当前选择的，把未保存的push进去
            selectKeys.map((key) => {
                staffData.map((result) => {
                    if (key == result.staffId && !checkIds.includes(key)) {
                        checkData.push(result);
                    }
                });
            });

            this.setState({
                selectKeys: selectKeys,
                checkData: checkData
            });
        }
    }
    rowDoubleClick = (record) => {  // 双击table列事件
        if (this.props.rowSelectType == 'radio') {
            this.setState({
                selectKeys: record.staffId,
            }, () => {
                setTimeout(() => {
                    this.props.handleSelect([record]);
                    if (this.props.onChange) {  // 初始化组件的onchange事件
                        this.props.onChange([record]);
                    }
                    this.handleCancel();
                }, 300);
            });
        }
    }
    render() {
        const { loading, pagination, staffData, selectKeys, checkData, filterKey } = this.state;
        let tableHeight;
        let modalTop = false;
        const innerHeight = window.innerHeight > 825 ? 825 : window.innerHeight;
        if (window.innerHeight > 825) {
            tableHeight = innerHeight - 300;
        } else {
            modalTop = true;
            tableHeight = innerHeight - 360;
        }
        const columns = [
            {
                title: '头像',
                dataIndex: 'portraitUrl',
                key: '-2',
                width: 60,
                render: (text, record, index) => {
                    let color = '#ddd';
                    if (record.staffAtom.status == 1) {
                        color = '#87d068';
                    }
                    if (text) {
                        return <Avatar src={text} />
                    } else {
                        return <Avatar style={{ backgroundColor: color }} icon="user" />
                    }
                }
            },
            {
                title: '姓名',
                dataIndex: 'name',
                key: '0',
                width: 100,
            },
            {
                title: '工号',
                dataIndex: 'staffAtom.jobNumber',
                key: '1',
                width: 100,
            },
            {
                title: '店仓',
                dataIndex: 'storgeName',
                key: '3',
                width: 150,
            },
        ];
        const rowSelection = {
            type: this.props.rowSelectType,
            onChange: (selectedRowKeys, selectedRows) => {
                if (this.props.rowSelectType == 'radio') {
                    this.setState({
                        selectKeys: selectedRowKeys,
                        checkData: selectedRows
                    });
                } else {
                    this.selectedIdsSet = new Set(selectedRowKeys);
                    this.setState({
                        selectKeys: selectedRowKeys,
                        checkData: selectedRows
                    });
                }
            },
            selectedRowKeys: selectKeys
        };
        let children = this.props.children
        const style = Object.assign({ display: 'inline-block' }, this.props.style);

        return (
            <div style={style}>
                {children ? children : (
                    <div onClick={() => this.showModal()}>
                        <Button>选择员工</Button>
                    </div>
                )}
                <Modal
                    style={{ top: modalTop ? '30px' : '' }}
                    width={1000}
                    title={this.props.modalTitle}
                    visible={this.state.visible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    okText="确认"
                    cancelText="取消"
                >
                    <StaffChooseFilter
                        key={filterKey}
                        handleSearch={this.handleSearch}
                        handleClear={this.handleClear}
                        handleSelectClear={this.handleSelectClear}
                        fixFilterDisabledList={this.props.fixFilterDisabledList}
                        fixFilterDisabledText={this.props.fixFilterDisabledText}
                    />
                    <Spin size='large' spinning={loading}>
                        <Table
                            rowSelection={rowSelection}
                            pagination={formatPagination(pagination, this.changePage, this.changePage)}
                            columns={columns}
                            rowKey={record => record.staffId}
                            dataSource={staffData}
                            onRowClick={(record) => { this.onRowClick(record, record.staffId) }}
                            onRowDoubleClick={(record) => { this.rowDoubleClick(record) }}
                            scroll={{
                                y: tableHeight
                            }}
                        />
                    </Spin>
                </Modal>
            </div>
        )
    }
}

const formatPagination = (pagination = {}, onChange, onShowSizeChange) => {
    return {
        total: pagination.totalResult || 0,
        current: pagination.currentPage,
        pageSize: pagination.showCount,
        onChange,
        onShowSizeChange,
        pageSizeOptions: ['10', '20', '50', '100'],
        showTotal: (total, range) => { return `共${total}条` },
        showSizeChanger: true
    }
}
StaffSelect.defaultProps = {
    modalTitle: '员工选择',
    canShow: true,
    canShowText: '',
    rowSelectType: 'radio',
    fixFilterDisabledList: [],
    fixFilterDisabledText: {},
}

StaffSelect.propTypes = {
    canShow: PropTypes.bool,                  // 是否显示弹框（扩展用）
    canShowText: PropTypes.string,            // 不能显示弹框的提示信息（扩展用）
    handleSelect: PropTypes.func.isRequired,  // 选择回调函数
    modalTitle: PropTypes.string,             // 弹框标题
    rowSelectType: PropTypes.string,          // 选择类型（单选或多选）
    params: PropTypes.object,                 // 外部传入参数
    extraAjaxData: PropTypes.object,          // 额外的查询参数
    fixFilterDisabledList: PropTypes.array,   // g固定的筛选条件禁止
    fixFilterDisabledText: PropTypes.object,  // g固定的筛选条件禁止，但要显示什么参数
}

export default StaffSelect;