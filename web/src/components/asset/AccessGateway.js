import React, { useState } from 'react';

import { Badge, Button, Layout, Popconfirm, Tag, Tooltip } from "antd";
import accessGatewayApi from "../../api/access-gateway";
import { ProTable } from "@ant-design/pro-components";
import AccessGatewayModal from "./AccessGatewayModal";
import ColumnState, { useColumnState } from "../../hook/column-state";
import Show from "../../dd/fi/show";

const { Content } = Layout;

const api = accessGatewayApi;

const actionRef = React.createRef();

const AccessGateway = () => {
    let [visible, setVisible] = useState(false);
    let [confirmLoading, setConfirmLoading] = useState(false);
    let [selectedRowKey, setSelectedRowKey] = useState(undefined);

    const [columnsStateMap, setColumnsStateMap] = useColumnState(ColumnState.ACCESS_GATEWAY);

    const columns = [
        {
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48,
        },
        {
            title: 'Gateway Type',
            dataIndex: 'gatewayType',
            key: 'gatewayType',
            hideInSearch: true
        },
        {
            title: 'Name',
            dataIndex: 'name',
        },
        {
            title: 'IP',
            dataIndex: 'ip',
            key: 'ip',
            sorter: true,
            hideInSearch: true
        }, {
            title: 'Port',
            dataIndex: 'port',
            key: 'port',
            hideInSearch: true
        }, {
            title: 'Account Type',
            dataIndex: 'accountType',
            key: 'accountType',
            hideInSearch: true,
            render: (accountType) => {
                if (accountType === 'private-key') {
                    return (
                        <Tag color="green">Key</Tag>
                    );
                } else if (accountType === 'password') {
                    return (
                        <Tag color="red">Password</Tag>
                    );
                } else {
                    return <>-</>
                }
            }
        }, {
            title: 'Authorized account',
            dataIndex: 'username',
            key: 'username',
            hideInSearch: true
        }, {
            title: 'State',
            dataIndex: 'connected',
            key: 'connected',
            hideInSearch: true,
            render: (text, record) => {
                if (text) {
                    return (
                        <Tooltip title='Successfully connected'>
                            <Badge status="success" text='connected' />
                        </Tooltip>
                    )
                } else {
                    return (
                        <Tooltip title={record['message']}>
                            <Badge status="default" text='Disconnected' />
                        </Tooltip>
                    )
                }
            }
        },
        {
            title: 'creation time',
            key: 'created',
            dataIndex: 'created',
            hideInSearch: true,
        },
        {
            title: 'operation',
            valueType: 'option',
            key: 'option',
            render: (text, record, _, action) => [
                <Show menu={'access-gateway-edit'} key={'access-gateway-edit'}>
                    <a
                        key="edit"
                        onClick={() => {
                            setVisible(true);
                            setSelectedRowKey(record['id']);
                        }}
                    >
                        edit
                    </a>
                </Show>,
                <Show menu={'access-gateway-del'} key={'access-gateway-del'}>
                    <Popconfirm
                        key={'confirm-delete'}
                        title="Are you sure you want to delete this row?"
                        onConfirm={async () => {
                            await api.deleteById(record.id);
                            actionRef.current.reload();
                        }}
                        okText="confirm"
                        cancelText="cancel"
                    >
                        <a key='delete' className='danger'>delete</a>
                    </Popconfirm>
                </Show>,
            ],
        },
    ];

    return (<Content className="page-container">
        <ProTable
            columns={columns}
            actionRef={actionRef}
            columnsState={{
                value: columnsStateMap,
                onChange: setColumnsStateMap
            }}
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
            headerTitle="Access Gateway List"
            toolBarRender={() => [
                <Show menu={'access-gateway-add'}>
                    <Button key="button" type="primary" onClick={() => {
                        setVisible(true)
                    }}>
                        New
                    </Button>
                </Show>,
            ]}
        />

        <AccessGatewayModal
            id={selectedRowKey}
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

    </Content>);
}

export default AccessGateway;
