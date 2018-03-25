import React, { Component } from 'react';
import PropTypes from 'prop-types';
import HTML from './html';

let rowkey = 0;

class Table extends Component {
    static defaultProps = {
        dataSource: [],
        columns: [],
        buttonOptions: {},
        isTable: true
    }

    render() {
        return <HTML buttonOptions={this.props.buttonOptions} isTable={true} auto={this.props.auto}>
            <table className='ptable'>
                {this.title}
                {this.thead}
                {this.tbody}
                {this.tfoot}
            </table>
        </HTML >
    }

    get title() {
        return this.props.title ? <caption><b>{this.props.title}</b></caption> : null;
    }

    get thead() {
        const ths = this.props.columns.map(item => {
            const props = {
                key: item.key,
                children: item.title
            };
            if (item.width !== undefined) {
                Object.assign(props, {
                    width: item.width
                })
            }

            if (item.style !== undefined) {
                Object.assign(props, {
                    style: col.style
                });
            }

            return <th {...props}></th>
        })
        return <thead>
            {
                this.props.head? <tr>
                    <td style={{textAlign:'center', padding:8}} colSpan={this.props.columns.length}>{this.props.head}</td>
                </tr>:null
            }
            <tr>
                {ths}
            </tr>
        </thead>
    }

    get tbody() {
        const trs = this.props.dataSource.map((record, index) => {
            const tds = this.props.columns.map(col => {
                let children = null;
                if (col.render) {
                    children = col.dataIndex ? col.render(record[col.dataIndex], record, index) : col.render(record, record, index);
                } else {
                    children = col.dataIndex ? record[col.dataIndex] : null;
                }
                const props = {
                    key: col.key,
                    children: children
                };
                if (col.width !== undefined) {
                    Object.assign(props, {
                        width: col.width
                    });
                }
                if (col.style !== undefined) {
                    Object.assign(props, {
                        style: col.style
                    });
                }
                return <td {...props}></td>
            });
            const key = record.key || (this.props.rowKey ? this.props.rowKey(record) : rowkey++);
            return <tr key={key}>
                {tds}
            </tr>
        });
        return <tbody>
            {trs}
        </tbody>
    }

    get tfoot() {
        return <tfoot>
            {
                this.props.foot? <tr>
                    <td style={{textAlign:'center', padding:8}} colSpan={this.props.columns.length}>{this.props.foot}</td>
                </tr>:null
            }
            <tr>
                <td colSpan={this.props.columns.length} style={{textAlign:'right', padding:8}}>
                    当前是第<font data-ptable-tdata="PageNO">##</font>页/共<font data-ptable-tdata="PageCount">##</font>页
                </td>
            </tr>
        </tfoot>
    }
}

module.exports = Table;