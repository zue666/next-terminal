import React, {useState} from 'react';
import {Button, Popconfirm} from "antd";
import {ProTable} from "@ant-design/pro-components";
import CommandModal from "../asset/CommandModal";
import workCommandApi from "../../api/worker/command";

const api = workCommandApi;
const actionRef = React.createRef();

const MyCommand = () => {

    let [visible, setVisible] = useState(false);
    let [confirmLoading, setConfirmLoading] = useState(false);
    let [selectedRowKey, setSelectedRowKey] = useState(undefined);

    const columns = [
        {
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48,
        },
        {
            title: 'Name',
            dataIndex: 'name',
        }, {
            title: 'Content',
            dataIndex: 'content',
            key: 'content',
            copyable: true,
            ellipsis: true
        },
        {
            title: 'Creation Date',
            key: 'created',
            dataIndex: 'created',
            hideInSearch: true,
        },
        {
            title: 'Action',
            valueType: 'option',
            key: 'option',
            render: (text, record, _, action) => [
                <a
                    key="edit"
                    onClick={() => {
                        setVisible(true);
                        setSelectedRowKey(record['id']);
                    }}
                >
                    Edit
                </a>,
                <Popconfirm
                    key={'confirm-delete'}
                    title="Are you sure you want to delete this row?"
                    onConfirm={async () => {
                        await api.deleteById(record.id);
                        actionRef.current.reload();
                    }}
                    okText="ok"
                    cancelText="cancel"
                >
                    <a key='delete' className='danger'>delete</a>
                </Popconfirm>,
            ],
        },
    ];

    return <div>
        <ProTable
            columns={columns}
            actionRef={actionRef}
            request={async (params = {}, sort, filter) => {

                let field = '';
                let order = '';
                if (Object.keys(sort).length > 0) {
                    field = Object.keys(sort)[0];
                    order = Object.values(sort)[0];
                }

                let queryParams = {
                    pageIndex: params.current,
                    pageSize: params.pageSize,
                    name: params.name,
                    field: field,
                    order: order
                }
                let result = await api.getPaging(queryParams);
                return {
                    data: result['items'],
                    success: true,
                    total: result['total']
                };
            }}
            rowKey="id"
            search={{
                labelWidth: 'auto',
            }}
            pagination={{
                defaultPageSize: 10,
            }}
            dateFormatter="string"
            headerTitle="Command List"
            toolBarRender={() => [
                <Button key="button" type="primary" onClick={() => {
                    setVisible(true)
                }}>
                    New
                </Button>,
            ]}
        />

        <CommandModal
            id={selectedRowKey}
            worker={true}
            visible={visible}
            confirmLoading={confirmLoading}
            handleCancel={() => {
                setVisible(false);
                setSelectedRowKey(undefined);
            }}
            handleOk={async (values) => {
                setConfirmLoading(true);

                try {
                    let success;
                    if (values['id']) {
                        success = await api.updateById(values['id'], values);
                    } else {
                        success = await api.create(values);
                    }
                    if (success) {
                        setVisible(false);
                    }
                    actionRef.current.reload();
                } finally {
                    setConfirmLoading(false);
                }
            }}
        />
    </div>;
};

export default MyCommand;