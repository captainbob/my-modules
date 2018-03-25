import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FilterView from './filter';
import { Button, Modal, message, Pagination, Row, Col, Spin } from 'antd';
import { uniq, difference } from 'lodash';
import { HttpUtil } from 'djmodules-utils';
import TableView from './table';

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
        selectedObj: {
            selectedRowKeys: []
        },  // 当前选择的ids

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

    handleOk = () => {
        this.setState({ visible: false }, () => {
            try {
                if (typeof this.props.onClose == 'function')
                    this.props.onClose();
                this.props.onHandleSure(this.state.selectedObj)
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
            currentPage: page
        });
        // 包含的couponIds中查找
        if (this.props.includeIds) {
            queryContent['couponIdArr'] = this.props.includeIds.join(",")
        }

        let ajaxData = {
            queryInfo: JSON.stringify(queryContent),
        }
        // 数据权限
        if (this.props.veidoo) {
            ajaxData["veidoo"] = this.props.veidoo
        }
        this.setState({
            loading: true
        }, () => {
            HttpUtil.promiseAjax('mkt/coupon/get_query_list.do', {
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
                message.error(messageText)
                this.setState({
                    loading: false
                })
            })
        });
    }

    format = (data = []) => {
        if (data == null) {
            data = []
        }
        return data.map(v => {
            v.id = v.couponId;
            v.key = v.couponId;   // key
            v.noAgreement = v.noAgreement || false // 是否允许
            return v
        })
    }

    get modalFooter() {
        const { mode } = this.props;
        switch (String(mode)) {
            case "view":
                return [
                    <Button key="back" size="large" onClick={this.handleCancel}>关闭</Button>,
                ]
            default:
                return [
                    <Button key="back" size="large" onClick={this.handleCancel}>取消</Button>,
                    <Button key="submit" type="primary" size="large" onClick={this.handleOk}>
                        确认
                    </Button>,
                ]
        }
    }

    render() {
        const { visible, loading } = this.state;
        const expand = this.state.expand;
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
                    width={780}
                    style={{ top: 80 }}
                    footer={this.modalFooter}
                    className="dj-coupon-single-select"
                >
                    <div>
                        <section>
                            <FilterView
                                handleSearch={this.fetchMethod}
                                onChangeExpand={(value) => this.setState({ expand: value })}
                                invaldType={this.props.invaldType}
                                ref={view => this.filterView = view}
                            />
                        </section>
                        <div className='dj-coupon-line'></div>
                        <section>
                            <Spin spinning={this.state.loading}>
                                <TableView
                                    pagination={false}
                                    style={{ marginBottom: 12 }}
                                    dataSource={this.state.dataSource}
                                    selectedRowKeys={this.state.selectedObj.selectedRowKeys}
                                    onChange={this.onChange}
                                    mode={this.props.mode}
                                    rowSelectType={this.props.rowSelectType}
                                />
                                <Pagination { ...formatPagination(this.state.pagination, (page) => this.fetchMethod(this.state.queryContent, page)) } style={paginationStyle} />
                            </Spin>
                        </section>
                    </div>
                </Modal>
            </div>
        );
    }

    onChange = (selectedRowKeys, selectedRows) => {
        this.setState({
            selectedObj: {
                selectedRowKeys,
                selectedRows
            }
        });
    }

}

MainView.defaultProps = {
    modalTitle: '优惠券选择',
    btnTitle: '选择优惠券',
    invaldType: 2,
    rowSelectType: "radio",
}

MainView.propTypes = {
    onClose: PropTypes.func,              // 关闭后的执行函数	
    onHandleSure: PropTypes.func,         // 点击后的执行函数	
    modalTitle: PropTypes.string,         // 表头名称
    btnTitle: PropTypes.string,           // 按钮名称
    noBtn: PropTypes.bool,                // 是否展示按钮
    includeIds: PropTypes.array,          // 查询时包含的spuId
    excludeIds: PropTypes.array,          // 查询时不包含的spuId
    mode: PropTypes.oneOf(['view']),      // 组件模式,默认没有 - ，查看 view
    invaldType: PropTypes.number,         // 去除某一类型的优惠券
    rowSelectType: PropTypes.string,       // 是不是多选
};

export default MainView;