import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FilterView from './filter';
import { Button, Modal, message, Pagination, Row, Col, Spin } from 'antd';
import _, { uniq, difference } from 'lodash';
import { HttpUtil, deepEqual } from 'djmodules-utils';
import TableView from './table';
import BaseSelectTableView from './base-checkbox-select';
import GoodsScopeView from './goods-scope-moadal';
const paginationStyle = {
    margin: '10px 0px',
    textAlign: "center"
}
const CLASSIFIED_GOOD = "good";
const CLASSIFIED_RANGE = "range";

export const formatPagination = (pagination = {}, onChange) => {
    return {
        total: pagination.totalResult || 0,
        current: pagination.currentPage,
        onChange,
        showTotal: (total, range) => { return `共${total}条` },
        size: "small"
    }
}

class MainView extends Component {
    constructor(props) {
        super(props);
        let showCheckedClassified = _.keys(this.props.originRecord).length;
        if (this.props.classifiedOnly) {
            showCheckedClassified = true;
        }
        this.state = {
            visible: false,
            selectedList: this.props.haveSelectedIds || [],  // 当前右边的ids

            noSelectData: [],
            noSelectPagination: { totalResult: 0 },
            noSelectSpin: false,

            hasSelectData: [],
            hasSelectPagination: { totalResult: 0 },
            hasSelectSpin: false,

            queryContent: {},
            expand: false,

            checkedClassified: showCheckedClassified ? CLASSIFIED_RANGE : CLASSIFIED_GOOD, //当有按范围查询时的状态

            goodScopeSelect: [], // 商品条件已选条件

            showFGBtn: this.props.showFGBtn || false,
            selectedFGList: this.props.haveSelectedSpuDtos || {},  // 当前右边的ids和商品换购价
        }

    }

    componentWillReceiveProps(nextProps) {
        try {
            if (this.state.visible) {
                if (nextProps.haveSelectedIds && nextProps.haveSelectedIds.length > 0) {
                    if (!deepEqual(nextProps.haveSelectedIds, this.state.selectedList)) {
                        this.setState({
                            selectedList: nextProps.haveSelectedIds,
                        }, () => {
                            this.fetchMethod('s_y', this.state.queryContent)
                        });
                    }
                }
            }
        } catch (err) {
            console.error(err)
        }
    }

    showModal = () => {
        this.setState({
            visible: true,
        }, () => {
            this.fetchMethod('s_y', this.state.queryContent)
        });
    }

    handleOk = () => {
        const { modalTitle, classified, classifiedOnly } = this.props;
        const { checkedClassified } = this.state;
        // 按范围时
        if (classified && checkedClassified == CLASSIFIED_RANGE || classifiedOnly) {

            this.setState({ visible: false }, () => {
                try {
                    if (typeof this.props.onClose == 'function')
                        this.props.onClose();
                    const rangeData = this.goodsScopeView.state.originRecord;
                    const rangeDataName = this.goodsScopeView.state.originRecordName;
                    this.props.onHandleSure(rangeData, CLASSIFIED_RANGE, rangeDataName)
                } catch (err) {
                    console.error(err)
                }
            });
        } else {

            this.setState({ visible: false }, () => {
                try {
                    if (typeof this.props.onClose == 'function') {
                        this.props.onClose();
                    }
                    if (this.state.showFGBtn) {       // 满赠高阶版
                        let onHandleList = [];
                        onHandleList = this.state.selectedList.map(item => {
                            return { spuId: item, salePrice: this.state.selectedFGList[item] ? this.state.selectedFGList[item].salePrice : '' }
                        })
                        this.props.onHandleSure(onHandleList);
                    } else {
                        this.props.onHandleSure(this.state.selectedList, CLASSIFIED_GOOD, []);
                    }
                } catch (err) {
                    console.error(err);
                }
            });
        }

    }

