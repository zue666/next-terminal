import React, {useEffect, useState} from 'react';
import {Button, Card, Checkbox, Form, Input, message, Modal, Typography} from "antd";
import './Login.css'
import request from "../common/request";
import {LockOutlined, UserOutlined} from '@ant-design/icons';
import {setToken} from "../utils/utils";
import brandingApi from "../api/branding";
import strings from "../utils/strings";
import {useNavigate} from "react-router-dom";
import {setCurrentUser} from "../service/permission";
import PromptModal from "../dd/prompt-modal/prompt-modal";

const {Title, Text} = Typography;

const LoginForm = () => {

    const navigate = useNavigate();

    let [inLogin, setInLogin] = useState(false);
    let [branding, setBranding] = useState({});
    let [prompt, setPrompt] = useState(false);
    let [account, setAccount] = useState({});

    useEffect(() => {
        const x = async () => {
            let branding = await brandingApi.getBranding();
            document.title = branding['name'];
            setBranding(branding);
        }
        x();
    }, []);

    const afterLoginSuccess = async (data) => {
        // 跳转登录
        sessionStorage.removeItem('current');
        sessionStorage.removeItem('openKeys');
        setToken(data['token']);

        let user = data['info'];
        setCurrentUser(user);
        if (user) {
            if (user['type'] === 'user') {
                navigate('/my-asset');
            } else {
                navigate('/');
            }
        }
    }

    const login = async (values) => {
        let result = await request.post('/login', values);
        if (result['code'] === 1) {
            Modal.destroyAll();
            await afterLoginSuccess(result['data']);
        }
    }

    const handleOk = (loginAccount, totp) => {
        if (!strings.hasText(totp)) {
            message.warn("Please enter the two-factor authentication code");
            return false;
        }
        loginAccount['totp'] = totp;
        login(loginAccount);
        return false;
    }

    const handleSubmit = async params => {
        setInLogin(true);

        try {
            let result = await request.post('/login', params);
            if (result.code === 100) {
                // 进行双因素认证
                setPrompt(true);
                setAccount(params);
                return;
            }
            if (result.code !== 1) {
                return;
            }

            afterLoginSuccess(result['data']);
        } catch (e) {
            message.error(e.message);
        } finally {
            setInLogin(false);
        }
    };

    return (
        <div style={{width: '100vw', height: '100vh', backgroundColor: '#fafafa'}}>
            <Card className='login-card' title={null}>
                <div style={{textAlign: "center", margin: '15px auto 30px auto', color: '#1890ff'}}>
                    <Title level={1}>{branding['name']}</Title>
                    <Text>{branding['description']}</Text>
                </div>
                <Form onFinish={handleSubmit} className="login-form">
                    <Form.Item name='username' rules={[{required: true, message: 'Please enter the username'}]}>
                        <Input prefix={<UserOutlined/>} placeholder="Username"/>
                    </Form.Item>
                    <Form.Item name='password' rules={[{required: true, message: 'Please enter the password'}]}>
                        <Input.Password prefix={<LockOutlined/>} placeholder="Password"/>
                    </Form.Item>
                    <Form.Item name='remember' valuePropName='checked' initialValue={false}>
                        <Checkbox>Keep me logged in</Checkbox>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="login-form-button"
                                loading={inLogin}>
                            Login
                        </Button>
                    </Form.Item>
                </Form>
            </Card>

            <PromptModal
                title={'Two-factor authentication'}
                open={prompt}
                onOk={(value) => {
                    handleOk(account, value)
                }}
                onCancel={() => setPrompt(false)}
                placeholder={"Please enter the two-factor authentication code"}
            >

            </PromptModal>
        </div>

    );
}

export default LoginForm;
