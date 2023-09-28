import React, {useEffect, useState} from 'react';
import {Form, Input, InputNumber, Modal, Select} from "antd";
import accessGatewayApi from "../../api/access-gateway";

const formItemLayout = {
    labelCol: {span: 6},
    wrapperCol: {span: 14},
};

const {TextArea} = Input;
const api = accessGatewayApi;

const AccessGatewayModal = ({
                                visible,
                                handleOk,
                                handleCancel,
                                confirmLoading,
                                id,
                            }) => {

    const [form] = Form.useForm();
    let [gatewayType, setGatewayType] = useState('ssh');
    let [accountType, setAccountType] = useState('password');

    const handleGatewayTypeChange = v => {
        setGatewayType(v);
        form.setFieldValue('port', v === 'ssh' ? 22 : 443)
    }

    const handleAccountTypeChange = v => {
        setAccountType(v);
    }

    useEffect(() => {

        const getItem = async () => {
            let data = await api.getById(id);
            if (data) {
                form.setFieldsValue(data);
                setGatewayType(data['gatewayType']);
                setAccountType(data['accountType']);
            }
        }

        if (visible) {
            if(id){
                getItem();
            }else {
                form.setFieldsValue({
                    gatewayType: 'ssh',
                    accountType: 'password',
                    port: 22,
                });
                // TODO: resolve this issue in guacd
                setGatewayType('ssh');
                setAccountType('password');
            }
        } else {
            form.resetFields();
        }
    }, [visible]);

    return (
        <Modal
            title={id ? 'Update Access Gateway' : 'Create New Access Gateway'}
            visible={visible}
            maskClosable={false}
            destroyOnClose={true}
            onOk={() => {
                form
                    .validateFields()
                    .then(async values => {
                        let ok = await handleOk(values);
                        if (ok) {
                            form.resetFields();
                        }
                    });
            }}
            onCancel={() => {
                form.resetFields();
                handleCancel();
            }}
            confirmLoading={confirmLoading}
            okText='OK'
            cancelText='Cancel'
        >
            <Form form={form} {...formItemLayout}>
                <Form.Item name='id' noStyle>
                    <Input hidden={true}/>
                </Form.Item>
                <Form.Item label="Gateway Type" name='gatewayType'
                        rules={[{required: true, message: 'Please Select the GatewayType'}]}>
                    <Select onChange={handleGatewayTypeChange}>
                        <Select.Option key='ssh' value='ssh'>SSH</Select.Option>
                        <Select.Option key='rdp' value='rdp'>RDP</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item label="Gateway Name" name='name' rules={[{required: true, message: "请输入网关名称"}]}>
                    <Input placeholder="Gateway Name"/>
                </Form.Item>

                <Form.Item label="Host" name='ip' rules={[{required: true, message: 'Please enter the host name or IP address of the gateway'}]}>
                    <Input placeholder="The gateway’s host name or IP address"/>
                </Form.Item>

                <Form.Item label="Port" name='port' rules={[{required: true, message: 'Please enter the port'}]}>
                    <InputNumber min={1} max={65535} placeholder='TCP port'/>
                </Form.Item>
                {gatewayType === 'ssh' &&
                <>
                    <Form.Item label="Account Type" name='accountType'
                            rules={[{required: true, message: 'Please select the Account Type'}]}>
                        <Select onChange={handleAccountTypeChange}>
                            <Select.Option key='password' value='password'>Password</Select.Option>
                            <Select.Option key='private-key' value='private-key'>Key</Select.Option>
                        </Select>
                    </Form.Item>

                    {
                        accountType === 'password' ?
                            <>
                                <input type='password' hidden={true} autoComplete='new-password'/>
                                <Form.Item label="Username" name='username'
                                        rules={[{required: true}]}>
                                    <Input placeholder="root"/>
                                </Form.Item>

                                <Form.Item label="Password" name='password'
                                        rules={[{required: true}]}>
                                    <Input.Password placeholder="password"/>
                                </Form.Item>
                            </>
                            :
                            <>
                                <Form.Item label="Username" name='username' rules={[{required: true}]}>
                                    <Input placeholder="Username"/>
                                </Form.Item>

                                <Form.Item label="Private Key" name='privateKey'
                                        rules={[{required: true, message: 'Enter PrivateKey'}]}>
                                    <TextArea rows={4}/>
                                </Form.Item>
                                <Form.Item label="PrivateKey Passphrase" name='passphrase'>
                                    <TextArea rows={1}/>
                                </Form.Item>
                            </>
                    }
                </>
            }
            </Form>
        </Modal>
    )
};

export default AccessGatewayModal;
