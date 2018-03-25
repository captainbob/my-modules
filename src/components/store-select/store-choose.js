import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, Spin, message, Row, Col } from 'antd';
import { HttpUtil, deepEqual } from 'djmodules-utils';
import StoreChooseTable from './store-choose-table';
import StoreChooseFilter from './store-choose-filter';
import * as _ from 'lodash';
class StoreChoose extends Component {
    state = {
        visible: false,
        laoding: false,
        selectedPageLoading: false,

        unselectedData: [], // 未选的数据
        unselectedPagination: {}, // 未选的数据的分页
        selectIds: [], // 当前选择的ids
        selectedRowsData: [], // 当前选择的数据

        filters: { queryContent: JSON.stringify({}) }, // 查询条件 //todo需要修改默认条件

        haveSelectedIds: [], // 已选的数据Id
        selectedData: [], // 已选的数据
        selectedPagination: {  // 已选的数据的分页
            currentPage: 1,
            totalResult: 0
        },

        unselectedRowSelection: {},  // 勾选的对象，table的操作

        filterKey: 1,
        selectAllPageFlag: false, // 选择全部状态
    }
    componentDidMount() {
        this.setUnselectedRowSelection()
    }
    componentWillReceiveProps(nextProps) {
        try {
            if (this.state.visible) {
                if (nextProps.haveSelectedIds && nextProps.haveSelectedIds.length > 0) {
                    if (!deepEqual(nextProps.haveSelectedIds, this.state.haveSelectedIds)) {
                        this.setState({
                            haveSelectedIds: nextProps.haveSelectedIds
                        }, () => {
                            this.fetchSelectedList(this.state.haveSelectedIds)
                        });
                    }
                }
            }
        } catch (err) {
            console.error(err)
        }
    }

    asyncSetState = (state) => {
        return new Promise((resolve, reject) => {
            this.setState(state, () => {
                resolve()
            })
        })
    }
    fetchList = (data) => {
        return this.asyncSetState({
            loading: true
        }).then(() => {
            let ajaxData = {};
            // 对某些使用pageNum或currentPage的接口参数转化
            if (data.pageNum || data.pageSize) {
                let queryContent = JSON.parse(data.queryContent);
                queryContent = Object.assign(queryContent, {
                    currentPage: data.pageNum || 1,
                    showCount: data.pageSize || 10
                })
                ajaxData['queryContent'] = JSON.stringify(queryContent)
            } else {
                ajaxData = data;
            }
            if (this.props.wareHouse) {
                ajaxData['wareHouse'] = 2
            }
            // 数据权限
            if (this.props.veidoo) {
                ajaxData["veidoo"] = this.props.veidoo
            }
            HttpUtil.ajax('brand/shop/get_list_by_query', {
                method: 'post',
                data: ajaxData
            }).then((res) => {
                if (res.status == 'success') {
                    let resultObject = res.resultObject || {};
                    this.setState({
                        loading: false,
                        unselectedData: this.formatDate(resultObject.results),
                        unselectedPagination: resultObject.pagination || {}
                    })
                } else {
                    let messageText = res.exceptionMessage || res.message || '请求错误';
                    message.error(messageText)
                    this.setState({
                        loading: false
                    })
                }
            })
        })

    }
    fetchSelectedList = (ids, page = 1) => {
        if (this.state.haveSelectedIds.length == 0) {
            this.setState({
                selectedData: [], // 所有已选的数据
                selectedPagination: {}
            })
            return
        }
        return this.asyncSetState({
            selectedPageLoading: true
        }).then(() => {
            // todo需要 fetch 已选的数据 时的条件
            let queryContent = {
                storageIds: this.state.haveSelectedIds,
                showCount: 10,
                currentPage: page
            }
            // todo 对某些使用pageNum或currentPage的接口参数转化
            let ajaxData = {
                queryContent: JSON.stringify(queryContent),
            }
            // 包含仓库
            if (this.props.wareHouse) {
                ajaxData['wareHouse'] = 2
            }

            HttpUtil.ajax('brand/shop/get_list_by_query', {
                method: 'post',
                data: ajaxData
            }).then((res) => {
                if (res.status == 'success') {
                    let resultObject = res.resultObject || {};
                    this.setState({
                        selectedPageLoading: false,
                        selectedData: this.formatDate(resultObject.results), // 所有已选的数据
                        selectedPagination: resultObject.pagination || {}
                    })
                } else {
                    let messageText = res.exceptionMessage || res.message || '请求错误';
                    message.error(messageText)
                    this.setState({
                        selectedPageLoading: false
                    })
                }
            })
        })
    }
    // todo 选择全部时 获取数据  
    fetchGetDataIds = () => {
        let ajaxData = this.state.filters;
        // 数据权限
        if (this.props.veidoo) {
            ajaxData["veidoo"] = this.props.veidoo
        }
        return this.asyncSetState({
            selectedPageLoading: true
        }).then(() => {
            return HttpUtil.ajax('brand/shop/get_ids_by_query', {
                method: 'POST',
                data: ajaxData
            }).then((res) => {
                this.setState({
                    selectedPageLoading: false
                })
                if (res.status == 'success') {
                    return res.resultObject || []
                } else {
                    let messageText = res.exceptionMessage || res.message || '请求错误';
                    message.error(messageText)
                }
            })
        })
    }
    // 处理数据
    formatDate = (data = []) => {
        if (data == null) {
            data = []
        }
        return data.map(v => {
            v._id = v.storageId;
            v.key = v.storageId;   // key
            v.noAgreement = v.noAgreement || false // 是否允许
            return v
        })
    }

