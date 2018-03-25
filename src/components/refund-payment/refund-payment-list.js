import React, {Component} from 'react';
import PropTypes from 'prop-types';
import IconImg from './ico-model';
import {Modal, Input, message} from 'antd';
import {MathUtils, StringUtils, Helper} from "djmodules-utils";

class PaymentList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            amountPrice: props.refundPrice,
            paymentList: JSON.parse(JSON.stringify(props.refundPaymentList))
        }
    }

    cancel = () => {
        let {close} = this.props;
        close();
    }

    ok = () => {
        let {ok} = this.props;
        let {amountPrice, paymentList} = this.state;
        if (amountPrice > 0) {
            message.destroy();
            message.warning('金额未结清');
        } else {
            let usePayment = _.filter(paymentList || [], item => {
                return Number(item.amount) > 0;
            });
            ok(JSON.parse(JSON.stringify(usePayment)));
        }
    }

    inputChange = (e, payment) => {
        let val = Helper.changeValue(e.target.value, 2);
        let currentAmountPrice = MathUtils.add(this.state.amountPrice, payment.amount || 0);
        if (Number(val) > currentAmountPrice) {
            val = currentAmountPrice;
        }
        payment.amount = val;
        this.setState({
            paymentList: this.state.paymentList,
            amountPrice: MathUtils.sub(currentAmountPrice, payment.amount)
        })
    }

    inputFill = (e, payment) => {
        let currentAmountPrice = MathUtils.add(this.state.amountPrice, payment.amount || 0);
        payment.amount = currentAmountPrice;
        this.setState({
            paymentList: this.state.paymentList,
            amountPrice: currentAmountPrice - payment.amount
        });
    }

    render() {
        let {refundPrice, paymentMode} = this.props;
        let {amountPrice, paymentList} = this.state;
        /**获取正在使用的有效支付方式*/
        let usePayment = _.filter(paymentList || [], item => {
            return item.amount > 0;
        });
        if (usePayment.length) {
            if (paymentMode === 'single') {
                /**单一支付渠道模式 Start*/
                let currentPayment = usePayment[0];
                _.forEach(paymentList || [], item => {
                    if (item.payMethod.toString() !== currentPayment.payMethod.toString() ||
                        item.outPayMethod.toString() !== currentPayment.outPayMethod.toString()) {
                        item.disabled = true;
                    }
                });
                /**单一支付渠道模式 End*/
            } else {
                /**多支付渠道模式 Start*/
                let currentMutexPayment = _.find(usePayment || [], item => {
                    return _.includes(mutexPaymentList || [], item.payMethod)
                });
                _.forEach(paymentList || [], item => {
                    if (currentMutexPayment &&
                        _.includes(mutexPaymentList || [], item.payMethod) &&
                        item.payMethod.toString() !== currentMutexPayment.payMethod.toString()) {
                        item.disabled = true;
                    } else {
                        item.disabled = false;
                    }
                })
                /**多支付渠道模式 End*/
            }
        } else {
            _.forEach(paymentList || [], item => {
                item.disabled = false;
            });
        }

        /**枚举支付方式对应的图标**/
        function paymentIco(payChannelCode) {
            let a = IconImg.other
            switch (payChannelCode) {
                case 1:
                    a = IconImg.cash;
                    break
                case 2:
                    a = IconImg.bankCard;
                    break
                case 3:
                    a = IconImg.alipay;
                    break
                case 4:
                    a = IconImg.weixin;
                    break
                case 5:
                case 6:
                case 7:
                    a = IconImg.voucher;
                    break
                case 13:
                    a = IconImg.weixin;
                    break
                case 14:
                    a = IconImg.alipay;
                    break
                case 15:
                    a = IconImg.bankCard;
                    break
                default:
                    a = IconImg.other
            }
            return a;
        }

        return <Modal
            title={"选择退款方式"}
            width={'90%'}
            style={{maxWidth: 500}}
            maskClosable={false}
            visible={true}
            onCancel={this.cancel}
            onOk={this.ok}
        >
            <div className="payment-list">
                <div className="title">
                    <div>还需退款：<em className="important">¥{StringUtils.numberFormat(amountPrice, 2)}</em></div>
                    <div>共需退款：<em>¥{StringUtils.numberFormat(refundPrice, 2)}</em></div>
                </div>
                <div className="content">
                    {paymentList.map((item, i) => {
                        let availableAmtElement =item.payMethod===1||!item.availableAmt ? '' : <span style={{color: '#F92A5E'}}>最多可退¥{item.availableAmt}</span>;
                        return <div key={i} style={{marginBottom: 10}}>
                            <Input maxLength={7}
                                   style={{height: 38}}
                                   value={item.amount}
                                   disabled={item.disabled}
                                   onChange={(e) => {
                                       this.inputChange(e, item)
                                   }}
                                   prefix={<div>
                                       <img src={paymentIco(item.payMethod)}
                                            style={{
                                                width: 28,
                                                verticalAlign: 'middle'
                                            }}/>
                                       <span style={{verticalAlign: 'middle'}}>{item.outPayMethodName}</span>
                                   </div>}
                                   suffix={<div>
                                       {availableAmtElement}
                                       <div className="fill-icon"
                                            style={{
                                                display: 'inline-block',
                                                width: 14,
                                                height: 14,
                                                verticalAlign: 'middle',
                                                cursor: 'pointer',
                                            }}
                                            onClick={(e) => {
                                                if (!item.disabled) {
                                                    this.inputFill(e, item)
                                                }
                                            }}
                                       >
                                       </div>
                                   </div>}
                            />
                        </div>
                    })}
                </div>
            </div>
        </Modal>
    }
}

PaymentList.propTypes = {}

PaymentList.defaultProps = {
    paymentMode: 'single'
}

export default PaymentList;