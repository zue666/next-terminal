import React, {useEffect, useState} from 'react';
import {Descriptions, Tag} from "antd";
import strategyApi from "../../api/strategy";

const api = strategyApi;

const renderStatus = (text) => {
    if (text === true) {
        return <Tag color={'green'}>On</Tag>
    } else {
        return <Tag color={'red'}>Off</Tag>
    }
}

const StrategyInfo = ({active, id}) => {
    let [item, setItem] = useState({});

    useEffect(() => {
        const getItem = async (id) => {
            let item = await api.getById(id);
            if (item) {
                setItem(item);
            }
        };
        if (active && id) {
            getItem(id);
        }
    }, [active]);

    return (
        <div className={'page-detail-info'}>
            <Descriptions column={1}>
                <Descriptions.Item label="Name">{item['name']}</Descriptions.Item>
                <Descriptions.Item label="Upload">{renderStatus(item['upload'])}</Descriptions.Item>
                <Descriptions.Item label="Download">{renderStatus(item['download'])}</Descriptions.Item>
                <Descriptions.Item label="Edit">{renderStatus(item['edit'])}</Descriptions.Item>
                <Descriptions.Item label="Delete">{renderStatus(item['delete'])}</Descriptions.Item>
                <Descriptions.Item label="Rename">{renderStatus(item['rename'])}</Descriptions.Item>
                <Descriptions.Item label="Copy">{renderStatus(item['copy'])}</Descriptions.Item>
                <Descriptions.Item label="Paste">{renderStatus(item['paste'])}</Descriptions.Item>
                <Descriptions.Item label="Created">{item['created']}</Descriptions.Item>
            </Descriptions>
        </div>
    );
};

export default StrategyInfo;