import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Upload, Icon, Modal, Button, message } from 'antd';
import Remote from './remote';


export default class PicUpload extends Component {
    constructor(props) {
        super(props);
        this.state = {
            previewVisible: false,
            previewImage: '',
            fileList: [],
            signData: {},
            currentCat: 0,
            fileMap: {},
            uploadData: {},
        }
    }
    componentWillMount() {
        //初始化签名
        Remote.signature().then((json) => {
            this.setState({
                signData: json
            });
        });
    }
    render() {
        let signData = this.state.signData;
        if (typeof signData == "string") {
            signData = JSON.parse(signData);
        }
        if (location.href.startsWith("https")) {
            signData.endpoint = signData.endpoint ? signData.endpoint.replace("http://", "https://") : 'https://img.dianjia.io/';
        }
        const { previewVisible, previewImage, fileList, uploadData } = this.state;
        const uploadButton = (
            <div style={{ fontSize: '28px', color: '#999999' }}>
                <Icon type="plus" />
                <div className="ant-upload-text" style={{ marginTop: 8, fontSize: 12, color: '#666666' }}>选择图片</div>
            </div>
        );
        const divStyle = Object.assign({ minHeight: 104, display: 'inline-block', verticalAlign: 'text-top' }, this.props.style);
        return (
            <div className="clearfix" style={divStyle} >
                <Upload
                    accept={`image/${this.props.format ? this.props.format : '*'}`}
                    action={signData.endpoint}
                    listType="picture-card"
                    fileList={fileList}
                    onPreview={this.handlePreview}
                    onChange={this.handleChange}
                    data={uploadData}
                    beforeUpload={this.beforeUpload}>
                    {fileList.length >= this.props.limit ? null : uploadButton}
                </Upload>
                <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
                    <img alt="example" style={{ width: '100%' }} src={previewImage} />
                </Modal>
            </div>
        )
    }

    beforeUpload = (file, fileList) => {
        const fileNameArr = file.name.split('.');
        if (fileNameArr[1] === 'gif') {
            message.warn('不支持gif类型');
            return false;
        }
        const signData = this.state.signData;
        const timeStamp = new Date().getTime();
        this.setState({
            uploadData: {
                Filename: `${file.name}`,
                key: `${signData.dir}/${this.props.projectName ? this.props.projectName : 'normal'}/${file.name}`,
                policy: signData.policyBase64,
                OSSAccessKeyId: signData.accessId,
                success_action_status: '200', //让服务端返回200,不然，默认会返回204
                signature: signData.signature,
            }
        })
    }

    handleCancel = () => this.setState({ previewVisible: false })

    handlePreview = (file) => {
        this.setState({
            previewImage: file.url || file.thumbUrl,
            previewVisible: true,
        });
    }

    handleChange = ({ file, fileList, event }) => {
        this.setState({ fileList })
        if (file.status === 'done' && this.props.completeUpload) {
            this.props.completeUpload(this.state.signData, fileList);
        }
    }
}

PicUpload.propTypes = {
    limit: PropTypes.number,
    completeUpload: PropTypes.func,
    projectName: PropTypes.string,
    format: PropTypes.string,
}
