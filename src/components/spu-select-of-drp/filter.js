import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Button, Input, InputNumber, Select, Icon, Checkbox, DatePicker } from 'antd';
// import { DjPopover, CatTree, DjSelect } from 'djmodules';
import DjPopover from '../dj-popover/index';
import '../dj-popover/style/index'
import CatTree from '../cat-tree/index';
import '../cat-tree/style/index'
import DjSelect from '../dj-select/index';
import '../dj-select/style/index'

const InputGroup = Input.Group;
const Option = Select.Option;
const { Ranges, Year, Season, ChildBrand, Series, Section, Style } = DjSelect;
const { GoodsTagPopover, PromtionPopover } = DjPopover;
const { GoodsBuffCatTree, BrandCatTree } = CatTree;
const RangePicker = DatePicker.RangePicker;
const queryItemLayout = {
    labelCol: {
        sm: { span: 8 },
    },
    wrapperCol: {
        sm: { span: 16 },
    },
};

class FilterView extends Component {
    state = Object.assign({
        "keyword": undefined,
        "childBrandId": "",
        "catIds": null,
        "yearIds": undefined,
        "seasonIds": undefined,
        "rangesIds": undefined,
        "sectionIds": undefined,
        "seriesIds": undefined,
        "styleIds": undefined,
        "selectCatDatas": {},
        "marketTime": [],
        "expand": this.props.expand || false, // 展开
    }, this.props.filterObj)

