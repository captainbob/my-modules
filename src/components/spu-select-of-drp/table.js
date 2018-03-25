import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table, Icon, Row, Col, Checkbox } from 'antd';

class TableView extends Component {
    render() {
        return (
            <div>
                <Table
                    dataSource={this.props.dataSource}
                    columns={this.columns}
                    pagination={false}
                    scroll={this.props.scroll}
                    onRowClick={(record) => { this.props.toggleSelectItem(record.id) }}
                />
            </div>
        );
    }

    onCheck = (record) => {
        const { selectAllPageFlag, selectThisPageFlag, selectedIds } = this.props.rowSelectState;
        let checked = selectedIds.includes(record.id);
        if (selectAllPageFlag) {
            checked = true
        }
        return (
            <div onClick={(e => {
                e.stopPropagation();
            })}>
                <Checkbox
                    checked={checked}
                    disabled={selectAllPageFlag}
                    onChange={(e) => {
                        this.props.toggleSelectItem(record.id)
                    }}
                />
            </div>
        )
    }

    columns = [
        {
            title: '',
            dataIndex: '',
            key: 'operate',
            width: '30px',
            render: (text, record) => {
                return this.onCheck(record);
            }
        },
        {
            title: '款号',
            dataIndex: "merchantCode",
            key: "merchantCode",
            width: '120px'
        }, {
            title: '名称',
            dataIndex: "title",
            key: "title",
            width: '120px',
            render: (text, record) => {
                return <p className='line2' title={record.title}>{record.title}</p>
            }
        }, {
            title: '类目',
            dataIndex: "customCatName",
            key: "customCatName",
            width: '150px'
        },
        {
            title: '年份',
            dataIndex: "year",
            key: "year",
            width: '80px'
        }, {
            title: '季节',
            dataIndex: "season",
            key: "season",
            width: '80px'
        },
        {
            title: '波段',
            dataIndex: "ranges",
            key: "ranges",
            width: '120px'
        },
        {
            title: "吊牌价",
            dataIndex: 'suggestPrice',
            key: 'suggestPrice',
            width: '120px',
            render: (text, record) => {
                return (
                    <div >
                        {text && text.amount.toFixed(2)}
                    </div>
                )
            }
        }
    ]

}

TableView.propTypes = {
    dataSource: PropTypes.array,
    handleAdd: PropTypes.func,
    handleRemove: PropTypes.func,
};

export default TableView;

export const formatPagination = (pagination = {}, onChange) => {
    return {
        total: pagination.totalResult || 0,
        current: pagination.currentPage,
        onChange,
        showQuickJumper: true,
        showTotal: (total, range) => { return `共${total}条` },
        size: "small"
    }
}