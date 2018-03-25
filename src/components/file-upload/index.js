import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Upload, Icon, Modal, Button } from 'antd';
import { HttpUtil } from 'djmodules-utils/lib';
import FileUtils from './file-utils';
import md5 from 'blueimp-md5';
import FileCollector from './file-collector';
import classNames from 'classnames';

const { getFileIconByFileType, getFileIconByUrl, getFileNameByUrl, isImage } = FileUtils;
const fileCollector = new FileCollector();

let uid = -1;


function _uuid(len, radix) {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    var uuid = [], i;
    radix = radix || chars.length;
    if (len) {
        // Compact form
        for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
    } else {
        // rfc4122, version 4 form
        var r;

        // rfc4122 requires these characters
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
        uuid[14] = '4';

        // Fill in random data.  At i==19 set the high bits of clock sequence as
        // per rfc4122, sec. 4.1.5
        for (i = 0; i < 36; i++) {
            if (!uuid[i]) {
                r = 0 | Math.random() * 16;
                uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
            }
        }
    }
    return uuid.join('');
}

function uuid() {
    return `${_uuid(16, 16)}-${(new Date()).getTime()}`;
}

const uploadFiles = (files) => {
    files = files || [];
    return new Promise((resolve, reject) => {
        for (let i = 0; i < files.length; i++) {
            if (files[i].status != 'done') {
                return reject('存在未上传成功的文件');
            }
        }

        if (files.length == 0) {
            return resolve({});
        }

        const sourceUrls = [];

        const defaultFiles = files.filter(file => {
            return file.defaultFile;
        });

        const uploadFiles = files.filter(file => {
            return !file.defaultFile;
        });

        uploadFiles.forEach(file => {
            sourceUrls.push({
                key: file.config.key,
                sourceUrl: file.config.key,
                fileName: file.config.Filename,
                catalogPath: file.module
            });
        });

        const keyGroupMap = {};
        uploadFiles.forEach(file => {
            keyGroupMap[file.config.key] = file.group;
        });

        HttpUtil.promisePost('pic/base/upload_sures_form', {
            sourceUrls: JSON.stringify(sourceUrls)
        }).then(response => {
            response = response || [];
            const result = {};
            response.forEach(item => {
                const group = keyGroupMap[item.key];
                if (!result[group]) {
                    result[group] = [];
                }
                result[group].push(item.prodUrl);
            });

            defaultFiles.forEach(item => {
                const group = item.group;
                if (!result[group]) {
                    result[group] = [];
                }
                result[group].push(item.url);
            });

            resolve(result);
        }).catch(err => {
            reject(err.message || err.exceptionMessage || '系统异常，请稍后重试！');
        });
    });
}

export default class FileUpload extends Component {
    static propTypes = {
        group: PropTypes.string.isRequired,
        limit: PropTypes.number,
        buttonTitle: PropTypes.string,
        prefixCls: PropTypes.string,
        module: PropTypes.string,
        listType: PropTypes.oneOf(['text', 'picture', 'picture-card']),
        beforeUpload: PropTypes.func,
        fileList: PropTypes.array,

    }

    static defaultProps = {
        limit: 1,
        buttonTitle: '上传文件',
        prefixCls: 'dj-file-upload',
        module: 'public',
        listType: 'picture',
        fileList: []
    }

    static contextTypes = {
        dj_file_upload_instance_id: PropTypes.string
    }

    state = {
        previewVisible: false,
        previewImage: '',
        fileList: [],
        config: {}
    };

    collect = (id) => {
        let group = this.props.group;
        if (this.context.dj_file_upload_instance_id) {
            group = this.props.group + this.context.dj_file_upload_instance_id;
        }
        if (id == group) {
            return this.state.fileList;
        }
    }

    handleCancel = () => this.setState({ previewVisible: false })

