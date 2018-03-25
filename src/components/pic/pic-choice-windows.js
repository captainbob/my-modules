import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Layout, Tabs, Select, Input, Pagination, Icon, Spin, message, Row, Col } from 'antd';
import PicCatalog from './pic-catalog'
import PicShowBlock from './pic-show-block'
import PicUpload from './pic-upload'
import Remote from './remote';

const { Header, Footer, Sider, Content } = Layout;
const TabPane = Tabs.TabPane;
const Option = Select.Option;
const Search = Input.Search;
let _this;

function isEmptyObject(obj) {
    for (let key in obj) {
        return false;
    }
    return true;
}

/**
 * 属性: 上一级传过来
 * onChoice：外面的回调
 * visible: 调用使其可以可现
 * hidePicModal: 使其不可见
 * showPromptly: 立即调用获取图片接口
 * mode： multi 多选
 */
export default class PicChoiceWindows extends Component {

    constructor(props) {
        super(props);
        _this = this;
        this.state = {
            totalPage: 0,
            maxNum: this.props.maxNum ? this.props.maxNum : 1,
            picData: [],
            loading: false,
            choicePics: {},//单选模式使用
            selectedPics: [],//多选模式使用
            catExpandedKeys: [],
            queryData: {
                brandId: currentBrandId,
                currentPage: 1,
                picCatalogId: 0,
                picName: "",
                sortName: "upload_time",
                sortType: "DESC",
                showCount: 35,
                deleted: 0,
            }
        }
        this.onSelect = this.onSelect.bind(this);
        this.onDelete = this.onDelete.bind(this);
        this.onPicChoice = this.onPicChoice.bind(this);
        this.setDefaultCat = this.setDefaultCat.bind(this);
    }

    static propTypes = {
        cutImageSize: PropTypes.string
    }

    static defaultProps = {
        cutImageSize: '@!a100-100'
    }

    //设置默认目录
    setDefaultCat(cat) {
        this.state.queryData.picCatalogId = cat.catalogId
        this.setState({
            currentCatData: cat,
            queryData: this.state.queryData
        });
    }

    getPics() {
        this.setState({
            loading: true
        });
        Remote.getPicList(this.state.queryData).then((res) => {
            this.setState({
                loading: false
            });
            let picData = res.results;
            this.setState({
                picData: picData
            })
            this.setState({
                totalResult: res.pagination.totalResult,
            });
        })
    }

    initModalInfo = () => {
        //清除选中
        this.setState({
            choicePics: {},
        });
        //重新获取图片数据
        this.getPics();

    }

    handleOk = (e) => {

        if (this.props.onChoice) {
            if (isEmptyObject(this.state.choicePics)) {
                message.error('请至少选择一张图片')
            } else {
                this.props.onChoice(this.state.choicePics, this.state.selectedPics)
                if (this.props.hidePicModal) {
                    this.props.hidePicModal();
                }
            }
        } else {
            for (let key in this.state.choicePics) {
                console.log({ id: key, url: this.state.choicePics[key] })
            }
        }

    }

    handleCancel = (e) => {
        if (this.props.hidePicModal) {
            this.props.hidePicModal()
        }

    }

    onCatalogSelect = (node) => {
        let queryData = this.state.queryData;
        queryData.picCatalogId = node.key;
        queryData.currentPage = 1;
        //重置页码
        this.setState({
            queryData: queryData,
            currentCatData: node
        });
        this.getPics();
    }

    onCatalogLoad = (node) => {
        let queryData = this.state.queryData;
        queryData.picCatalogId = node.key;
        queryData.currentPage = 1;
        //重置页码
        this.setState({
            queryData: queryData
        });
        this.getPics();
    }

    onPageChange = (page) => {
        let queryData = this.state.queryData;
        queryData.currentPage = page;
        this.setState({
            queryData: queryData
        });
        this.getPics();
    }

    handleChange(value) {
        let queryData = _this.state.queryData;
        queryData.sortName = value.split("#")[0];
        queryData.sortType = value.split("#")[1];
        queryData.currentPage = 1;
        _this.setState({
            queryData: queryData
        });
        _this.getPics();
    }

