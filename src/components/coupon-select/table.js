import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table, Icon, Row, Col, Checkbox } from 'antd';

class TableView extends Component {
    // 是否显示行选择功能
    isShowRowSelect = () => {
        let mode = this.props.mode || '';
        switch (String(mode)) {
            case "view":
                // 查看模式    
                return {}
            default:
                // 默认情况返回 选择功能    
                return {
                    rowSelection: {
                        type: this.props.rowSelectType,
                        selectedRowKeys: this.props.selectedRowKeys,
                        onChange: (selectedRowKeys, selectedRows) => {
                            try {
                                this.props.onChange(selectedRowKeys, selectedRows)
                            } catch (err) {
                                console.log("请填写onChange属性");
                            }
                        }
                    }
                }
        }
    }

    render() {
        return (
            <div>
                <Table
                    dataSource={this.props.dataSource}
                    columns={this.columns}
                    pagination={false}
                    {...this.isShowRowSelect() }
                />
            </div>
        );
    }



    columns = [
        {
            title: "优惠券名称",
            dataIndex: 'name',
            key: '1',
        },
        {
            title: <div style={{ textAlign: 'center' }}>优惠规则</div>,
            dataIndex: 'couponRuleContent',
            key: '2',
            width: 240,
            render: (text, record, index) => {
                let ruleContent = JSON.parse(record.couponRuleContent);
                let ruleTest = "";
                if (record.type == 1) {//现金券
                    if (ruleContent.type == 0) {//无门槛
                        ruleTest = "无门槛减" + ruleContent.denomination + "元";
                    } else if (ruleContent.type == 1) {//满金额
                        ruleTest = "满" + ruleContent.useFullAmount + "元减" + ruleContent.denomination + "元";
                    } else if (ruleContent.type == 2) {//满件数
                        ruleTest = "满" + ruleContent.useFullAmount + "件减" + ruleContent.denomination + "元";
                    }
                } else if (record.type == 2) {//折扣券
                    if (ruleContent.type == 0) {//无门槛
                        ruleTest = "无门槛打" + this.formatFloat(ruleContent.discount / 100, 2) + "折";
                    } else if (ruleContent.type == 1) {//满金额
                        ruleTest = "满" + ruleContent.useFullAmount + "元打" + this.formatFloat(ruleContent.discount / 100, 2) + "折";
                    } else if (ruleContent.type == 2) {//满件数
                        ruleTest = "满" + ruleContent.useFullAmount + "件打" + this.formatFloat(ruleContent.discount / 100, 2) + "折";
                    }
                }
                return <div className='dj-coupon-style'>{ruleTest}</div>;
            }
        },
        {
            title: "有效期",
            dataIndex: 'name',
            key: '3',
            render: (text, record, index) => {
                let dateText;
                // 判断有效期类型
                if (record.effectiveDateType == 1 || record.effectiveDateType == null) {
                    dateText = (
                        <span>
                            {record.beginDate}至
                            <br />
                            {record.endDate}
                        </span>
                    );
                } else if (record.effectiveDateType == 2) {
                    dateText = "领取后" + record.relativeDate + "天内有效";
                }

                return dateText;
            }
        },
        {
            title: "剩余量",
            dataIndex: 'name',
            key: '4',
            render: (text, record, index) => {
                let resultText;
                // 判断是否限量
                if (record.whetherLimitation == 1 || record.whetherLimitation == null) {
                    if (record.pubCount > record.getCount) {
                        resultText = (record.pubCount - record.getCount);
                    } else {
                        resultText = 0;
                    }
                } else if (record.whetherLimitation == 2) {
                    resultText = "不限量"
                }

                return resultText
            }
        },
    ]

    formatFloat = (f, digit) => {
        let m = Math.pow(10, digit);
        return parseInt(f * m, 10) / m;
    }
}

TableView.propTypes = {
    dataSource: PropTypes.array,
    rowSelectType: PropTypes.string,
};

export default TableView;
