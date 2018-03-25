import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {message} from "antd";
import moment from "moment";
import {MathUtils} from "djmodules-utils";
import PaymentRemote from "../payment/payment-remote";
import RefundPaymentList from './refund-payment-list';
import RefundPaymentSuccess from './refund-payment-success';
import RefundPaymentFail from './refund-payment-fail';
import RefundPaymentError from './refund-payment-error';
import RefundPaymentV from './refund-payment-v';


class RefundPaymentMain extends Component {
    constructor(props) {
        super(props);
        this.state = {
            /**当前状态*/
            currentState: props.currentState,
            /**支付列表*/
            refundPaymentList: props.paymentList,
            /**选中的在线支付方式*/
            onlinePayment: null,
            /**选中的退款方式*/
            validPaymentList: []
        }
    }

    close = () => {
        this.props.onClose();
    }

    changeState = (state) => {
        this.setState({
            currentState: state
        })
    }

    paymentRefundListOk = (refundPayment) => {
        //判断是否刷卡，因为只有刷卡在后续过程中需要特殊处理
        let onlinePayment = _.find(refundPayment || [], item => {
            return item.payMethod === 15;
        });
        this.setState({
            validPaymentList: refundPayment,
            onlinePayment: onlinePayment
        }, () => {
            this.refundPaymentHandle();
        });
    }

    refundPaymentHandle = () => {
        let {refundPaymentHandle, getRefundOrderState} = this.props;
        let {onlinePayment, validPaymentList} = this.state;
        if (onlinePayment) {
            const {device} = onlinePayment;
            /**判断设备是云POS还是固网POS，2-云POS*/
            if (device === 2) {
                this.changeState('支付中');
                refundPaymentHandle(validPaymentList, (refundOrderId) => {
                    this.yunPOSNotice(refundOrderId, () => {
                        getRefundOrderState(this.changeState);
                    });
                });

            } else {
                refundPaymentHandle(validPaymentList, (refundOrderId) => {
                    this.netWorkPOSHandle(refundOrderId);
                });
            }
        } else {
            this.changeState('支付中');
            refundPaymentHandle(validPaymentList, (refundOrderId) => {
                getRefundOrderState(this.changeState);
            });
        }
    }

    yunPOSNotice = (refundOrderId, callBack) => {
        let {orderName, orderType, userInfo} = this.props;
        let {validPaymentList, onlinePayment} = this.state;
        let {BILL99_IDTXN} = onlinePayment.extInfo;
        validPaymentList = _.map(validPaymentList || [], item => {
            return {
                "payChannel": item.payMethod,
                "payChannelDesc": item.payMethodName,
                "outPayChannelCode": item.outPayMethod,
                "outPayChannelDesc": item.outPayMethodName,
                "amount": item.amount,
                "needReceiveResult": item.needReceiveResult,
                "extInfo": item.extInfo
            }
        });
        let notifyParam = {
            brandId: userInfo.brandId,
            storageId: userInfo.storageId,
            acquirerId: userInfo.userId,
            cashierDetail: JSON.stringify({
                brandId: userInfo.brandId,
                storageId: userInfo.storageId,
                orderId: refundOrderId,
                subject: orderName,
                allowPartRefund: onlinePayment.allowPartRefund,
                payAmout: onlinePayment.paiedAmt,//原始支付的总额
                payMethodList: validPaymentList,
                bizType: 'refund',
                idTxn: BILL99_IDTXN,
                orderType: orderType
            })
        };
        PaymentRemote.notifyToSmartPOS(notifyParam).then(json => {
            callBack && callBack();
        }).catch(error => {
            message.destroy();
            message.error('推送支付信息到云POS失败，请重试');
            this.changeState('支付列表');
        })
    }