    onSearch(value) {
        let queryData = this.state.queryData;
        queryData.picName = value;
        queryData.currentPage = 1;
        this.setState({
            queryData: queryData
        });
        this.getPics();
    }

    onPicChoice(item, picId, url, checked) {

        //单选
        if (this.state.maxNum == 1) {
            //清理选中
            this.state.selectedPics = []
            if (checked) {
                this.onSelect(item);
            } else {
                this.onDelete(item);
            }

        } else {//多选
            if (checked) {
                this.onSelect(item);
            } else {
                this.onDelete(item);
            }
        }


    }

    onSelect(record) {

        //数量控制
        if (this.state.selectedPics.length + 1 > this.state.maxNum) {
            message.error("最多只能选择" + this.state.maxNum + "张");
            return false;
        }

        record.checked = true;

        let index = this.getIndex(record);

        if (index < 0) {
            this.state.selectedPics.push(record)
        }

        this.state.choicePics = {};

        for (let i = 0; i < this.state.selectedPics.length; i++) {
            let element = this.state.selectedPics[i];
            this.state.choicePics[element.brandPicId] = element.url;
        }

        this.setState({
            selectedPics: this.state.selectedPics,
            choicePics: this.state.choicePics,
            picData: this.state.picData
        });

        return true;

    }

    getIndex(record) {
        let index = -1;

        for (let i = 0; i < this.state.selectedPics.length; i++) {
            let element = this.state.selectedPics[i];
            if (element.brandPicId == record.brandPicId) {
                index = i;
                break;
            }
        }
        return index;
    }

    onDelete(record) {

        record.checked = false;

        let index = this.getIndex(record);

        if (index > -1) {
            this.state.selectedPics.splice(index, 1);
        }

        this.state.choicePics = {};

        for (let i = 0; i < this.state.selectedPics.length; i++) {
            let element = this.state.selectedPics[i];
            this.state.choicePics[element.brandPicId] = element.url;
        }

        this.setState({
            selectedPics: this.state.selectedPics,
            choicePics: this.state.choicePics,
            picData: this.state.picData
        });
        return true;
    }

    componentDidMount() {
        if (this.props.showPromptly) {
            this.initModalInfo();
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.visible) {
            this.initModalInfo()
        }
    }