    render() {
        let children = this.props.children
        let { modalTitle, wareHouse } = this.props;
        if (!modalTitle) {
            modalTitle = wareHouse ? '选择店仓' : '选择门店';
        }
        return (
            <div style={this.props.style}>
                {this.props.noBtn ? undefined : (
                    <div onClick={() => this.showModal()}>
                        {children ? children : <Button type='primary'>选择门店</Button>}
                    </div>
                )}
                <div>
                    <Modal
                        title={modalTitle}
                        visible={this.state.visible}
                        onOk={this.handleOk}
                        onCancel={this.handleCancel}
                        width={850}
                        footer={this.modalFooter}
                        className='store-choose-component'
                    >
                        <section>
                            <StoreChooseFilter
                                key={this.state.filterKey}
                                handleSearch={this.handleSearch}
                                handleClear={this.handleClear}
                                ref={c => this.storeChooseFilter = c}
                            />
                        </section>
                        <Row type="flex">
                            <Col ref='unselected'
                                span={11}
                            >
                                <Spin size='large' spinning={this.state.loading}>
                                    <StoreChooseTable
                                        selectAllPageFlag={this.state.selectAllPageFlag}
                                        onChangeSelectAllPageFlag={this.onChangeSelectAllPageFlag}
                                        dataSource={this.state.unselectedData}
                                        pagination={this.state.unselectedPagination}
                                        onChangePage={this.changeUnselectedPage}
                                        rowSelection={this.state.unselectedRowSelection}
                                        haveSelectedIds={this.state.haveSelectedIds}
                                        position='left'
                                        wareHouse={this.props.wareHouse}
                                    />
                                </Spin>
                            </Col>
                            <Col span={2}>
                                <div style={{ height: 560, textAlign: 'center', transform: 'translateY(50%)' }}>
                                    <Button type="default" icon='right' onClick={this.handleAdd} style={{ marginBottom: 10 }}></Button>
                                </div>
                            </Col>
                            <Col ref='selected'
                                span={11}
                            >
                                <Spin size='large' spinning={this.state.selectedPageLoading}>
                                    <StoreChooseTable
                                        dataSource={this.state.selectedData}
                                        pagination={this.state.selectedPagination}
                                        onChangePage={this.changeSelectedPage}
                                        deleteItem={this.deleteSelectedData}
                                        clearSelectedDataOfPage={this.clearSelectedDataOfPage}
                                        clearAllSelectedData={this.clearAllSelectedData}
                                        position='right'
                                        wareHouse={this.props.wareHouse}
                                        batchAddStore={(ids) => this.batchAddStore(ids)}
                                        allowDelBtn={this.props.allowDelBtn}
                                    />
                                </Spin>
                            </Col>
                        </Row>
                    </Modal>
                </div>
            </div>
        );
    }
    get modalFooter() {
        let defaultOptions = [
            <Button key="back" onClick={this.handleCancel}>{this.props.cancelText}</Button>,
        ]
        if (this.props.showConfirmBtn) {
            defaultOptions.push((
                <Button key="submit" type="primary" onClick={this.handleOk}>
                    {this.props.okText}
                </Button>
            ))
        }
        return defaultOptions
    }
    // api
    // 显示确定按钮
    showModal = () => {
        let { filterKey } = this.state;
        filterKey += 1
        this.setState({
            visible: true,
            filterKey: filterKey,
            haveSelectedIds: this.props.haveSelectedIds || this.state.haveSelectedIds || [],
            filters: { queryContent: JSON.stringify({}) }, // 查询条件
        }, () => {
            this.fetchSelectedList(this.state.haveSelectedIds, 1)
        });
    }
    // modal确定按钮
    handleOk = (e) => {
        this.setState({
            visible: false,
            selectIds: [],
            selectedRowsData: [],
            selectAllPageFlag: false,
            unselectedRowSelection: Object.assign({}, this.state.unselectedRowSelection, {
                pageSelectAll: false,
                selectIds: [],
                selectedRowKeys: []
            })
        }, () => {
            this.props.onHandleSure({
                haveSelectedIds: this.state.haveSelectedIds
            })
            if (typeof this.props.onClose == "function") {
                this.props.onClose();
            }
        });
    }
    // 关闭modal
    handleCancel = (e) => {
        this.setState({
            visible: false,
            selectIds: [],
            selectedRowsData: [],
            selectAllPageFlag: false,
            unselectedRowSelection: Object.assign({}, this.state.unselectedRowSelection, {
                pageSelectAll: false,
                selectIds: [],
                selectedRowKeys: []
            })
        }, () => {
            if (typeof this.props.onClose == "function") {
                this.props.onClose();
            }
        });
    }
    //  处理查询
    handleSearch = (data) => {
        const queryData = Object.assign({}, data, {
            pageNum: this.state.unselectedPagination.pageNum || 1
        })
        this.setState({
            filters: data
        })
        this.fetchList(queryData)
    }
    // 处理条件清除
    handleClear = (data) => {
        let { filterKey } = this.state;
        filterKey += 1
        this.setState({
            filterKey: filterKey,
            filters: { queryContent: JSON.stringify({}) }, // 查询条件
        })
        this.fetchList({ queryContent: JSON.stringify({}) })
    }
    // 点击未选页数
    changeUnselectedPage = (page) => {
        const queryData = Object.assign({}, this.state.filters, {
            pageNum: page
        })
        this.fetchList(queryData).then(() => this.monitorPageSelected());

    }
    // 点击已选页数
    changeSelectedPage = (page = 1) => {
        this.fetchSelectedList(this.state.haveSelectedIds, page)
    }
    // 更新已选的翻页信息
    updateSelectedPagination = (data) => {
        this.setState({
            selectedPagination: Object.assign({}, this.state.selectedPagination, data)
        })
    }
    // 删除已选的一条数据
    deleteSelectedData = (id) => {
        const selectedData = this.state.selectedData.filter(v => {
            return v._id != id;
        })
        const haveSelectedIds = this.state.haveSelectedIds.filter(v => {
            return v != id;
        })

        this.setState({
            selectedData,
            haveSelectedIds,
        }, () => {
            this.upDateSelectedData()
            this.updateSelectedPagination({
                totalResult: haveSelectedIds.length
            })
        })
    }
    // 更新删除操作后的每页数量
    upDateSelectedData = () => {
        if (this.state.selectedData.length == 0) {
            const page = this.state.selectedPagination.pageNum;
            this.changeSelectedPage(page);
        }
    }
    /**
     * 批量添加门店
     *  ids 要添加的门店id
     *  在已选的Ids中加haveSelectedIds=>新的ids
     *  更新总的条数
     */
    batchAddStore = (ids = []) => {
        let haveSelectedIds = ids.concat(this.state.haveSelectedIds);
        haveSelectedIds = _.uniq(haveSelectedIds);
        let len = haveSelectedIds.length;

        this.setState({
            haveSelectedIds: haveSelectedIds,
            selectedPagination: Object.assign({}, this.state.selectedPagination, {
                totalResult: len,
                currentPage: 1,
            })
        }, () => {
            this.changeSelectedPage(this.state.selectedPagination.currentPage)
        });
    }
    // 右移
    handleAdd = () => {
        // 选择全部
        if (this.state.selectAllPageFlag) {
            this.fetchGetDataIds().then(res => {
                this.setState({
                    selectIds: [],
                    selectedRowsData: [],
                    selectAllPageFlag: false,
                    haveSelectedIds: res
                }, () => {
                    this.changeSelectedPage(1)
                });
            })
            return;
        }
        if (this.state.selectedRowsData.length == 0) {
            return;
        }
        let selectedRowsData = JSON.parse(JSON.stringify(this.state.selectedRowsData));
        let haveSelectedIds = this.state.selectIds.concat(this.state.haveSelectedIds)
        let len = haveSelectedIds.length
        this.setState({
            selectIds: [],
            selectedRowsData: [],
            haveSelectedIds: haveSelectedIds,
        }, () => {
            // this.changeSelectedPage(1);
            const rowDatas = [
                ...selectedRowsData,
                ...this.state.selectedData
            ];

            this.setState({
                selectedData: rowDatas.slice(0, 10),
                selectedPagination: Object.assign({}, this.state.selectedPagination, {
                    totalResult: len,
                    currentPage: 1,
                })
            })
            this.setUnselectedRowSelection();
        });
    }

