import React, {useState} from 'react';
import {Button, Drawer, Layout, Popconfirm, Tag} from "antd";
import {ProTable} from "@ant-design/pro-components";
import storageApi from "../../api/storage";
import StorageModal from "./StorageModal";
import {renderSize} from "../../utils/utils";
import FileSystem from "./FileSystem";
import ColumnState, {useColumnState} from "../../hook/column-state";
import Show from "../../dd/fi/show";

const api = storageApi;

const {Content} = Layout;

const actionRef = React.createRef();

const Storage = () => {
    let [visible, setVisible] = useState(false);
    let [confirmLoading, setConfirmLoading] = useState(false);
    let [selectedRowKey, setSelectedRowKey] = useState(undefined);

    let [fileSystemVisible, setFileSystemVisible] = useState(false);
    const [columnsStateMap, setColumnsStateMap] = useColumnState(ColumnState.STORAGE);

    const columns = [
        {
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48,
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        }, {
            title: 'Shared',
            dataIndex: 'isShare',
            key: 'isShare',
            hideInSearch: true,
            render: (isShare) => {
                if (isShare) {
                    return <Tag color={'green'}>yes</Tag>
                } else {
                    return <Tag color={'red'}>no</Tag>
                }
            }
        }, {
            title: '是否默认',
            dataIndex: 'isDefault',
            key: 'isDefault',
            hideInSearch: true,
            render: (isDefault) => {
                if (isDefault) {
                    return <Tag color={'green'}>yes</Tag>
                } else {
                    return <Tag color={'red'}>no</Tag>
                }
            }
        }, {
            title: 'size limit',
            dataIndex: 'limitSize',
            key: 'limitSize',
            hideInSearch: true,
            render: (text => {
                return text < 0 ? 'unlimited' : renderSize(text);
            })
        }, {
            title: 'used size',
            dataIndex: 'usedSize',
            key: 'usedSize',
            hideInSearch: true,
            render: (text => {
                return renderSize(text);
            })
        }, {
            title: 'owner',
            dataIndex: 'ownerName',
            key: 'ownerName',
            hideInSearch: true,
        },
        {
            title: 'action',
            valueType: 'option',
            key: 'option',
            render: (text, record, _, action) => [
                <Show menu={'storage-browse'} key={'storage-browse'}>
                    <a
                        key="edit"
                        onClick={() => {
                            setFileSystemVisible(true);
                            setSelectedRowKey(record['id']);
                        }}
                    >
                        browse
                    </a>
                </Show>,
                <Show menu={'storage-edit'} key={'storage-edit'}>
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
                <Show menu={'storage-del'} key={'storage-del'}>
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
                        <a key='delete' disabled={record['isDefault']} className='danger'>delete</a>
                    </Popconfirm>
                </Show>,
            ],
        },
    ];

    return (
        <div>
            <Content className="page-container">
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
                        pageSize: 10,
                    }}
                    dateFormatter="string"
                    headerTitle="Storage"
                    toolBarRender={() => [
                        <Show menu={'storage-add'}>
                            <Button key="button" type="primary" onClick={() => {
                                setVisible(true)
                            }}>
                                New
                            </Button>
                        </Show>,
                    ]}
                />

                <StorageModal
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

                <Drawer
                    title={'File management'}
                    placement="right"
                    width={window.innerWidth * 0.8}
                    closable={true}
                    maskClosable={true}
                    onClose={() => {
                        setFileSystemVisible(false);
                        setSelectedRowKey(undefined);
                        actionRef.current.reload();
                    }}
                    visible={fileSystemVisible}
                >
                    {fileSystemVisible ?
                        <FileSystem
                            storageId={selectedRowKey}
                            storageType={'storages'}
                            upload={true}
                            download={true}
                            delete={true}
                            rename={true}
                            edit={true}
                            minHeight={window.innerHeight - 103}/>
                        : undefined
                    }

                </Drawer>
            </Content>
        </div>
    );
}

export default Storage;