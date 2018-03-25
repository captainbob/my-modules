import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';
import Remote from './remote';

/**
 * 属性: 上一级传过来
 * onChoice：外面的回调
 * visible: 调用使其可以可现
 * hidePicModal: 使其不可见
 * showPromptly: 立即调用获取图片接口
 * mode： multi 多选
 */
export default class PicChoiceForm extends Component {

    constructor(props) {
        super(props);
    }


    componentDidMount() {

    }
    componentWillReceiveProps(nextProps) {

    }
    render() {


        return (
            <div ref="uploadDiv" className="picAdd" style={{ position: "relative", height: 30 }}>
                <div className="fileSelect" style={{
                    position: "absolute", border: "1px #49a9ee solid",
                    padding: "0px 20px", backgroundColor: "#49a9ee", color: "white",
                    height: 30, lineHeight: "30px"
                }}>选择图片</div>
                <input id="picFormFile" ref="picFormFile" type="file" name="picFile"
                    style={{ opacity: 0, width: 90, height: 30 }} />
            </div>
        );
    }
}