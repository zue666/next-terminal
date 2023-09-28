import React from 'react';
import {Badge, Select, Tag, Tooltip} from "antd";
import {ProTable} from "@ant-design/pro-components";
import {PROTOCOL_COLORS} from "../../common/constants";
import strings from "../../utils/strings";
import {useQuery} from "react-query";
import workAssetApi from "../../api/worker/asset";
import dayjs from "dayjs";

const actionRef = React.createRef();

const MyAsset = () => {

    const tagQuery = useQuery('getAllTag', workAssetApi.tags);

    const columns = [
        {
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48,
        },
        {
            title: 'Name',
            dataIndex: 'name',
            sorter: true,
            render: (text, record) => {
                if (record['description'] === '-') {
                    record['description'] = '';
                }
                return <div>
                    <div>{text}</div>
                    <div style={{
                        color: 'rgba(0, 0, 0, 0.45)',
                        lineHeight: 1.45,
                        fontSize: '14px'
                    }}>{record['description']}</div>
                </div>
            },
        }, {
            title: 'Protocol',
            dataIndex: 'protocol',
            key: 'protocol',
            sorter: true,
            render: (text, record) => {
                return (
                    <Tag color={PROTOCOL_COLORS[text]}>{text}</Tag>
                )
            },
            renderFormItem: (item, {type, defaultRender, ...rest}, form) => {
                if (type === 'form') {
                    return null;
                }

                return (
                    <Select>
                        <Select.Option value="rdp">RDP</Select.Option>
                        <Select.Option value="ssh">SSH</Select.Option>
                        <Select.Option value="telnet">Telnet</Select.Option>
                        <Select.Option value="kubernetes">Kubernetes</Select.Option>
                    </Select>
                );
            },
        }, {
            title: 'Tags',
            dataIndex: 'tags',
            key: 'tags',
            render: tags => {
                if (strings.hasText(tags)) {
                    return tags.split(',').filter(tag => tag !== '-').map(tag => <Tag key={tag}>{tag}</Tag>);
                }
            },
            renderFormItem: (item, {type, defaultRender, ...rest}, form) => {
                if (type === 'form') {
                    return null;
                }

                return (
                    <Select mode="multiple"
                            allowClear>
                        {
                            tagQuery.data?.map(tag => {
                                if (tag === '-') {
                                    return undefined;
                                }
                                return <Select.Option key={tag}>{tag}</Select.Option>
                            })
                        }
                    </Select>
                );
            },
        }, {
            title: 'State',
            dataIndex: 'active',
            key: 'active',
            sorter: true,
            render: (text, record) => {
                if (record['testing'] === true) {
                    return (
                        <Tooltip title='Testing'>
                            <Badge status="processing" text='Testing'/>
                        </Tooltip>
                    )
                }
                if (text) {
                    return (
                        <Tooltip title='Running'>
                            <Badge status="success" text='Running'/>
                        </Tooltip>
                    )
                } else {
                    return (
                        <Tooltip title={record['activeMessage']}>
                            <Badge status="error" text='unavailable'/>
                        </Tooltip>
                    )
                }
            },
            renderFormItem: (item, {type, defaultRender, ...rest}, form) => {
                if (type === 'form') {
                    return null;
                }

                return (
                    <Select>
                        <Select.Option value="true">running</Select.Option>
                        <Select.Option value="false">unavailable</Select.Option>
                    </Select>
                );
            },
        },
        {
            title: 'Last Access Time',
            key: 'lastAccessTime',
            sorter: true,
            dataIndex: 'lastAccessTime',
            hideInSearch: true,
            render: (text, record) => {
                if (text === '0001-01-01 00:00:00') {
                    return '-';
                }
                return (
                    <Tooltip title={text}>
                        {dayjs(text).fromNow()}
                    </Tooltip>
                )
            },
        },
        {
            title: 'Action',
            valueType: 'option',
            key: 'option',
            render: (text, record, index, action) => {
                const id = record['id'];
                const protocol = record['protocol'];
                const name = record['name'];
                let url = '';
                if (protocol === 'ssh') {
                    url = `#/term?assetId=${id}&assetName=${name}&isWorker=true`;
                } else {
                    url = `#/access?assetId=${id}&assetName=${name}&protocol=${protocol}`;
                }

                return [
                    <a
                        key="access"
                        href={url}
                        rel="noreferrer"
                        target='_blank'
                    >
                        Open
                    </a>,
                ]
            },
        },
    ];

    return (
        <div>
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
                        type: params.type,
                        protocol: params.protocol,
                        active: params.active,
                        'tags': params.tags?.join(','),
                        field: field,
                        order: order
                    }
                    let result = await workAssetApi.getPaging(queryParams);

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
                headerTitle="Asset List"
            />
        </div>
    );
}

export default MyAsset;