    handleCancel = () => {
        this.setState({ visible: false }, () => {
            if (typeof this.props.onClose == 'function')
                this.props.onClose();
        });
    }
    // type = s_n 未选商品 s_y 已选
    fetchMethod = (type, queryContent, page) => {
        let oldQueryContent = Object.assign({}, queryContent);
        let dataSource, pagination, spinning;
        let ajaxData;
        queryContent = Object.assign({}, queryContent);
        page = page || 1;
        if (type == "s_n") {
            Object.assign(queryContent, this.state.noSelectPagination, {
                currentPage: page,
                offset: undefined,
            })
            queryContent['excludedBrandSpuIds'] = this.state.selectedList;
            dataSource = 'noSelectData'
            pagination = 'noSelectPagination'
            spinning = 'noSelectSpin'
            // 包含的spuIds中查找
            if (this.props.includeIds) {
                queryContent['brandSpuIds'] = this.props.includeIds
            }
            // 不包含的spuIds中
            if (this.props.excludeIds) {
                queryContent['excludedBrandSpuIds'] = this.state.selectedList.concat(this.props.excludeIds)
            }
            // 包含特殊的条件
            queryContent = Object.assign({}, this.props.filterObj, queryContent);
            ajaxData = {
                queryContent: JSON.stringify(queryContent),
                pageNum: page,
            }
        } else if (type == "s_y") {
            if (this.state.selectedList.length == 0) {
                return
            }
            Object.assign(queryContent, this.state.hasSelectPagination, {
                currentPage: page,
                offset: undefined,
            })
            queryContent['brandSpuIds'] = this.state.selectedList;
            dataSource = 'hasSelectData'
            pagination = 'hasSelectPagination'
            spinning = 'hasSelectSpin'
            // 包含特殊的条件
            queryContent = Object.assign({}, this.props.filterObj, queryContent);
            ajaxData = {
                queryContent: JSON.stringify(queryContent),
            }
        } else {
            message.warning('必须选一个搜索范围')
            return
        }
        // 数据权限
        if (this.props.veidoo) {
            ajaxData["veidoo"] = this.props.veidoo
        }

        this.setState({
            [spinning]: true
        }, () => {
            HttpUtil.promiseAjax('goodsx/sprice/get_spu_list', {
                method: 'post',
                data: ajaxData
            }).then((resultObject) => {
                // if (pagination == "hasSelectPagination") {
                //     Object.assign(resultObject.pagination, {
                //         totalResult: this.state.selectedList.length
                //     })
                // }
                this.setState({
                    [dataSource]: this.format(resultObject.results),
                    [pagination]: Object.assign(resultObject.pagination, { currentPage: page }),
                    queryContent: oldQueryContent,
                    [spinning]: false
                });
            }).catch(err => {
                let messageText = err.exceptionMessage || err.message || '请求错误';
                this.setState({
                    [spinning]: false
                })
                message.error(messageText)
            })
        });
    }
    // 选择全部时获取数据
    fetchGetDataIds = () => {
        let ajaxData = {
            queryContent: JSON.stringify(this.state.queryContent),
        }
        // 数据权限
        if (this.props.veidoo) {
            ajaxData["veidoo"] = this.props.veidoo
        }
        return HttpUtil.promiseAjax('goodsx/sspu/get_ids', {
            method: 'POST',
            data: ajaxData,
        }).then((resultObject) => {
            return resultObject || []
        }).catch(err => {
            let messageText = err.exceptionMessage || err.message || '请求错误';
            message.error(messageText)
        })
    }
    format = (data = []) => {
        if (data == null) {
            data = []
        }
        return data.map(v => {
            v.id = v.brandSpuId;
            v.key = v.brandSpuId;   // key
            v.noAgreement = v.noAgreement || false // 是否允许
            return v
        })
    }
    render() {
        const { visible, loading, checkedClassified } = this.state;
        const { modalTitle, classified, classifiedOnly } = this.props;
        const expand = this.state.expand;
        let tableHeight
        const innerHeight = window.innerHeight > 960 ? 960 : window.innerHeight
        if (expand) {
            tableHeight = innerHeight - 240 - 305
        } else {
            tableHeight = innerHeight - 240 - 165
        }
        // 是否显示div
        let mainSelectDivDisplay = !classified ? "block" : checkedClassified == CLASSIFIED_GOOD ? "block" : "none";
        let rangeSelectDivDisplay = checkedClassified == CLASSIFIED_RANGE ? "block" : "none";
        // 只显示按范围
        if (classifiedOnly) {
            mainSelectDivDisplay = "none";
            rangeSelectDivDisplay = "block";
        }
        return (
            <div style={Object.assign({ display: 'inline-block' }, this.props.style)}>
                {
                    this.props.noBtn ? undefined
                        : this.props.children ?
                            (this.props.noDefaultClick ? this.props.children
                                : (<div onClick={this.showModal}>{this.props.children}</div>))
                            : (
                                <Button type="primary" onClick={this.showModal}>
                                    {this.props.btnTitle}
                                </Button>
                            )
                }
                <Modal
                    visible={visible}
                    title={this.getTitle()}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    width={1150}
                    style={{ top: 80 }}
                    footer={this.modalFooter}
                    className="dj-spu-select"
                >
                    <div>
                        <div className="main-select-div" style={{
                            height: (innerHeight - 220),
                            display: mainSelectDivDisplay,
                        }}>
                            <section>
                                <FilterView
                                    handleSearch={this.fetchMethod}
                                    onChangeExpand={(value) => this.setState({ expand: value })}
                                    filterObj={this.props.filterObj}
                                    ref={view => this.filterView = view}
                                    mode={this.props.mode}
                                />
                            </section>
                            <div className='dj-spu-line'></div>
                            <section>
                                <Row type="flex">
                                    <Col span={this.state.showFGBtn ? 10 : 11} >
                                        <Spin spinning={this.state.noSelectSpin}>
                                            <BaseSelectTableView
                                                dataSource={this.state.noSelectData}
                                                style={{ marginBottom: 12 }}
                                                scroll={{
                                                    y: tableHeight
                                                }}
                                                handleAdd={this.handleAdd}
                                                notSelectIds={this.props.notSelectIds}
                                                type={1}
                                                ref={c => this.unSelectView = c}
                                            />
                                        </Spin>
                                        <Pagination {...formatPagination(this.state.noSelectPagination, (page) => {
                                            this.unSelectView.setState({
                                                selectThisPageFlag: false,
                                                selectAllPageFlag: false,
                                            })
                                            this.fetchMethod('s_n', this.state.queryContent, page);
                                        }) } style={paginationStyle} />
                                    </Col>
                                    <Col span={2}>
                                        <div style={{ height: tableHeight, textAlign: 'center', transform: 'translateY(50%)' }}>
                                            <Button type="default" icon='right' onClick={() => this.handleAdd()} style={{ marginBottom: 10 }}></Button>
                                        </div>
                                    </Col>
                                    <Col span={this.state.showFGBtn ? 12 : 11}>
                                        <Spin spinning={this.state.hasSelectSpin}>
                                            <BaseSelectTableView
                                                dataSource={this.state.hasSelectData}
                                                style={{ marginBottom: 12 }}
                                                scroll={{
                                                    y: tableHeight
                                                }}
                                                handleRemove={this.handleRemove}
                                                batchAddSpu={(spuIds) => this.updateState(spuIds)}
                                                type={2}
                                                ref={c => this.selectView = c}
                                                showFGBtn={this.state.showFGBtn}
                                                handleChangePrice={this.handleChangePrice}
                                                selectedFGList={this.state.selectedFGList}
                                                handleCPSelected={this.handleCPSelected}
                                            />
                                        </Spin>
                                        <Pagination {...formatPagination(this.state.hasSelectPagination, (page) => {
                                            this.selectView.setState({
                                                selectThisPageFlag: false,
                                                selectAllPageFlag: false,
                                            })
                                            this.fetchMethod('s_y', this.state.queryContent, page)
                                        }) } style={paginationStyle} />
                                    </Col>
                                </Row>
                            </section>
                        </div>
                        <div className="range-select-div" style={{
                            height: (innerHeight - 220),
                            display: rangeSelectDivDisplay,
                        }}>
                            <GoodsScopeView
                                originRecord={this.props.originRecord}
                                originRecordName={this.props.originRecordName}
                                ref={c => this.goodsScopeView = c}
                                onSelect={(value) => {
                                    this.setState({ goodScopeSelect: value });
                                }}
                            />
                        </div>
                    </div>
                </Modal>
            </div>
        );
    }
    getTitle = () => {
        const { modalTitle, classified, classifiedOnly } = this.props;
        const { checkedClassified } = this.state;
        if (classified) {
            return (
                <div>
                    <span className={checkedClassified == CLASSIFIED_GOOD ? 'title_checked' : "title_classified"} onClick={() => this.setState({ checkedClassified: CLASSIFIED_GOOD })}>指定商品</span>
                    <span className={checkedClassified == CLASSIFIED_RANGE ? 'title_checked' : "title_classified"} onClick={() => this.setState({ checkedClassified: CLASSIFIED_RANGE })}>按商品范围</span>
                </div>
            )
        }
        return modalTitle
    }
    get modalFooter() {
        const { modalTitle, classified } = this.props;
        const { checkedClassified } = this.state;
        let defaultOptions = [
            <Button key="back" size="large" onClick={this.handleCancel}> {this.props.cancelText}</Button>,
        ]
        if (this.props.showConfirmBtn) {
            defaultOptions.push((
                <Button key="submit" type="primary" size="large" onClick={this.handleOk}>
                    {this.props.okText}
                </Button>
            ))
        }
        if (classified && checkedClassified == CLASSIFIED_RANGE) {
            let scopeSize = this.state.goodScopeSelect.length;
            console.log(this.state.goodScopeSelect, scopeSize);
            defaultOptions.unshift((
                <a key='a1' style={{ marginRight: 15 }}>共选择条件数：{scopeSize}</a>
            ))
            return defaultOptions
        }
        defaultOptions.unshift((
            <a key='a1' style={{ marginRight: 15 }}>共选择商品数：{this.state.selectedList.length}</a>
        ))
        return defaultOptions
    }
    handleAdd = (id = undefined) => {
        if (id) {
            let changeRowData = this.state.noSelectData.find(noSelectItem => noSelectItem.id == id);
            this.setState({
                selectedList: [id].concat(this.state.selectedList),
                hasSelectData: [changeRowData, ...this.state.hasSelectData],
                hasSelectPagination: Object.assign({}, this.state.hasSelectPagination, {
                    totalResult: this.state.hasSelectPagination.totalResult + 1
                }),
                noSelectData: this.state.noSelectData.filter(noSelectItem => noSelectItem.id != id),
                noSelectPagination: Object.assign({}, this.state.noSelectPagination, {
                    totalResult: this.state.noSelectPagination.totalResult - 1
                })
            }, () => {
                if (this.state.noSelectData.length == 0) {
                    this.fetchMethod('s_n', this.state.queryContent)
                }
            });
            return
        }

        new Promise((resolve, reject) => {
            let selectedIds = [];
            // 选择全部
            if (this.unSelectView.state.selectAllPageFlag) {
                this.fetchGetDataIds().then(res => {
                    const notSelectIds = this.props.notSelectIds || []; //  在左边显示是不可以选择的状态
                    selectedIds = difference(res, notSelectIds)
                    resolve(selectedIds)
                })
            } else {
                selectedIds = this.unSelectView.state.selectedIds;
                resolve(selectedIds)
            }
        }).then(selectedIds => {
            if (selectedIds.length == 0) {
                message.warning('请先选择商品')
                return;
            }
            this.updateState(selectedIds);
        })
    }
    updateState = (selectedIds) => {
        this.setState({
            selectedList: uniq(selectedIds.concat(this.state.selectedList)),
            noSelectData: this.state.noSelectData.filter(noSelectItem => !selectedIds.includes(noSelectItem.id)),
            noSelectPagination: Object.assign({}, this.state.noSelectPagination, {
                totalResult: this.state.noSelectPagination.totalResult - selectedIds.length
            })
        }, () => {
            if (this.state.noSelectData.length == 0) {
                this.fetchMethod('s_n', this.state.queryContent)
            }
            // 判断是不是要带过滤数据请求接口
            if (this.filterView.state['s_y']) {
                this.fetchMethod('s_y', this.state.queryContent)
            } else {
                this.fetchMethod('s_y', {})
            }
            this.unSelectView.toInitialState();
        });
    }
    // 向右移时是不是有一个
    isHaveOne = () => {
        let selectedIds = this.unSelectView.state.selectedIds;
        let { noSelectData } = this.state;

        return !!noSelectData.find(v => {
            return selectedIds.includes(v.id)
        })
    }
    //处理删除
    handleRemove = (id) => {
        let selectedFGListNew = this.state.selectedFGList;
        if (id) {
            let changeRowData = this.state.hasSelectData.find(hasSelectItem => hasSelectItem.id == id);

            //满赠高阶版
            if (selectedFGListNew[id]) {
                delete selectedFGListNew[id];
            }

            this.setState({
                selectedList: difference(this.state.selectedList, [id]),
                hasSelectData: this.state.hasSelectData.filter(hasSelectItem => hasSelectItem.id != id),
                hasSelectPagination: Object.assign({}, this.state.hasSelectPagination, {
                    totalResult: this.state.hasSelectPagination.totalResult - 1
                }),
                noSelectData: [changeRowData, ...this.state.noSelectData],
                noSelectPagination: Object.assign({}, this.state.noSelectPagination, {
                    totalResult: this.state.noSelectPagination.totalResult + 1
                }),

                selectedFGList: selectedFGListNew,      //满赠高阶版
            }, () => {
                if (this.state.hasSelectData.length == 0) {
                    this.fetchMethod('s_y', this.state.queryContent)
                }
            });
            return
        }
        // 选择全部
        if (this.selectView.state.selectAllPageFlag) {
            this.setState({
                selectedList: [],
                hasSelectData: [],
                hasSelectPagination: {},
                selectedFGList: {},     //满赠高阶版
            }, () => {
                this.selectView.toInitialState();
                this.fetchMethod('s_n', this.state.queryContent)
            });
            return;
        }
        let selectedIds = this.selectView.state.selectedIds;
        if (selectedIds.length == 0) {
            message.warning('请先选择商品')
            return;
        }

        // 满赠高阶版
        selectedIds.map(item => {
            if (selectedFGListNew[item]) {
                delete selectedFGListNew[item];
            }
        })

        this.setState({
            selectedList: difference(this.state.selectedList, selectedIds),
            hasSelectData: this.state.hasSelectData.filter(hasSelectItem => !selectedIds.includes(hasSelectItem.id)),
            hasSelectPagination: Object.assign({}, this.state.hasSelectPagination, {
                totalResult: this.state.hasSelectPagination.totalResult - selectedIds.length
            }),
            selectedFGList: selectedFGListNew,      //满赠高阶版
        }, () => {
            if (this.state.hasSelectData.length == 0) {
                this.fetchMethod('s_y', this.state.queryContent)
            }
            this.fetchMethod('s_n', this.state.queryContent)
            this.selectView.toInitialState();
        });
    }

