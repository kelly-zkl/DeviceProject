<template>
  <section>
    <headerTitle></headerTitle>
    <el-row style="margin-top: 20px;margin-bottom: 10px">
      <el-col :span="24" align="left">
        <el-radio-group v-model="dateString" size="medium" @change="handleDateType">
          <el-radio-button v-for="item in dateTimes" :label="item.value" :key="item.value">{{item.label}}
          </el-radio-button>
        </el-radio-group>
        <el-date-picker v-model="durationDate" type="daterange" align="right" unlink-panels range-separator="至"
                        size="medium" start-placeholder="开始日期" end-placeholder="结束日期"
                        :picker-options="pickerOptions2" @change="handleDate" style="width: 250px;margin-left: 10px"
                        value-format="yyyy-MM-dd" v-show="dateString == 'dur'">
        </el-date-picker>
        <el-radio-group v-model="query.scope" size="medium" style="margin-left: 30px" @change="handleDevice">
          <el-radio-button v-for="item in deviceTypes" :label="item.value" :key="item.value">{{item.label}}
          </el-radio-button>
        </el-radio-group>
        <el-select v-model="query.scopeId" placeholder="请选择设备ID" filterable v-show="query.scope == 2"
                   style="width: 180px;margin-left: 10px" size="medium" @change="handleDevId">
          <el-option v-for="item in deviceList" :key="item.deviceId" :label="item.deviceId" :value="item.deviceId">
          </el-option>
        </el-select>
        <el-tooltip class="item" effect="dark" content="请选择组织" placement="bottom" v-show="query.scope == 1">
          <el-select v-model="query.scopeId" placeholder="请选择组织" size="medium" filterable @change="handleGroup"
                     style="width: 180px;margin-left: 10px">
            <el-option v-for="item in groups" :key="item.groupId" :label="item.groupName" :value="item.groupId">
            </el-option>
          </el-select>
        </el-tooltip>
      </el-col>
    </el-row>
    <div id="main" class="chart"></div>
    <el-row>
      <el-col :span="24" align="left">
        <el-radio-group v-model="query.interval" size="medium" @change="handleTime">
          <el-radio-button v-for="item in timePeriods" :label="item.value" :key="item.value">{{item.label}}
          </el-radio-button>
        </el-radio-group>
      </el-col>
    </el-row>
  </section>