    // 清除本页
    clearSelectedDataOfPage = () => {
        const selectedDataIds = this.state.selectedData.map(v => v._id);

        let haveSelectedIds = this.state.haveSelectedIds.filter(v => {
            return !selectedDataIds.includes(v)
        })

        this.setState({
            haveSelectedIds: haveSelectedIds,
        }, () => {
            this.changeSelectedPage(this.state.selectedPagination.currentPage-1)
        })
    }
    // 清除全部
    clearAllSelectedData = () => {
        this.setState({
            selectedData: [], // 已选的数据
            haveSelectedIds: [],
            selectedPagination: {  // 已选的数据的分页
                currentPage: 1,
                totalResult: 0
            },
        })
    }
    // 监控全选状态
    monitorPageSelected = () => {
        let selectedRowKeys = this.state.selectIds.concat();
        let haveSelectedIds = this.state.haveSelectedIds.concat();

        let flag = true;
        if (selectedRowKeys.length == 0) {
            flag = false
        }
        this.state.unselectedData.forEach(v => {
            if (v.noAgreement) {
                return
            }
            if (haveSelectedIds.includes(v._id)) {
                return
            }
            if (!selectedRowKeys.includes(v._id)) {
                flag = false
                return
            }
        })
        this.setState({
            unselectedRowSelection: Object.assign({}, this.state.unselectedRowSelection, {
                pageSelectAll: flag
            })
        });
    }
    // 设置选择事件
    setUnselectedRowSelection() {
        const onChange = (value = false, id, record) => {
            let selectedRowKeys = this.state.selectIds.concat();
            let selectedRowsData = this.state.selectedRowsData.concat();
            let haveSelectedIds = this.state.haveSelectedIds.concat();
            if (value) {
                selectedRowKeys = selectedRowKeys.concat([id]);
                selectedRowsData = selectedRowsData.concat([record])
            } else {
                selectedRowKeys = selectedRowKeys.filter(v => {
                    return v != id
                })
                selectedRowsData = selectedRowsData.filter(v => {
                    return v._id != id
                })
            }
            this.setState({
                selectIds: selectedRowKeys,
                selectedRowsData: selectedRowsData,
                unselectedRowSelection: Object.assign({}, this.state.unselectedRowSelection, {
                    selectedRowKeys
                })
            }, () => {
                this.monitorPageSelected()
            })
        }
        const selectAll = (checked) => {
            let selectedRowKeys = this.state.selectIds.concat();
            let selectedRowsData = this.state.selectedRowsData.concat();
            let haveSelectedIds = this.state.haveSelectedIds.concat();
            let idsArr = [], datasArr = [];
            if (checked) {
                this.state.unselectedData.forEach(v => {
                    if (v.noAgreement) {
                        return false
                    }
                    if (selectedRowKeys.includes(v._id)) {
                        return false
                    }
                    if (haveSelectedIds.includes(v._id)) {
                        return false
                    }
                    idsArr.push(v._id);
                    datasArr.push(v)
                })
                selectedRowKeys = selectedRowKeys.concat(idsArr)
                selectedRowsData = selectedRowsData.concat(datasArr)
            } else {
                this.state.unselectedData.forEach(v => {
                    if (v.noAgreement) {
                        return false
                    }
                    if (haveSelectedIds.includes(v._id)) {
                        return false
                    }
                    idsArr.push(v._id);
                    datasArr.push(v)
                })
                selectedRowKeys = selectedRowKeys.filter(v => {
                    return !idsArr.includes(v);
                });

                selectedRowsData = selectedRowsData.filter(v => {
                    return !idsArr.includes(v._id);
                });
            }
            this.setState({
                selectAllPageFlag: false,
                selectIds: selectedRowKeys,
                selectedRowsData: selectedRowsData,
                unselectedRowSelection: Object.assign({}, this.state.unselectedRowSelection, {
                    selectedRowKeys,
                    pageSelectAll: checked
                })
            })
        }

        let selectedRowKeys = this.state.selectIds.concat();
        this.setState({
            unselectedRowSelection: {
                selectedRowKeys,
                onChange,
                selectAll,
                pageSelectAll: false
            }
        })
    }

