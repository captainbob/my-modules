import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Popover, Input, Icon, Spin } from 'antd';
import { HttpUtil } from 'djmodules-utils/lib';

const InputGroup = Input.Group;

class PromotionLabelPopoverContent extends Component {
    state = {
        filters: '',
        promotionLabels: [],
        loading: false
    }
    componentDidMount() {
        this.handleSearch()
    }
    render() {
        let { filters, promotionLabels, loading } = this.state;
        let { selectedIds, handleToggle } = this.props;
        let IconView = <Icon type="search" onClick={this.handleSearch} />

        return (
            <div className='dj-propover'
                style={{
                    width: 300,
                }}>
                <div>
                    <Input
                        className="inline-block"
                        value={filters}
                        onChange={e => {
                            this.setState({
                                filters: e.target.value
                            });
                        }}
                        suffix={IconView}
                        onKeyDown={(e) => {
                            if (e.keyCode == '13')
                                this.handleSearch()
                        }} />
                </div>
                <Spin spinning={loading}>
                    <div>
                        <p className="cat-title">促销标签</p>
                        {promotionLabels.length > 0 ? promotionLabels.map(v => {
                            return (
                                <span key={v.promotionId} className={selectedIds.includes(v.promotionId) ? 'selected' : 'unselected'} onClick={() => handleToggle(v.promotionId, v)}>{v.promotionLabel}</span>
                            )
                        }) : (
                                <div className="none-data">暂无数据</div>
                            )}
                    </div>

                </Spin>
            </div>
        )
    }
    // 请求数据
    fetchData = (value) => {
        let content = {
            promotionLabel: value
        }
        let ajaxData = {
            content: JSON.stringify(content)
        }
        return HttpUtil.ajax('peony/promotion/get_query_list', {
            data: ajaxData,
            method: "GET"
        })
    }
    // 点击搜索
    handleSearch = () => {
        let filters = this.state.filters
        this.setState({
            loading: true
        }, () => {
            this.fetchData(filters).then(res => {
                if (res.status == 'success') {
                    let { results } = res.resultObject;
                    if (results == null)
                        promotionLabels = []

                    this.setState({
                        promotionLabels: results,
                        loading: false
                    });
                } else {
                    this.setState({
                        promotionLabels: [],
                        loading: false,
                    });
                }
            })

        })
    }
}

export default PromotionLabelPopoverContent;
