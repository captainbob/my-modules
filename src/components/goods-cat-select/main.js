import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, message, Spin } from 'antd';
import { HttpUtil } from 'djmodules-utils';
import TableView from './table';

let getData = (function () {
    let data;
    return function () {
        if (data) {
            return new Promise((resolve) => {
                resolve(data)
            })
        }
        return HttpUtil.ajax('/rs/goodsx/sbuffcat/get_tree', {
            method: 'get',
        }).then(res => {
            data = res
            return res
        }).catch(err => {
            message.error(err.exceptionMessage || err.message || '请求错误')
        })
    }
})()

class MainView extends Component {
    state = {
        loading: false,
        visible: false,
        selectedObj: {},  // 当前右边的ids
        dataSource: []
    }

    showModal = () => {
        this.setState({
            visible: true,
        }, () => {
            this.fetchMethod()
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

    fetchMethod = () => {
        this.setState({
            loading: true
        }, () => {
            getData().then((res) => {
                if (res.status == 'success') {
                    this.setState({
                        dataSource: this.formatData(res.resultObject),
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
    formatData = (data) => {
        let children = (data && data.children) || [];
        return children.map((v, i) => {
            return {
                key: i,
                ...v.sourceObj.brandBuffCatAtom,
                children: v.children && v.children.map((catItem, catIndex) => {
                    return {
                        key: i + '-' + catIndex,
                        ...catItem.sourceObj.brandBuffCatAtom
                    }
                })
            }
        })
    }
    render() {
        return (
            <div style={Object.assign({ display: 'inline-block' }, this.props.style)}>
                {this.props.noBtn ? undefined : this.props.children ? this.props.children : (
                    <Button type="primary" onClick={this.showModal}>
                        {this.props.btnTitle}
                    </Button>
                )}
                <Modal
                    visible={this.state.visible}
                    title={this.props.modalTitle}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    width={800}
                    style={{ top: 80 }}
                    footer={false}
                    className="dj-good-cat-select"
                >
                    <section>
                        <Spin spinning={this.state.loading}>
                            <TableView
                                dataSource={this.state.dataSource}
                                style={{ marginBottom: 12 }}
                                scroll={{
                                    y: 600
                                }}
                                handleChoose={this.onChange}
                            />
                        </Spin>

                    </section>
                </Modal>
            </div>
        );
    }
    onChange = (selectedObj) => {
        this.setState({
            selectedObj: selectedObj
        }, () => {
            this.handleOk()
        });
    }

}

MainView.defaultProps = {
    modalTitle: '商品分组选择',
    btnTitle: '选择商品分组'
}
MainView.propTypes = {
    onClose: PropTypes.func, //关闭后的执行函数	
    onHandleSure: PropTypes.func, //点击后的执行函数	
    modalTitle: PropTypes.string, //表头名称
    btnTitle: PropTypes.string, //按钮名称
    noBtn: PropTypes.bool, //是否展示按钮
};

export default MainView;