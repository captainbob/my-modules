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
        },  // 当前右边的ids

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
        queryContent = Object.assign({}, queryContent, this.state.pagination, {
            currentPage: page
        });
        // 包含的spuIds中查找
        if (this.props.includeIds) {
            queryContent['brandSpuIds'] = this.props.includeIds
        }
        // 不包含的spuIds中
        if (this.props.excludeIds) {
            queryContent['excludedBrandSpuIds'] = this.props.excludeIds
        }
        let ajaxData = {
            queryContent: JSON.stringify(queryContent),
        }
        // 数据权限
        if (this.props.veidoo) {
            ajaxData["veidoo"] = this.props.veidoo
        }
        this.setState({
            loading: true
        }, () => {
            HttpUtil.ajax('goodsx/sprice/get_spu_list', {
                method: 'post',
                data: ajaxData
            }).then((res) => {
                if (res.status == 'success') {
                    this.setState({
                        dataSource: this.format(res.resultObject.results),
                        pagination: res.resultObject.pagination,
                        queryContent: oldQueryContent,
                        loading: false
                    });
                } else {
                    let messageText = res.exceptionMessage || res.message || '请求错误';
                    this.setState({
                        loading: false
                    })
                    message.error(messageText)
                }
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
        let tableHeight
        const innerHeight = window.innerHeight > 960 ? 960 : window.innerHeight
        if (expand) {
            tableHeight = innerHeight - 240 - 274
        } else {
            tableHeight = innerHeight - 240 - 130
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
                    width={1080}
                    style={{ top: 80 }}
                    footer={this.modalFooter}
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
                                <TableView
                                    dataSource={this.state.dataSource}
                                    style={{ marginBottom: 12 }}
                                    scroll={{
                                        y: tableHeight
                                    }}
                                    mode={this.props.mode}
                                    type={1}
                                    pagination={false}
                                    selectedRowKeys={this.state.selectedObj.selectedRowKeys}
                                    onChange={this.onChange}
                                    ref={c => this.unSelectView = c}
                                    showFGBtn={this.props.showFGBtn}            //满赠活动专用是否显示换购价
                                    includeSpuDtos={this.props.includeSpuDtos}  // 满赠活动专用id和换购价对象
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
    filterObj: {},
    modalTitle: '商品选择',
    btnTitle: '选择商品',
}

MainView.propTypes = {
    filterObj: PropTypes.object, //过滤条件
    onClose: PropTypes.func, //关闭后的执行函数	
    onHandleSure: PropTypes.func, //点击后的执行函数	
    modalTitle: PropTypes.string, //表头名称
    btnTitle: PropTypes.string, //按钮名称
    noBtn: PropTypes.bool, //是否展示按钮
    includeIds: PropTypes.array, // 查询时包含的spuId
    excludeIds: PropTypes.array, // 查询时不包含的spuId
    mode: PropTypes.oneOf(['view']), // 组件模式,默认没有 - ，查看 view
    showFGBtn: PropTypes.bool,          //满赠活动专用是否显示换购价
    includeSpuDtos: PropTypes.object,   //满赠活动专用id和换购价对象
};

export default MainView;