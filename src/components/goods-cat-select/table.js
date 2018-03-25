import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table, Icon, Row, Col, Checkbox } from 'antd';

class TableView extends Component {
    render() {
        return (
            <Table
                dataSource={this.props.dataSource}
                columns={this.columns}
                pagination={false}
                scroll={this.props.scroll}
            />
        );
    }



    columns = [
        {
            title: '分组名称',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: "修改时间",
            dataIndex: 'lastModifytime',
            key: 'lastModifytime',
            width: '240',
        },
        {
            title: "操作",
            dataIndex: 'options12',
            key: '12',
            width: '15%',
            render: (text, record) => {
                return (
                    <a onClick={() => this.props.handleChoose(record)}>选择</a>
                )
            }
        },
    ]

}

TableView.propTypes = {
    type: PropTypes.number, // 是必须的， 1代表左，2代表右
    dataSource: PropTypes.array,
    handleChoose: PropTypes.func,
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