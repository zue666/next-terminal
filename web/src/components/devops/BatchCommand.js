import React, {useState} from 'react';
import {Badge, Divider, Layout, Space, Table, Tag, Tooltip, Typography} from "antd";
import {ProTable} from "@ant-design/pro-components";
import {PROTOCOL_COLORS} from "../../common/constants";
import assetApi from "../../api/asset";
import {isEmpty} from "../../utils/utils";
import dayjs from "dayjs";

const {Title} = Typography;
const {Content} = Layout;
const actionRef = React.createRef();

const BatchCommand = () => {

    let [rows, setRows] = useState([]);

    const addRows = (selectedRows) => {
        selectedRows.forEach(selectedRow => {
            let exist = rows.some(row => {
                return row.id === selectedRow.id;
            });
            if (exist === false) {
                rows.push(selectedRow);
            }
        });
        setRows(rows.slice());
    }

    const removeRows = (selectedRows) => {
        selectedRows.forEach(selectedRow => {
            rows = rows.filter(row => row.id !== selectedRow.id);
        });
        setRows(rows.slice());
    }

    const removeRow = (rowKey) => {
        let items = rows.filter(row => row.id !== rowKey);
        setRows(items.slice());
    }

    const columns = [{
        title: 'Asset Name',
        dataIndex: 'name',
        key: 'name',
        render: (name, record) => {
            let short = name;
            if (short && short.length > 20) {
                short = short.substring(0, 20) + " ...";
            }
            return (
                <Tooltip placement="topLeft" title={name}>
                    {short}
                </Tooltip>
            );
        }
    }, {
        title: 'Protocol',
        dataIndex: 'protocol',
        key: 'protocol',
        render: (text, record) => {
            const title = `${record['ip'] + ':' + record['port']}`
            return (
                <Tooltip title={title}>
                    <Tag color={PROTOCOL_COLORS[text]}>{text}</Tag>
                </Tooltip>
            )
        }
    }, {
        title: 'Tags',
        dataIndex: 'tags',
        key: 'tags',
        render: tags => {
            if (!isEmpty(tags)) {
                let tagDocuments = []
                let tagArr = tags.split(',');
                for (let i = 0; i < tagArr.length; i++) {
                    if (tags[i] === '-') {
                        continue;
                    }
                    tagDocuments.push(<Tag>{tagArr[i]}</Tag>)
                }
                return tagDocuments;
            }
        }
    }, {
        title: 'Status',
        dataIndex: 'active',
        key: 'active',
        render: text => {

            if (text) {
                return (
                    <Tooltip title='运行中'>
                        <Badge status="processing" text='运行中'/>
                    </Tooltip>
                )
            } else {
                return (
                    <Tooltip title='不可用'>
                        <Badge status="error" text='不可用'/>
                    </Tooltip>
                )
            }
        }
    }, {
        title: 'Owner',
        dataIndex: 'ownerName',
        key: 'ownerName'
    }, {
        title: 'Created',
        dataIndex: 'created',
        key: 'created',
        render: (text, record) => {
            return (
                <Tooltip title={text}>
                    {dayjs(text).fromNow()}
                </Tooltip>
            )
        }
    },
    ];

    return (<Content className="page-container">
        <div style={{paddingLeft: 24, paddingRight: 24}}>
            <Title level={5}>List of assets to be executed</Title>
            <div>
                {
                    rows.map(item => {
                        return <Tag color={PROTOCOL_COLORS[item['protocol']]} closable
                                    onClose={() => removeRow(item['id'])}
                                    key={item['id']}>{item['name']}</Tag>
                    })
                }
            </div>

            <Divider/>
        </div>

        <ProTable
            columns={columns}
            actionRef={actionRef}
            rowSelection={{
                // 自定义选择项参考: https://ant.design/components/table-cn/#components-table-demo-row-selection-custom
                // 注释该行则默认不显示下拉选项
                selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
            }}
            tableAlertRender={({selectedRowKeys, selectedRows, onCleanSelected}) => (
                <Space size={24}>
                              <span>
                                Selected {selectedRowKeys.length} 项
                              </span>
                    <span>
                                <a onClick={() => addRows(selectedRows)}>
                                  Add to to-do list
                                </a>
                            </span>
                    <span>
                                <a onClick={() => removeRows(selectedRows)}>
                                  Remove from to-do list
                                </a>
                            </span>
                </Space>
            )}
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
                    protocol: 'ssh',
                    field: field,
                    order: order
                }
                let result = await assetApi.getPaging(queryParams);
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
                pageSize: 5,
            }}
            dateFormatter="string"
            headerTitle="Asset list"
        />
    </Content>);
};

export default BatchCommand;