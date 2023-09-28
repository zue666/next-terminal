import React, {useState} from 'react';

import {Button, Input, Layout, message, Modal, Popconfirm, Switch, Table} from "antd";
import UserModal from "./UserModal";
import {Link, useNavigate} from "react-router-dom";
import {ProTable, TableDropdown} from "@ant-design/pro-components";
import userApi from "../../../api/user";
import arrays from "../../../utils/array";
import {ExclamationCircleOutlined, LockTwoTone} from "@ant-design/icons";
import strings from "../../../utils/strings";
import ColumnState, {useColumnState} from "../../../hook/column-state";
import {hasMenu} from "../../../service/permission";
import Show from "../../../dd/fi/show";

const api = userApi;

const {Content} = Layout;

const actionRef = React.createRef();

const User = () => {
    let [visible, setVisible] = useState(false);
    let [confirmLoading, setConfirmLoading] = useState(false);
    let [selectedRowKey, setSelectedRowKey] = useState(undefined);
    let [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const [columnsStateMap, setColumnsStateMap] = useColumnState(ColumnState.USER);
    let navigate = useNavigate();

    const columns = [
        {
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48,
        }, {
            title: 'User Nickname',
            dataIndex: 'nickname',
            key: 'nickname',
            sorter: true,
            render: (text, record) => {
                let view = <div>{text}</div>;
                if (hasMenu('user-detail')) {
                    view = <Link to={`/user/${record['id']}`}>{text}</Link>;
                }
                return view;
            }
        }, {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
            sorter: true,
        }, {
            title: 'Email',
            dataIndex: 'mail',
            key: 'mail',
        }, {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            hideInSearch: true,
            render: (status, record, index) => {
                return <Switch checkedChildren="enable" unCheckedChildren="disable"
                               checked={status !== 'disabled'}
                               onChange={checked => {
                                   handleChangeUserStatus(record['id'], checked, index);
                               }}/>
            }
        }, {
            title: 'Status',
            dataIndex: 'online',
            key: 'online',
            valueType: 'radio',
            sorter: true,
            valueEnum: {
                true: {text: 'online', status: 'success'},
                false: {text: 'offline', status: 'default'},
            },
        },
        {
            title: 'Creation Time',
            key: 'created',
            dataIndex: 'created',
            hideInSearch: true,
        },
        {
            title: 'Action',
            valueType: 'option',
            key: 'option',
            render: (text, record, _, action) => [
                <Show menu={'user-edit'} key={'user-edit'}>
                    <a
                        key="edit"
                        onClick={() => {
                            setVisible(true);
                            setSelectedRowKey(record['id']);
                        }}
                    >
                        Edit
                    </a>
                </Show>
                ,
                <Show menu={'user-del'} key={'user-del'}>
                    <Popconfirm
                        key={'confirm-delete'}
                        title="Are you sure you want to delete this line?"
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
                <TableDropdown
                    key="actionGroup"
                    onSelect={(key) => {
                        switch (key) {
                            case 'user-detail':
                                navigate(`/user/${record['id']}?activeKey=info`);
                                break;
                            case 'user-authorised-asset':
                                navigate(`/user/${record['id']}?activeKey=asset`);
                                break;
                            case 'user-login-policy':
                                navigate(`/user/${record['id']}?activeKey=login-policy`);
                                break;
                        }
                    }}
                    menus={[
                        {key: 'user-detail', name: 'details', disabled: !hasMenu('user-detail')},
                        {key: 'user-authorised-asset', name: 'assets', disabled: !hasMenu('user-authorised-asset')},
                        {key: 'user-login-policy', name: 'login policy', disabled: !hasMenu('user-login-policy')},
                    ]}
                />,
            ],
        },
    ];

    const handleChangeUserStatus = async (id, checked, index) => {
        await api.changeStatus(id, checked ? 'enabled' : 'disabled');
        actionRef.current.reload();
    }

    const handleResetTotp = () => {
        Modal.confirm({
            title: "Are you sure you want to reset the user's two-factor authentication information?",
            icon: <ExclamationCircleOutlined/>,
            content: 'After the reset, users can log in to the system without secondary authentication.',
            onOk() {
                return new Promise(async (resolve, reject) => {
                    await api.resetTotp(selectedRowKeys.join(','));
                    resolve();
                    message.success("2FA Reset successful");
                }).catch(() => console.log('Oops errors!'))
            },
        });
    }

    const handleChangePassword = () => {
        let password = '';
        Modal.confirm({
            title: 'Change Password',
            icon: <LockTwoTone/>,
            content: <Input.Password onChange={e => password = e.target.value} placeholder="Please enter a new password"/>,
            onOk() {
                return new Promise(async (resolve, reject) => {
                    if (!strings.hasText(password)) {
                        reject();
                        message.warn("Please enter password");
                        return;
                    }
                    await api.changePassword(selectedRowKeys.join(','), password);
                    resolve();
                    message.success("Successfully modified");
                }).catch(() => console.log('Oops errors!'))
            },
        });
    }

    return (<Content className="page-container">
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
                    nickname: params.nickname,
                    username: params.username,
                    mail: params.mail,
                    online: params.online,
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
            headerTitle="User List"
            toolBarRender={() => [
                <Show menu={'user-add'}>
                    <Button key="button" type="primary" onClick={() => {
                        setVisible(true)
                    }}>
                        New
                    </Button>
                </Show>,
                <Show menu={'user-change-password'}>
                    <Button key="button"
                            disabled={arrays.isEmpty(selectedRowKeys)}
                            onClick={handleChangePassword}>
                        Change Password
                    </Button>
                </Show>,
                <Show menu={'user-reset-totp'}>
                    <Button key="button"
                            disabled={arrays.isEmpty(selectedRowKeys)}
                            onClick={handleResetTotp}>
                        Reset two-factor authentication
                    </Button>
                </Show>,
            ]}
        />

        <UserModal
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

export default User;
