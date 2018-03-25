import React, {Component, PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Modal} from 'antd';
import IconImg from './ico-model';

class PaymentV extends (PureComponent || Component) {
    constructor(props) {
        super(props);
        this.state = {
            yunPOS: false,
            showTryAgain: false,
            timeSpan: 15
        }
    }

    componentDidMount() {
        let {validPaymentList} = this.props;
        let paymentByYunPOS = _.filter(validPaymentList || [], item => {
            return item.payMethod.toString() === '15' && item.cashierDeviceInfo && item.cashierDeviceInfo.device.toString() === '2';
        }).length > 0;
        paymentByYunPOS && this.tryAgainTimer();
    }

    tryAgainTimer = () => {
        let {timeSpan} = this.state;
        let timer = setInterval(() => {
            if (timeSpan > 0) {
                this.setState({
                    yunPOS: true,
                    showTryAgain: false,
                    timeSpan: --timeSpan
                });
            } else {
                clearInterval(timer);
                this.setState({
                    showTryAgain: true,
                    timeSpan: 15
                });
            }
        }, 1000);
    }

    tryAgain = () => {
        let {yunPOSNotice} = this.props;
        yunPOSNotice(() => {
            this.tryAgainTimer();
        });
    }


    render() {
        let {yunPOS, showTryAgain} = this.state;
        let tryAgainElement = ''
        if (yunPOS) {
            if (showTryAgain) {
                tryAgainElement = <div style={{marginTop: 30, fontSize: 14, cursor: 'pointer'}} onClick={this.tryAgain}>
                        <span style={{
                            backgroundImage: 'linear-gradient(-90deg, #03B4E2 0%, #378CF1 99%)',
                            boxShadow: '0 4px 8px 0 rgba(32,98,145,0.20)',
                            borderRadius: 2,
                            display: 'inline-block',
                            width: 120,
                            height: 32,
                            lineHeight: '32px',
                            color: '#FFF'
                        }}>重新推送</span>
                </div>
            } else {
                tryAgainElement = <div style={{marginTop: 30, fontSize: 14, cursor: 'pointer'}}>
                        <span style={{
                            background: '#F0F0F0',
                            borderRadius: 2,
                            display: 'inline-block',
                            width: 120,
                            height: 32,
                            lineHeight: '32px'
                        }}>重新发送<em style={{color: '#4990E2'}}>{this.state.timeSpan}s</em></span>
                </div>
            }
        }
        return (<Modal
            width={'90%'}
            style={{maxWidth: 300}}
            maskClosable={false}
            title={null}
            footer={null}
            visible={true}
            closable={false}
        >
            <div style={{margin: 30, textAlign: 'center'}}>
                <img src={IconImg.pay_loading} style={{maxWidth: 176}}/>
                <div style={{fontSize: '18px', marginTop: 10}}>退款中...请勿关闭浏览器</div>
                {tryAgainElement}
            </div>
        </Modal>)
    }
}

PaymentV.propTypes = {
    validPaymentList: PropTypes.array,
    yunPOSNotice: PropTypes.func
}

PaymentV.defaultProps = {
    validPaymentList: [],
    yunPOSNotice: () => {
    }
}

export default PaymentV;