import ReactDOM from 'react-dom';
import { Table } from 'antd';
import React, { Component } from 'react';

const data = [];

class ListV extends Component {

    pagination;

    constructor(props, context) {
        super(props, context);
        this.handlerPageQuery = this.handlerPageQuery.bind(this);
    }

    handlerPageQuery = (pagination, filters, sorter) => {
        this.props.handlerPageQuery(pagination, this.props.thisKey);
    }

    render() {

        return (
            <div>

                {this.props.formView}

                <div style={{ marginTop: 20 }}>
                    <Table
                        columns={this.props.data.columns}
                        dataSource={this.props.data.list}
                        bordered
                        onChange={this.handlerPageQuery}
                        pagination={{ pageSize: this.props.data.pagination.showCount, total: this.props.data.pagination.totalResult }}
                        scroll={{ x: 1200, y: 400 }}
                    />
                </div>
            </div>
        );
    }
}

export default ListV;