    //满赠高阶版 设置赠品价格
    handleChangePrice = (id = undefined, value) => {
        if (id) {
            let FGList = this.state.selectedFGList || {};
            if (FGList && FGList[id]) {
                FGList[id].salePrice = value;
            } else {
                FGList[id] = { spuId: id, salePrice: value };
            }
            this.setState({ selectedFGList: FGList })
        }
    }

    // 批量设置换购价
    handleCPSelected = (value) => {
        let selectedIdsNew = [];
        let FGList = this.state.selectedFGList || {};
        if (this.selectView.state.selectAllPageFlag) { selectedIdsNew = this.state.selectedList; } else { selectedIdsNew = this.selectView.state.selectedIds; }
        if (selectedIdsNew.length == 0) {
            message.warning('请先选择商品')
            return;
        }

        selectedIdsNew.map(item => {
            FGList[item] = { spuId: item, salePrice: value };
        })
        this.setState({ selectedFGList: FGList })
    }
}

MainView.defaultProps = {
    filterObj: {},
    haveSelectedIds: [],
    modalTitle: '商品选择',
    btnTitle: '选择商品',
    showConfirmBtn: true,
    notSelectIds: [],
    originRecord: {},
    cancelText: "取消",
    okText: "确认",
    showFGBtn: false,
    haveSelectedSpuDtos: {},
}
MainView.propTypes = {
    filterObj: PropTypes.object,      // 过滤条件
    onClose: PropTypes.func,          // 关闭后的执行函数	
    haveSelectedIds: PropTypes.array, // 已选数据	
    onHandleSure: PropTypes.func,     // 点击后的执行函数	
    modalTitle: PropTypes.string,     // 表头名称
    btnTitle: PropTypes.string,       // 按钮名称
    showConfirmBtn: PropTypes.bool,   // 展示确定按钮
    veidoo: PropTypes.string,         // 权限策略参数
    includeIds: PropTypes.array,      // 查询时包含的spuId
    excludeIds: PropTypes.array,      // 查询时不包含的spuId
    notSelectIds: PropTypes.array,    // 在左边显示是不可以选择的状态
    classified: PropTypes.bool,       // 显示按商品范围查找
    classifiedOnly: PropTypes.bool,   // 只显示按商品范围查找
    originRecord: PropTypes.object,   // 按条件查询
    cancelText: PropTypes.string,     // 取消按钮文字
    okText: PropTypes.string,         // 确认按钮文字
    showFGBtn: PropTypes.bool,        // 满赠高阶版换购价
    haveSelectedSpuDtos: PropTypes.object,    // 满赠高阶版已选数据

};

export default MainView;