    componentDidMount() {
        this._handleSearch()
    }
    render() {
        const { expand } = this.state;
        const expandStyle = {
            display: expand ? 'inline-block' : 'none'
        }
        const labelStyle = {
            textAlign: "right",
            paddingRight: 10,
            lineHeight: "28px",
            marginBottom: 8

        }
        if (!this.state.expand) {
            return (
                <div className='spu-goods-choose-component'>
                    <Row>
                        <Col span={6}>
                            <Col {...queryItemLayout.labelCol} style={labelStyle}>名称货号:</Col>
                            <Col {...queryItemLayout.wrapperCol}>
                                <Input
                                    value={this.state.keyword}
                                    onChange={(e) => this.setState({
                                        keyword: e.target.value
                                    })}
                                    placeholder="输入商品货号或名称"
                                />
                            </Col>
                        </Col>
                        <Col span={6}>
                            <Col {...queryItemLayout.labelCol} style={labelStyle}>商品类目:</Col>
                            <Col  {...queryItemLayout.wrapperCol} >
                                <BrandCatTree
                                    value={this.state.catIds}
                                    onChange={(value, label, extra, selectCatDatas) => {
                                        this.setState({
                                            catIds: value,
                                            selectCatDatas: selectCatDatas,
                                        })
                                    }}
                                    style={{ width: '100%' }}
                                />
                            </Col>
                        </Col>
                        <Col span={8} style={{ marginLeft: 10 }}>
                            <Button
                                type='primary'
                                onClick={this._handleSearch}
                            >搜索</Button>&nbsp;&nbsp;&nbsp;
                            <Button
                                type='default'
                                onClick={this._handleClear}
                            >清空</Button>&nbsp;&nbsp;&nbsp;
                            <a style={{ marginLeft: 8, fontSize: 12 }} onClick={this.toggle}>{expand ? '收起搜索' : '更多搜索条件'}&nbsp;&nbsp;
                                <Icon type={expand ? 'up' : 'down'} />
                            </a>
                        </Col>
                    </Row>
                </div>

            )
        } else {
            return (
                <div className='spu-goods-choose-component'>
                    <Row>
                        <Col span={6}>
                            <Col {...queryItemLayout.labelCol} style={labelStyle}>名称货号:</Col>
                            <Col {...queryItemLayout.wrapperCol}>
                                <Input
                                    value={this.state.keyword}
                                    onChange={(e) => this.setState({
                                        keyword: e.target.value
                                    })}
                                    placeholder="输入商品货号或名称"
                                />
                            </Col>
                        </Col>
                        <Col span={6} style={expandStyle}>
                            <Col {...queryItemLayout.labelCol} style={labelStyle}>商品品牌:</Col>
                            <Col {...queryItemLayout.wrapperCol} >
                                <ChildBrand
                                    value={this.state.childBrandId}
                                    onChange={(value) => {
                                        this.setState({
                                            childBrandId: value
                                        })
                                    }}
                                    style={{ width: '100%' }}
                                />
                            </Col>
                        </Col>
                        <Col span={6}>
                            <Col {...queryItemLayout.labelCol} style={labelStyle}>商品类目:</Col>
                            <Col  {...queryItemLayout.wrapperCol} >
                                <BrandCatTree
                                    value={this.state.catIds}
                                    onChange={(value, label, extra, selectCatDatas) => {
                                        this.setState({
                                            catIds: value,
                                            selectCatDatas: selectCatDatas,
                                        })
                                    }}
                                    style={{ width: '100%' }}
                                />
                            </Col>
                        </Col>
                        <Col span={6} style={expandStyle}>
                            <Col {...queryItemLayout.labelCol} style={labelStyle}>年份:</Col>
                            <Col  {...queryItemLayout.wrapperCol}>
                                <Year
                                    value={this.state.yearIds}
                                    onChange={(value) => {
                                        this.setState({
                                            yearIds: value
                                        })
                                    }}
                                    style={{ width: '100%' }}
                                />
                            </Col>
                        </Col>
                        <Col span={6} style={expandStyle}>
                            <Col {...queryItemLayout.labelCol} style={labelStyle}>季节:</Col>
                            <Col  {...queryItemLayout.wrapperCol}>
                                <Season
                                    value={this.state.seasonIds}
                                    onChange={(value) => {
                                        this.setState({
                                            seasonIds: value
                                        })
                                    }}
                                    style={{ width: '100%' }}
                                />
                            </Col>
                        </Col>
                        <Col span={6} style={expandStyle}>
                            <Col {...queryItemLayout.labelCol} style={labelStyle}>波段:</Col>
                            <Col  {...queryItemLayout.wrapperCol}>
                                <Ranges
                                    value={this.state.rangesIds}
                                    onChange={(value) => {
                                        this.setState({
                                            rangesIds: value
                                        })
                                    }}
                                    style={{ width: '100%' }}
                                />
                            </Col>
                        </Col>
                        <Col span={6} style={expandStyle}>
                            <Col {...queryItemLayout.labelCol} style={labelStyle}>商品层:</Col>
                            <Col  {...queryItemLayout.wrapperCol}>
                                <Section
                                    value={this.state.sectionIds}
                                    onChange={(value) => {
                                        this.setState({
                                            sectionIds: value
                                        })
                                    }}
                                    style={{ width: '100%' }}
                                />
                            </Col>
                        </Col>
                        <Col span={6} style={expandStyle}>
                            <Col {...queryItemLayout.labelCol} style={labelStyle}>系列:</Col>
                            <Col  {...queryItemLayout.wrapperCol}>
                                <Series
                                    value={this.state.seriesIds}
                                    onChange={(value) => {
                                        this.setState({
                                            seriesIds: value
                                        })
                                    }}
                                    style={{ width: '100%' }}
                                />
                            </Col>
                        </Col>
                        <Col span={6} style={expandStyle}>
                            <Col {...queryItemLayout.labelCol} style={labelStyle}>风格:</Col>
                            <Col  {...queryItemLayout.wrapperCol}>
                                <Style
                                    value={this.state.styleIds}
                                    onChange={(value) => {
                                        this.setState({
                                            styleIds: value
                                        })
                                    }}
                                    style={{ width: '100%' }}
                                />
                            </Col>
                        </Col>
                        <Col span={6} style={expandStyle}>
                            <Col {...queryItemLayout.labelCol} style={labelStyle}>预计上市时间:</Col>
                            <Col  {...queryItemLayout.wrapperCol}>
                                <RangePicker
                                    value={this.state.marketTime}
                                    onChange={(value) => {
                                        this.setState({
                                            marketTime: value
                                        })
                                    }}
                                    style={{ width: '100%' }}
                                />
                            </Col>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12} >
                            <Col span={4} style={labelStyle}></Col>
                            <Button
                                type='primary'
                                onClick={this._handleSearch}
                            >搜索</Button>&nbsp;&nbsp;&nbsp;
                            <Button
                                type='default'
                                onClick={this._handleClear}
                            >清空</Button>&nbsp;&nbsp;&nbsp;
                            <a style={{ marginLeft: 8, fontSize: 12 }} onClick={this.toggle}>{expand ? '收起搜索' : '更多搜索条件'}&nbsp;&nbsp;
                                <Icon type={expand ? 'up' : 'down'} />
                            </a>

                        </Col>
                    </Row>
                </div>
            );
        }
    }

    // api
    _handleSearch = () => {
        this.props.handleSearch(this._formatData(this.state));
    }
    stringCopyBySelf = (s, n) => {
        let str = ''
        for (let i = 0; i < (n - 1); i++) {
            str += s
        }
        return str
    }
    _formatData = (data) => {
        let ret = {}, queryContent = {}

        queryContent['keyword'] = data.keyword
        let selectCatData = this.getSearchData(data.selectCatDatas)
        queryContent['catIds'] = selectCatData.catIds || null
        queryContent['customCatCodes'] = selectCatData.customCatCodes || null
        queryContent['childBrandId'] = data.childBrandId
        queryContent['yearIds'] = data.yearIds
        queryContent['seasonIds'] = data.seasonIds
        queryContent['rangesIds'] = data.rangesIds
        queryContent['sectionIds'] = data.sectionIds
        queryContent['seriesIds'] = data.seriesIds
        queryContent['styleIds'] = data.styleIds
        queryContent['startMarketTime'] = data.marketTime[0] && data.marketTime[0].format("YYYY-MM-DD")
        queryContent['endMarketTime'] = data.marketTime[1] && data.marketTime[1].format("YYYY-MM-DD")
        queryContent['brandId'] = window.currentBrandId
        queryContent = this.filterObjectNull(queryContent)
        return queryContent
    }
    getSearchData = (data) => {
        let selectDatas = data;
        let catIds = [], customCatCodes = [];

        for (let key in selectDatas) {
            let sourceObj = selectDatas[key].sourceObj;
            if (sourceObj.catLevel == 0) {
                catIds.push(sourceObj.catId)
            } else {
                customCatCodes.push(sourceObj.catCode)
            }
        }

        return {
            catIds,
            customCatCodes
        }
    }

    filterObjectNull = (obj) => {
        let retObj = {};
        for (let key in obj) {
            if (obj[key] != null && obj[key] != undefined && obj[key] != '') {
                retObj[key] = obj[key]
            }
        }
        return retObj
    }

    _handleClear = () => {
        this.setState({
            "keyword": undefined,
            "childBrandId": "",
            "catIds": null,
            "yearIds": undefined,
            "seasonIds": undefined,
            "rangesIds": undefined,
            "sectionIds": undefined,
            "seriesIds": undefined,
            "styleIds": undefined,
            "selectCatDatas": {},
            "marketTime": [],
        }, () => {
            this._handleSearch()
        });
    }
    toggle = () => {
        this.setState({
            expand: !this.state.expand
        }, () => {
            this.props.onChangeExpand(this.state.expand)
        });
    }


}


FilterView.defaultProps = {
    expand: false
}
FilterView.propTypes = {
    handleSearch: PropTypes.func.isRequired,
    expand: PropTypes.bool
};

export default FilterView;