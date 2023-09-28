import React, {Component} from 'react';
import FileSystem from "../devops/FileSystem";
import {Col, Descriptions, Layout, message, Row, Typography} from "antd";
import {getCurrentUser, isAdmin} from "../../service/permission";
import {FireOutlined, HeartOutlined} from "@ant-design/icons";
import {renderSize} from "../../utils/utils";
import request from "../../common/request";

const {Content} = Layout;
const {Title} = Typography;

class MyFile extends Component {

    state = {
        storage: {}
    }

    componentDidMount() {
        this.getDefaultStorage();
    }

    getDefaultStorage = async () => {
        let result = await request.get(`/account/storage`);
        if (result.code !== 1) {
            message.error(result['message']);
            return;
        }
        this.setState({
            storage: result['data']
        })
    }

    render() {
        let storage = this.state.storage;
        let contentClassName = isAdmin() ? 'page-container' : 'page-container-user';
        return (
            <div>
                <Content key='page-container' className={[contentClassName]}>
                    <div >
                        <Row justify="space-around" align="middle" gutter={24}>
                            <Col span={16} key={1}>
                                <Title level={4}>My File</Title>
                            </Col>
                            <Col span={8} key={2} style={{textAlign: 'right'}}>
                                <Descriptions title="" column={2}>
                                    <Descriptions.Item label={<div><FireOutlined/> Size Limit</div>}>
                                        <strong>{storage['limitSize'] < 0 ? 'Unlimited' : renderSize(storage['limitSize'])}</strong>
                                    </Descriptions.Item>
                                    <Descriptions.Item label={<div><HeartOutlined/> Used Size</div>}>
                                        <strong>{renderSize(storage['usedSize'])}</strong>
                                    </Descriptions.Item>
                                </Descriptions>
                            </Col>
                        </Row>
                    </div>
                    <FileSystem storageId={getCurrentUser()['id']}
                                storageType={'storages'}
                                callback={this.getDefaultStorage}
                                upload={true}
                                download={true}
                                delete={true}
                                rename={true}
                                edit={true}
                                minHeight={window.innerHeight - 203}/>
                </Content>
            </div>
        );
    }
}

export default MyFile;