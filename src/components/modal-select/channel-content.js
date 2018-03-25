import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Select, Button, Table, Input, Pagination, Spin, Message } from 'antd';
const Option = Select.Option;
import { HttpUtil } from 'djmodules-utils';
import ChannelChooseFilter from './channel-choose-filter';
import './style/index';

class ChannelSelect extends Component {
    constructor(props) {
        super(props)
    }
    state = {
        filterKey: 0,
        visible: false,
        loading: false,
        queryData: {},         // table请求借口参数
        pagination: {},        // table 的分页数据
        channelData: [],       // table 数据
        selectKeys: [],       // 选中的id值，供表格显示样式
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
                this.getChannelList();
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
        queryData.pageNum = 1;
        queryData.pageSize = 10;
        this.getChannelList(queryData, type);
    }
    // 清空筛选条件
    handleClear = (data) => {
        let { filterKey } = this.state;
        filterKey += 1;
        this.setState({
            filterKey: filterKey,
        });
        this.getChannelList(data, 'clickSearch');
    }
    // 清空已选
    handleSelectClear = () => {
        this.selectedIdsSet.clear();
        this.setState({
            selectKeys: [],
            checkData: []
        });
    }
    asyncSetState = (state) => {
        return new Promise((resolve, reject) => {
            this.setState(state, () => {
                resolve()
            })
        })
    }
    getChannelList = (data, type) => {
        return this.asyncSetState({
            loading: true,
        }).then(() => {
            let jsonData = data || { pageNum: 1, pageSize: 10 };
            // 数据权限
            if (this.props.veidoo) {
                jsonData["veidoo"] = this.props.veidoo
            }
            if (this.props.params) {  // 外部传入其他参数
                jsonData = Object.assign(jsonData, this.props.params);
            }
            HttpUtil.ajax('brand/channel/get_page_list', {
                method: 'get',
                data: jsonData
            }).then((res) => {
                if (res.status == 'success') {
                    let resultObject = res.resultObject || {};
                    this.setState({
                        queryData: jsonData,
                        loading: false,
                        channelData: resultObject.results,
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
    changePage = (pageNum, pageSize) => {
        let { queryData } = this.state;
        let queryDataCopy = Object.assign({}, queryData, {
            pageNum,
            pageSize
        });
        this.getChannelList(queryDataCopy, 'changePage'); // 传翻页状态
    }
    onRowClick = (record, id) => {   // 单击table列事件
        const channelData = this.state.channelData;
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
            let checkIds = (checkData || []).map(item => item.brandChannelAtom.channelId);
            // 把之前已选的筛选出来
            checkData = checkData.filter(item => selectKeys.includes(item.brandChannelAtom.channelId));
            // 再遍历一下当前选择的，把未保存的push进去
            selectKeys.map((key) => {
                channelData.map((result) => {
                    if (key == result.brandChannelAtom.channelId && !checkIds.includes(key)) {
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
                selectKeys: record.brandChannelAtom.channelId,
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
        const { loading, pagination, channelData, selectKeys, checkData, filterKey } = this.state;
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
                title: '渠道名称',
                dataIndex: 'brandChannelAtom.channelName',
                key: 'brandChannelAtom.channelName',
                width: 120,
            }, {
                title: '渠道编码',
                dataIndex: 'brandChannelAtom.channelCode',
                key: 'brandChannelAtom.channelCode',
                width: 120,
            }, {
                title: '渠道类型',
                dataIndex: 'brandChannelAtom.channelTypeDesc',
                key: 'brandChannelAtom.channelTypeDesc',
                width: 120,
            }, {
                title: '店铺数量',
                dataIndex: 'shopCount',
                key: 'shopCount',
                width: 120,
            }, {
                title: '仓库数量',
                dataIndex: 'warehouseCount',
                key: 'warehouseCount',
                width: 120,
            }];

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
                        <Button>选择渠道商</Button>
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
                    <ChannelChooseFilter
                        key={filterKey}
                        handleSearch={this.handleSearch}
                        handleClear={this.handleClear}
                        handleSelectClear={this.handleSelectClear}
                    />
                    <Spin size='large' spinning={loading}>
                        <Table
                            rowSelection={rowSelection}
                            pagination={formatPagination(pagination, this.changePage, this.changePage)}
                            columns={columns}
                            rowKey={record => record.brandChannelAtom.channelId}
                            dataSource={channelData}
                            onRowClick={(record) => { this.onRowClick(record, record.brandChannelAtom.channelId) }}
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
ChannelSelect.defaultProps = {
    modalTitle: '渠道商选择',
    canShow: true,
    canShowText: '',
    rowSelectType: 'radio'
}

ChannelSelect.propTypes = {
    canShow: PropTypes.bool,                  // 是否显示弹框（扩展用）
    canShowText: PropTypes.string,            // 不能显示弹框的提示信息（扩展用）
    handleSelect: PropTypes.func.isRequired,  // 选择回调函数
    modalTitle: PropTypes.string,             // 弹框标题
    rowSelectType: PropTypes.string,          // 选择类型（单选或多选）
    params: PropTypes.object,                 // 外部传入参数
}

export default ChannelSelect;