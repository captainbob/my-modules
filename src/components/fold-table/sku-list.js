import React, { Component } from 'react';
import TableList from './table-list';

class SkuTableCount extends Component {
    constructor(props) {
        super(props);
        this.state = {
            datas: []
        }
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
                                                titleKey: 'sizeName',
                                                // rule:[0,'stock'],   //过滤字符，字符长度
                                                placeholder: '请填写',
                                                cloumns: [
                                                    { title: '可用库存', keyName: 'stock' },    //,style:{color:'red'}
                                                    { title: '入库数', keyName: 'paperNum', editType: 'number', placeholder: '请填写' }     //,editType:'string'
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

export default SkuTableCount;