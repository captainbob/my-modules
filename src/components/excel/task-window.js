import { Table, Icon, Modal, Button, Progress } from 'antd';
import React, { Component } from 'react';
import Remote from './remote'

/**
 * 任务窗口
 */
class TaskWindow extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            results: []
        }
    }

    timer = null;
    columns = [
        {
            title: '任务名称',
            dataIndex: 'jobName',
            width: 180,
            key: 'jobName',
        }, {
            title: '创建时间',
            dataIndex: 'createTime',
            key: 'createTime',
        }, {
            title: '进度',
            key: 'percent',
            width: 220,
            render: (text, record) => {
                let percent = record.percent && record.percent.toFixed(2);
                percent = parseInt(percent);
                return (<div style={{ width: 220 }}><Progress percent={percent} strokeWidth={4} status={record.status} /></div>)
            },
        }, {
            title: '操作',
            key: 'action',
            width: 130,
            render: (text, record) => {
                let buttons = [];
                buttons.push(
                    <a key={0} href="javascript:void(0)" onClick={() => this.onDeleteClick(record)}>删除</a>)

                if (record.exportStatus == 9 && record.percent == 100) {
                    buttons.push(<span key={1} className="ant-divider" />)
                    if (location.href.startsWith("https")) {
                        record.outFilePath = record.outFilePath.replace("http://", "https://");
                    }
                    buttons.push(
                        <a key={2} href={record.outFilePath}>下载</a>
                    )
                }
                if (record.exportStatus == 2) {
                    buttons.push(<span key={3} className="ant-divider" />)
                    buttons.push(
                        <a key={4} href="javascript:void(0)" onClick={() => { this.onReportClick(record) }}>报告</a>
                    )
                }
                return (
                    <span>
                        {buttons}
                    </span>
                )
            },
        }];

    onDeleteClick = (record) => {
        Remote.delJob(record).then((json) => {
            this.loadData();
        });
    }

    onReportClick = (record) => {
        Remote.getReport(record.jobId).then((json) => {
            let resultError = "";
            if (typeof (json.resultObject) == "string") {
                json = JSON.parse(json.resultObject)
            } else {
                json = json.resultObject ? json.resultObject : {}
            }
            if (json.errors) {
                for (let i = 0; i < json.errors.length; i++) {
                    var error = json.errors[i];
                    resultError = error.replace(/\n/g, "<br/>");
                }
            }
            if (json.exceptionErrors) {
                for (let i = 0; i < json.exceptionErrors.length; i++) {
                    var error = json.exceptionErrors[i];
                    resultError = error.replace(/\n/g, "<br/>");
                }
            }
            //显示错误提示框
            Modal.error({
                title: '错误报告',
                content: <pre className='djmodules-excel-pre'>{resultError}</pre>,
            });

        });
    }

    loadData = () => {
        Remote.getList({ bizType: this.props.data.bizType }).then((json) => {
            if (json.complete) {
                this.stopTime();
            }
            this.setState({ results: json.resultObject });
        });
    }

    startTime = () => {
        let _this = this;
        _this.loadData();
        if (this.timer == null) {
            this.timer = setInterval(function () {
                _this.loadData();
            }, 3000);
        }
    }

    stopTime = () => {
        window.clearInterval(this.timer);
        this.timer = null
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ visible: nextProps.visible });
        if (nextProps.visible == true) {
            this.setState({
                visible: nextProps.visible
            });
            this.startTime();
        }
    }

    handleOk = () => {
        if (this.props.onClose) {
            this.props.onClose()
        }
        this.stopTime();
    }

    handleCancel = () => {
        if (this.props.onClose) {
            this.props.onClose()
        }

        this.stopTime();
    }

    render() {
        return (
            <Modal
                maskClosable={false}
                visible={this.props.visible}
                title="任务列表"
                onOk={this.handleOk}
                onCancel={this.handleCancel}
                width={800}>
                <Table columns={this.columns} dataSource={this.state.results} pagination={false} />
            </Modal>
        );
    }
}

export default TaskWindow;