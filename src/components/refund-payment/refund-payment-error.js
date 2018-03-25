import React, {PureComponent, Component} from 'react';
import PropTypes from 'prop-types';
import {Modal, Button} from 'antd';
import IconImg from './ico-model';

class PaymentSuccess extends (PureComponent || Component) {
    constructor(props) {
        super(props);
    }

    render() {
        let {close} = this.props;
        let defaultFooter = <div>
            <Button onClick={() => {
                this.props.changeState('支付中');
                this.props.getRefundOrderState(this.props.changeState, 1);
            }}>
                重试
            </Button>
        </div>
        return <Modal title={null}
                      width={'90%'}
                      style={{maxWidth: 300}}
                      maskClosable={false}
                      visible={true}
                      onCancel={() => {
                          close();
                      }}
                      footer={defaultFooter}
        >
            <div style={{textAlign: 'center', margin: '30px 0 15px 0'}}>
                <img src={IconImg.overtime} style={{width: 50}}/>
                <div style={{fontSize: '16px', marginTop: 10}}>支付异常,点击重试重新获取支付结果</div>
            </div>
        </Modal>
    }
}

export default PaymentSuccess;