import React, { Component } from 'react';
import { Icon, Modal, Button, message, Table, Layout, Progress } from 'antd';
import PicCatalog from './pic-catalog'
import Remote from './remote'

const { Header, Footer, Sider, Content } = Layout;

Array.prototype.remove = function (object) {
    let index = this.indexOf(object);
    if (index > -1) {
        this.splice(index, 1);
    }
};

Array.prototype.removeAt = function (index) {
    if (index > -1) {
        this.splice(index, 1);
    }
};
/**
 * excel导出
 */
let _this;
export default class PicUpload extends Component {

    constructor(props) {
        super(props);
        _this = this;
        this.state = {
            files: [],
            signData: {},
            fileMap: {}
        }
        this.refrash = this.refrash.bind(this);
    }

    onCatalogSelect = (node) => {
        if (this.props.onCatalogSelect) {
            return this.props.onCatalogSelect(node)
        }
        return false;
    }

    componentDidMount() {
        //初始化签名
        Remote.signature().then((json) => {
            _this.setState({
                signData: json
            });
            _this.initUpload()

        });
    }
    startWith = (s, str) => {
        let reg = new RegExp("^" + str);
        return reg.test(s);
    }

    getIndex(record, selectedPics) {
        let index = -1;

        for (let i = 0; i < selectedPics.length; i++) {
            let element = selectedPics[i];
            if (element.brandPicId == record.brandPicId) {
                index = i;
                break;
            }
        }
        return index;
    }

    refrash(selectedPics) {
        for (let i = 0; i < this.state.files.length; i++) {
            let element = this.state.files[i];
            if (this.getIndex(element, selectedPics) > -1) {
                element.checked = true;
            }
        }
        this.setState({ files: this.state.files });
    }

    initUpload() {
        let signData = this.state.signData;
        if (typeof signData == "string") {
            signData = JSON.parse(signData);
        }
        let data = this.state.data;

        if (this.startWith(location.href, "https://")) {
            signData.endpoint = signData.endpoint.replace("http://", "https://");
        }
        let picFile = document.getElementById("picFile");
        //初始化控件
        let uploader = new plupload.Uploader({
            runtimes: 'html5,flash,silverlight,html4',
            browse_button: picFile,
            flash_swf_url: _path + '/assets/globals/plupload/js/Moxie.swf',
            silverlight_xap_url: _path + '/assets/globals/plupload/js/Moxie.xap',
            url: signData.endpoint,
            multipart_params: {
                'Filename': '${filename}',
                'key': signData.dir + "/${filename}",
                'policy': signData.policyBase64,
                'OSSAccessKeyId': signData.accessId,
                'success_action_status': '200', //让服务端返回200,不然，默认会返回204
                'signature': signData.signature,
            },

            // 只能上传指定格式图片,不允许上传同样的图片
            filters: {
                max_file_size: '100mb',
                mime_types: [{
                    title: "IMAGE FILES",
                    extensions: "jpg,jpeg,gif,bmp,png"
                }],
                prevent_duplicates: true
            },

            init: {
                Browse: function (up) {
                    if (_this.props.selectedCatData == null) {
                        up.disableBrowse()
                        message.error("请选择一个上传目录", 3, function () {
                            up.disableBrowse(false)
                        })
                        return false;
                    }
                },
                FilesAdded: function (up, files) {
                    if (_this.props.selectedCatData == null) {
                        for (let i = 0; i < files.length; i++) {
                            let element = files[i];
                            _this.state.uploader.removeFile(element);
                        }
                        message.error("请选择一个上传目录")
                        return;
                    }
                    for (let i = 0; i < files.length; i++) {
                        let element = files[i];
                        element.key = element.id;
                        _this.state.fileMap[element.id] = { cat: _this.props.selectedCatData };
                        _this.state.files.push(element);
                    }
                    _this.setState({
                        files: _this.state.files
                    })

                    uploader.start()
                },
                UploadProgress: function (up, file) {
                    for (let i = 0; i < _this.state.files.length; i++) {
                        let element = _this.state.files[i];
                        if (file.id == element.id) {
                            element.key = element.id;
                            _this.state.files[i] = file;
                            break;
                        }
                    }
                    _this.setState({
                        files: _this.state.files
                    })
                },
                FileUploaded: function (up, file, info) {
                    if (info.status == 200) {
                        let catalog = _this.state.fileMap[file.id].cat;
                        let catalogId = catalog.key;
                        let catalogPath = catalog.title;
                        while (catalog.pnode != null) {
                            catalog = catalog.pnode;
                            if (catalog.pnode == null) {
                                break;
                            }
                            catalogPath = catalog.title + "/" + catalogPath
                        }

                        let data = {
                            brandId: currentBrandId,
                            userId: userInfo.userId,
                            sourceUrl: signData.dir + "/" + file.name,
                            catalogId: catalogId,
                            catalogPath: catalogPath,
                            fileName: file.name
                        }

                        Remote.addPicSure(data).then((json) => {
                            _this.state.fileMap[file.id].picId = json.brandPicId;
                            file.url = json.url;
                            file.brandPicId = json.brandPicId;
                            _this.setState({
                                files: _this.state.files
                            });
                        });
                    } else {
                        console.log("上传失败,失败文件名为" + file.name);
                    }
                },
                Error: function (up, err) {
                    let txt;
                    if (err.code == '-602') {
                        txt = '请勿选择相同的文件';
                    } else if (err.code == '-600') {
                        txt = '请勿选择小于于100MB（兆）的文件'
                    } else {
                        message.error(err.response);
                    }
                    if (null != txt) {
                        message.error(txt + "(" + err.code + ")");
                    }
                }

            }
        });

        uploader.init();

        _this.setState({
            uploader: uploader
        });

        return uploader;
    }

