import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Input, Spin, message } from 'antd'
import { HttpUtil } from 'djmodules-utils/lib'
const FormItem = Form.Item

class ChangePasswordModal extends Component {
    static propTypes = {
        defaultVisible: PropTypes.bool
    }

    static defaultProps = {
        defaultVisible: false
    }

    constructor(props) {
        super(props)
        this.state = {
            visible: props.defaultVisible,
            loading: false
        }
    }

    componentWillReceiveProps(nextProps, nextState) {
        if (typeof nextProps.defaultVisible != 'undefined' && this.props.defaultVisible != nextProps.defaultVisible) {
            this.setState({ visible: nextProps.defaultVisible })
        }
    }

    onCancel = () => {
        if (this.state.loading) return;
        this.setState({ visible: false })
        if (this.props.onCancel) {
            this.props.onCancel()
        }
    }

    onOk = () => {
        if (this.state.loading) return;
        this.props.form.validateFields((error, values) => {
            if (!error) {
                this.setState({ loading: true })
                try {
                    values.staffId = userInfo.relation.otherInfos.staffId;
                } catch (e) {
                    if (userInfo)
                        values.staffId = userInfo.staffId;
                }
                HttpUtil.post('/rs/auth/staff/modify_pwd_by_old_back.do', values, {}).then((json) => {
                    if (json['status'] === 'success') {
                        message.success('密码修改成功');
                        if (this.props.onOk) {
                            this.props.onOk()
                        }
                    } else {
                        if (json['resultCode'] === '20004') {
                            message.error('原始密码不正确');
                        }
                        else {
                            message.error('密码修改失败');
                        }
                    }
                    this.setState({ loading: false })
                }).catch(error => {
                    message.error("网络请求错误")
                    this.setState({ loading: false })
                })
            }
        })
    }

    checkPassword = (rule, value, callback) => {
        const form = this.props.form;
        if (value && value !== form.getFieldValue('newPassword')) {
            callback('确认密码和新密码不一致');
        } else {
            callback();
        }
    }

    render() {
        const { getFieldDecorator } = this.props.form;

        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 6 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 14 },
            },
        };
        return (
            <Modal visible={this.state.visible} title='修改密码' onCancel={this.onCancel} onOk={this.onOk}>
                <Spin spinning={this.state.loading} size='large'>
                    <Form>
                        <FormItem
                            {...formItemLayout}
                            label="原始密码"
                            hasFeedback>
                            {getFieldDecorator('oldPassword', {
                                rules: [{
                                    required: true, message: '请输入原始密码',
                                }, {
                                    validator: this.checkConfirm,
                                }],
                            })(
                                <Input type="password" placeholder="原始密码" />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="新密码"
                            extra='密码由6~20位字母（区分大小写）、数字或符号组成'
                            hasFeedback>
                            {getFieldDecorator('newPassword', {
                                rules: [{
                                    required: true, message: '请输入新密码',
                                }, {
                                    pattern: /^[\d\D]{6,20}$/, message: ' 密码不符合规则'
                                }],
                            })(
                                <Input type="password" placeholder="新密码" />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="确认密码"
                            hasFeedback>
                            {getFieldDecorator('newPassword1', {
                                rules: [{
                                    required: true, message: '请输入确认密码',
                                }, {
                                    pattern: /^[\d\D]{6,20}$/, message: ' 密码不符合规则'
                                }, {
                                    validator: this.checkPassword,
                                }],
                            })(
                                <Input type="password" placeholder="确认密码" />
                                )}
                        </FormItem>
                    </Form>
                </Spin>

            </Modal>
        )
    }
}

ChangePasswordModal = Form.create()(ChangePasswordModal)

export default ChangePasswordModal