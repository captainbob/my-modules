import React, { Component } from 'react';
import { HttpUtil } from 'djmodules-utils';
import { Modal, Button, Row, Col, Input, message, Table, Alert } from 'antd';

const TextArea = Input.TextArea;

class BatchAddModal extends Component {
    state = { visible: false, textValue: undefined, failureList: [] }
    showModal = () => {
        this.setState({
            visible: true,
            textValue: undefined,
            failureList: []
        });
    }
    hideModal = () => {
        this.setState({
            visible: false,
        });
    }
    _handleOk = () => {
        const { textValue } = this.state;
        HttpUtil.promiseAjax("/rs/brand/shop/check_code", {
            method: 'POST',
            data: {
                storageCodes: textValue
            }
        }).then(res => {
            let successList = res.filter(v => v.success),
                failureList = res.filter(v => !v.success);
            let successIds = successList.map(v => v.storageId);
            if (failureList.length == 0) {
                this.setState({
                    visible: false,
                    failureList: [],
                }, () => {
                    const { handleOk } = this.props;
                    if (typeof handleOk == "function")
                        handleOk(successIds);
                    message.success('添加成功')
                });
            } else {
                this.setState({
                    failureList: failureList
                });
            }
        }).catch((err) => {
            message.error("请输入正确的门店编码")
        })
    }
    render() {
        const style = Object.assign({}, this.props.style);
        const { textValue, failureList } = this.state;

        return (
            <div style={style}>
                <Button type="default" onClick={this.showModal}>批量添加</Button>
                <Modal
                    title="批量添加"
                    visible={this.state.visible}
                    onOk={this._handleOk}
                    onCancel={this.hideModal}
                    okText="确认"
                    cancelText="取消"
                    width={600}
                >
                    <Row type="flex" justify="space-between" align="top" gutter={16}>
                        <Col span={10}>
                            <TextArea
                                value={textValue}
                                rows={26}
                                onChange={(e) => this.setState({ textValue: e.target.value })}
                                placeholder="在此粘贴货号，货号与货号之间请用“，”或换行"
                            />
                        </Col>
                        <Col span={14}>
                            <Alert message="温馨提示" type="info" description="打开excel，选择店仓编码这一栏，整列复制，然后粘贴到左侧框中或者手填" />
                            {
                                failureList.length > 0 ? (
                                    <div>
                                        <p style={{ margin: 5 }}>失败原因：</p>
                                        <Table
                                            columns={this.columns}
                                            size="small"
                                            dataSource={failureList}
                                            pagination={false}
                                            scroll={{
                                                y: 300
                                            }}
                                        />
                                    </div>
                                ) : undefined
                            }
                        </Col>
                    </Row>
                </Modal>
            </div>
        );
    }

    columns = [
        {
            title: '店仓编码',
            dataIndex: 'storageCode',
            key: '1',
        },
        {
            title: '失败原因',
            dataIndex: 'errorMessage',
            key: '2',
        }
    ]
}

export default BatchAddModal