import React, {useEffect} from 'react';
import {Form, Input, Modal, Switch} from "antd";
import strategyApi from "../../api/strategy";

const api = strategyApi;

const formItemLayout = {
    labelCol: {span: 6},
    wrapperCol: {span: 14},
};

const StrategyModal = ({visible, handleOk, handleCancel, confirmLoading, id}) => {

    const [form] = Form.useForm();

    useEffect(() => {

        const getItem = async () => {
            let data = await api.getById(id);
            if (data) {
                form.setFieldsValue(data);
            }
        }
        if (visible && id) {
            getItem();
        } else {
            form.setFieldsValue({
                upload: false,
                download: false,
                edit: false,
                delete: false,
                rename: false,
                copy: false,
                paste: false,
            });
        }
    }, [visible]);

    return (
        <Modal
            title={id ? 'Update Authorization Policy' : 'Create New Authorization Policy'}
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
            okText='Ok'
            cancelText='Cancel'
        >

            <Form form={form} {...formItemLayout}>
                <Form.Item name='id' noStyle>
                    <Input hidden={true}/>
                </Form.Item>

                <Form.Item label="Name" name='name' rules={[{required: true, message: 'Please Enter Name'}]}>
                    <Input autoComplete="off" placeholder="Authorization Policy Name"/>
                </Form.Item>

                <Form.Item label="Upload" name='upload' rules={[{required: true}]} valuePropName="checked">
                    <Switch checkedChildren="On" unCheckedChildren="Off"/>
                </Form.Item>

                <Form.Item label="Download" name='download' rules={[{required: true}]} valuePropName="checked">
                    <Switch checkedChildren="On" unCheckedChildren="Off"/>
                </Form.Item>

                <Form.Item label="编辑" name='edit' rules={[{required: true}]} valuePropName="checked"
                           tooltip={'编辑需要先开启下载'}>
                    <Switch checkedChildren="On" unCheckedChildren="Off"/>
                </Form.Item>

                <Form.Item label="删除" name='delete' rules={[{required: true}]} valuePropName="checked">
                    <Switch checkedChildren="On" unCheckedChildren="Off"/>
                </Form.Item>

                <Form.Item label="重命名" name='rename' rules={[{required: true}]} valuePropName="checked">
                    <Switch checkedChildren="On" unCheckedChildren="Off"/>
                </Form.Item>

                <Form.Item label="复制" name='copy' rules={[{required: true}]} valuePropName="checked">
                    <Switch checkedChildren="On" unCheckedChildren="Off"/>
                </Form.Item>

                <Form.Item label="粘贴" name='paste' rules={[{required: true}]} valuePropName="checked">
                    <Switch checkedChildren="On" unCheckedChildren="Off"/>
                </Form.Item>
            </Form>
        </Modal>
    )
};

export default StrategyModal;