    handlePreview = (file) => {
        let previewImage = file.url || file.thumbUrl;
        if (file.defaultFile) {
            if (!isImage(file.url)) {
                previewImage = file.thumbUrl;
            }
        }
        this.setState({
            previewImage: previewImage,
            previewVisible: true,
        });
    }

    handleChange = ({ file, fileList, event }) => {
        if (!file.defaultFile) {
            file.thumbUrl = getFileIconByFileType(file.type);
            file.config = this.data(file);
            file.group = this.props.group;
            file.module = 'dj-file-upload-store-center/' + this.props.module;
        }

        if (this.props.onChange) {
            this.props.onChange(fileList);
        } else {
            this.setState({ fileList });
        }
    };

    componentWillUnmount() {
        fileCollector.remove(this.collect);
    }

    mapToFileList = (fileList) => {
        return fileList.map(file => {
            if (typeof file == 'string') {
                return {
                    name: getFileNameByUrl(file),
                    status: 'done',
                    uid: md5(file),
                    url: file,
                    thumbUrl: isImage(file) ? file : getFileIconByUrl(file),
                    defaultFile: true,
                    group: this.props.group
                }
            } else {
                //file.thumbUrl = isImage(file) ? file : getFileIconByUrl(file);
                //file.defaultFile = true;
                //file.status = 'done';
                //file.group = this.props.group;
                return file;
            }
        });
    }

    componentDidMount() {
        fileCollector.add(this.collect);
        if (this.props.fileList && this.props.fileList.length > 0) {
            this.setState({ fileList: this.mapToFileList(this.props.fileList) });
        } else if (this.props.defaultFileList && this.props.defaultFileList.length > 0) {
            this.setState({ fileList: this.mapToFileList(this.props.defaultFileList) });
        }
        HttpUtil.promiseGet('pic/base/signature').then(response => {
            if (document.location.href.startsWith('https')) {
                response.endpoint = response.endpoint ? response.endpoint.replace("http://", "https://") : 'https://img.dianjia.io/';
            }
            this.setState({ config: response || {} });
        }).catch(err => {
        });
    }

    componentWillReceiveProps(nextProps, nextState) {
        if (nextProps.fileList && this.props.fileList) {
            if (nextProps.fileList != this.props.fileList) {
                this.setState({ fileList: this.mapToFileList(nextProps.fileList) });
            }
        }
    }

    getFileName = (file) => {
        const fileComponents = file.name.split('.') || [];
        let ext = '';
        if (fileComponents.length > 1) {
            ext = '.' + fileComponents[fileComponents.length - 1];
        }

        if (fileComponents.length > 1) {
            fileComponents.pop();
        }

        const name = fileComponents.join('.');

        //alert(`${name}${(file.uid || '').replace('rc-upload-', '')}${ext}`)

        return `${name}${(file.uid || '').replace('rc-upload-', '')}${ext}`;

    }

    data = (file) => {
        const { signature, accessId, policyBase64, dir } = this.state.config;
        // let fileName = md5(`${file.uid}-${file.lastModified}-${this.props.module}-${file.name}`);
        // const fileComponents = file.name.split('.') || [];
        // if (fileComponents.length > 1) {
        //     fileName += '.' + fileComponents[fileComponents.length - 1];
        // }
        const fileName = this.getFileName(file);
        return {
            Filename: fileName,
            key: `${dir}/${fileName}`,
            policy: policyBase64,
            OSSAccessKeyId: accessId,
            success_action_status: '200', //让服务端返回200,不然，默认会返回204
            signature: signature,
        }
    }

    beforeUpload = (file) => {
        if (this.props.beforeUpload) {
            return this.props.beforeUpload(file.originFileObj || file);
        }
        return true;
    }

