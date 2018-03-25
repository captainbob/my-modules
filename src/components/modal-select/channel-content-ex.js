import React, { Component } from 'react';
import { Input, Icon } from 'antd';
import PropTypes from 'prop-types';
import ChannelSelect from './channel-content';

export default class extends Component {
    static propTypes = {
        mode: PropTypes.oneOf(['radio', 'checkbox'])
    }
    static defaultProps = {
        mode: 'radio'
    }
    render() {
        return <ChannelSelect
            rowSelectType={this.props.mode}
            style={this.props.style}
            modalTitle='选择退货渠道'
            veidoo="channelData"
            ref={type => this.channelSelect = type}
            handleSelect={this.handleSelect}
            veidoo='channelData'>
            <Input
                suffix={<Icon onClick={() => { if (!this.props.disabled) this.channelSelect.showModal() }} type="home" />}
                style={{ width: "100%" }}
                placeholder="选择退货渠道"
                onChange={this.onChange}
                onClick={!this.props.allowInput ? () => { this.channelSelect.showModal() } : () => { }}
                value={this.getDisplayLabel()}
            />
        </ChannelSelect>
    }

    getDisplayLabel() {
        if (Array.isArray(this.props.value)) {
            return `已选择${this.props.value.length}项`
        }
        if (typeof this.props.value == 'object') {
            return (this.props.value || {}).name;
        }

        return this.props.value;
    }

    onChange = (event) => {
        if (this.props.allowInput) {
            this.props.onChange(event.target.value);
        }
    }

    handleSelect = (value) => {
        if (this.props.onChange) {
            if (this.props.mode == 'radio') {
                this.props.onChange({
                    name: (((value || {})[0] || {}).brandChannelAtom || {}).channelName,
                    id: (((value || {})[0] || {}).brandChannelAtom || {}).channelId,
                });
            } else {
                value = (value || []).map(item => {
                    console.log(item)
                    return {
                        name: (((item || {}) || {}).brandChannelAtom || {}).channelName,
                        id: (((item || {}) || {}).brandChannelAtom || {}).channelId,
                    }
                });
                this.props.onChange(value);
            }
        }
    }
}