    netWorkPOSHandle = (refundOrderId, port = 0) => {
        let {getRefundOrderState} = this.props;
        let {onlinePayment} = this.state;
        let {oldTrace, oldDateTime, oldAuthcode} = onlinePayment.extInfo;
        let swipeParam = {
            transType: '20',
            amount: onlinePayment.amount,
            posId: '00000000',
            operatorId: '0000',
            transTime: moment().format('MMDDHHmmss'),
            orderId: refundOrderId,
            oldTrace: oldTrace,
            oldDateTime: oldDateTime,
            oldAuthcode: oldAuthcode
        };
        PaymentRemote.openPOS({
            timeout: 60, port: port
        }).then(json => {
            if (json['status'] === 'success') {
                PaymentRemote.sendPOS(swipeParam).then(json => {
                    if (json['status'] && json['status'] === 'success') {
                        this.changeState('支付中');
                        PaymentRemote.getPOSResult({port: port}).then(json => {
                            if (json['status'] && json['status'] === 'success') {
                                if (json['resultObject'] && json['resultObject']['responseCode'] === '00') {
                                    this.swipeNotify(json['resultObject'], swipeParam).then(json => {
                                        getRefundOrderState(this.changeState);
                                    });
                                } else {
                                    this.swipeNotify({responseCode: '01'}, swipeParam).then(json => {
                                        getRefundOrderState(this.changeState);
                                    });
                                }
                            } else {
                                this.changeState('支付异常');
                            }
                        }).catch(error => {
                            this.changeState('支付异常');
                        });
                    } else {
                        this.swipeNotify({responseCode: '01'}, swipeParam).then(json => {
                            message.destroy();
                            message.warn('发送刷卡信息失败,请重试');
                            this.changeState('支付列表');
                        });
                    }
                }).catch(error => {
                    this.swipeNotify({responseCode: '01'}, swipeParam).then(json => {
                        message.destroy();
                        message.warn('发送刷卡信息失败,请重试');
                        this.changeState('支付列表');
                    });
                })
            }
            else {
                if (port === 10) {
                    this.swipeNotify({responseCode: '01'}, swipeParam).then(json => {
                        message.destroy();
                        message.warn('COM口打开失败,请检查COM口后重试');
                        this.changeState('支付列表');
                    });
                } else {
                    setTimeout(() => {
                        this.netWorkPOSHandle(refundOrderId, ++port);
                    }, 200)
                }
            }
        }).catch(error => {
            this.swipeNotify({responseCode: '01'}, swipeParam).then(json => {
                message.destroy();
                message.warn('POS驱动运行异常,请检查COM口后重试');
                this.changeState('支付列表');
            });
        })
    }

    render() {
        let {refundPrice, refundPaymentList, getRefundOrderState, printRefundReceipt, onClose} = this.props;
        let {validPaymentList} = this.state;
        return <div className="refund-payment">
            {this.state.currentState === '支付列表' ?
                <RefundPaymentList refundPrice={refundPrice}
                                   refundPaymentList={refundPaymentList}
                                   changeState={this.changeState}
                                   ok={this.paymentRefundListOk}
                                   close={onClose}/> : ''
            }
            {this.state.currentState === '支付成功' ?
                <RefundPaymentSuccess close={onClose} printRefundReceipt={printRefundReceipt}/> : ''
            }
            {this.state.currentState === '支付失败' ?
                <RefundPaymentFail tryAgain={this.refundPaymentHandle} changeState={this.changeState}
                                   close={onClose}/> : ''
            }
            {this.state.currentState === '支付异常' ?
                <RefundPaymentError getRefundOrderState={getRefundOrderState} changeState={this.changeState}
                                    close={onClose}/> : ''
            }
            {this.state.currentState === '支付中' ?
                <RefundPaymentV validPaymentList={validPaymentList} yunPOSNotice={this.yunPOSNotice}/> : ''
            }
        </div>
    }
}

RefundPaymentMain.propTypes = {
    refundPrice: PropTypes.number,
    currentState: PropTypes.string,
    refundPaymentList: PropTypes.array
}

RefundPaymentMain.defaultProps = {
    refundPrice: 0,
    currentState: '支付列表',
    refundPaymentList: []
}

export default RefundPaymentMain;