import React, {Component} from 'react';
import {Modal, Input, message, Button} from 'antd';
import IconImg from './ico-model';

class PaymentScan extends Component {
    constructor(props) {
        super(props);
        this.state = {
            inputVal: ''
        }
    }

    componentDidMount() {
        setTimeout(() => {
            this.refDom.focus();
        })
    }

    ok = () => {
        let {validPaymentList} = this.props;
        let {inputVal} = this.state;
        this.props.ok(this.state.inputVal);
    }

    inputChange = (e) => {
        let {value} = e.target;
        this.setState({
            inputVal: value
        })
    }

    render() {
        let {changeState, validPaymentList, close} = this.props;
        let onlinePayment = _.find(validPaymentList || [], item => {
            return item.payMethod === 13 || item.payMethod === 14;
        });
        let defaultFooter = <div>
            <Button onClick={() => {
                changeState('支付列表');
            }}>
                上一步
            </Button>
            <Button
                type="primary"
                onClick={this.ok}
            >
                下一步
            </Button>
        </div>
        return <Modal
            title={`${onlinePayment.payMethod === 13 ? '微信' : '支付宝'}扫码支付`}
            width={'90%'}
            style={{maxWidth: 500}}
            maskClosable={false}
            visible={true}
            footer={defaultFooter}
            onCancel={() => {
                close()
            }}
        >
            <div style={{textAlign: 'center', margin: '30px 0'}}>
                <div style={{fontSize: 30}}>
                    <span>金额：</span>
                    <span style={{color: '#F92A5E'}}>¥{onlinePayment.amount}</span>
                </div>
                <div style={{marginTop: 30}}>
                    <img src={IconImg.smq} style={{maxWidth: '100%'}}/>
                </div>
                <div style={{marginTop: 30, fontSize: '20px', color: '#444444'}}>请扫描客户付款码</div>
                <div style={{marginTop: 30, marginBottom: 50}}>
                    <Input
                        style={{width: '80%', height: 44, border: '3px solid #b3b3b3', fontSize: '14px'}}
                        placeholder="输入付款码"
                        onChange={this.inputChange}
                        maxLength={32}
                        ref={(node) => this.refDom = node}
                    />
                </div>
            </div>
        </Modal>
    }
}

export default PaymentScan;