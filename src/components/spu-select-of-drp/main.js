import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FilterView from './filter';
import { Button, Modal, message, Pagination, Row, Col, Spin } from 'antd';
import { uniq, difference } from 'lodash';
import { HttpUtil } from 'djmodules-utils';
import TableView from './table';
import BaseSelectView from './base-checkbox-select';

const paginationStyle = {
    margin: '10px 0px',
    textAlign: "right"
}
export const formatPagination = (pagination = {}, onChange) => {
    return {
        total: pagination.totalResult || 0,
        current: pagination.currentPage,
        onChange,
        showTotal: (total, range) => { return `共${total}条` },
    }
}
class MainView extends Component {
    state = {
        loading: false,
        visible: false,
        selectedList: this.props.haveSelectedIds,  // 当前右边的ids
        selectObj: {}, // 已选状态

        dataSource: [],
        pagination: {},

        queryContent: {},
        expand: false,
    }

    showModal = () => {
        this.setState({
            visible: true,
        });
    }
    // 选择全部时获取数据
    fetchGetDataIds = () => {
        return HttpUtil.ajax('goodsx/sspu/get_ids', {
            method: 'POST',
            data: this.state.queryContent
        }).then((res) => {
            if (res.status == 'success') {
                return res.resultObject || []
            } else {
                let messageText = res.exceptionMessage || res.message || '请求错误';
                message.error(messageText)
            }
        })
    }
    handleOk = () => {
        this.setState({ visible: false }, () => {
            try {
                if (typeof this.props.onClose == 'function')
                    this.props.onClose();
                let { selectAllPageFlag } = this.state.selectObj;
                if (selectAllPageFlag) {
                    this.fetchGetDataIds().then((res) => {
                        this.props.onHandleSure(res);
                    })
                } else {
                    this.props.onHandleSure(this.state.selectedList)
                }
            } catch (err) {
                console.error(err)
            }
        });
    }

    handleCancel = () => {
        this.setState({ visible: false }, () => {
            if (typeof this.props.onClose == 'function')
                this.props.onClose();
        });
    }

    fetchMethod = (queryContent, page) => {
        let oldQueryContent = Object.assign({}, queryContent);
        let dataSource, pagination;
        page = page || 1;
        queryContent = Object.assign({}, queryContent, {
            currentPage: page,
        });

        if (this.props.includeIds) {
            queryContent['brandSpuIds'] = this.props.includeIds;
        }
        if (this.props.excludeIds) {
            queryContent['excludedBrandSpuIds'] = this.props.excludeIds;
        }
        let ajaxData = {
            queryContent: JSON.stringify(queryContent)
        }
        // 数据权限
        if (this.props.veidoo) {
            ajaxData["veidoo"] = this.props.veidoo
        }

        this.setState({
            loading: true
        }, () => {
            HttpUtil.promiseAjax('goodsx/sprice/get_spu_list', {
                method: 'post',
                data: ajaxData
            }).then((resultObject) => {
                this.setState({
                    dataSource: this.format(resultObject.results),
                    pagination: resultObject.pagination,
                    queryContent: oldQueryContent,
                    loading: false
                });
            }).catch(err => {
                let messageText = err.exceptionMessage || err.message || '请求错误';
                this.setState({
                    loading: false
                })
                message.error(messageText)
            })
        });
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
        const { visible, loading } = this.state;
        const expand = this.state.expand;
        let tableHeight
        const innerHeight = window.innerHeight > 825 ? 825 : window.innerHeight
        if (expand) {
            tableHeight = innerHeight - 240 - 274
        } else {
            tableHeight = innerHeight - 240 - 170
        }
        return (
            <div style={Object.assign({ display: 'inline-block' }, this.props.style)}>
                {this.props.noBtn ? undefined : this.props.children ? this.props.children : (
                    <Button type="primary" onClick={this.showModal}>
                        {this.props.btnTitle}
                    </Button>
                )}
                <Modal
                    visible={visible}
                    title={this.props.modalTitle}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    width={1120}
                    style={{ top: 80 }}
                    footer={[
                        <Button key="back" size="large" onClick={this.handleCancel}>取消</Button>,
                        <Button key="submit" type="primary" size="large" onClick={this.handleOk}>
                            确认
                        </Button>,
                    ]}
                    className="dj-spu-single-select"
                >
                    <div style={{ height: (innerHeight - 220) }}>
                        <section>
                            <FilterView
                                handleSearch={this.fetchMethod}
                                onChangeExpand={(value) => this.setState({ expand: value })}
                                filterObj={this.props.filterObj}
                                ref={view => this.filterView = view}
                            />
                        </section>
                        <div className='dj-spu-line'></div>
                        <section>
                            <Spin spinning={this.state.loading}>
                                <BaseSelectView
                                    selectedList={this.state.selectedList}
                                    dataSource={this.state.dataSource}
                                    style={{ marginBottom: 12 }}
                                    scroll={{
                                        y: tableHeight
                                    }}
                                    pagination={false}
                                    onChange={this.onChange}
                                    ref={c => this.unSelectView = c}
                                />
                                <Pagination { ...formatPagination(this.state.pagination, (page) => this.fetchMethod(this.state.queryContent, page)) } style={paginationStyle} />
                            </Spin>

                        </section>
                    </div>
                </Modal>
            </div>
        );
    }
    onChange = (object) => {
        this.setState({
            selectedList: object.selectedIds,
            selectObj: object
        });
    }
}

MainView.defaultProps = {
    filterObj: {},
    haveSelectedIds: [],
    modalTitle: '商品选择',
    btnTitle: '选择商品'
}
MainView.propTypes = {
    filterObj: PropTypes.object, //过滤条件
    onClose: PropTypes.func, //关闭后的执行函数	
    haveSelectedIds: PropTypes.array, //已选数据	
    onHandleSure: PropTypes.func, //点击后的执行函数	
    modalTitle: PropTypes.string, //表头名称
    btnTitle: PropTypes.string, //按钮名称
    noBtn: PropTypes.bool, //是否展示按钮
    includeIds: PropTypes.array, //只在这个范围的id中查询
    excludeIds: PropTypes.array, // 排除掉这个范围中的id中查询
};

export default MainView;