    onDeleteClick(record) {
        let catalog = _this.state.fileMap[record.id].cat;
        let catalogId = catalog.key;
        //发送删除文件请求到后台
        Remote.batchDel({
            brandId: currentBrandId,
            picIdStr: "" + _this.state.fileMap[record.id].picId,
            catalogId: catalogId,
            through: true
        }).then((json) => {
            _this.state.files.remove(record);
            _this.state.uploader.removeFile(record);

            delete _this.state.fileMap[record.id]

            _this.setState({
                files: _this.state.files,
                fileMap: _this.state.fileMap
            });
        });

        if (this.props.onDelete) {
            this.props.onDelete(record)
        }
    }

    onSelectedClick(record) {
        if (this.props.onSelect) {
            return this.props.onSelect(record)
        }
        return false
    }

    onCancelClick(record) {
        if (this.props.onDelete) {
            return this.props.onDelete(record)
        }
        return false
    }

    render() {
        let columns = [
            {
                title: '图片名称',
                dataIndex: 'name',
                width: 200,
                key: 'name',
                render: (text, record) => (<div style={{ width: 100, overflow: "hidden" }}>{record.name}</div>),
            },
            {
                title: '预览',
                dataIndex: 'url',
                width: 40,
                key: 'url',
                render: (text, record) => {
                    if (record.percent == 100) {
                        if (record.url == null) {
                            return (<span />)
                        }
                        return (<img src={record.url + '@!a20-20'} width={20} />)
                    } else {
                        return (<span />)
                    }
                },
            }, {
                title: '进度',
                key: 'percent',
                width: 200,
                render: (text, record) => (<Progress percent={record.percent} strokeWidth={5} />),
            }, {
                title: '操作',
                key: 'action',
                render: (text, record) => {
                    return (
                        <span>
                            <a href="javascript:void(0)" onClick={() => this.onDeleteClick(record)}>删除</a>
                            <span className="ant-divider" />
                            <a href="javascript:void(0)" style={{ display: record.checked ? "none" : "inline" }} onClick={() => {
                                this.onSelectedClick(record)
                            }}>选择</a>
                            <a href="javascript:void(0)" style={{ display: record.checked ? "inline" : "none" }} onClick={() => {
                                this.onCancelClick(record)
                            }}>取消选择</a>
                        </span>
                    )
                },
            }];

        return (
            <Layout style={{ height: 350 }}>
                <Content style={{ width: '100%', height: 350 }}>
                    <Layout style={{ width: '100%', height: 350 }}>
                        <Sider width="180" style={{ height: 350 }}>
                            <Layout>
                                <Content style={{ height: 350, backgroundColor: 'white' }}>
                                    <PicCatalog onSelect={this.onCatalogSelect} selectedCatId={this.props.selectedCatId}
                                        expandedKeys={this.props.expandedKeys}
                                        setDefaultCat={this.props.setDefaultCat}
                                        onExpandCatalog={this.props.onExpandCatalog} />
                                </Content>
                            </Layout>
                        </Sider>
                        <Layout>
                            <Header style={{ height: 30, lineHeight: '30px', backgroundColor: 'white', padding: '0 10px' }}>
                                <div ref="uploadDiv" className="picAdd" style={{ position: "relative", height: 25 }}>
                                    <div className="fileSelect" style={{
                                        position: "absolute", border: "1px #49a9ee solid",
                                        padding: "0px 20px", backgroundColor: "#49a9ee", color: "white",
                                        height: 28, lineHeight: "25px"
                                    }}>选择文件</div>
                                    <input id="picFile" ref="picFile" type="file" name="picFile"
                                        style={{ opacity: 0, width: 90, height: 28 }} />
                                    <Button style={{ position: "absolute", top: 0, right: 4 }}>
                                        <a href="http://shop.dianjia.io/views/modules/common/menu.html?menupath=%2Fpicture%2Fpicture_center_list_public.html&module=10&function=1040&wapper=menu"
                                            target="_blank">更多操作</a>
                                    </Button>
                                </div>
                            </Header>
                            <Content style={{ height: 300, backgroundColor: 'white' }}>
                                <Table columns={columns} dataSource={this.state.files} pagination={false} scroll={{ y: 300 }} />
                            </Content>
                        </Layout>
                    </Layout>
                </Content>
            </Layout>
        )
    }
}
