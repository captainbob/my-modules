import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table, Icon, Checkbox, Tooltip, Pagination, Row, Col, Select } from 'antd';
import BatchAddModal from './batch-add-modal';

export const formatPagination = (pagination = {}, onChange) => {
    return {
        total: pagination.totalResult || 0,
        current: pagination.currentPage,
        onChange,
        showQuickJumper: false,
        showTotal: (total, range) => { return `共${total}条` },
        size: "small"
    }
}
class StoreChooseTable extends Component {
    state = {
        pagination: {},
        pageSelectFlag: '1'
    }
    onChangePage = (page) => {
        this.props.onChangePage(page)
    }

    render() {
        const pagination = formatPagination(this.props.pagination, this.onChangePage)
        const paginationStyle = {
            position: 'absolute',
            bottom: 0,
            margin: '15px 0',
            width: '100%',
            textAlign: "center"
        }
        const containerStyle = {
            position: 'relative',
            height: '520px',
        }
        const tableStyle = {
            display: 'block',
            height: '465px',
            overflow: 'hidden',
            overflowY: 'auto',
            border: '1px solid #ccc'
        }
        if (this.props.position == 'left') {
            return (
                <div>
                    <div className='operate'>
                        {this.state.pageSelectFlag == '1' ? (
                            <Checkbox
                                checked={this.props.rowSelection.pageSelectAll}
                                onChange={(e) => this.props.rowSelection.selectAll(e.target.checked)}
                            />
                        ) : (
                                <Checkbox
                                    checked={this.props.selectAllPageFlag}
                                    onChange={(e) => this.props.onChangeSelectAllPageFlag(e.target.checked)}
                                />
                            )
                        }
                        <Select value={this.state.pageSelectFlag}
                            onChange={(value) => {
                                this.setState({
                                    pageSelectFlag: value
                                }, () => {
                                    value == '1' ? this.props.onChangeSelectAllPageFlag(false) : this.props.rowSelection.selectAll(false)
                                });
                            }}
                        >
                            <Select.Option value='1'>本页</Select.Option>
                            <Select.Option value='2'>全部</Select.Option>
                        </Select>
                    </div>
                    <div style={containerStyle}>

                        <Table
                            columns={this.leftColumns}
                            dataSource={this.props.dataSource}
                            pagination={false}
                            style={tableStyle}
                        />
                        <Pagination {...pagination} style={paginationStyle} />
                    </div>
                </div>
            );
        } else {
            return (
                <div>
                    <div className='operate'>
                        {this.props.allowDelBtn ?
                            <span>
                                <a onClick={this.props.clearSelectedDataOfPage} style={{ marginRight: 15 }}>清除本页</a>
                                <a onClick={this.props.clearAllSelectedData}>清除全部</a>
                            </span>
                        :null}
                        <BatchAddModal
                            handleOk={this.props.batchAddStore}
                            style={{ float: "right" }}
                        />
                    </div>
                    <div style={containerStyle}>
                        <Table
                            columns={this.rightColumns}
                            dataSource={this.props.dataSource}
                            pagination={false}
                            style={tableStyle}

                        />
                        <Pagination {...pagination} style={paginationStyle} />
                    </div>
                </div>

            );
        }

    }

    get leftColumns() {
        let prefix = "门店"
        if (this.props.wareHouse) {
            prefix = "店仓"
        }

        const arr = [
            {
                title: '',
                dataIndex: '',
                key: 'operate',
                width: '30px',
                render: (text, record) => {
                    const rowSelection = this.props.rowSelection;
                    const checked = rowSelection.selectedRowKeys.includes(record._id);
                    const haveSelectedIds = this.props.haveSelectedIds
                    return <div>
                        {haveSelectedIds.includes(record._id) ?
                            (<div>
                                <Icon type="check-circle-o" style={{
                                    color: '#33CC00',
                                    fontSize: '16px'
                                }} />
                            </div>) : (
                                <Tooltip placement="topLeft" title={record.noAgreement ? '已被其他选择' : ''}>
                                    <Checkbox
                                        checked={this.props.selectAllPageFlag ? true : checked}
                                        disabled={this.props.selectAllPageFlag ? true : record.noAgreement}
                                        onChange={(e) => rowSelection.onChange(e.target.checked, record._id, record)}
                                    />
                                </Tooltip>
                            )
                        }

                    </div>
                }

            }
            ,
            {
                title: `${prefix}编码`,
                dataIndex: 'storageCode',
                width: '30%',
                key: 'brandStorageAtom.storageCode',
            },
            {
                title: `${prefix}名`,
                dataIndex: 'name',
                key: 'name',
                width: '30%',
            },
            {
                title: '所在地',
                dataIndex: 'city',
                key: 'city',
                width: '30%',
            }
        ]
        return arr
    }

    get rightColumns() {
        let prefix = "门店"
        if (this.props.wareHouse) {
            prefix = "店仓"
        }
        const arr = [
            {
                title: '',
                dataIndex: '',
                key: 'operate',
                width: '30px',
                render: (text, record) => {
                    return (
                        <div
                            onClick={() => this.props.deleteItem(record._id)}
                            style={{ width: 30 }}
                        >
                            {this.props.allowDelBtn ?
                                <Icon type="close-circle" style={{
                                    fontSize: 16,
                                    color: '#999999',
                                    cursor: 'pointer',
                                }} />
                            :null}
                        </div>
                    )
                }

            },
            {
                title: `${prefix}编码`,
                dataIndex: 'storageCode',
                width: '30%',
                key: 'brandStorageAtom.storageCode',
            },
            {
                title: `${prefix}名`,
                dataIndex: 'name',
                key: 'name',
                width: '30%',
            },
            {
                title: '所在地',
                dataIndex: 'city',
                key: 'city',
                width: '30%',
            }
        ]
        return arr
    }


}
StoreChooseTable.defaultProps = {
    rowSelection: {},
    position: 'left',
    haveSelectedIds: []
}
StoreChooseTable.PropTypes = {
    dataSource: PropTypes.array,
    pagination: PropTypes.object,
    rowSelection: PropTypes.object,
    onChangePage: PropTypes.func.isRequired,
    deleteItem: PropTypes.func,
    position: PropTypes.string
}
export default StoreChooseTable;
