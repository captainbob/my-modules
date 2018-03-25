import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Table, Pagination, Spin, Message } from 'antd';
import { HttpUtil } from 'djmodules-utils';
import WareHouseFilter from './warehouse-filter';
import './style/index';

class WarehouseSelect extends Component {
    constructor(props) {
        super(props)
    }
    state = {
        filterKey: 0,
        visible: false,
        loading: false,
        queryData: {},
        pagination: {},
        selectKeys: [],
        checkData: [],
        warehouseData: [],
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
                this.warehouseFilter._handleSearch();
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
        let queryData = data ? JSON.parse(data.queryContent) : {};
        queryData.pageNum = 1;
        queryData.pageSize = 10;
        this.getWarehouseList(queryData, type);
    }
    // 清空筛选条件
    handleClear = (data) => {
        let { filterKey } = this.state;
        filterKey += 1;
        this.setState({
            filterKey: filterKey,
        }, () => {
            this.getWarehouseList(data, 'clickSearch');
        });
    }
    // 清空已选项
    handleSelectClear = () => {
        this.selectedIdsSet.clear();
        this.setState({
            selectKeys: [],
            checkData: [],
        })
    }
    asyncSetState = (state) => {
        return new Promise((resolve, reject) => {
            this.setState(state, () => {
                resolve()
            })
        })
    }
    getWarehouseList = (data, type) => {
        return this.asyncSetState({
            loading: true,
        }).then(() => {
            let {
                hasWareHouse,      // 搜索包含仓库的数据
                onlyWareHouse,     // 搜索只含仓库的数据
                includeStorageIds, // 在该范围内搜索
                dataType,          // 权限控制
                params,            // 外部传入其他参数
            } = this.props;
            let queryContent = data || { currentPage: 1, showCount: 10, status: 1 };
            if (onlyWareHouse) {
                queryContent['storageTypes'] = [2];
            }
            if (includeStorageIds) {
                queryContent['storageIds'] = includeStorageIds;
            }
            if (dataType) {
                queryContent['dataType'] = dataType;
            }
            let jsonData = {
                queryContent: JSON.stringify(queryContent),
                wareHouse: hasWareHouse ? 2 : ''
            };
            // 数据权限
            if (this.props.veidoo) {
                jsonData["veidoo"] = this.props.veidoo
            }
            if (params) {  // 外部传入其他参数
                jsonData = Object.assign(jsonData, params);
            }
            HttpUtil.ajax('brand/shop/get_list_by_query', {
                method: 'post',
                data: jsonData
            }).then((res) => {
                if (res.status == 'success') {
                    let resultObject = res.resultObject || {};
                    this.setState({
                        queryData: queryContent,
                        loading: false,
                        warehouseData: resultObject.results,
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
        })
        this.getWarehouseList(queryDataCopy, 'changePage'); // 传翻页状态
    }
    onRowClick = (record, id) => {   // 单击table列事件
        const warehouseData = this.state.warehouseData;
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
            let checkIds = (checkData || []).map(item => item.storageId);
            // 把之前已选的筛选出来
            checkData = checkData.filter(item => selectKeys.includes(item.storageId));
            // 再遍历一下当前选择的，把未保存的push进去
            selectKeys.map((key) => {
                warehouseData.map((result) => {
                    if (key == result.storageId && !checkIds.includes(key)) {
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
                selectKeys: record.storageId,
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

    get modalFooter() {
        const { mode } = this.props;
        let footer = [
            [
                <Button key="back" size="large" onClick={this.handleCancel}>取消</Button>,
                <Button key="submit" type="primary" size="large" onClick={this.handleOk}>
                    确认
                </Button>,
            ]
        ];
        switch (String(mode)) {
            case "view":
                return [
                    <Button key="back" size="large" onClick={this.handleCancel}>关闭</Button>,
                ]
            default:
                return footer
        }
    }

    render() {
        const { loading, pagination, warehouseData, selectKeys, checkData, filterKey } = this.state;
        let tableHeight;
        let modalTop = false;
        const innerHeight = window.innerHeight > 825 ? 825 : window.innerHeight;
        if (window.innerHeight > 825) {
            tableHeight = innerHeight - 300;
        } else {
            modalTop = true;
            tableHeight = innerHeight - 360;
        }
        let columns = this.columns;

        let children = this.props.children;

        let rowSelection = {
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
            selectedRowKeys: selectKeys,
        };
        // 判断是不是查看模式
        if (this.props.mode === 'view') {
            rowSelection = null

        }
        const style = Object.assign({ display: 'inline-block' }, this.props.style);

        return (
            <div style={style}>
                {children ? children : this.props.noBtn ? null : (
                    <Button onClick={() => this.showModal()}>选择店仓</Button>
                )}
                <Modal
                    style={{ top: modalTop ? '30px' : '' }}
                    width={1100}
                    title={this.props.modalTitle}
                    visible={this.state.visible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    footer={this.modalFooter}
                >
                    <WareHouseFilter
                        key={filterKey}
                        channelName={this.props.channelName}
                        handleSearch={this.handleSearch}
                        handleClear={this.handleClear}
                        handleSelectClear={this.handleSelectClear}
                        ref={warehouseFilter => this.warehouseFilter = warehouseFilter}
                    />
                    <Spin size='large' spinning={loading}>
                        <Table
                            rowSelection={rowSelection}
                            pagination={formatPagination(pagination, this.changePage, this.changePage)}
                            columns={columns}
                            rowKey={record => record.storageId}
                            dataSource={warehouseData}
                            onRowClick={(record) => { this.onRowClick(record, record.storageId) }}
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

    get columns() {
        const { mode } = this.props;
        let columns = [
            {
                title: '店仓编码',
                dataIndex: 'storageCode',
                key: 'storageCode',
                width: 120,
            }, {
                title: '店仓名称',
                dataIndex: 'name',
                key: 'name',
                width: 120,
            },
        ];
        if (mode == "view") {
            columns = [
                {
                    title: '店铺编码',
                    dataIndex: 'storageCode',
                    key: 'storageCode',
                    width: 120,
                }, {
                    title: '店铺名称',
                    dataIndex: 'name',
                    key: 'name',
                    width: 120,
                }, {
                    title: "所属渠道",
                    dataIndex: "channelName",
                    key: "channelName",
                    width: 120,
                }, {
                    title: '所在地',
                    dataIndex: 'city',
                    key: 'city',
                    width: 120,
                }
            ]
        } else {
            columns = columns.concat([{
                title: "渠道类型",
                dataIndex: "property",
                key: "property",
                width: 120,
            }, {
                title: '所在地',
                dataIndex: 'city',
                key: 'city',
                width: 120,
            }])
        }
        return columns
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
WarehouseSelect.defaultProps = {
    modalTitle: '发货店仓选择',
    canShow: true,
    canShowText: '',
    style: {},
    disableArray: [],
    rowSelectType: 'radio',
    hasWareHouse: false,     // 搜索是否含仓库
    onlyWareHouse: false,   // 只搜索仓库的数据（默认搜索店铺）
}

WarehouseSelect.propTypes = {
    canShow: PropTypes.bool,                   // 是否显示弹框（扩展用）
    canShowText: PropTypes.string,             // 不能显示弹框的提示信息（扩展用） 
    handleSelect: PropTypes.func.isRequired,   // 选择回调函数
    modalTitle: PropTypes.string,              // 弹框标题
    onlyWareHouse: PropTypes.bool,             // 只搜索仓库的数据
    hasWareHouse: PropTypes.bool,              // 是否含仓库
    disableArray: PropTypes.array,             // 不能选择的类目
    rowSelectType: PropTypes.string,           // 选择类型（单选或多选）
    params: PropTypes.object,                  // 外部传入参数
    channelName: PropTypes.object,             // 外部传入渠道商名称搜索内容
    mode: PropTypes.oneOf(['view']),           // 显示模式，view为查看
    includeStorageIds: PropTypes.array,        // 只查询该属性数组中的门店
    dataType: PropTypes.string,                // 权限控制
}

export default WarehouseSelect;