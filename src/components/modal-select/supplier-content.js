import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Select, Button, Table, Input, Pagination, Spin, Message } from 'antd';
const Option = Select.Option;
import { HttpUtil } from 'djmodules-utils';
import SupplierFilter from './supplier-filter';
import './style/index';

class SupplierSelect extends Component {
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
        supplierData: [],
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
                this.getSupplierList();
            });
        } else {
            message.warning(canShowText)
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
        this.getSupplierList(queryData, type);
    }
    // 清空筛选条件
    handleClear = (data) => {
        let { filterKey } = this.state;
        filterKey += 1;
        this.setState({
            filterKey: filterKey,
        });
        this.getSupplierList(data, 'clickSearch');
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
    getSupplierList = (data, type) => {
        return this.asyncSetState({
            loading: true,
        }).then(() => {
            let queryContent = data || { currentPage: 1, showCount: 10 };
            let jsonData = {
                queryContent: JSON.stringify(queryContent),
            };
            // 数据权限
            if (this.props.veidoo) {
                jsonData["veidoo"] = this.props.veidoo
            }
            if (this.props.params) {  // 外部传入其他参数
                jsonData = Object.assign(jsonData, this.props.params);
            }
            HttpUtil.ajax('brand/supplier/get_page_list', {
                method: 'POST',
                data: jsonData
            }).then((res) => {
                if (res.status == 'success') {
                    let resultObject = res.resultObject || {};
                    this.setState({
                        queryData: queryContent,
                        loading: false,
                        supplierData: resultObject.results,
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
        this.getSupplierList(queryDataCopy, 'changePage');
    }
    onRowClick = (record, id) => {   // 单击table列事件
        const supplierData = this.state.supplierData;
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
            let checkIds = (checkData || []).map(item => item.supplierId);
            // 把之前已选的筛选出来
            checkData = checkData.filter(item => selectKeys.includes(item.supplierId));
            // 再遍历一下当前选择的，把未保存的push进去
            selectKeys.map((key) => {
                supplierData.map((result) => {
                    if (key == result.supplierId && !checkIds.includes(key)) {
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
                selectKeys: record.supplierId,
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
        const { loading, pagination, supplierData, selectKeys, checkData, filterKey } = this.state;
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
                title: '供应商名称',
                dataIndex: 'supplierName',
                key: 'supplierName',
                width: 120,
            }, {
                title: '供应商编码',
                dataIndex: 'supplierCode',
                key: 'supplierCode',
                width: 120,
            }, {
                title: '供应商类型',
                dataIndex: 'supplierTypeDesc',
                key: 'supplierTypeDesc',
                width: 120,
            }, {
                title: '联系人',
                dataIndex: 'linkMan',
                key: 'linkMan',
                width: 120,
            }, {
                title: '联系方式',
                dataIndex: 'linkPhone',
                key: 'linkPhone',
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
                        <Button>选择供应商</Button>
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
                    <SupplierFilter
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
                            rowKey={record => record.supplierId}
                            dataSource={supplierData}
                            onRowClick={(record) => { this.onRowClick(record, record.supplierId) }}
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
SupplierSelect.defaultProps = {
    modalTitle: '供应商选择',
    canShow: true,
    canShowText: '',
    rowSelectType: 'radio',
}

SupplierSelect.propTypes = {
    canShow: PropTypes.bool,                  // 是否显示弹框（扩展用）
    canShowText: PropTypes.string,            // 不能显示弹框的提示信息（扩展用）
    handleSelect: PropTypes.func.isRequired,  // 选择回调函数
    modalTitle: PropTypes.string,             // 弹框标题
    rowSelectType: PropTypes.string,          // 选择类型（单选或多选）
    params: PropTypes.object,                 // 外部传入参数
}

export default SupplierSelect;