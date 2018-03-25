import React, { Component } from 'react';
import { CachedBaseDataProvider, BaseDataProvider } from 'djmodules-utils/lib';
import { TreeSelect } from 'antd';

const TreeNode = TreeSelect.TreeNode;

class AreaSelect extends Component {
    provider = new CachedBaseDataProvider(new BaseDataProvider('brand/area/get_tree', {
        method: 'GET',
        data: {
            brandId: window.currentBrandId,
            veidoo: "areaData"
        }
    }));

    constructor(props, context) {
        super(props, context);
        this.state = {
            datas: {}
        };
    }

    componentDidMount() {
        this.provider.getData(e => {
            let halfAreaIds = [];
            this.getHalfAreas(halfAreaIds, e.resultObject.children)
            this.setState({
                datas: e.resultObject,
                halfAreaIds: halfAreaIds
            });
        });
    }

    getHalfAreas = (areaIds, children) => {
        let _this = this;
        if (children) {
            children.forEach(function (element) {
                if (element.half) {
                    areaIds.push(element.id);
                }
                _this.getHalfAreas(areaIds, element.children);
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
            <TreeSelect treeDefaultExpandedKeys={this.state.halfAreaIds} {...props}>
                {treeNodeView(this.state.datas.children)}
            </TreeSelect>
        );
    }
}

export default AreaSelect;
