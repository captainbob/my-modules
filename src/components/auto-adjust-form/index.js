import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from 'antd';

const MODE_CLOSE = 'close';
const MODE_OPEN = 'open';

const DELTA = 5;

const DEFAULT_HEIGHT = 32;

const MARGIN = 10;

const FONT_SIZE = 12;

class AutoAdjustForm extends Component {

    static propTypes = {
        onSearch: PropTypes.func, //搜索
        onClear: PropTypes.func, //清空
        onCollapseChange: PropTypes.func, //折叠
        mode: PropTypes.string, //默认折叠状态
        noclear: PropTypes.bool, //是否有清空功能 open | close
        nocollapse: PropTypes.bool //是否有折叠功能
    }

    static defaultProps = {
        mode: MODE_CLOSE
    }

    constructor(props) {
        super(props);
        this.state = {
            mode: props.mode || MODE_CLOSE,
            width: 0
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.mode != nextProps.mode) {
            this.setState({ mode: nextProps.mode });
        }
    }

    componentDidMount() {
        window.addEventListener('resize', this.onResize);
        this.onResize();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.onResize);
    }

    onResize = () => {
        this.setState({ width: this.refs.container.clientWidth });
    }

    render() {
        const renderItems = this.myRender(this.props.children);
        return <div ref='container' style={this.props.style}>
            {
                renderItems.items
            }
            {this.state.mode == MODE_OPEN ? <div style={{ clear: 'both' }}></div> : null}
            <div style={{ marginLeft: renderItems.margin, float: this.state.mode == MODE_OPEN ? '' : 'left', marginTop: MARGIN, height: DEFAULT_HEIGHT, lineHeight: DEFAULT_HEIGHT + 'px' }}>
                <Button type='primary' onClick={this.props.onSearch}>查询</Button>
                {this.props.noclear ? null : <Button type='default' style={{ marginLeft: MARGIN }} onClick={this.props.onClear}>清空条件</Button>}
                {this.props.nocollapse ? null : <label style={{ marginLeft: MARGIN, cursor: 'pointer', color: '#108ee9' }}>{this.state.mode == MODE_OPEN ? <span onClick={this.onClose}>收起 <Icon type="up" /></span> : <span onClick={this.onOpen}>展开全部 <Icon type="down" /></span>}</label>}
            </div>
            <div style={{ clear: 'both', height: MARGIN }}></div>
        </div>
    }


    get btnWidth() {
        let width = 60 + 80 + MARGIN + 64 + MARGIN;
        if (this.props.noclear === true) {
            width -= (MARGIN + 80);
        }
        if (this.props.nocollapse === true) {
            width -= (MARGIN + 64);
        }
        return width;
    }


    onOpen = () => {
        this.setState({
            mode: MODE_OPEN
        }, () => {
            this.onCollapseChange(MODE_OPEN);
        });
    }

    onClose = () => {
        this.setState({
            mode: MODE_CLOSE
        }, () => {
            this.onCollapseChange(MODE_CLOSE);
        });
    }

    onCollapseChange = (value) => {
        if (this.props.onCollapseChange) {
            this.props.onCollapseChange(value);
        }
        this.dispatchEvent(value);
    }

    dispatchEvent = (value) => {
        const dispatchEvent = document.createEvent('HTMLEvents')
        dispatchEvent.initEvent('autoadjustformcollapse', true, true)
        dispatchEvent.payload = {value};
        document.dispatchEvent(dispatchEvent)
    }

    getLabelWidth = (item) => {
        let width = item.props.labelWidth;
        if (typeof width == 'undefined') {
            width = item.props.label.length * FONT_SIZE;
        }
        width += FONT_SIZE;
        return width;
    }

    myRender = (children) => {
        let items = []
        React.Children.forEach(children, (item) => {
            if (item && item.type == AutoAdjustForm.Item) {
                items.push(item);
            }
        });
        let margin = MARGIN;
        switch (this.state.mode) {
            case MODE_CLOSE:
                let startHiddenIndex = -1;
                let currentWidth = 0;
                for (let index = 0; index < items.length; index++) {
                    const item = items[index];
                    const width = this.getLabelWidth(item) + item.props.contentWidth;
                    if (currentWidth + MARGIN + width + this.btnWidth + MARGIN >= this.state.width) {
                        startHiddenIndex = index;
                        break;
                    }
                    currentWidth += width + MARGIN;
                }
                items = items.map((item, index) => {
                    if (index >= startHiddenIndex && startHiddenIndex != -1) {
                        return React.cloneElement(item, { _labelWidth: this.getLabelWidth(item), _contentWidth: item.props.contentWidth, display: 'none' });
                    }
                    return React.cloneElement(item, { _labelWidth: this.getLabelWidth(item), _contentWidth: item.props.contentWidth, display: 'block' });
                });
                break;
            case MODE_OPEN:
                let maxLabelWidth = 0;
                items.forEach(item => {
                    let width = this.getLabelWidth(item);
                    if (maxLabelWidth < width) {
                        maxLabelWidth = width;
                    }
                });
                let maxContentWidth = 0;
                items.forEach(item => {
                    let width = item.props.contentWidth;
                    if (maxContentWidth < width) {
                        maxContentWidth = width;
                    }
                });
                items = items.map(item => {
                    return React.cloneElement(item, { _labelWidth: maxLabelWidth, _contentWidth: item.props.contentWidth, display: 'block' });
                });
                margin = maxLabelWidth + MARGIN;
                break;
        }
        return {
            items,
            margin
        };
    }
}

class AutoAdjustFormItem extends Component {
    static propTypes = {
        label: PropTypes.string,
        labeWidth: PropTypes.number,
        contentWidth: PropTypes.number
    }
    render() {
        const labelWidth = this.props._labelWidth;
        const contentWidth = this.props._contentWidth;
        const defaultStyle = {
            height: DEFAULT_HEIGHT,
            float: 'left',
            marginLeft: MARGIN,
            marginTop: MARGIN,
            display: this.props.display || 'block'
        }
        const style = Object.assign({}, defaultStyle, this.props.style, { width: labelWidth + contentWidth });
        return <div style={style}>
            <div style={{ textAlign: 'right', float: 'left', width: labelWidth, height: style.height, lineHeight: style.height + 'px', color: 'rgba(0, 0, 0, 0.85)' }}>{this.props.label}：</div>
            <div style={{ float: 'left', width: contentWidth, height: style.height, lineHeight: style.height + 'px' }}>{React.Children.only(this.props.children)}</div>
            <div style={{ clear: 'both' }}></div>
        </div>
    }
}

AutoAdjustForm.Item = AutoAdjustFormItem;

module.exports = AutoAdjustForm;