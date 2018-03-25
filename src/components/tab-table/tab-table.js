import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Tabs } from 'antd';
import PropTypes from 'prop-types';
import ListV from './list-v';

const TabPane = Tabs.TabPane;

class TabTable extends Component {

    constructor(props, context) {
        super(props, context);
        this.state = {
            activeKey: this.props.activeKey,
            loading: false,
            driverVisable: false,
            driverEditable: false,
            currentBillId: null
        }
    }

    render() {
        let tabs = this.props.tabDatas
        return (
            <Tabs defaultActiveKey={this.state.activeKey + ""} onChange={this.props.handlerTabChange}
                type="card" style={{ margin: 20 }} animated={true}>
                {(() => {
                    let tabViews = [];
                    for (let i = 0; i < tabs.length; i++) {
                        let tab = tabs[i];
                        tabViews.push(
                            <TabPane tab={tab.label} key={tab.status}>
                                <ListV ref={"tab_" + tab.status}
                                    formView={this.props.formView}
                                    data={{
                                        thisKey: tab.status,
                                        list: this.props.getDataList(tab.status) ? this.props.getDataList(tab.status) : [],
                                        pagination: this.props.getPagination(tab.status) ? this.props.getPagination(tab.status) : {},
                                        columns: this.props.columns,
                                        tab: tab
                                    }}
                                    handlerPageQuery={this.props.handlerPageQuery}
                                />
                            </TabPane>)
                    }
                    return tabViews;
                })()}
            </Tabs>

        );
    }
}

TabTable.propTypes = {
    activeKey: PropTypes.string.isRequired,
    tabDatas: PropTypes.array.isRequired,
    columns: PropTypes.array.isRequired,
    formView: PropTypes.node,
    getDataList: PropTypes.func.isRequired,
    getPagination: PropTypes.func.isRequired,
    handlerTabChange: PropTypes.func.isRequired,
    handlerPageQuery: PropTypes.func.isRequired,
};

export default TabTable;
