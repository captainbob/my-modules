import React, { Component } from 'react';
import { RoleBasePropProvider } from '../remote';
import { Select } from 'antd';

const Option = Select.Option;

class RoleSelect extends Component {
    roleBasePropProvider;
    constructor(props, context) {
        super(props, context);
        this.roleBasePropProvider = new RoleBasePropProvider(props.veidoo);
        this.state = {
            datas: [],
            props: []
        };
    }

    componentDidMount() {
        let _this = this;
        this.roleBasePropProvider.getData(e => {
            _this.setState({
                datas: e.resultObject
            });
            _this.setState({
                props: _this.props
            });
        });
    }

    render() {
        let props = this.props;
        let _this = this;
        return (
            <Select {...props} >
                {(() => {
                    let options = [];
                    if (_this.state && _this.state.datas) {
                        for (let i = 0; i < _this.state.datas.length; i++) {
                            let element = _this.state.datas[i];
                            if (userInfo && userInfo.roleId != 4 && element.roleId == 4) {
                                continue;
                            }
                            options.push(<Option key={element.roleId} value={element.roleId}>{element.name}</Option>)
                        }
                    }
                    return options;
                })()}
            </Select>
        );
    }
}

export default RoleSelect;
