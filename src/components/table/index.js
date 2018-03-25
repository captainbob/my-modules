import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { Icon } from 'antd'
import classNames from 'classnames'

class Table extends Component {
    static defaultProps = {
        prefixCls: 'dj-table',
        columns: [],
        rowClassName: function (record, index) {
            return ''
        },
        dataSource: [],
        rowKey: function (record, index) {
            return record.key
        },
        rowHeader: function (record, index) {
            return undefined
        }
    }

    static propTypes = {
        prefixCls: PropTypes.string,
        /**
         *  {
         *      key
         *      title
         *      width
         *      algin
         *      className:(record, index)
         *      render(record, index)
         *  }
         */
        columns: PropTypes.array,
        rowClassName: PropTypes.func,
        rowKey: PropTypes.func,
        rowHeader: PropTypes.func,
        dataSource: PropTypes.array
    }

    render() {
        const { prefixCls, columns, dataSource, rowHeader, rowKey, rowClassName } = this.props
        const tableCls = classNames(`${prefixCls}`)

        const cols = columns.map((column, index) => {
            return <col key={column.key} width={column.width}></col>
        })

        const datas = dataSource.map((data, index) => {
            let header = rowHeader(data, index)
            const rowCls = rowClassName(data, index)
            header = header ? <tr>
                <td colSpan={columns.length} className={classNames(`${prefixCls}-row-header`, rowCls)}>
                    {header}
                </td>
            </tr> : undefined

            const cols = columns.map((column, index) => {
                const className = column.className ? column.className(data, index) : ''
                const align = column.align || 'left'
                return <td key={column.key} className={classNames(`${prefixCls}-td`, `${prefixCls}-text-${align}`, className, rowCls)}>
                    {column.render(data, index)}
                </td>
            })
            const key = rowKey(data, index)
            return <tbody key={key}>
                {
                    header ? <tr>
                        <td className={classNames(`${prefixCls}-row-blank`)}></td>
                    </tr> : undefined
                }
                {header}
                <tr>
                    {cols}
                </tr>
            </tbody>
        })

        const headers = columns.map((column, index) => {
            const className = column.className ? column.className(undefined, index) : ''
            const align = column.align || 'left'
            return <th key={column.key} className={classNames(`${prefixCls}-th`, `${prefixCls}-text-${align}`, className)}>{column.title}</th>
        })

        return (
            <table className={tableCls} cellPadding={0} cellSpacing={0}>
                <colgroup>
                    {cols}
                </colgroup>
                <thead>
                    <tr>
                        {headers}
                    </tr>
                </thead>
                {
                    datas.length == 0 ? <tbody>
                        <tr>
                            <td colSpan={columns.length} className={classNames(`${prefixCls}-no-data`)}>
                                <Icon type="frown-o" />&nbsp;&nbsp;暂无数据
                            </td>
                        </tr>
                    </tbody> : datas
                }
            </table>
        )
    }
}

module.exports = Table