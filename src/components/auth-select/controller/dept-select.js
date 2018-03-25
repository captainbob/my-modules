import React, { Component } from 'react';
import { TreeSelect } from 'antd';
import { DeptBasePropProvider } from '../remote';

const TreeNode = TreeSelect.TreeNode;

class DeptSelect extends Component {
    deptBasePropProvider;
    constructor(props, context) {
        super(props, context);
        this.deptBasePropProvider = new DeptBasePropProvider(props.parentId, props.veidoo);
        this.state = {
            datas: {}
        };
    }

    componentDidMount() {
        let _this = this;
        this.deptBasePropProvider.getData(e => {
            let halfDeptIds = [];
            _this.getHalfDepts(halfDeptIds, e.resultObject.children)
            _this.setState({
                datas: e.resultObject,
                halfDeptIds: halfDeptIds
            });
        });
    }

    getHalfDepts = (deptIds, children) => {
        let _this = this;
        if (children) {
            children.forEach(function (element) {
                if (element.half) {
                    deptIds.push(element.id);
                }
                _this.getHalfDepts(deptIds, element.children);
            }, this);
        }
    }

    render() {
        const treeNodeView = (children) => {
            if (children == null || children.length == 0) {
                return;
            }
            let treeNodes = [];

            children.forEach(function (element) {
                treeNodes.push(<TreeNode value={element.id} disabled={element.half}
                    title={element.name} key={element.id}>
                    {treeNodeView(element.children)}
                </TreeNode>)
            }, this);

            return treeNodes;
        }
        let props = this.props;
        return (
            <TreeSelect treeDefaultExpandedKeys={this.state.halfDeptIds} {...props}>
                {treeNodeView(this.state.datas.children)}
            </TreeSelect>
        );
    }
}

export default DeptSelect;
