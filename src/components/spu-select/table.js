import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table, Icon, Row, Col, Checkbox, Tooltip, InputNumber } from 'antd';

class TableView extends Component {
    render() {
        return (
            <div>
                <Table
                    dataSource={this.props.dataSource}
                    columns={this.columns}
                    pagination={false}
                    scroll={this.props.scroll}
                    onRowClick={(record) => {
                        const notSelectIds = this.props.notSelectIds || []; //  在左边显示是不可以选择的状态
                        let notSelectFlag = notSelectIds.includes(record.id);
                        if (notSelectFlag) {
                            return
                        }
                        this.props.toggleSelectItem(record.id)
                    }}
                />
            </div>
        );
    }

    onCheck = (record) => {
        const { selectAllPageFlag, selectThisPageFlag, selectedIds } = this.props.rowSelectState;
        const notSelectIds = this.props.notSelectIds || []; //  在左边显示是不可以选择的状态

        let checked = selectedIds.includes(record.id);
        let notSelectFlag = notSelectIds.includes(record.id);
        let disabled = selectAllPageFlag || notSelectFlag

        if (selectAllPageFlag && !notSelectFlag) {
            checked = true
        }
        return (
            <div onClick={(e => {
                e.stopPropagation();
            })}>
                <Checkbox
                    checked={checked}
                    disabled={disabled}
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
        }
        , {
            title: '商品信息',
            dataIndex: 'brandSpuId',
            key: 'brandSpuId',
            render: (text, record) => {
                return (
                    <Row type="flex" justify="start">
                        <Col span={7}>
                            <img src={record.mainPicUrl + '@!a80-80'} style={{ width: 50, height: 50 }} />
                        </Col>
                        <Col span={17}>
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
            width: '71px',
            render: (text, record) => {
                return (
                    <div title={text && text.amount.toFixed(2)} style={{ textAlign: 'right',width:'55px',overflow:'hidden', textOverflow:'ellipsis',whiteSpace: 'nowrap' }}>
                        {text && text.amount.toFixed(2)}
                    </div>
                )
            }
        },
        {
            title: <div style={{ textAlign: 'right' }}>销售价</div>,
            dataIndex: 'salePrice',
            key: 'salePrice',
            width: '71px',
            render: (text, record) => {
                return (
                    <div title={text && text.amount.toFixed(2)} style={{ textAlign: 'right',width:'55px',overflow:'hidden', textOverflow:'ellipsis',whiteSpace: 'nowrap' }}>
                        {text && text.amount.toFixed(2)}
                    </div>
                )
            }
        }].concat(this.props.showFGBtn ? {
            title: <div style={{ textAlign: 'right' }}>换购价</div>,
            dataIndex: 'showFGBtn',
            key: 'showFGBtn',
            width: '76px',
            render: (text, record) => {
                return (
                    <InputNumber min={0} precision={2} style={{width:'60px',float:'right'}} value={(this.props.selectedFGList && this.props.selectedFGList[record.id] && (this.props.selectedFGList[record.id].salePrice || Number(this.props.selectedFGList[record.id].salePrice) == 0)) ? this.props.selectedFGList[record.id].salePrice : ''} onChange={(value)=>{
                        this.props.handleChangePrice(record.id,value)
                    }} />
                )
            }
        }:[]).concat({
            title: <div style={{ textAlign: 'center' }}>操作</div>,
            dataIndex: 'oo2',
            key: "oo2",
            width: '45px',
            render: (text, record) => {
                const notSelectIds = this.props.notSelectIds || []; //  在左边显示是不可以选择的状态
                let notSelectFlag = notSelectIds.includes(record.id);

                return (
                    <div style={{ textAlign: 'center' }}>
                        {this.props.type === 1 ? (
                            <a
                                onClick={(e) => {
                                    e.stopPropagation()
                                    if (notSelectFlag) {
                                        return
                                    }
                                    this.props.handleAdd(record.id)
                                }}
                                title={notSelectFlag ? "已选择" : undefined}
                                disabled={notSelectFlag}
                            >加入</a>
                        ) : (<a onClick={(e) => {
                            e.stopPropagation()
                            this.props.handleRemove(record.id)
                        }}> 删除</a>)
                        }
                    </div>
                )
            }
        })
}

TableView.propTypes = {
    type: PropTypes.number, // 是必须的， 1代表左，2代表右
    dataSource: PropTypes.array,
    handleAdd: PropTypes.func,
    handleRemove: PropTypes.func,
    handleChangePrice: PropTypes.func,  //满赠高阶版改变价格
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