import React, { Component } from 'react';
import { Input, InputNumber } from 'antd';
import { Helper } from 'djmodules-utils'
// import Css from './style/style.css';

export default class extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let datas = this.props.datas || [];
        let { min, config } = this.props;
        if (min && min > datas.length) {
            min = min - datas.length;
            for (let i = 0; i < min; i++) {
                datas.push({});
            }
        }
        let fixed = this.props.fixed;
        let inputStyle = { border: 'none', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: 0, background: 'none' };
        let height = !config.title && !config.titleKey ? { height: 33 } : {}
        return (
            <div>
                {!datas || !datas.length || !config ? '' :
                    <div data-box="" className={'dj-table-box'} style={this.props.style} >
                        <div>
                            <ul
                                style={!fixed ? {} : { marginRight: -(fixed) - 1 }}
                                className={"dj-div-table"}
                                data-fixed={fixed || "0"}
                                data-extend={config.extendNum || '0'}
                            >
                                {datas.map((item, i) => (
                                    <li
                                        key={'li-' + i}
                                        style={Object.assign({}, !fixed ? {} : { width: (100 / Number(fixed)) + '%' }, height)}
                                        data-empty={item.title || item.titleKey ? '' : 'true'}
                                        data-class={'a' + (i + 1)}

                                    >
                                        <table>
                                            <tbody>
                                                {(!config.title && !config.titleKey) || !config.cloumns.length ? '' :
                                                    <tr key={'tr' + i} data-name="">
                                                        <td colSpan={config.cloumns.length} style={Object.assign({}, config.titleStyle || {}, item.style || {})}>{<span>{item[config.titleKey] || config.title}</span>}&nbsp;</td>
                                                    </tr>
                                                }
                                                <tr key={'tr-' + i} data-title={fixed ? 'show' : ''}>
                                                    {config.cloumns.map((itm, j) => {
                                                        let _min = item[itm.min] != undefined ? Number(item[itm.min]) : itm.min;
                                                        let _max = item[itm.max] != undefined ? Number(item[itm.max]) : itm.max;
                                                        return <td key={'td' + j} data-title={itm.title}>
                                                            {!itm.editType ?
                                                                <span style={Object.assign({}, itm.style || {}, item.style || {})}>{item[itm.keyName]}&nbsp;</span>
                                                                : ''}
                                                            {itm.editType === 'string' ?
                                                                <Input value={item[itm.keyName]}
                                                                    style={Object.assign({}, inputStyle, itm.style || {})}
                                                                    placeholder={itm.placeholder || item.placeholder || config.placeholder || ''}
                                                                    onFocus={(e) => {
                                                                        if (e.target.offsetWidth < 60) {
                                                                            e.target.style.textAlign = 'left';
                                                                        }
                                                                        let rule = itm.rule || config.rule || [];
                                                                        this.returnData(e, i, itm.keyName, rule)
                                                                    }}
                                                                    onBlur={(e) => {
                                                                        e.target.style.textAlign = 'center';
                                                                        let rule = itm.rule || config.rule || [];
                                                                        this.returnData(e, i, itm.keyName, rule)
                                                                    }}
                                                                    onChange={(e) => {
                                                                        let rule = itm.rule || config.rule || [];
                                                                        this.returnData(e, i, itm.keyName, rule)
                                                                    }}
                                                                />
                                                                : ''}
                                                            {itm.editType === 'number' ?
                                                                <InputNumber value={item[itm.keyName]}
                                                                    style={Object.assign({}, inputStyle, itm.style || {})}
                                                                    placeholder={itm.placeholder || item.placeholder || config.placeholder || ''}
                                                                    min={_min}
                                                                    max={_max}
                                                                    onFocus={(e) => {
                                                                        if (e.target.offsetWidth < 60) {
                                                                            e.target.style.textAlign = 'left';
                                                                        }
                                                                        let rule = itm.rule || config.rule || [];
                                                                        this.returnData(e, i, itm.keyName, rule)
                                                                    }}
                                                                    onBlur={(e) => {
                                                                        e.target.style.textAlign = 'center';
                                                                        let rule = itm.rule || config.rule || [];
                                                                        this.returnData(e, i, itm.keyName, rule)
                                                                    }}
                                                                    onChange={(e) => {
                                                                        let rule = itm.rule || config.rule || [];
                                                                        this.returnData(e, i, itm.keyName, rule)
                                                                    }}
                                                                />
                                                                : ''}
                                                            &nbsp;
                                                        </td>
                                                    })}
                                                </tr>
                                            </tbody>
                                        </table>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                }
            </div>
        );
    }
    returnData = (e, index, keyName, rule) => {
        let eventTypes = {
            'change': 'onChange',
            'focus': 'onFocus',
            'blur': 'onBlur',
        }
        let eventType = eventTypes.change;
        if (e instanceof Object) {
            eventType = eventTypes[e.type];
        }
        if (!(rule instanceof Array)) {
            rule = [];
        }
        let { datas } = this.props;
        // if (rule[1] && typeof rule[1] === 'string' && datas[index]){
        //     rule[1]=Number(datas[index][rule[1]]) || null;
        // }
        let value = Helper.changeValue(e, rule[0], rule[1], rule[2]);
        datas[index][keyName] = value;
        this.setState({ datas }, () => {
            if (this.props[eventType]) {
                let data = Object.assign({}, {
                    datas: JSON.parse(JSON.stringify(datas)),
                    eventType
                }, { current: datas[index] })
                this.props[eventType](data);
            }
        })
    }
}