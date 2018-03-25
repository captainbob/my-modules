import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table, Icon, Row, Col, Checkbox } from 'antd';

class TableView extends Component {
    // 是否显示行选择功能
    isShowRowSelect = () => {
        let mode = this.props.mode || '';
        switch (String(mode)) {
            case "view":
                // 查看模式    
                return {}
            default:
                // 默认情况返回 选择功能    
                return {
                    rowSelection: {
                        type: 'radio',
                        selectedRowKeys: this.props.selectedRowKeys,
                        onChange: (selectedRowKeys, selectedRows) => {
                            try {
                                this.props.onChange(selectedRowKeys, selectedRows)
                            } catch (err) {
                                console.log("请填写onChange属性");
                            }
                        }
                    },
                    onRowClick: (record) => {
                        try {
                            this.props.onChange([record.id], [record])
                        } catch (err) {
                            console.log("请填写onChange属性");
                        }
                    }
                }
        }
    }

    render() {
        return (
            <div>
                <Table
                    dataSource={this.props.dataSource}
                    columns={this.columns}
                    pagination={false}
                    scroll={this.props.scroll}
                    {...this.isShowRowSelect() }
                />
            </div>
        );
    }



    columns = [
        {
            title: '商品信息',
            dataIndex: 'brandSpuId',
            key: 'brandSpuId',
            width: '300px',
            render: (text, record) => {
                return (
                    <Row type="flex" justify="start">
                        <Col span={7}>
                            <img src={record.mainPicUrl + '@!a80-80'} style={{ width: 80, height: 80 }} />
                        </Col>
                        <Col span={16}>
                            <p className='line2' title={record.title} style={{ fontSize: 14 }}>{record.title}</p>
                            <p style={{ color: '#9c9c9c' }}>类目：{record.catName ? record.catName : "--"}</p>
                            <p style={{ color: '#9c9c9c', whiteSpace: "nowrap" }}>货号：{record.merchantCode}</p>
                        </Col>
                    </Row>
                )
            }
        },
        {
            title: <div style={{ textAlign: 'right' }}>吊牌价</div>,
            dataIndex: 'suggestPrice',
            key: 'suggestPrice',
            width: '12%',
            render: (text, record) => {
                return (
                    <div style={{ textAlign: 'right' }}>
                        {text && text.amount.toFixed(2)}
                    </div>
                )
            }
        },
        {
            title: <div style={{ textAlign: 'right' }}>销售价</div>,
            dataIndex: 'salePrice',
            key: 'salePrice',
            width: '12%',
            render: (text, record) => {
                return (
                    <div style={{ textAlign: 'right' }}>
                        {text && text.amount.toFixed(2)}
                    </div>
                )
            }
        },
        {
            title: <div style={{ textAlign: 'right' }}>库存</div>,
            dataIndex: 'auctionCount',
            key: 'auctionCount',
            width: '12%',
            render: (text, record) => {
                return (
                    <div style={{ textAlign: 'right' }}>
                        {text}
                    </div>
                )
            }
        },
        {
            title: <div style={{ textAlign: 'right' }}>销量</div>,
            dataIndex: 'saledCount',
            key: 'saledCount',
            width: '12%',
            render: (text, record) => {
                return (
                    <div style={{ textAlign: 'right' }}>
                        {text}
                    </div>
                )
            }
        }].concat(this.props.showFGBtn ? {
            title: <div style={{ textAlign: 'right' }}>换购价</div>,
            dataIndex: 'showFGBtn',
            key: 'showFGBtn',
            width: '12%',
            render: (text, record) => {
                return (
                    <div style={{ textAlign: 'right' }}>
                        {(this.props.includeSpuDtos[record.id] && this.props.includeSpuDtos[record.id].salePrice) || ''}
                    </div>
                )
            }
        }:[])

}

TableView.propTypes = {
    type: PropTypes.number, // 是必须的， 1代表左，2代表右
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