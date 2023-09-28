import React, {useState} from 'react';
import {Button, Form, Input, Layout, message, Tabs, Typography} from "antd";
import accountApi from "../api/account";
import Totp from "./Totp";

const {Content} = Layout;
const {Title} = Typography;

const Info = () => {

    let [newPassword1, setNewPassword1] = useState('');
    let [newPassword2, setNewPassword2] = useState('');
    let [newPasswordStatus, setNewPasswordStatus] = useState({});

    const onNewPasswordChange = (value) => {
        setNewPassword1(value.target.value);
        setNewPasswordStatus(validateNewPassword(value.target.value, newPassword2));
    }

    const onNewPassword2Change = (value) => {
        setNewPassword2(value.target.value);
        setNewPasswordStatus(validateNewPassword(newPassword1, value.target.value));
    }

    const validateNewPassword = (newPassword1, newPassword2) => {
        if (newPassword2 === newPassword1) {
            return {
                validateStatus: 'success',
                errorMsg: null,
            };
        }
        return {
            validateStatus: 'error',
            errorMsg: 'passwords did not match',
        };
    }

    const changePassword = async (values) => {
        let success = await accountApi.changePassword(values);
        if (success) {
            message.success('The password has been changed successfully and you will be redirected to the login page.');
            window.location.href = '/#';
        }
    }

    return (
        <>
            <Content className={'page-container-white'}>
                <Tabs className={'info-tab'} tabPosition={'left'} tabBarStyle={{width: 150}}>
                    <Tabs.TabPane tab="Change Password" key="change-password">
                        <Title level={4}>Change Password</Title>
                        <div style={{margin: 16}}></div>
                        <Form name="password" onFinish={changePassword}>
                            <input type='password' hidden={true} autoComplete='new-password'/>
                            <Form.Item
                                name="oldPassword"
                                label="Current Password"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Current Password',
                                    },
                                ]}
                            >
                                <Input type='password' placeholder="Please enter the current password" style={{width: 240}}/>
                            </Form.Item>
                            <Form.Item
                                name="newPassword"
                                label="New Password"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please enter the new password',
                                    },
                                ]}
                            >
                                <Input type='password' placeholder="NewPassword"
                                       onChange={(value) => onNewPasswordChange(value)} style={{width: 240}}/>
                            </Form.Item>
                            <Form.Item
                                name="newPassword2"
                                label="Password Confirmation"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Password Confirmation',
                                    },
                                ]}
                                validateStatus={newPasswordStatus.validateStatus}
                                help={newPasswordStatus.errorMsg || ' '}
                            >
                                <Input type='password' placeholder="Password Confirmation"
                                       onChange={(value) => onNewPassword2Change(value)} style={{width: 240}}/>
                            </Form.Item>
                            <Form.Item>
                                <Button disabled={newPasswordStatus.errorMsg || !newPasswordStatus.validateStatus}
                                        type="primary"
                                        htmlType="submit">
                                    提交
                                </Button>
                            </Form.Item>
                        </Form>
                    </Tabs.TabPane>

                    {/*<Tabs.TabPane tab="授权令牌" key="token">*/}
                    {/*    <AccessToken/>*/}
                    {/*</Tabs.TabPane>*/}

                    <Tabs.TabPane tab="Two-step authentication" key="totp">
                        <Totp/>
                    </Tabs.TabPane>
                </Tabs>
            </Content>
        </>
    );
}

export default Info;
