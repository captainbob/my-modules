import { Table, Icon, Modal, Button, Progress } from 'antd';
import React, { Component } from 'react';

/**
 * 错误报告窗口
 */
class ReportWindow extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            reportRowErrors: []
        }
    }

    columns = [
        {
            title: '行数',
            key: 'rowNum',
            width: 80,
            render: (text, record) => {
                let rowNum = record.rowNum + 1;
                return (rowNum)
            },
        },
        {
            title: '错误原因',
            dataIndex: 'errorMessage',
            key: 'errorMessage',
        }
    ];

    handleCancel = () => {
        if (this.props.onClose) {
            this.props.onClose()
        }
    }

    handleSureImport = () => {
        if (this.props.onClose) {
            this.props.onClose()
        }
        this.props.handleImmediatelyToDB();
    }

    render() {
        const { reportDetail } = this.props
        const totalCount = reportDetail.totalCount ? reportDetail.totalCount : 0;
        const errorCount = reportDetail.errorCount ? reportDetail.errorCount : 0
        const successCount = totalCount - errorCount;
        const hasRowError = this.props.reportRowErrors.length > 0;
        const hasGlobalError = this.props.reportExceptons.length > 0;
        const hasError = hasRowError || hasGlobalError;
        return (
            <Modal
                maskClosable={false}
                visible={this.props.visible}
                title="导入报告"
                onCancel={this.handleCancel}
                footer={[
                    <Button key={0} size="large" onClick={this.handleCancel}>
                        关闭
					</Button>,
                    <Button key={1} size="large" type="primary" onClick={this.handleSureImport}
                        style={{ display: (this.props.task.mode == 1 && !hasGlobalError && successCount > 0) ? "inline" : "none" }}>

                        {hasRowError ? "继续导入" : "确认导入"}
                    </Button>
                ]}
                width={600}>
                <p style={{ padding: 10 }}>当前数据
                    <span style={{ color: "red" }}>{totalCount}</span> 条，
                    成功
                    <span style={{ color: "red" }}>{successCount}</span> 条，
                    失败
                    <span style={{ color: "red" }}>{errorCount}</span> 条</p>

                <div style={{ textAlign: "center", display: hasError ? "none" : "block" }}>
                    <p style={{ fontSize: 55, color: "green", verticalAlign: "middle", display: "inline" }}><Icon type="check-circle" /></p>
                    <p style={{ fontSize: 20 }}>{this.props.task.mode == 1 ? "校验通过" : "导入成功"}</p>
                </div>

                <div style={{ height: 300, display: hasRowError ? "block" : "none" }}>
                    <p style={{ padding: 10 }}>失败原因如下</p>
                    <Table columns={this.columns} dataSource={this.props.reportRowErrors}
                        pagination={false} scroll={{ y: 210 }} rowKey="rowNum" />
                </div>

                <div style={{ maxHeight: "300px", overflowY: "auto", display: hasGlobalError ? "block" : "none" }}>
                    <p style={{ padding: 10 }}>错误信息如下</p>
                    {this.props.reportExceptons}
                </div>
            </Modal>
        );
    }
}

export default ReportWindow;