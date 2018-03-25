import React, {PureComponent, Component} from 'react';
import PropTypes from 'prop-types';
import {Modal,Button} from 'antd';
import IconImg from './ico-model';

class PaymentSuccess extends (PureComponent || Component) {
    constructor(props) {
        super(props);
    }

    ok = () => {
        this.props.printReceipt();
    }


    render() {
        let {close, printReceipt} = this.props;
        let defaultFooter = <div>
            <Button onClick={() => {
                close(true);
            }}>
                关闭
            </Button>
            {printReceipt ?
                <Button
                    type="primary"
                    onClick={() => {
                        this.ok();
                    }}
                >
                    打印小票
                </Button> : ''}
        </div>
        return <Modal title={null}
                      width={'90%'}
                      style={{maxWidth: 300}}
                      maskClosable={false}
                      visible={true}
                      closable={false}
                      footer={defaultFooter}
                      onCancel={() => {
                          close(true);
                      }}>
            <div style={{textAlign: 'center', margin: '30px 0 15px 0'}}>
                <img src={IconImg.success} style={{width: 50}}/>
                <div style={{fontSize: '20px', marginTop: 10}}>支付成功</div>
            </div>
        </Modal>
    }
}

PaymentSuccess.propTypes = {}

PaymentSuccess.defaultProps = {}
export default PaymentSuccess;