import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Popover, Input, Icon, Spin, message } from 'antd';
import { HttpUtil } from 'djmodules-utils/lib';

const InputGroup = Input.Group;

class DjGoodsTagPopoverContent extends Component {
    state = {
        filters: '',
        privateTags: [],
        publicTags: [],
        loading: false
    }
    componentDidMount() {
        this.handleSearch()
    }
    render() {
        let { filters, privateTags, publicTags, loading } = this.state;
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
                        <p className="cat-title">公有标签</p>
                        {publicTags.length > 0 ? publicTags.map(v => {
                            return (
                                <span key={v.tagId} className={selectedIds.includes(v.tagId) ? 'selected' : 'unselected'} onClick={() => handleToggle(v.tagId, v)}>{v.tagName}</span>
                            )
                        }) : (
                                <div className="none-data">暂无数据</div>
                            )}
                    </div>
                    <div>
                        <p className="cat-title">私有标签</p>
                        {privateTags.length > 0 ? privateTags.map(v => {
                            return (
                                <span key={v.tagId} className={selectedIds.includes(v.tagId) ? 'selected' : 'unselected'} onClick={() => handleToggle(v.tagId, v)}>{v.tagName}</span>
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
        let ajaxData = {
            tagName: value
        }
        return HttpUtil.ajax('goodsx/stag/get_all_tags', {
            data: ajaxData,
            method: "POST"
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
                    let { privateTags, publicTags } = res.resultObject;
                    if (privateTags == null)
                        privateTags = []
                    if (publicTags == null)
                        publicTags = []

                    this.setState({
                        privateTags: privateTags,
                        publicTags: publicTags,
                        loading: false
                    });
                } else {
                    this.setState({
                        loading: false,
                        privateTags: [],
                        publicTags: []
                    });
                    message.error(res.exceptionMessage || res.message || '请求错误')
                }
            })
        })
    }
}

export default DjGoodsTagPopoverContent;
