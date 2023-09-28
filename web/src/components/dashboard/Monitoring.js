import React from 'react';
import {Space, Tooltip} from "antd";
import {DualAxes, Liquid} from '@ant-design/plots';
import {ProCard, StatisticCard} from '@ant-design/pro-components';
import dayjs from "dayjs";
import {renderSize} from "../../utils/utils";
import {Area} from "@ant-design/charts";
import './Monitoring.css'
import {renderWeekDay} from "../../utils/week";
import {useQuery} from "react-query";
import monitorApi from "../../api/monitor";

const {Statistic} = StatisticCard;

const renderLoad = (percent) => {
    if (percent >= 0.9) {
        return 'blocked';
    } else if (percent >= 0.8) {
        return 'slow';
    } else if (percent >= 0.7) {
        return 'normal';
    } else {
        return 'Smooth';
    }
}

const initData = {
    loadStat: {
        load1: 0, load5: 0, load15: 0, percent: 0
    },
    mem: {
        total: 0,
        available: 0,
        usedPercent: 0
    },
    cpu: {
        count: 0,
        usedPercent: 0,
        info: [{
            'modelName': ''
        }]
    },
    disk: {
        total: 0,
        available: 0,
        usedPercent: 0
    },
    diskIO: [], netIO: [], cpuStat: [], memStat: [],
}

