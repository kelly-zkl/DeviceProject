<template>
  <div>
    <section class="content">
      <el-form label-width="120px" label-position="left" ref="gsmSniffer" :model="gsmSniffer" :rules="rules">
        <h4 style="text-align: left;margin-top: 0">扫频设置</h4>
        <div class="center-block add-appdiv">
          <el-form-item label="扫频模式" align="left" style="margin: 20px 0 0 15px" prop="snifferMode">
            <el-select v-model="gsmSniffer.snifferMode" placeholder="请选择" filterable>
              <el-option v-for="item in snifferModes" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="选频模式" align="left" style="margin: 20px 0 0 15px" prop="selectFreqMode">
            <el-select v-model="gsmSniffer.selectFreqMode" placeholder="请选择" filterable>
              <el-option v-for="item in autoBccModes" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="自动扫频时间" style="margin: 20px 0 0 15px" align="left" prop="runTime"
                        v-show="gsmSniffer.snifferMode==1">
            <el-time-picker v-model="gsmSniffer.runTime" :picker-options="{selectableRange: '00:00:00 - 23:59:59'}"
                            placeholder="选择时间" value-format="HH:mm:ss">
            </el-time-picker>
          </el-form-item>
          <el-form-item label="自动扫频间隔" style="margin: 20px 0 0 15px" align="left" prop="snifferCycle"
                        v-show="gsmSniffer.snifferMode==1">
            <el-row>
              <el-col :span="8">
                <el-input-number v-model="gsmSniffer.snifferCycle" :min="1" :maxlength=3
                                 style="width: 95%"></el-input-number>
              </el-col>
              <el-col :span="2">天</el-col>
            </el-row>
          </el-form-item>
          <el-form-item align="left" style="margin: 20px 0 0 15px" v-show="getButtonVial('set:gsmSniffer')">
            <el-button type="primary" @click="setScanTime" size="medium">设置</el-button>
          </el-form-item>
        </div>
      </el-form>
      <h4 style="text-align: left">扫频数据</h4>
      <el-tabs v-model="activeItem" @tab-click="handleClick" style="margin-left: 20px">
        <el-tab-pane :label="tab.name" v-for="tab in activeName" :key="tab.name" :name="tab.name"></el-tab-pane>
      </el-tabs>
      <el-table :data="networkData" v-loading="listLoading" stripe style="margin-bottom: 30px">
        <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
        <el-table-column align="left" v-for="item in defaultProps" :key="item.value" :formatter="formatterAddress"
                         :prop="item.value" :label="item.name" min-width="100" max-width="200"></el-table-column>
      </el-table>
    </section>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        networkData: [],
        gsmSniffer: {snifferMode: 0, selectFreqMode: 10, runTime: new Date(), snifferCycle: 1},
        listLoading: false,
        activeItem: "移动(GSM)",
        activeName: [{moduleID: 1, name: '移动(GSM)', type: 'GSM1'}, {moduleID: 2, name: '联通(GSM)', type: 'GSM1'}],
        query: {page: 1, size: 10},
        count: 0,
        deviceId: this.$route.query.deviceId || '',
        defaultProps: [{value: 'bcchNumber', name: '频点'}, {value: 'c1', name: 'c1'},
          {value: 'c2', name: 'c2'}, {value: 'rssi', name: 'rssi'}, {value: 'upTime', name: '上报时间'}],
        autoBccModes: [{value: 10, label: '手动配置'}, {value: 2, label: '周围宏站选次弱'}, {value: 8, label: '宏站邻区选次弱'}],
        snifferModes: [{value: 0, label: '手动'}, {value: 1, label: '自动'}],
        rules: {
          snifferMode: [{required: true, message: '请输入选择扫频模式', trigger: "blur"}],
          selectFreqMode: [{required: true, message: '请输入选择选频模式', trigger: "blur"}],
          runTime: [{required: true, message: '请输入扫频时间', trigger: "blur"}],
          snifferCycle: [{required: true, message: '请输入扫频周期', trigger: "blur"}]
        }
      }
    },
    methods: {
      getButtonVial(msg) {
        return $.Button.buttonValidator(msg);
      },
      //设置时间
      setScanTime() {
        this.$refs['gsmSniffer'].validate((valid) => {
          if (valid) {
            let param = Object.assign({}, this.gsmSniffer);
            if (param.snifferMode === 0) {
              delete param['runTime'];
              delete param['snifferCycle'];
            }
            this.$post('set/gsmSniffer/' + this.deviceId, param, '设置成功', '设置失败');
          }
        })
      },

      handleClick(tab, event) {
        if (this.getNetwork(this.activeItem) === 'GSM1') {//2G
          this.defaultProps = [{value: 'bcchNumber', name: '频点'}, {value: 'c1', name: 'c1'},
            {value: 'c2', name: 'c2'}, {value: 'rssi', name: 'rssi'}, {value: 'upTime', name: '上报时间'}];
        } else {
          this.defaultProps = [{value: 'earfcn', name: '频点'}, {value: 'pci', name: 'pci'},
            {value: 'band', name: 'band'}, {value: 'rsrp', name: 'rsrp'},
            {value: 'network', name: 'network'}, {value: 'frameOffset', name: '帧偏移'},
            {value: 'freqOffset', name: '频偏'}, {value: 'plmnID', name: 'plmnID'},
            {value: 'priority', name: '小区优先级'}, {value: 'upTime', name: '上报时间'}];//{value: 'ncellList', name: '邻区列表'}
        }
        this.networkData = [];
        this.getNetworkData();
      },
      getModuleID(modeleName) {
        for (let item of this.activeName) {
          if (modeleName === item.name) {
            return item.moduleID;
          }
        }
      },
      getNetwork(modeleName) {
        for (let item of this.activeName) {
          if (modeleName === item.name) {
            return item.type;
          }
        }
      },
      pageChange(index) {
        this.query.page = index;
        this.getNetworkData();
      },
      handleSizeChange(val) {
        this.query.size = val;
        this.getNetworkData();
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'upTime') {
          return row.upTime ? row.upTime !== 0 ? $.Data.formatDate(new Date(row.upTime), 'yyyy-MM-dd hh:mm:ss') : '--' : '--';
        } else {
          return row[column.property];
//            ? row[column.property] : '--';
        }
      },
      //扫频数据列表
      getNetworkData() {
        this.listLoading = true;
        this.$post('device/get/sniffer/' + this.deviceId, {}).then((data) => {
          setTimeout(() => {
            this.listLoading = false
          }, 500);
          if (data.code === '000000') {
            if (data.data) {
              data.data.forEach((item) => {//移动2G/联通2G数据一样
                if (this.getModuleID(this.activeItem) === item.moduleId || (this.getModuleID(this.activeItem) === 2 && item.moduleId === 1)) {
                  this.networkData.push(item);
                }
              });
            } else {
              this.networkData = [];
            }
          } else {
            this.networkData = [];
          }
        }).catch((err) => {
          this.listLoading = false;
          this.networkData = [];
          this.$message.error(err);
        });
      },
      //获取自动扫频按钮
      getScanSwitch() {
        this.$post('device/get/deviceParameter/' + this.deviceId, {}).then((data) => {
          if (data.code === '000000') {
            if (data.data) {
              if (data.data.gsmSnifferParam) {
                this.gsmSniffer = data.data.gsmSnifferParam;
              }
            }
          }
        })
      }
    },
    mounted() {
      let device = this.$emit('getDevice');
      this.deviceId = this.$route.query.deviceId || device.deviceId || '';
      this.getNetworkData();
      this.getScanSwitch();
    }
  }
</script>
