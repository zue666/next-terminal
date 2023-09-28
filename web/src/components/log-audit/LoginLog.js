import React, {useState} from 'react';

import {Button, Layout, Modal, Popconfirm, Table, Tag, Tooltip} from "antd";
import {formatDate, isEmpty} from "../../utils/utils";
import {ProTable} from "@ant-design/pro-components";
import loginLogApi from "../../api/login-log";
import ColumnState, {useColumnState} from "../../hook/column-state";
import Show from "../../dd/fi/show";

const api = loginLogApi;
const {Content} = Layout;

const actionRef = React.createRef();

const LoginLog = () => {

    let [total, setTotal] = useState(0);
    let [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const [columnsStateMap, setColumnsStateMap] = useColumnState(ColumnState.LOGIN_LOG);

    const columns = [
        {
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48,
        },
        {
            title: 'username',
            dataIndex: 'username',
            key: 'username'
        },
        {
            title: 'client Ip',
            dataIndex: 'clientIp',
            key: 'clientIp'
        }, {
            title: 'status',
            dataIndex: 'state',
            key: 'state',
            hideInSearch: true,
            render: text => {
                if (text === '0') {
                    return <Tag color="error">fail</Tag>
                } else {
                    return <Tag color="success">success</Tag>
                }
            }
        }, {
            title: 'Reason for failure',
            dataIndex: 'reason',
            key: 'reason',
            hideInSearch: true,
        }, {
            title: 'UserAgent',
            dataIndex: 'clientUserAgent',
            key: 'clientUserAgent',
            hideInSearch: true,
            render: (text, record) => {
                if (isEmpty(text)) {
                    return 'unknown';
                }
                return (
                    <Tooltip placement="topLeft" title={text}>
                        {text.split(' ')[0]}
                    </Tooltip>
                )
            }
        }, {
            title: 'login time',
            dataIndex: 'loginTime',
            key: 'loginTime',
            hideInSearch: true,
            render: (text, record) => {

                return formatDate(text, 'yyyy-MM-dd hh:mm:ss');
            }
        }, {
            title: 'logout time',
            dataIndex: 'logoutTime',
            key: 'logoutTime',
            hideInSearch: true,
            render: (text, record) => {
                if (isEmpty(text) || text === '0001-01-01 00:00:00') {
                    return '';
                }
                return text;
            }
        },
        {
            title: 'action',
            valueType: 'option',
            key: 'option',
            render: (text, record, _, action) => [
                <Show menu={'login-log-del'} key={'login-log-del'}>
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
                    rowSelection={{
                        // 自定义选择项参考: https://ant.design/components/table-cn/#components-table-demo-row-selection-custom
                        // 注释该行则默认不显示下拉选项
                        selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
                        selectedRowKeys: selectedRowKeys,
                        onChange: (keys) => {
                            setSelectedRowKeys(keys);
                        }
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
                            username: params.username,
                            clientIp: params.clientIp,
                            field: field,
                            order: order
                        }
                        let result = await api.getPaging(queryParams);
                        setTotal(result['total']);
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
                    headerTitle="登录日志列表"
                    toolBarRender={() => [
                        <Show menu={'login-log-del'}>
                            <Button key="delete"
                                    danger
                                    disabled={selectedRowKeys.length === 0}
                                    onClick={async () => {
                                        Modal.confirm({
                                            title: '您确定要删除选中的登录日志吗?',
                                            content: '删除之后无法进行恢复，请慎重考虑。',
                                            okText: 'ok',
                                            okType: 'danger',
                                            cancelText: 'Cancel',
                                            onOk: async () => {
                                                await api.deleteById(selectedRowKeys.join(","));
                                                actionRef.current.reload();
                                                setSelectedRowKeys([]);
                                            }
                                        });
                                    }}>
                                删除
                            </Button>
                        </Show>,
                        <Show menu={'login-log-clear'}>
                            <Button key="clear"
                                    type="primary"
                                    danger
                                    disabled={total === 0}
                                    onClick={async () => {
                                        Modal.confirm({
                                            title: '您确定要清空全部的文件登录日志吗?',
                                            content: '清空之后无法进行恢复，请慎重考虑。',
                                            okText: 'ok',
                                            okType: 'danger',
                                            cancelText: 'Cancel',
                                            onOk: async () => {
                                                await api.Clear();
                                                actionRef.current.reload();
                                            }
                                        });
                                    }}>
                                清空
                            </Button>
                        </Show>,
                    ]}
                />
            </Content>
        </div>
    );
}

export default LoginLog;