    render() {
        const { previewVisible, previewImage, fileList } = this.state;

        let uploadButton = (() => {
            if (this.props.listType == 'picture-card') {
                return <div>
                    <Icon type="plus" style={{ fontSize: 28 }} />
                    <div className="ant-upload-text">{this.props.buttonTitle}</div>
                </div>
            } else {
                return <Button>
                    <Icon type="upload" /> {this.props.buttonTitle}
                </Button>
            }
        })();

        if (React.Children.count(this.props.children) > 0) {
            if (React.Children.only(this.props.children)) {
                uploadButton = this.props.children;
            }
        }

        let clsname = this.props.listType == 'picture' ? `${this.props.prefixCls}-list-style` : undefined;
        clsname = classNames(clsname, this.props.className);

        return (
            <div>
                <Upload
                    className={clsname}
                    beforeUpload={this.beforeUpload}
                    action={this.state.config.endpoint}
                    listType={this.props.listType}
                    fileList={fileList}
                    data={this.data}
                    onPreview={this.handlePreview}
                    onChange={this.handleChange}>
                    {fileList.length >= this.props.limit ? null : uploadButton}
                </Upload>
                <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
                    <img alt="图片预览" style={{ width: '100%' }} src={previewImage} />
                </Modal>
            </div>
        )
    }
}


FileUpload.create = () => {
    return (target) => {
        return class extends Component {
            constructor(props) {
                super(props);
                this.uuid = uuid();
            }

            render() {
                return React.createElement(target, Object.assign({}, this.props, {
                    fileUploadManager: {
                        getUploadDecorator: this.getUploadDecorator
                    }
                }));
            }

            static childContextTypes = {
                dj_file_upload_instance_id: PropTypes.string
            }

            getChildContext() {
                return {
                    dj_file_upload_instance_id: this.uuid
                }
            }

            getUploadDecorator = (groups, options) => {
                if (typeof groups == 'string') {
                    groups = [groups];
                }
                if (Array.isArray(groups)) {
                    groups = groups.map(group => {
                        return group + this.uuid;
                    });
                }
                return FileUpload.getUploadDecorator(groups, options);
            }
        }
    }
}

class FileUploadDecorator extends Component {
    render() {
        const { element, elementProps } = this.props;
        return React.cloneElement(element, elementProps);
    }
}

FileUpload.getUploadDecorator = (groups, options) => {
    return (element) => {
        if (!React.isValidElement(element)) {
            throw new Error(`element ${element} must be a react element`);
        } else {

            if (element.props.onClick) {
                return console.warn('getUploadDecorator will auto invoke the onClick event, you can set your own onClick event in options!');
            }

            const props = {
                onClick: () => {
                    //收集文件
                    let files = [];
                    if (typeof groups == 'string') {
                        files = fileCollector.collect(groups);
                    } else if (Array.isArray(groups)) {
                        files = groups.reduce((pre, next) => {
                            const tmpFiles = fileCollector.collect(next) || [];
                            pre.push(...tmpFiles);
                            return pre;
                        }, []);
                    } else {
                        throw new Error('groups can only be string or array of string!');
                    }

                    //验证文件有效性
                    if (options.validator) {
                        const groupFileMap = files.reduce((pre, next) => {
                            if (!pre[next.group]) {
                                pre[next.group] = [];
                            }
                            pre[next.group].push(next.originFileObj || next.url);
                            return pre;
                        }, {}) || {};
                        const groupFileList = Object.keys(groupFileMap).reduce((pre, next) => {
                            pre.push({ group: next, fileList: groupFileMap[next] });
                            return pre;
                        }, []) || [];

                        for (let i = 0; i < groupFileList.length; i++) {
                            if (!options.validator(groupFileList[i].group, groupFileList[i].fileList)) {
                                return;
                            }
                        }
                    }

                    //上传文件
                    const fileUploadTask = uploadFiles(files);
                    if (options.onClick) {
                        options.onClick(fileUploadTask);
                    }
                }
            };
            return <FileUploadDecorator element={element} elementProps={props}></FileUploadDecorator>
        }
    }
}