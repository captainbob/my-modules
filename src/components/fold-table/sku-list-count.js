
import React, { Component } from 'react';
import TableList from './table-list';

class SkuTable extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let { config, dataJson } = this.props;
        let dataKey = config && config.dataKey ? config.dataKey : 'sku';
        let countKey = config && config.countKey ? config.countKey : 'count';
        let minNumber = Math.max.apply(null, dataJson.map(item => item[dataKey].length));
        let tdStyle = { position: 'relative', zIndex: 10, background: '#ffffff', borderTop: '1px solid #DDDDDD', textAlign: 'center' }
        return (
            <div style={{ border: '1px solid #CCCCCC', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderSpacing: 0, position: 'relative', right: -1, top: -1, marginBottom: -1 }}>
                    <tbody>
                        {dataJson.map((item, i) =>
                            <tr key={i} data-hide-header={i > 0 ? "true" : ''}>
                                <td style={Object.assign({ width: 100 }, tdStyle, i == 0 ? { borderTop: 'none' } : {})}>
                                    {i > 0 ? '' :
                                        <div style={{ position: 'absolute', top: 0, left: -1, width: '100000px', height: '33px', lineHeight: '36px', background: '#EEEEEE', fontWeight: 'bold', borderBottom: '1px solid #cccccc' }}>
                                            <div style={{ width: 100 }}>{config && config.title ? config.title : '颜色'}</div>
                                        </div>
                                    }
                                    <div style={{ position: 'relative', top: i > 0 ? 0 : 17 }}>{config && config.rowTitleKey ? item[config.rowTitleKey] || config.rowTitleKey || item.color : item.color}</div>
                                </td>
                                <td style={{ verticalAlign: 'top', }}>
                                    <TableList
                                        style={{ marginTop: -2, marginBottom: -1 }} min={minNumber}
                                        datas={item[dataKey]}
                                        config={
                                            this.props.config || {
                                                titleKey: 'name',
                                                //rule:['%|&',5],   //过滤字符，字符长度
                                                cloumns: [
                                                    { title: '单据数', keyName: 'billNum' },    //,style:{color:'red'}
                                                    { title: '入库数', keyName: 'paperNum' },
                                                    { title: '差异数', keyName: 'diffNum' },     //,editType:'string'
                                                ],
                                                extendNum: 0    //扩展值 1，2，3
                                            }
                                        }
                                        onFocus={(data) => {
                                            return this.props.onFocus ? this.props.onFocus(this.changeData(data, item)) : null;
                                        }}
                                        onChange={(data) => {
                                            return this.props.onChange ? this.props.onChange(this.changeData(data, item)) : null;
                                        }}
                                        onBlur={(data) => {
                                            return this.props.onBlur ? this.props.onBlur(this.changeData(data, item)) : null;
                                        }}
                                    />
                                </td>
                                <td style={{ verticalAlign: 'top', width: this.props.rightConfig ? this.props.rightConfig.width : 160 }}>
                                    {<TableList datas={[item[countKey]]} fixed="1" title="-合计-" style={{ margin: '-2px 0 -1px -1px' }}
                                        config={
                                            this.props.rightConfig || this.props.config || {
                                                title: '合计',
                                                cloumns: [
                                                    { title: '单据数', keyName: 'billNum' },
                                                    { title: '入库数', keyName: 'paperNum' },
                                                    { title: '差异数', keyName: 'diffNum', editType: 'number' }
                                                ]
                                            }
                                        }
                                        onFocus={(data) => {
                                            let _data = this.changeData(data, item);
                                            _data.current.type = 2;
                                            return this.props.onFocus ? this.props.onFocus(Object.assign({}, _data)) : null;
                                        }}
                                        onChange={(data) => {
                                            let _data = this.changeData(data, item);
                                            _data.current.type = 2;
                                            return this.props.onChange ? this.props.onChange(Object.assign({}, _data)) : null;
                                        }}
                                        onBlur={(data) => {
                                            let _data = this.changeData(data, item);
                                            _data.current.type = 2;
                                            return this.props.onBlur ? this.props.onBlur(Object.assign({}, _data)) : null;
                                        }}
                                    />}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        );
    }
    changeData(data, item) {
        let { config } = this.props;
        let rowKey = config && config.rowTitleKey ? config.rowTitleKey : 'color';
        let idKey = config && config.idKey ? config.idKey : 'id'
        let current = Object.assign({ [rowKey]: item[rowKey] }, item[idKey] ? { [idKey]: item[idKey] } : {}, data.current);
        data.current = current;
        return Object.assign({}, data);
    }
}

export default SkuTable;