import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Modal, message} from 'antd';
import moment from 'moment';
import {MathUtils} from 'djmodules-utils';
import PaymentRemote from './payment-remote';
import PaymentList from './payment-list';
import PaymentV from './payment-v';
import PaymentScan from './payment-scan';
import PaymentSuccess from './payment-success';
import PaymentFail from './payment-fail';
import PaymentError from './payment-error';

class PaymentMain extends Component {
    constructor(props) {
        super(props);
        this.state = {
            /**当前状态*/
            currentState: props.currentState,
            /**支付列表*/
            paymentList: props.paymentList,
            /**选中的在线支付方式*/
            onlinePayment: null,
            /**选中的支付方式*/
            validPaymentList: [],
            /**付款码*/
            paymentCode: ''
        }
    }

    close = (success) => {
        this.props.onClose(success);
    }

    changeState = (state) => {
        this.setState({
            currentState: state
        })
    }

    paymentListOk = (paymentList) => {
        let onlinePayment = _.find(paymentList || [], item => {
            return item.payMethod === 13 || item.payMethod === 14 || item.payMethod === 15;
        });
        this.setState({
            validPaymentList: paymentList,
            onlinePayment: onlinePayment
        }, () => {
            this.paymentHandle();
        });
    }

    paymentHandle = () => {
        let {paymentHandle, getOrderState, setOrderStateToWaitPaid} = this.props;
        let {onlinePayment, validPaymentList} = this.state;
        if (onlinePayment) {
            const {device} = onlinePayment.cashierDeviceInfo;
            /**判断设备是云POS还是固网POS，2-云POS*/
            if (device === 2) {
                this.changeState('支付中');
                setOrderStateToWaitPaid(() => {
                    this.yunPOSNotice(() => {
                        getOrderState(this.changeState);
                    });
                })
            } else {
                if (onlinePayment.payMethod === 15) {
                    this.changeState('支付中');
                    paymentHandle(validPaymentList, () => {
                        this.netWorkPOSHandle();
                    });
                } else {
                    this.changeState('扫码支付');
                }
            }
        } else {
            this.changeState('支付中');
            paymentHandle(validPaymentList, () => {
                getOrderState(this.changeState);
            });
        }
    }

    paymentScanOk = (paymentCode) => {
        this.changeState('支付中');
        let {paymentHandle, getOrderState} = this.props;
        let {validPaymentList} = this.state;
        paymentHandle(validPaymentList, () => {
            getOrderState(this.changeState);
        }, paymentCode);
    }

    yunPOSNotice = (callBack) => {
        let {orderId, orderName, orderType, sumPrice, userInfo} = this.props;
        let {validPaymentList} = this.state;
        console.log(validPaymentList);
        validPaymentList = _.map(validPaymentList || [], item => {
            return {
                "payChannel": item.payMethod,
                "payChannelDesc": item.payMethodName,
                "outPayChannelCode": item.outPayMethod,
                "outPayChannelDesc": item.outPayMethodName,
                "amount": item.amount,
                "device": item.cashierDeviceInfo && item.cashierDeviceInfo.device,
                "cashierInfoReceiveType": item.cashierDeviceInfo && item.cashierDeviceInfo.cashierInfoReceiveType,
                "needReceiveResult": item.cashierDeviceInfo && item.cashierDeviceInfo.needReceiveResult
            }
        });
        let notifyParam = {
            brandId: userInfo.brandId,
            storageId: userInfo.storageId,
            acquirerId: userInfo.userId,
            cashierDetail: JSON.stringify({
                brandId: userInfo.brandId,
                storageId: userInfo.storageId,
                acquirerId: userInfo.userId,
                acquirerName: userInfo.displayName,
                orderId: orderId,
                subject: orderName,
                payAmout: sumPrice,
                payMethodList: validPaymentList,
                bizType: 'pay',
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

    netWorkPOSHandle = (port = 0) => {
        let {orderId, getOrderState} = this.props;
        let {onlinePayment} = this.state;
        let swipeParam = {
            transType: '00',
            amount: MathUtils.mul(onlinePayment['amount'], 100),
            posId: '00000000',
            operatorId: '0000',
            transTime: moment().format('MMDDHHmmss'),
            orderId: orderId
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
                                        getOrderState(this.changeState);
                                    });
                                } else {
                                    this.swipeNotify({responseCode: '01'}, swipeParam).then(json => {
                                        getOrderState(this.changeState);
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
                        this.netWorkPOSHandle(++port);
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

    swipeNotify = (notifyParam, swipeParam) => {
        let {userInfo, orderId} = this.props;
        return PaymentRemote.swipeNotify({
            brandId: userInfo.brandId,
            orderId: orderId,
            notifyBody: JSON.stringify(notifyParam),
            requestBody: JSON.stringify(swipeParam)
        })
    }

    render() {
        let {sumPrice, paymentMode, paymentList, mutexPaymentList, getOrderState, printReceipt} = this.props;
        let {validPaymentList, onlinePayment} = this.state;
        let device = onlinePayment && onlinePayment.cashierDeviceInfo && onlinePayment.cashierDeviceInfo.device;

        return <div className="payment">
            {this.state.currentState === '支付列表' ?
                <PaymentList sumPrice={sumPrice}
                             paymentList={paymentList}
                             paymentMode={paymentMode}
                             mutexPaymentList={mutexPaymentList}
                             changeState={this.changeState}
                             ok={this.paymentListOk}
                             close={this.close}/> : ''
            }
            {this.state.currentState === '支付中' ?
                <PaymentV validPaymentList={validPaymentList}
                          yunPOSNotice={this.yunPOSNotice}/> : ''
            }
            {this.state.currentState === '扫码支付' ?
                <PaymentScan validPaymentList={validPaymentList}
                             changeState={this.changeState}
                             close={this.close}
                             ok={this.paymentScanOk}/> : ''
            }
            {this.state.currentState === '支付成功' ?
                <PaymentSuccess close={this.close} printReceipt={printReceipt}/> : ''
            }
            {this.state.currentState === '支付失败' ?
                <PaymentFail tryAgain={this.paymentHandle} changeState={this.changeState} close={this.close}/> : ''
            }
            {this.state.currentState === '支付异常' ?
                <PaymentError getOrderState={getOrderState} changeState={this.changeState} close={this.close}/> : ''
            }
        </div>
    }
}

PaymentMain.propTypes = {
    sumPrice: PropTypes.number,
    currentState: PropTypes.string,
    paymentList: PropTypes.array,
    paymentMode: PropTypes.string,
    mutexPaymentList: PropTypes.array,
    scanPaymentList: PropTypes.array,
    orderId: PropTypes.string,
    orderName: PropTypes.string
}

PaymentMain.defaultProps = {
    sumPrice: 0,
    currentState: '支付列表',
    paymentList: [],
    paymentMode: 'single',
    mutexPaymentList: [13, 14, 15],
    scanPaymentList: [13, 14],
    orderId: '',
    orderName: ''
}

export default PaymentMain;