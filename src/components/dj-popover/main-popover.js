import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Popover, Input, Icon } from 'antd';
import { HttpUtil } from 'djmodules-utils/lib';

const InputGroup = Input.Group;
function filterObjectNull(obj) {
    let retObj = {};
    for (let key in obj) {
        if (obj[key] != null && obj[key] != undefined && obj[key] != '') {
            retObj[key] = obj[key]
        }
    }
    return retObj
}

class DjFilterPopover extends Component {
    state = {
        selectedIds: [],
        selectedDatas: {}
    }

    render() {
        let { selectedIds } = this.state;
        let content = React.createElement(this.props.content, {
            handleToggle: this.handleToggle,
            selectedIds: selectedIds
        })
        let { value, handleSelect, tipName, ..._props } = this.props;
        return (
            <div>
                <Popover
                    placement={this.props.placement || "bottomRight"}
                    title={this.props.title}
                    content={content}
                    trigger="click"
                    getPopupContainer={this.props.getPopupContainer}
                >
                    {/*可以自定义children*/}
                    {this.props.children ? this.props.children : (
                        <div style={{ width: '100%' }}>
                            <Input
                                value={value ? (selectedIds.length > 0 ? `已选择了${selectedIds.length}个${this.props.tipName}` : undefined) : undefined}
                                placeholder={'请选择' + this.props.tipName}
                                {..._props}
                            />
                        </div>
                    )}
                </Popover>
            </div>
        );
    }

    handleToggle = (id, data) => {
        let selectedIds = this.state.selectedIds.concat();
        let selectedDatas = Object.assign({}, this.state.selectedDatas);
        const index = selectedIds.indexOf(id);
        if (index == -1) {
            selectedDatas[id] = data;
            selectedIds = selectedIds.concat([id]);
            this.setState({
                selectedIds,
                selectedDatas
            });
        } else {
            selectedDatas[id] = null;
            selectedIds = [
                ...selectedIds.slice(0, index),
                ...selectedIds.slice(index + 1)
            ]
            this.setState({
                selectedIds,
                selectedDatas
            });
        }
        if (typeof this.props.handleSelect === 'function') {
            this.props.handleSelect({
                selectedIds,
                selectedDatas: filterObjectNull(selectedDatas)
            })
        }
        if (typeof this.props.onChange === 'function') {
            this.props.onChange({
                selectedIds,
                selectedDatas: filterObjectNull(selectedDatas)
            })
        }
    }
}
DjFilterPopover.propTypes = {
    handleSelect: PropTypes.func.isRequired,
    tipName: PropTypes.string,
    title: PropTypes.string,
}
export default DjFilterPopover