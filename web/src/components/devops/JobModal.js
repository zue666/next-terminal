import React, {useState} from 'react';
import {Form, Input, Modal, Radio, Select, Spin} from "antd";
import jobApi from "../../api/job";
import assetApi from "../../api/asset";
import {useQuery} from "react-query";
import strings from "../../utils/strings";

const {TextArea} = Input;

const JobModal = ({
                      visible,
                      handleOk,
                      handleCancel,
                      confirmLoading,
                      id,
                  }) => {

    const [form] = Form.useForm();

    let [func, setFunc] = useState('shell-job');
    let [mode, setMode] = useState('all');

    useQuery('getJobById', () => jobApi.getById(id), {
        enabled: visible && strings.hasText(id),
        onSuccess: data => {
            if (data['func'] === 'shell-job') {
                try {
                    data['shell'] = JSON.parse(data['metadata'])['shell'];
                } catch (e) {
                    data['shell'] = '';
                }
            }

            if (data.resourceIds) {
                data.resourceIds = data.resourceIds.split(',');
            }
            form.setFieldsValue(data);
            setMode(data['mode']);
            setFunc(data['func']);
        },
    });

    let resQuery = useQuery(`resQuery`, () => assetApi.GetAll('ssh'));

    let resOptions = resQuery.data?.map(item => {
        return {
            label: item.name,
            value: item.id
        }
    });

    const formItemLayout = {
        labelCol: {span: 6},
        wrapperCol: {span: 14},
    };

    return (
        <Modal
            title={id ? 'Update scheduled tasks' : 'Create a new scheduled task'}
            visible={visible}
            maskClosable={false}
            destroyOnClose={true}
            onOk={() => {
                form
                    .validateFields()
                    .then(async values => {
                        console.log(values)
                        if (values['resourceIds']) {
                            values['resourceIds'] = values['resourceIds'].join(',');
                        }
                        form.resetFields();
                        handleOk(values);
                    });
            }}
            onCancel={() => {
                form.resetFields();
                handleCancel();
            }}
            confirmLoading={confirmLoading}
            okText='ok'
            cancelText='Cancel'
        >

            <Form form={form} {...formItemLayout}
                  initialValues={
                      {
                          func: 'shell-job',
                          mode: 'all',
                      }
                  }>
                <Form.Item name='id' noStyle>
                    <Input hidden={true}/>
                </Form.Item>

                <Form.Item label="Task type" name='func' rules={[{required: true, message: 'Please select task type'}]}>
                    <Select onChange={(value) => {
                        setFunc(value);
                    }}>
                        <Select.Option value="shell-job">Shell Script</Select.Option>
                        <Select.Option value="check-asset-status-job">Asset status detection</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item label="任务名称" name='name' rules={[{required: true, message: 'Please enter a task name'}]}>
                    <Input autoComplete="off" placeholder="Please enter a task name"/>
                </Form.Item>

                {
                    func === 'shell-job' ?
                        <Form.Item label="Shell script" name='shell'
                                   rules={[{required: true, message: 'Please enter Shell script'}]}>
                            <TextArea autoSize={{minRows: 5, maxRows: 10}} placeholder="Fill in the Shell script content here"/>
                        </Form.Item> : undefined
                }

                <Form.Item label="cron job" name='cron' rules={[{required: true, message: 'Please enter cron job'}]}>
                    <Input placeholder="Please enter cron job"/>
                </Form.Item>

                <Form.Item label="Asset selection" name='mode' rules={[{required: true, message: 'Please select an asset'}]}>
                    <Radio.Group onChange={async (e) => {
                        setMode(e.target.value);
                    }}>
                        <Radio value={'all'}>All</Radio>
                        <Radio value={'custom'}>custom</Radio>
                        <Radio value={'self'}>local</Radio>
                    </Radio.Group>
                </Form.Item>

                {
                    mode === 'custom' &&
                    <Spin tip='loading...' spinning={resQuery.isLoading}>
                        <Form.Item label="Asset selected" name='resourceIds' rules={[{required: true}]}>
                            <Select
                                mode="multiple"
                                allowClear
                                placeholder="Please select an asset"
                                options={resOptions}
                            >
                            </Select>
                        </Form.Item>
                    </Spin>
                }
            </Form>
        </Modal>
    )
};

export default JobModal;