    filterArrRepeat = (arr = []) => {
        let retObject = {}, retArr = [];

        arr.forEach(v => {
            retObject[v._id] = v
        })
        for (let key in retObject) {
            retArr.push(retObject[key])
        }
        return retArr
    }

    onChangeSelectAllPageFlag = (value) => {
        this.setState({
            selectAllPageFlag: value,
            unselectedRowSelection: Object.assign({}, this.state.unselectedRowSelection, {
                pageSelectAll: false
            })
        });
    }
}

StoreChoose.Button = class extends Component {
    render() {
        return (
            <div>
                {this.props.children}
            </div>
        )
    }
}
StoreChoose.defaultProps = {
    showConfirmBtn: true,
    wareHouse: false,
    allowDelBtn: true,
    okText: "确认",
    cancelText: "取消",
}

StoreChoose.propTypes = {
    okText: PropTypes.string,           // 确认按钮名称
    cancelText: PropTypes.string,       // 取消按钮名称
    modalTitle: PropTypes.string,       // 弹出框标题
    onHandleSure: PropTypes.func,       // 确定的回调行数
    haveSelectedIds: PropTypes.array,   // 已选ids
    onClose: PropTypes.func,            // 关闭的回调
    showConfirmBtn: PropTypes.bool,     // 展示确定按钮
    wareHouse: PropTypes.bool,          // 是否展示店仓
    allowDelBtn: PropTypes.bool,        // 是否允许删除已选择数据
}

export default StoreChoose;