</template>
<script>
  import headerTitle from "../publicComponents/headerTitle.vue";
  import echarts from "echarts";

  export default {
    data() {
      return {
        myChart: {},
        groups: [],
        deviceList: [],
        dateTimes: [{label: '今天', value: $.Data.formatDate(new Date(), 'yyyy-MM-dd')},
          {label: '昨天', value: $.Data.formatDate(new Date((new Date().getTime() - 24 * 3600 * 1000)), 'yyyy-MM-dd')},
          {
            label: '最近一周',
            value: $.Data.formatDate(new Date((new Date().getTime() - 24 * 3600 * 7 * 1000)), 'yyyy-MM-dd') +
            '~' + $.Data.formatDate(new Date(), 'yyyy-MM-dd')
          },
          {label: '自定义', value: 'dur'}],
        dateString: $.Data.formatDate(new Date(), 'yyyy-MM-dd'),
        query: {
          startTime: new Date($.Data.formatDate(new Date(), 'yyyy-MM-dd') + " 00:00:00").getTime(),
          scope: 0, interval: 5, scopeId: '', endTime: new Date().getTime()
        },
        deviceTypes: [{label: '全部设备', value: 0}, {label: '按组织', value: 1}, {label: '指定设备', value: 2}],
        pickerOptions2: {
          shortcuts: [{
            text: '最近一周',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit('pick', [start, end]);
            }
          }]
        },
        timePeriods: [{label: '5分钟', value: 5}, {label: '15分钟', value: 15}, {label: '1小时', value: 60}],
        durationDate: '',
        timeDur: '',
        chartTitle: $.Data.formatDate(new Date(), 'yyyy-MM-dd'),
        subTitle: 0,
        startValue: 0,
        statistics: []//统计数据
      }
    },
    methods: {
      //网络获取统计数据
      getData() {
        this.myChart.showLoading();
        this.$post("/analysis/terminate", this.query).then((data) => {
          this.statistics = data.data;
          if (this.statistics.length <= 100) {
            this.startValue = 0;
          } else {
            let a = parseInt((10000 / this.statistics.length));
            if (a <= 1) {
              this.startValue = 99;
            } else {
              this.startValue = 100 - parseInt((10000 / this.statistics.length));
            }
          }
          this.subTitle = data.msg;
          this.getChart();
        }).catch((err) => {
          this.subTitle = 0;
          this.statistics = [{time: '0', count: 0, mobile: 0, union: 0, telecom: 0}];
          this.getChart();
        });
      },
      //获取折线统计图的数组
      getMapData(val) {
        let arr = [];
        this.statistics.forEach((item) => {
          arr.push(item[val]);
        });
        return arr;
      },
      /** 折线图表示例*/
      getChart() {
        this.myChart.clear();
        // 基于准备好的dom，初始化echarts实例
        this.myChart = echarts.init(document.getElementById('main'));
        // 指定图表的配置项和数据
        let option = {
//          backgroundColor: '#404a59',
          color: ['#C23531', '#2F4554', '#FF8000', '#008000', '#91c7ae', '#749f83', '#dd6b66', '#bda29a', '#6e7074', '#546570', '#c4ccd3'],
          title: {
            text: this.chartTitle, textStyle: {fontWeight: 'normal', fontSize: 16}, subtext: '总量  ' + this.subTitle,
            subtextStyle: {fontSize: 14}, padding: [0, 0, 20, 20,]
          },
          grid: {left: 10, right: 10, bottom: '10%', containLabel: true},
//          toolbox: {feature: {saveAsImage: {show: true}}},
          tooltip: {trigger: 'axis', axisPointer: {type: 'cross'}},
          legend: {data: ['总量', '移动', '联通', '电信'], right: 0, itemWidth: 30},
          xAxis: {data: this.getMapData('time')},
          yAxis: {
            type: 'value', name: '数据量（单位：条）', nameLocation: 'center', nameGap: '-20',
            axisLabel: {interval: 0, rotate: 30}
          },
          dataZoom: [{show: true, start: this.startValue, end: 100}, {type: 'slider'}, {type: 'inside'}],
          series: [{
            name: '总量', type: 'line',//line -> 折线图  bar -> 柱状图
            lineStyle: {type: 'dotted', width: 4},//solid  dashed  dotted  smooth: true,
            symbol: 'roundRect', smooth: true, data: this.getMapData('count')
          },
            {
              name: '移动', type: 'line', lineStyle: {type: 'solid'}, smooth: true,
              data: this.getMapData('mobile'), symbol: 'roundRect'
            },
            {
              name: '联通', type: 'line', lineStyle: {type: 'solid'}, smooth: true,
              data: this.getMapData('nuion'), symbol: 'roundRect'
            },
            {
              name: '电信', type: 'line', lineStyle: {type: 'solid'}, smooth: true,
              data: this.getMapData('telecom'), symbol: 'roundRect'
            }]
        };

        // 使用刚指定的配置项和数据显示图表。
        this.myChart.setOption(option, true);
        this.myChart.hideLoading();
      },
      //选择时间间隔
      handleTime(val) {
        this.query.interval = val;
        this.getData();
      },
      //选择日期
      handleDateType(val) {
        console.log(val);
        if (val.length > 10) {
          this.timePeriods = [{label: '5分钟', value: 5}, {label: '15分钟', value: 15},
            {label: '1小时', value: 60}, {label: '1天', value: 1440}];
          this.query.startTime = new Date(($.Data.formatDate(new Date((new Date().getTime() - 24 * 3600 * 7 * 1000)), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime();
          this.query.endTime = new Date(($.Data.formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime();
        } else {
          this.timePeriods = [{label: '5分钟', value: 5}, {label: '15分钟', value: 15}, {label: '1小时', value: 60}];
          if ($.Data.formatDate(new Date(), 'yyyy-MM-dd') === val) {
            this.query.startTime = new Date((val + " 00:00:00").replace(/-/g, '/')).getTime();
            this.query.endTime = new Date().getTime();
          } else {
            this.query.startTime = new Date((val + " 00:00:00").replace(/-/g, '/')).getTime();
            this.query.endTime = new Date((val + " 23:59:59").replace(/-/g, '/')).getTime();
          }
        }
        this.query.interval = 5;

        if (val !== 'dur') {
          this.chartTitle = val;
          this.durationDate = '';
          this.getData();
        }
      },
      //选择时间段
      handleDate(val) {
        if (new Date(val[1]).getTime() - new Date(val[0]).getTime() > 90 * 24 * 3600 * 1000) {
          this.$message.error('请选择1~90天的范围');
          return;
        }
        if (new Date(val[1]).getTime() - new Date(val[0]).getTime() > 2 * 24 * 3600 * 1000) {
          this.timePeriods = [{label: '5分钟', value: 5}, {label: '15分钟', value: 15},
            {label: '1小时', value: 60}, {label: '1天', value: 1440}];
        } else {
          this.timePeriods = [{label: '5分钟', value: 5}, {label: '15分钟', value: 15}, {label: '1小时', value: 60}];
        }
        this.query.interval = 5;
        this.chartTitle = val[0] + "~" + val[1];
        this.query.startTime = new Date((val[0] + " 00:00:00").replace(/-/g, '/')).getTime();
        this.query.endTime = new Date((val[1] + " 23:59:59").replace(/-/g, '/')).getTime();
        this.getData();
      },
      //设备查询
      handleDevice(val) {
        this.query.scopeId = '';
        if (val === 0) {//全部设备
          this.getData();
        }
      },
      //按照组织查询
      handleGroup(val) {
        this.query.scopeId = val;
        this.getData();
      },
      //指定设备查询
      handleDevId(val) {
        this.query.scopeId = val;
        this.getData();
      },
      //获取全部组织列表
      getAllGroups() {
        this.$post('/manager/group/query', {
          page: 1, size: 9999,
          userId: JSON.parse(sessionStorage.getItem("user")).userId
        }).then((data) => {
          this.groups = data.data.content;
        }).catch((err) => {
          this.groups = [];
        });
      },
      //获取设备列表
      getDeviceList() {
        this.$post("device/query", {page: 1, size: 9999}).then((data) => {
          this.deviceList = data.data.list;
        })
      }
    },
    mounted() {
      // 基于准备好的dom，初始化echarts实例
      this.myChart = echarts.init(document.getElementById('main'));
      this.getAllGroups();
      this.getDeviceList();
      this.getData();
    },
    components: {
      headerTitle
    }
  }
</script>
<style scoped>
  @media screen and (min-width: 320px) and (max-width: 359px) {
    .chart {
      width: 100%;
      height: 250px;
      margin-top: 20px
    }
  }

  @media screen and (min-width: 360px) and (max-width: 411px) {
    .chart {
      width: 100%;
      height: 320px;
      margin-top: 20px
    }
  }

  @media screen and (min-width: 412px) and (max-width: 639px) {
    .chart {
      width: 100%;
      height: 400px;
      margin-top: 30px
    }
  }

  @media screen and (min-width: 640px) {
    .chart {
      width: 100%;
      height: 550px;
      margin-top: 50px
    }
  }

  @media screen and (orientation: landscape) and (max-height: 639px) {
    .chart {
      width: 100%;
      height: 250px;
      margin-top: 20px
    }
  }
</style>
