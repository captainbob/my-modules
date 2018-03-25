import React, {Component} from 'react';
import DjFilterPopover from './main-popover';
import DjGoodsTagPopoverContent from './popovers/goods-tag-popover';
import PromotionLabelPopoverContent from './popovers/promotion-popover';

const getComponent = (content, title, tipName) => {
    return class extends Component {
        render() {
            return (
                <DjFilterPopover {...this.props} content={content} title={title} tipName={tipName}/>
            )
        }
    }
}


const GoodsTagPopover = getComponent(DjGoodsTagPopoverContent, '商品标签', '标签');
const PromtionPopover = getComponent(PromotionLabelPopoverContent, '促销标签', '标签');
module.exports = {
    GoodsTagPopover,
    PromtionPopover
};