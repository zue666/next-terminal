import React, {useState} from 'react';
import {Col, Descriptions, Progress, Row} from "antd";
import {renderSize} from "../../utils/utils";
import './Stats.css'
import {useQuery} from "react-query";
import sessionApi from "../../api/session";

const defaultStats = {
    uptime: 0,
    load1: 0,
    load5: 0,
    load10: 0,
    memTotal: 0,
    memFree: 0,
    memAvailable: 0,
    memBuffers: 0,
    memCached: 0,
    swapTotal: 0,
    swapFree: 0,
    network: {},
    fileSystems: [],
    cpu: {
        user: 0,
        system: 0,
        nice: 0,
        idle: 0,
        ioWait: 0,
        irq: 0,
        softIrq: 0,
        guest: 0
    }
}

const Stats = ({sessionId, visible, queryInterval = 5000}) => {

    let [stats, setStats] = useState(defaultStats);
    let [prevStats, setPrevStats] = useState({});

    useQuery("stats", () => sessionApi.stats(sessionId), {
        refetchInterval: queryInterval,
        enabled: visible,
        onSuccess: (data) => {
            setPrevStats(stats);
            setStats(data);
        }
    });

    const upDays = parseInt((stats.uptime / 1000 / 60 / 60 / 24).toString());
    const memUsage = ((stats.memTotal - stats.memAvailable) * 100 / stats.memTotal).toFixed(2);
    let network = stats.network;
    let fileSystems = stats.fileSystems;

    let swapUsage = 0;
    if (stats.swapTotal !== 0) {
        swapUsage = ((stats.swapTotal - stats.swapFree) * 100 / stats.swapTotal).toFixed(2)
    }

    return (
        <div>
            <Descriptions title="System information" column={4}>
                <Descriptions.Item label="Hostname">{stats.hostname}</Descriptions.Item>
                <Descriptions.Item label="Uptime">{upDays}天</Descriptions.Item>
            </Descriptions>

            <Row justify="center" align="middle">
                <Col>
                    <Descriptions title="load" column={4}>
                        <Descriptions.Item label='Load1'>
                            <div className='description-content'>
                                <Progress percent={stats.load1} steps={20} size={'small'}/>
                            </div>
                        </Descriptions.Item>
                        <Descriptions.Item label='Load5'>
                            <div className='description-content'>
                                <Progress percent={stats.load5} steps={20} size={'small'}/>
                            </div>
                        </Descriptions.Item>
                        <Descriptions.Item label='Load10'>
                            <div className='description-content'>
                                <Progress percent={stats.load10} steps={20} size={'small'}/>
                            </div>
                        </Descriptions.Item>
                    </Descriptions>
                </Col>
            </Row>


            <Descriptions title="CPU" column={4}>
                <Descriptions.Item label="user">
                    {stats.cpu['user'].toFixed(2)}%
                </Descriptions.Item>
                <Descriptions.Item label="system">
                    {stats.cpu['system'].toFixed(2)}%
                </Descriptions.Item>
                <Descriptions.Item label="idle">
                    {stats.cpu['idle'].toFixed(2)}%
                </Descriptions.Item>
                <Descriptions.Item label="IO wait">
                    {stats.cpu['ioWait'].toFixed(2)}%
                </Descriptions.Item>
                <Descriptions.Item label="irq">
                    {stats.cpu['irq'].toFixed(2)}%
                </Descriptions.Item>
                <Descriptions.Item label="soft-irq">
                    {stats.cpu['softIrq'].toFixed(2)}%
                </Descriptions.Item>
                <Descriptions.Item label="nice">
                    {stats.cpu['nice'].toFixed(2)}%
                </Descriptions.Item>
                <Descriptions.Item label="guest">
                    {stats.cpu['guest'].toFixed(2)}%
                </Descriptions.Item>
            </Descriptions>

            <Descriptions title="内存" column={4}>
                <Descriptions.Item label="Total Memory">{renderSize(stats.memTotal)}</Descriptions.Item>
                <Descriptions.Item label="Free Memory">{renderSize(stats.memFree)}</Descriptions.Item>
                <Descriptions.Item label="Available Memory">{renderSize(stats.memAvailable)}</Descriptions.Item>
                <Descriptions.Item label="Usage Ratio">
                    <div className='description-content'>
                        <Progress percent={memUsage} steps={20} size={'small'}/>
                    </div>
                </Descriptions.Item>
                <Descriptions.Item
                    label="Buffers/Cached">{renderSize(stats.memBuffers)} / {renderSize(stats.memCached)}</Descriptions.Item>
                <Descriptions.Item
                    label="交换内存大小">{renderSize(stats.swapTotal)}</Descriptions.Item>
                <Descriptions.Item
                    label="交换内存剩余">{renderSize(stats.swapFree)}</Descriptions.Item>
                <Descriptions.Item label="Usage Ratio">
                    <div className='description-content'>
                        <Progress percent={swapUsage} steps={20} size={'small'}/>
                    </div>
                </Descriptions.Item>
            </Descriptions>

            <Descriptions title="磁盘" column={4}>
                {
                    fileSystems.map((item, index) => {
                        return (
                            <React.Fragment key={'disk' + index}>
                                <Descriptions.Item label="MountPath" key={'MountPath' + index}>
                                    {item['mountPoint']}
                                </Descriptions.Item>
                                <Descriptions.Item label="Used" key={'Used' + index}>
                                    {renderSize(item['used'])}
                                </Descriptions.Item>
                                <Descriptions.Item label="Remaining" key={'Remaining' + index}>
                                    {renderSize(item['free'])}
                                </Descriptions.Item>
                                <Descriptions.Item label="UsageRatio" key={'UsageRatio' + index}>
                                    <div className='description-content'>
                                        <Progress
                                            percent={(item['used'] * 100 / (item['used'] + item['free'])).toFixed(2)}
                                            steps={20} size={'small'}/>
                                    </div>
                                </Descriptions.Item>
                            </React.Fragment>
                        );
                    })
                }
            </Descriptions>

            <Descriptions title="Network" column={4}>
                {
                    Object.keys(network).map((key, index) => {
                        let prevNetwork = prevStats.network;
                        let rxOfSeconds = 0, txOfSeconds = 0;
                        if (prevNetwork[key] !== undefined) {
                            rxOfSeconds = (network[key]['rx'] - prevNetwork[key]['rx']) / 5;
                        }
                        if (prevNetwork[key] !== undefined) {
                            txOfSeconds = (network[key]['tx'] - prevNetwork[key]['tx']) / 5;
                        }

                        return (
                            <React.Fragment key={'Network' + index}>
                                <Descriptions.Item label="NIC" key={'NIC' + index}>{key}</Descriptions.Item>
                                <Descriptions.Item label="IPv4" key={'IPv4' + index}>
                                    {network[key]['ipv4']}
                                </Descriptions.Item>
                                <Descriptions.Item label="RX" key={'RX' + index}>
                                    {renderSize(network[key]['rx'])} &nbsp; {renderSize(rxOfSeconds)}/秒
                                </Descriptions.Item>
                                <Descriptions.Item label="TX" key={'TX' + index}>
                                    {renderSize(network[key]['tx'])} &nbsp; {renderSize(txOfSeconds)}/秒
                                </Descriptions.Item>
                            </React.Fragment>
                        );
                    })
                }
            </Descriptions>
        </div>
    );
};

export default Stats;