    render() {
        let _this = this;
        const loopPic = data => data.map((item) => {
            let checked = false;
            if (_this.state.choicePics) {
                for (let key in _this.state.choicePics) {
                    if (item.brandPicId == key) {
                        checked = true;
                        break;
                    }
                }
            }

            return (
                <PicShowBlock key={item.brandPicId}
                    originalUrl={item.url + this.props.cutImageSize}
                    url={item.url + '@!a100-100'}
                    picId={item.brandPicId}
                    picName={item.picName}
                    picWidth={item.width}
                    picHeight={item.height} checked={checked}
                    onClick={(picId, url, checked) => { _this.onPicChoice(item, picId, url, checked) }} />
            );
        });

        const loopSelectedPic = data => data.map((item) => {
            return (
                <PicShowBlock key={item.brandPicId}
                    originalUrl={item.url + this.props.cutImageSize}
                    url={item.url + '@!a100-100'}
                    picId={item.brandPicId}
                    picName={item.picName}
                    picWidth={item.width}
                    deleteable={true}
                    onDelete={() => {
                        _this.onDelete(item)
                    }}
                    picHeight={item.height} />);
        });

        return (
            <div>
                <Modal title="图片选择" visible={this.props.visible}
                    onOk={this.handleOk} onCancel={this.handleCancel}
                    wrapClassName="vertical-center-modal"
                    width="820px">
                    <div style={{ border: '1px #eee solid' }}>
                        <Tabs defaultActiveKey="1" tabBarStyle={{ marginBottom: 10, height: 40 }} onChange={(key) => {
                            if (key == "1") {
                                _this.getPics()
                            } else {
                                if (_this.refs.picUpload) {
                                    _this.refs.picUpload.refrash(_this.state.selectedPics);
                                }
                            }
                        }}>
                            <TabPane tab="图片空间" key="1" style={{ marginBottom: '2px' }} >
                                <Layout style={{ height: 350, backgroundColor: "white" }}>
                                    <Content style={{ width: '100%', height: 350, backgroundColor: "white" }}>
                                        <Layout style={{ width: '100%', height: 350 }}>
                                            <Sider width="180" style={{ height: 350 }}>
                                                <Layout>
                                                    <Content style={{ height: 350, backgroundColor: 'white' }}>
                                                        <PicCatalog selectedCatId={this.state.queryData.picCatalogId}
                                                            expandedKeys={this.state.catExpandedKeys}
                                                            setDefaultCat={this.setDefaultCat}
                                                            onExpandCatalog={(expandedKeys) => {
                                                                _this.setState({
                                                                    catExpandedKeys: expandedKeys
                                                                })
                                                            }}
                                                            onSelect={this.onCatalogSelect} onLoad={this.onCatalogLoad.bind(this)} />
                                                    </Content>
                                                </Layout>
                                            </Sider>
                                            <Layout style={{ height: 350, backgroundColor: "white" }}>
                                                <Header style={{ height: 30, lineHeight: '30px', backgroundColor: 'white', padding: 0 }}>
                                                    <Select defaultValue="upload_time#ASC" style={{ width: 180 }} onChange={this.handleChange}>
                                                        <Option value="upload_time#DESC">按上传时间从早到晚</Option>
                                                        <Option value="upload_time#ASC">按上传时间从晚到早</Option>
                                                        <Option value="pic_size#DESC">按图片从大到小</Option>
                                                        <Option value="pic_size#ASC">按图片从小到大</Option>
                                                        <Option value="pic_name#DESC">按图片名称降序</Option>
                                                        <Option value="pic_name#ASC">按图片名称升序</Option>
                                                    </Select>
                                                    <Search
                                                        placeholder="按图片名搜索"
                                                        style={{ width: 200, marginLeft: 10, height: 26 }}
                                                        onSearch={this.onSearch.bind(this)}
                                                    />
                                                    <Button onClick={this.getPics.bind(this)} title="刷新" style={{ marginLeft: 5 }}><Icon type="reload" /></Button>
                                                </Header>
                                                <Content style={{ backgroundColor: '#f4f4f4', marginTop: 10 }}>
                                                    <Spin spinning={this.state.loading} size="large">
                                                        <div style={{ width: '100%', height: 260, overflowY: 'auto', overflowX: 'hidden' }}>
                                                            {loopPic(this.state.picData)}
                                                        </div>
                                                    </Spin>
                                                </Content>
                                                <Footer style={{ backgroundColor: 'white', padding: '6px 10px' }}>
                                                    <Pagination defaultCurrent={1} current={this.state.queryData.currentPage} pageSize={35}
                                                        total={this.state.totalResult} onChange={this.onPageChange} />
                                                </Footer>
                                            </Layout>
                                        </Layout>
                                    </Content>
                                </Layout>
                            </TabPane>
                            <TabPane tab="上传图片" key="2">
                                <PicUpload
                                    ref="picUpload"
                                    selectedCatId={this.state.queryData.picCatalogId}
                                    selectedCatData={this.state.currentCatData}
                                    onCatalogSelect={this.onCatalogSelect}
                                    expandedKeys={this.state.catExpandedKeys}
                                    setDefaultCat={this.setDefaultCat}
                                    onExpandCatalog={(expandedKeys) => {
                                        _this.setState({
                                            catExpandedKeys: expandedKeys
                                        })
                                    }}
                                    onSelect={this.onSelect} onDelete={this.onDelete} />
                            </TabPane>
                        </Tabs>
                        <Row>
                            <Col span={24} style={{ paddingLeft: 10 }}>已选</Col>
                        </Row>

                        <Row style={{ height: 100 }}>
                            <Col span={24} style={{
                                padding: 5, overflowX: "auto",
                                overflowY: "auto",
                                height: 100
                            }}>
                                {loopSelectedPic(this.state.selectedPics)}
                            </Col>
                        </Row>
                    </div>
                </Modal>
            </div>
        );
    }
}