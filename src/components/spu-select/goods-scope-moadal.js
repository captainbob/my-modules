import React, { Component } from "react";
import PropTypes from 'prop-types';
import {
    Row, Col, Button, message, Icon, Alert, Modal,
    Input, Radio, Card, Tree,
} from "antd";
import * as GoodsScopeItem from './goods-scope-moadal-item';

const RadioGroup = Radio.Group;
const TreeNode = Tree.TreeNode;


/**
 * 奖励规则
 */
class GoodsScopeView extends Component {
    static propTypes = {
        originRecord: PropTypes.object
    }

    static defaultProps = {
        originRecord: {}
    }

    constructor(props) {
        super(props);
        this.state = {
            errorMessage: "",
            ruleItemSet: new Set(),//需要渲染的组件原始数据
            ruleItemArray: [],//原始数据转换为组数
            originRecord: Object.assign({           //初始化规则
                "childBrandId": [],                 // 子品牌id
                "goodsCategory": [],                // 商品类目
                "goodsSection": [],                 //商品层        
                "yearLike": [],                     // 年份
                "seasonLike": [],                   //季节
            }, this.props.originRecord),
            originRecordName: Object.assign({           //初始化规则
                "childBrandName": [],                 // 子品牌id
                "goodsCategoryName": [],                // 商品类目
                "goodsSectionName": [],                 //商品层        
                "yearLikeName": [],                     // 年份
                "seasonLikeName": [],                   //季节
            }, this.props.originRecordName),

        }
    }

    componentDidMount() {
        const editInfo = this.state.originRecord;
        let ruleItemSet = new Set();
        try {
            this.state.ruleItemSet.clear();
            if (editInfo.childBrandId.length) {
                ruleItemSet.add("GOODS_BRAND");
            }
            if (editInfo.goodsCategory.length) {
                ruleItemSet.add("GOODS_CATEGORY");
            }
            if (editInfo.goodsSection.length) {
                ruleItemSet.add("GOODS_SELECT");
            }
            if (editInfo.yearLike.length) {
                ruleItemSet.add("PARTICULAR_YEAR");
            }
            if (editInfo.seasonLike.length) {
                ruleItemSet.add("SEASON");
            }

        } catch (error) {
            console.error(error);
        }
        const ruleItemArray = Array.from(ruleItemSet);
        this.setState({
            ruleItemSet: ruleItemSet,
            ruleItemArray: ruleItemArray
        })
    }


    render() {
        let { children, style } = this.props;
        style = Object.assign({ display: 'inline-block' }, style);
        return (
            <Row type="flex" gutter={16} style={{ height: "100%" }}>
                <Col key="1" span={6}>
                    <div style={{ lineHeight: "40px" }}>范围条件</div>
                    <Card className="card-height">
                        <Tree
                            showLine
                            defaultExpandAll={true}
                            onSelect={this.onSelect}
                            selectedKeys={[]}
                        >
                            <TreeNode title="商品品牌" key="GOODS_BRAND" />
                            <TreeNode title="商品类目" key="GOODS_CATEGORY" />
                            <TreeNode title="商品层" key="GOODS_SELECT" />
                            <TreeNode title="年份" key="PARTICULAR_YEAR" />
                            <TreeNode title="季节" key="SEASON" />
                        </Tree>
                    </Card>
                </Col>
                <Col key="2" span={16}>
                    <div style={{ lineHeight: "40px" }}>范围内容</div>
                    <Card className="rule-modal card-height" style={{ overflow: "auto" }}>
                        {this.getRuleItem()}
                    </Card>
                </Col>
            </Row>
        );

    }

    // 删除一个选项
    onClose = (value) => {
        const ruleItemSet = this.state.ruleItemSet;
        ruleItemSet.delete(value);
        this.setState({
            ruleItemSet: ruleItemSet,
            ruleItemArray: Array.from(ruleItemSet)
        }, () => {
            this.props.onSelect(Array.from(ruleItemSet))
        })
    }

    onSelect = (selectKey, e) => {
        selectKey = selectKey[0]
        if (this.state.ruleItemSet.has(selectKey)) {
            return
        } else {
            const ruleItemSet = this.state.ruleItemSet;
            ruleItemSet.add(selectKey);
            this.setState({
                ruleItemSet: ruleItemSet,
                ruleItemArray: Array.from(ruleItemSet)
            }, () => {
                this.props.onSelect(Array.from(ruleItemSet))
            })
        }
    }

    onChangeProp = (data,textData) => {
        const originRecord = Object.assign(this.state.originRecord, data);
        const originRecordName=Object.assign(this.state.originRecordName,textData)
        this.setState({
            originRecord: originRecord,
            originRecordName:originRecordName
        })
    }

    getRuleItem = () => {
        const { ruleItemSet, ruleItemArray } = this.state;
        let retArr = [], viewItem;
        for (let key of ruleItemSet) {
            switch (key) {
                case "GOODS_BRAND":
                    viewItem = (
                        <GoodsScopeItem.GoodsBrand
                            key="GOODS_BRAND"
                            keyId="GOODS_BRAND"
                            dataSource={this.state.originRecord}
                            onClose={this.onClose}
                            onChangeProp={this.onChangeProp}
                        />
                    )
                    break;
                case "GOODS_CATEGORY":
                    viewItem = (
                        <GoodsScopeItem.GoodsCategary
                            key="GOODS_CATEGORY"
                            keyId="GOODS_CATEGORY"
                            onChangeProp={this.onChangeProp}
                            dataSource={this.state.originRecord}
                            onClose={this.onClose}
                        />
                    )
                    break;
                case "GOODS_SELECT":
                    viewItem = (
                        <GoodsScopeItem.GoodsSection
                            key="GOODS_SELECT"
                            keyId="GOODS_SELECT"
                            onChangeProp={this.onChangeProp}
                            dataSource={this.state.originRecord}
                            onClose={this.onClose}
                        />
                    )
                    break;
                case "PARTICULAR_YEAR":
                    viewItem = (
                        <GoodsScopeItem.YearLink
                            key="PARTICULAR_YEAR"
                            keyId="PARTICULAR_YEAR"
                            onChangeProp={this.onChangeProp}
                            dataSource={this.state.originRecord}
                            onClose={this.onClose}
                        />
                    )
                    break;
                case "SEASON":
                    viewItem = (
                        <GoodsScopeItem.SeasonLike
                            key="SEASON"
                            keyId="SEASON"
                            onChangeProp={this.onChangeProp}
                            dataSource={this.state.originRecord}
                            onClose={this.onClose}
                        />
                    )
                    break;
                default:
                    viewItem = (<span>代办...</span>)
                    break;
            }
            retArr.push(viewItem)
        }
        return retArr;
    }
    // 自定义如何检验onChange返回的值 
    onValidate = (rule, value, callback) => {
        if (typeof (value) == "string") {
            value = value ? value.replace(/^\s+|\s+$/g, "") : value
        }

        if (!value || value.length == 0) {
            if (rule.required) {
                return callback('输入不能为空')
            }
            return callback();
        }
        callback();
    }
}


export default GoodsScopeView;