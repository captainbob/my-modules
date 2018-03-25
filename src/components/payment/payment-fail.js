import React, {PureComponent, Component} from 'react';
import PropTypes from 'prop-types';
import {Modal, Button} from 'antd';
import IconImg from './ico-model';

class PaymentFail extends (PureComponent || Component) {
    constructor(props) {
        super(props);
    }

    render() {
        let {close} = this.props;
        let defaultFooter = <div>
            <Button onClick={() => {
                this.props.tryAgain();
            }}>
                重试
            </Button>
            <Button
                type="primary"
                onClick={() => {
                    this.props.changeState('支付列表');
                }}
            >
                其它支付方式
            </Button>
        </div>
        return <Modal title={null}
                      width={'90%'}
                      style={{maxWidth: 300}}
                      maskClosable={false}
                      visible={true}
                      footer={defaultFooter}
                      onCancel={close}>
            <div style={{textAlign: 'center', margin: '30px 0 15px 0'}}>
                <img src={IconImg.fail} style={{width: 50}}/>
                <div style={{fontSize: '20px', marginTop: 10}}>支付失败</div>
            </div>
        </Modal>
    }
}

PaymentFail.propTypes = {}

PaymentFail.defaultProps = {}
export default PaymentFail;