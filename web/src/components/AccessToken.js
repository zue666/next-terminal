import React from 'react';
import {Button, Descriptions, Space, Typography} from "antd";
import {useQuery} from "react-query";
import accountApi from "../api/account";


const {Title, Text} = Typography;

const AccessToken = () => {

    let tokenQuery = useQuery('getAccessToken', accountApi.getAccessToken);

    const genAccessToken = async () => {
        await accountApi.createAccessToken();
        await tokenQuery.refetch();
    }

    const clearAccessToken = async () => {
        let success = await accountApi.deleteAccessToken();
        if (success) {
            await tokenQuery.refetch();
        }
    }

    return (
        <div>
            <Title level={4}>authorization token</Title>
            <div style={{margin: 16}}></div>
            <Descriptions column={1}>
                <Descriptions.Item label="authorization token">
                    <Text strong copyable>{tokenQuery.data?.token}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Creation Time">
                    <Text strong>{tokenQuery.data?.created}</Text>
                </Descriptions.Item>
            </Descriptions>

            <Space>
                <Button type="primary" onClick={genAccessToken}>
                    regenerate
                </Button>
                <Button type="primary" danger disabled={tokenQuery.data?.token === ''}
                        onClick={clearAccessToken}>
                    delete token
                </Button>
            </Space>
        </div>
    );
};

export default AccessToken;