const Monitoring = () => {

    let monitorQuery = useQuery('getMonitorData', monitorApi.getData, {
        initialData: initData,
        refetchInterval: 5000
    });

    let loadPercent = monitorQuery.data?.loadStat['percent'];
    let loadColor = '#5B8FF9';
    if (loadPercent > 0.9) {
        loadColor = '#F4664A';
    } else if (loadPercent > 0.8) {
        loadColor = '#001D70';
    } else if (loadPercent > 0.7) {
        loadColor = '#0047A5';
    }

    const loadStatConfig = {
        height: 100,
        width: 100,
        shape: function (x, y, width, height) {
            const r = width / 4;
            const dx = x - width / 2;
            const dy = y - height / 2;
            return [
                ['M', dx, dy + r * 2],
                ['A', r, r, 0, 0, 1, x, dy + r],
                ['A', r, r, 0, 0, 1, dx + width, dy + r * 2],
                ['L', x, dy + height],
                ['L', dx, dy + r * 2],
                ['Z'],
            ];
        },
        percent: loadPercent,
        outline: {
            border: 4, distance: 4,
        },
        wave: {
            length: 64,
        },
        theme: {
            styleSheet: {
                brandColor: loadColor,
            },
        },
        statistic: {
            title: false, content: false
        },
        pattern: {
            type: 'square',
        },
    };

    let cpuPercent = monitorQuery.data?.cpu['usedPercent'] / 100;
    let cpuColor = '#5B8FF9';
    if (cpuPercent > 0.9) {
        cpuColor = '#F4664A';
    } else if (cpuPercent > 0.8) {
        cpuColor = '#001D70';
    }
    const cpuStatConfig = {
        height: 100,
        width: 100,
        shape: 'diamond',
        percent: cpuPercent,
        outline: {
            border: 4, distance: 4,
        },
        wave: {
            length: 64,
        },
        theme: {
            styleSheet: {
                brandColor: cpuColor,
            },
        },
        pattern: {
            type: 'line',
        },
        statistic: {
            title: false, content: false
        }
    };

    let memPercent = monitorQuery.data?.mem['usedPercent'] / 100;
    let memColor = '#5B8FF9';
    if (memPercent > 0.75) {
        memColor = '#F4664A';
    }

    const memStatConfig = {
        height: 100,
        width: 100,
        percent: memPercent,
        outline: {
            border: 4, distance: 4,
        },
        wave: {
            length: 64,
        },
        theme: {
            styleSheet: {
                brandColor: memColor,
            },
        },
        statistic: {
            title: false, content: false
        },
        pattern: {
            type: 'dot',
        },
    };

    let diskPercent = monitorQuery.data?.disk['usedPercent'] / 100;
    let diskColor = '#5B8FF9';
    if (diskPercent > 0.9) {
        diskColor = '#F4664A';
    } else if (diskPercent > 0.8) {
        diskColor = '#001D70';
    }

    const diskStatConfig = {
        height: 100,
        width: 100,
        shape: 'rect',
        percent: diskPercent,
        outline: {
            border: 4, distance: 4,
        },
        wave: {
            length: 64,
        },
        theme: {
            styleSheet: {
                brandColor: diskColor,
            },
        },
        pattern: {
            type: 'line',
        },
        statistic: {
            title: false, content: false
        }
    };

    const diskIOConfig = {
        height: 150,
        data: [monitorQuery.data['diskIO'], monitorQuery.data['diskIO']],
        xField: 'time',
        yField: ['read', 'write'],
        meta: {
            read: {
                alias: 'Read (MB/s)',
            }, write: {
                alias: 'Write (MB/s)'
            }
        },
        geometryOptions: [{
            geometry: 'line', color: '#5B8FF9', smooth: true,
        }, {
            geometry: 'line', color: '#5AD8A6', smooth: true,
        },],
    };

    const netIOConfig = {
        height: 150,
        data: [monitorQuery.data['netIO'], monitorQuery.data['netIO']],
        xField: 'time',
        yField: ['read', 'write'],
        meta: {
            read: {
                alias: 'Receive (MB/s)',
            }, write: {
                alias: 'Send (MB/s)'
            }
        },
        geometryOptions: [{
            geometry: 'line', color: '#5B8FF9', smooth: true,
        }, {
            geometry: 'line', color: '#5AD8A6', smooth: true,
        },],
    };

    const cpuConfig = {
        height: 150, data: monitorQuery.data['cpuStat'], xField: 'time', yField: 'value', smooth: true, areaStyle: {
            fill: '#d6e3fd',
        },
    };

    const memConfig = {
        height: 150, data: monitorQuery.data['memStat'], xField: 'time', yField: 'value', smooth: true, areaStyle: {
            fill: '#d6e3fd',
        },
    };

    const cpuModelName = monitorQuery.data['cpu']['info'][0]['modelName'].length > 10 ? monitorQuery.data['cpu']['info'][0]['modelName'].substring(0, 10) + '...' : monitorQuery.data['cpu']['info'][0]['modelName'];

    return (<>
        <div style={{margin: 16}}>
            <ProCard
                title="System Monitoring"
                extra={dayjs().format("YYYY[Year]MM[Month]DD[Day]") + ' ' + renderWeekDay(dayjs().day())}
                split={'horizontal'}
                headerBordered
                bordered
            >
                <ProCard split={'vertical'}>
                    <ProCard>
                        <StatisticCard
                            statistic={{
                                title: 'Load',
                                value: renderLoad(monitorQuery.data['loadStat']['percent']),
                                description: <Space direction="vertical" size={1}>
                                    <Statistic title="Load1" value={monitorQuery.data['loadStat']['load1'].toFixed(2)}/>
                                    <Statistic title="Load5" value={monitorQuery.data['loadStat']['load5'].toFixed(2)}/>
                                    <Statistic title="Load15"
                                               value={monitorQuery.data['loadStat']['load15'].toFixed(2)}/>
                                </Space>,
                            }}
                            chart={<Liquid {...loadStatConfig} />}
                            chartPlacement="left"
                        />

                        <StatisticCard
                            statistic={{
                                title: 'CPU',
                                value: monitorQuery.data['cpu']['count'],
                                suffix: '个',
                                description: <Space direction="vertical" size={1}>
                                    <Statistic title="Utilization"
                                               value={monitorQuery.data['cpu']['usedPercent'].toFixed(2) + '%'}/>
                                    <Statistic title="Cores"
                                               value={monitorQuery.data['cpu']['phyCount'] + ' 个'}/>
                                    <Tooltip title={monitorQuery.data['cpu']['info'][0]['modelName']}>
                                        <Statistic title="Model" value={cpuModelName}/>
                                    </Tooltip>
                                </Space>,
                            }}
                            chart={<Liquid {...cpuStatConfig} />}
                            chartPlacement="left"
                        />
                    </ProCard>
                    <ProCard>
                        <StatisticCard
                            statistic={{
                                title: 'Memory',
                                value: renderSize(monitorQuery.data['mem']['total']),
                                description: <Space direction="vertical" size={1}>
                                    <Statistic title="Utilization"
                                               value={monitorQuery.data['mem']['usedPercent'].toFixed(2) + '%'}/>
                                    <Statistic title="Available"
                                               value={renderSize(monitorQuery.data['mem']['available'])}/>
                                    <Statistic title="Used" value={renderSize(monitorQuery.data['mem']['used'])}/>
                                </Space>,
                            }}
                            chart={<Liquid {...memStatConfig} />}
                            chartPlacement="left"
                        />

                        <StatisticCard
                            statistic={{
                                title: 'Storage',
                                value: renderSize(monitorQuery.data['disk']['total']),
                                description: <Space direction="vertical" size={1}>
                                    <Statistic title="Utilization"
                                               value={monitorQuery.data['disk']['usedPercent'].toFixed(2) + '%'}/>
                                    <Statistic title="Available"
                                               value={renderSize(monitorQuery.data['disk']['available'])}/>
                                    <Statistic title="Used" value={renderSize(monitorQuery.data['disk']['used'])}/>
                                </Space>,
                            }}
                            chart={<Liquid {...diskStatConfig} />}
                            chartPlacement="left"
                        />
                    </ProCard>
                </ProCard>

                <ProCard split={'vertical'}>
                    <ProCard title="CPU Load">
                        <Area {...cpuConfig} />
                    </ProCard>
                    <ProCard title="Memory Load">
                        <Area {...memConfig} />
                    </ProCard>
                </ProCard>

                <ProCard split={'vertical'}>
                    <ProCard title="Network Throughput">
                        <DualAxes onlyChangeData={true} {...netIOConfig} />
                    </ProCard>
                    <ProCard title="Disk IO">
                        <DualAxes onlyChangeData={true} {...diskIOConfig} />
                    </ProCard>

                </ProCard>


            </ProCard>
        </div>
    </>);
}

export default Monitoring;
