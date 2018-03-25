import React, { Component } from 'react';
import { Icon } from 'antd';

/**
 * 图片展示块
 */
export default class PicShowBlock extends Component {
    constructor(props) {
        super(props);
    }

    onClick(e) {
        if (this.props.onClick) {
            this.props.onClick(this.props.picId, this.props.originalUrl, !this.props.checked)
        }
    }
    render() {
        let checkedClass = "imgShow " + (this.props.checked ? "imgShowChecked" : "");
        return (
            <div className={checkedClass}
                title={this.props.picName}
                onClick={this.onClick.bind(this)}>
                {this.props.deleteable ? "" : <div className="imgShowName">{this.props.picName}</div>}
                <img src={this.props.url} style={{ width: 80 }} />
                {this.props.deleteable ? <div className="imgShowDel"><Icon type="close-circle" onClick={this.props.onDelete} /></div> : ""}
                {this.props.checked ? (<Icon className="checkedIcon" type="check-circle"
                    style={{ fontSize: '21px', color: '#22d408', width: 20, height: 20, borderRadius: "10px", backgroundColor: "white" }} />) : ""}
                {this.props.deleteable ? "" : <div className="imgShowSize">{this.props.picWidth}×{this.props.picHeight}</div>}
            </div>
        );
    }
}