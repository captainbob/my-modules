import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tree, Input } from 'antd';
import Remote from './remote';

import { HttpUtil } from 'djmodules-utils';

const Ajax = HttpUtil.ajax;
const TreeNode = Tree.TreeNode;
const Search = Input.Search;


export default class SearchTree extends Component {
    state = {
        searchValue: '',
        autoExpandParent: true,
        gData: [],
        dataList: []
    }

    generateData = (paretNode, children) => {
        for (let i = 0; i < children.length; i++) {
            const node = children[i];
            const key = node.id;
            const name = node.name;
            const nodeData = { key, title: name };

            nodeData.pnode = paretNode;
            paretNode.children.push(nodeData);
            this.state.dataList.push(nodeData)
            if (node.children) {
                nodeData.children = [];
                this.generateData(nodeData, node.children);
            }

        }
    }

    getParentKey = (key, tree) => {
        let parentKey;
        for (let i = 0; i < tree.length; i++) {
            const node = tree[i];
            if (node.children) {
                if (node.children.some(item => item.key === key)) {
                    parentKey = node.key;
                } else if (this.getParentKey(key, node.children)) {
                    parentKey = this.getParentKey(key, node.children);
                }
            }
        }
        return parentKey;
    }

    getByKey = (key) => {
        for (let i = 0; i < this.state.dataList.length; i++) {
            const node = this.state.dataList[i];
            if (node.key == key) {
                return node;
            }
        }
    }

    onExpand = (expandedKeys) => {
        this.setState({
            autoExpandParent: false,
        });
        this.props.onExpandCatalog(expandedKeys)
    }

    onChange = (e) => {
        const value = e.target.value;
        const expandedKeys = this.state.dataList.map((item) => {
            if (value && item.title.indexOf(value) > -1) {
                return this.getParentKey(item.key, this.state.gData);
            }
            return null;
        }).filter((item, i, self) => item && self.indexOf(item) === i);
        if (expandedKeys.length > 0) {
            this.props.onExpandCatalog(expandedKeys)
        }
        this.setState({
            searchValue: value,
            autoExpandParent: true,
        });

    }

    onSelect = (selectedKeys, info) => {
        if (selectedKeys.length == 0) {
            return;
        }
        if (this.props.onSelect) {
            this.props.onSelect(this.getByKey(selectedKeys[0]))
        }
    }

    componentDidMount() {
        Remote.getCatalogList().then((res) => {
            const key = res.id;
            const name = res.name;
            const nodeData = { key, title: name, children: [] };
            this.generateData(nodeData, res.children);
            this.state.gData.push(nodeData)
            this.state.dataList.push(nodeData)
            this.setState({
                gData: this.state.gData,
                dataList: this.state.dataList
            })
            this.props.onExpandCatalog([key])
            this.props.setDefaultCat(res.sourceObj)
            if (this.props.onLoad) {
                this.props.onLoad(nodeData)
            }

        })
    }

    render() {

        const { searchValue, autoExpandParent } = this.state;
        const { expandedKeys } = this.props;
        const loop = data => data.map((item) => {
            const index = item.title.search(searchValue);
            const beforeStr = item.title.substr(0, index);
            const afterStr = item.title.substr(index + searchValue.length);
            const title = index > -1 ? (
                <span>
                    {beforeStr}
                    <span style={{ color: '#f50' }}>{searchValue}</span>
                    {afterStr}
                </span>
            ) : <span>{item.title}</span>;
            if (item.children) {
                return (
                    <TreeNode key={item.key} title={title}>
                        {loop(item.children)}
                    </TreeNode>
                );
            }
            return <TreeNode key={item.key} title={title} />;
        });
        return (
            <div>
                <Search style={{ width: '87%', marginLeft: '7px', height: 25 }} placeholder="按文件夹名搜索" onChange={this.onChange} />
                <div style={{ height: 325, overflow: 'auto' }}>
                    <Tree
                        showLine
                        onExpand={this.onExpand}
                        onSelect={this.onSelect}
                        selectedKeys={[this.props.selectedCatId + ""]}
                        expandedKeys={this.props.expandedKeys}
                        autoExpandParent={autoExpandParent}>
                        {loop(this.state.gData)}
                    </Tree>
                </div>
            </div>
        );
    }
}