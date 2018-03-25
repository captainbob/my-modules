import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Button, Input, InputNumber, Select, Icon, Checkbox } from 'antd';
// import { DjPopover, CatTree, DjSelect } from 'djmodules';
import DjPopover from '../dj-popover/index';
import '../dj-popover/style/index'
import CatTree from '../cat-tree/index';
import '../cat-tree/style/index'
import DjSelect from '../dj-select/index';
import '../dj-select/style/index'

const InputGroup = Input.Group;
const Option = Select.Option;
const { RangesSingle, YearSingle, SeasonSingle, ChildBrand, SeriesSingle } = DjSelect;
const { GoodsTagPopover, PromtionPopover } = DjPopover;
const { GoodsBuffCatTree, BrandCatTree } = CatTree;

const queryItemLayout = {
    labelCol: {
        sm: { span: 7 },
    },
    wrapperCol: {
        sm: { span: 17 },
    },
};

class FilterView extends Component {
    state = Object.assign({
        "merchantCodeLike": "",
        "merchantCodes": null,
        "title": "",
        "minSuggestPrice": "",
        "maxSuggestPrice": "",
        "spuStatuses": "",
        "childBrandId": "",
        "yearLike": "",
        "seasonLike": "",
        "rangesLike": "",
        "seriesLike": "",
        "minAuctionCount": "",
        "maxAuctionCount": "",
        "brandTagIds": [],
        "promotionLabels": [],
        "buffCatIds": null,
        "catIds": null,
        "selectCatDatas": {},
        "expand": this.props.expand || false, // 展开
        "merchantCodeSlice": 'no', // 货号截取为yes，不截取为no
        "merchantCodeSliceNum": undefined, // 货号截取位置
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
                        货号:&nbsp;&nbsp;&nbsp;
                        <Input
                            value={this.state.merchantCodes}
                            onChange={(e) => this.setState({
                                merchantCodes: e.target.value
                            })}
                            style={{ width: 150 }}
                        />&nbsp;&nbsp;&nbsp;
                        商品名称:&nbsp;&nbsp;&nbsp;<Input
                            value={this.state.title}
                            onChange={(e) => this.setState({
                                title: e.target.value
                            })}
                            style={{ width: 150 }}
                        />&nbsp;&nbsp;&nbsp;
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
                    </Row>
                </div>

            )
        } else {
            return (
                <div className='spu-goods-choose-component'>
                    <Row>
                        <Col span={6}>
                            <Col {...queryItemLayout.labelCol} style={labelStyle}>货号:</Col>
                            <Col {...queryItemLayout.wrapperCol}>
                                <Input
                                    value={this.state.merchantCodes}
                                    onChange={(e) => this.setState({
                                        merchantCodes: e.target.value
                                    })}
                                />
                            </Col>
                        </Col>
                        <Col span={6}>
                            <Col {...queryItemLayout.labelCol} style={labelStyle}>商品名称:</Col>
                            <Col  {...queryItemLayout.wrapperCol}>
                                <Input
                                    value={this.state.title}
                                    onChange={(e) => this.setState({
                                        title: e.target.value
                                    })}
                                />
                            </Col>
                        </Col>
                        <Col span={6}>
                            <Col {...queryItemLayout.labelCol} style={labelStyle}>类目:</Col>
                            <Col  {...queryItemLayout.wrapperCol} ><BrandCatTree
                                onChange={(value, label, extra, selectCatDatas) => {
                                    this.setState({
                                        catIds: value,
                                        selectCatDatas: selectCatDatas,
                                    })
                                }}
                                style={{ width: '100%' }}
                            /></Col>
                        </Col>
                        <Col span={6} style={expandStyle}>
                            <Col {...queryItemLayout.labelCol} style={labelStyle}>商品状态:</Col>
                            <Col  {...queryItemLayout.wrapperCol}>
                                <Select
                                    value={this.state.spuStatuses}
                                    onChange={(value) => {
                                        this.setState({
                                            spuStatuses: value
                                        })
                                    }}
                                    style={{ width: '100%' }}
                                >
                                    <Option value=''>全部</Option>
                                    <Option value='off'>微商城未上架</Option>
                                    <Option value='on'>微商城上架</Option>
                                </Select>
                            </Col>
                        </Col>
                        <Col span={6} style={expandStyle}>
                            <Col {...queryItemLayout.labelCol} style={labelStyle}>系列:</Col>
                            <Col  {...queryItemLayout.wrapperCol}>
                                <SeriesSingle
                                    value={this.state.seriesLike}
                                    onChange={(value) => {
                                        this.setState({
                                            seriesLike: value
                                        })
                                    }}
                                    style={{ width: '100%' }}
                                />
                            </Col>
                        </Col>
                        <Col span={6} style={expandStyle}>
                            <Col {...queryItemLayout.labelCol} style={labelStyle}>商品分组:</Col>
                            <Col  {...queryItemLayout.wrapperCol}><GoodsBuffCatTree
                                onChange={(text) => {
                                    this.setState({
                                        buffCatIds: text
                                    })
                                }}
                                style={{ width: '100%' }}
                            />
                            </Col>
                        </Col>
                        <Col span={6} style={expandStyle}>
                            <Col {...queryItemLayout.labelCol} style={labelStyle}>年份:</Col>
                            <Col  {...queryItemLayout.wrapperCol}>
                                <YearSingle
                                    value={this.state.yearLike}
                                    onChange={(value) => {
                                        this.setState({
                                            yearLike: value
                                        })
                                    }}
                                    style={{ width: '100%' }}
                                />
                            </Col>
                        </Col>
                        <Col span={6} style={expandStyle}>
                            <Col {...queryItemLayout.labelCol} style={labelStyle}>季节:</Col>
                            <Col  {...queryItemLayout.wrapperCol}>
                                <SeasonSingle
                                    value={this.state.seasonLike}
                                    onChange={(value) => {
                                        this.setState({
                                            seasonLike: value
                                        })
                                    }}
                                    style={{ width: '100%' }}
                                />
                            </Col>
                        </Col>
                        <Col span={6} style={expandStyle}>
                            <Col {...queryItemLayout.labelCol} style={labelStyle}>波段:</Col>
                            <Col  {...queryItemLayout.wrapperCol}>
                                <RangesSingle
                                    value={this.state.rangesLike}
                                    onChange={(value) => {
                                        this.setState({
                                            rangesLike: value
                                        })
                                    }}
                                    style={{ width: '100%' }}
                                />
                            </Col>
                        </Col>
                        <Col span={6} style={expandStyle}>
                            <Col {...queryItemLayout.labelCol} style={labelStyle}>库存区间:</Col>
                            <Col  {...queryItemLayout.wrapperCol} style={{ width: 182 }}>
                                <InputGroup>
                                    <Col style={{ width: 80, display: 'inline-block' }}>
                                        <InputNumber
                                            value={this.state.minAuctionCount}
                                            min={0}
                                            max={this.state.maxAuctionCount || 100000}
                                            onChange={(value) => {
                                                this.setState({
                                                    minAuctionCount: value
                                                })
                                            }}
                                        />
                                    </Col>
                                    <Col style={{
                                        width: 10, display: 'inline-block', margin: '0 3px 0 8px'
                                    }}>~</Col>
                                    <Col style={{ width: 80, display: 'inline-block' }}>
                                        <InputNumber
                                            value={this.state.maxAuctionCount}
                                            min={this.state.minAuctionCount || 0}
                                            max={100000}
                                            onChange={(value) => {
                                                this.setState({
                                                    maxAuctionCount: value
                                                })
                                            }}
                                        />
                                    </Col>
                                </InputGroup>
                            </Col>
                        </Col>
                        <Col span={6} style={expandStyle}>
                            <Col {...queryItemLayout.labelCol} style={labelStyle}>吊牌价格:</Col>
                            <Col  {...queryItemLayout.wrapperCol} style={{ width: 182 }}>
                                <InputGroup>
                                    <Col style={{ width: 80, display: 'inline-block' }}>
                                        <InputNumber
                                            value={this.state.minSuggestPrice}
                                            min={0}
                                            max={this.state.maxSuggestPrice || 100000}
                                            onChange={(value) => {
                                                this.setState({
                                                    minSuggestPrice: value
                                                })
                                            }}
                                        />
                                    </Col>
                                    <Col style={{
                                        width: 10, display: 'inline-block', margin: '0 3px 0 8px'
                                    }}>~</Col>
                                    <Col style={{ width: 80, display: 'inline-block' }}>
                                        <InputNumber
                                            value={this.state.maxSuggestPrice}
                                            min={this.state.minSuggestPrice || 0}
                                            max={100000}
                                            onChange={(value) => {
                                                this.setState({
                                                    maxSuggestPrice: value
                                                })
                                            }}
                                        />
                                    </Col>
                                </InputGroup>
                            </Col>
                        </Col>
                        <Col span={6} style={expandStyle}>
                            <Col {...queryItemLayout.labelCol} style={labelStyle}>品牌名称:</Col>
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
                        <Col span={6} style={expandStyle}>
                            <Col {...queryItemLayout.labelCol} style={labelStyle}>商品标签:</Col>
                            <Col  {...queryItemLayout.wrapperCol}>
                                <GoodsTagPopover
                                    handleSelect={(data) => {
                                        this.setState({
                                            brandTagIds: data.selectedIds
                                        })
                                    }}
                                >
                                    <Input
                                        value={this.state.brandTagIds.length > 0 ? `已选择了${this.state.brandTagIds.length}个标签` : undefined}
                                        placeholder="请选择商品标签"
                                    />
                                </GoodsTagPopover>
                            </Col>
                        </Col>
                        <Col span={6} style={expandStyle}>
                            <Col {...queryItemLayout.labelCol} style={labelStyle}>促销标签:</Col>
                            <Col  {...queryItemLayout.wrapperCol}>
                                <PromtionPopover
                                    handleSelect={(data) => {
                                        this.setState({
                                            promotionLabels: data.selectedIds
                                        })
                                    }}
                                >
                                    <Input
                                        placeholder="请选择促销标签"
                                        value={this.state.promotionLabels.length > 0 ? `已选择了${this.state.promotionLabels.length}个促销标签` : undefined}
                                    />
                                </PromtionPopover>
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
        if (data.merchantCodeSlice == 'yes') {
            queryContent['merchantCodeLike'] = this.stringCopyBySelf('_', data.merchantCodeSliceNum) + data.merchantCodeLike + '%'
        } else {
            queryContent['merchantCodes'] = [data.merchantCodes];
        }
        queryContent['title'] = data.title
        let selectCatData = this.getSearchData(data.selectCatDatas)
        queryContent['catIds'] = selectCatData.catIds || null
        queryContent['customCatCodes'] = selectCatData.customCatCodes || null
        queryContent['buffCatIds'] = data.buffCatIds
        queryContent['minSuggestPrice'] = data.minSuggestPrice
        queryContent['maxSuggestPrice'] = data.maxSuggestPrice
        if (data.spuStatuses == 'on') {
            queryContent['spuStatuses'] = [3]
        } else if (data.spuStatuses == 'off') {
            queryContent['spuStatuses'] = [1, 2]
        }
        queryContent['brandTagIds'] = data.brandTagIds
        queryContent['childBrandId'] = data.childBrandId
        queryContent['yearLike'] = data.yearLike
        queryContent['seasonLike'] = data.seasonLike
        queryContent['rangesLike'] = data.rangesLike
        queryContent['seriesLike'] = data.seriesLike
        queryContent['minAuctionCount'] = data.minAuctionCount
        queryContent['maxAuctionCount'] = data.maxAuctionCount
        queryContent['promotionLabels'] = data.promotionLabels
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
            "merchantCodeLike": "",
            "merchantCodes": null,
            "title": "",
            "minSuggestPrice": "",
            "maxSuggestPrice": "",
            "spuStatuses": "",
            "childBrandId": "",
            "yearLike": "",
            "seasonLike": "",
            "rangesLike": "",
            "seriesLike": "",
            "minAuctionCount": "",
            "maxAuctionCount": "",
            "brandTagIds": [],
            "promotionLabels": [],
            "buffCatIds": null,
            "catIds": null,
            "selectCatDatas": {},
            "merchantCodeSlice": 'no', // 货号截取为yes，不截取为no
            "merchantCodeSliceNum": undefined, // 货号截取位置
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