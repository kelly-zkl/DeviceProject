<template>
  <div>
    <section class="content">
      <el-tabs v-model="scanItem">
        <el-tab-pane label="LTE扫频" name="lte"></el-tab-pane>
        <el-tab-pane label="GSM扫频" name="gsm" v-if="(deviceType=='2'||deviceType=='3'||
            deviceType=='4'||deviceType=='5'||deviceType=='6'||deviceType=='C')">
          <gsmScan @getDevice="getDevice"></gsmScan>
        </el-tab-pane>
      </el-tabs>
      <div v-show="scanItem=='lte'">
        <el-form label-width="120px" label-position="left" ref="lteSniffer" :model="lteSniffer" :rules="rules">
          <h4 style="text-align: left;margin-top: 0">LTE扫频配置</h4>
          <div class="center-block add-appdiv">
            <el-form-item label="扫频模式" align="left" style="margin: 20px 0 0 15px" prop="snifferMode">
              <el-select v-model="lteSniffer.snifferMode" placeholder="请选择" filterable>
                <el-option v-for="item in snifferModes" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="选频模式" align="left" style="margin: 20px 0 0 15px" prop="selectFreqMode">
              <el-select v-model="lteSniffer.selectFreqMode" placeholder="请选择" filterable>
                <el-option v-for="item in autoBccModes" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="自动扫频时间" style="margin: 20px 0 0 15px" align="left" prop="runTime"
                          v-show="lteSniffer.snifferMode==3">
              <el-time-picker v-model="lteSniffer.runTime" :picker-options="{selectableRange: '00:00:00 - 23:59:59'}"
                              placeholder="选择时间" value-format="HH:mm:ss">
              </el-time-picker>
            </el-form-item>
            <el-form-item label="自动扫频间隔" style="margin: 20px 0 0 15px" align="left" prop="snifferCycle"
                          v-show="lteSniffer.snifferMode==3">
              <el-row>
                <el-col :span="8">
                  <el-input-number v-model="lteSniffer.snifferCycle" :min="1" :maxlength=3
                                   style="width: 95%"></el-input-number>
                </el-col>
                <el-col :span="2">天</el-col>
              </el-row>
            </el-form-item>
            <el-form-item align="left" style="margin: 20px 0 0 15px" v-show="getButtonVial('set:lteSniffer')">
              <el-button type="primary" @click="setScanTime()" size="medium">保存配置</el-button>
            </el-form-item>
          </div>
        </el-form>
        <h4 style="text-align: left">LTE扫频数据</h4>
        <el-tabs v-model="activeItem" @tab-click="handleClick" style="margin-left: 20px">
          <el-tab-pane :label="tab.name" v-for="tab in activeName" :key="tab.type" :name="tab.type"></el-tab-pane>
        </el-tabs>
        <el-table :data="networkData" v-loading="listLoading" stripe style="margin-bottom: 30px">
          <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
          <el-table-column align="left" label="频点" prop="earfcn" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="band" prop="band" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="pci" prop="pci" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="帧偏移" prop="frameOffset" :formatter="formatterAddress"
                           v-if="activeItem=='CMCC'"></el-table-column>
          <el-table-column align="left" label="rsrp" prop="rsrp" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="plmn" prop="plmnID" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="小区优先级" prop="priority" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="邻区列表" prop="nCellInfo" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="上报时间" prop="upTime" :formatter="formatterAddress"
                           min-width="170" max-width="200"></el-table-column>
          <el-table-column align="center" label="操作">
            <template slot-scope="scope">
              <el-button type="text" @click="cells=scope.row.nCellInfo;runCellList=true">查看邻区列表</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!--邻区列表-->
        <el-dialog title="邻区列表" :visible.sync="runCellList" center>
          <el-table :data="cells" stripe>
            <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
            <el-table-column align="left" label="频点" prop="earfcn" :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" label="band" prop="band" :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" label="小区优先级" prop="priority" :formatter="formatterAddress"></el-table-column>
          </el-table>
        </el-dialog>
      </div>
    </section>
  </div>
</template>
<script>
  import gsmScan from '../device/GsmScan';

  export default {
    data() {
      return {
        runCellList: false,
        networkData: [],
        cells: [],
        scanItem: 'lte',
        deviceType: '',
        lteSniffer: {snifferMode: 0, selectFreqMode: 10, snifferCycle: 1, runTime: new Date()},
        listLoading: false,
        activeItem: "CMCC",
        activeName: [{name: '移动(LTE)', type: 'CMCC'}, {name: '联通(LTE)', type: 'CMUC'},
          {name: '电信(LTE)', type: 'CMTC'}],
        autoBccModes: [{value: 10, label: '手动'}, {value: 2, label: '自动'}],
        snifferModes: [{value: 0, label: '关闭'}, {value: 1, label: '手动'},
          {value: 2, label: '上电扫'}, {value: 3, label: '定时扫'}],
        rules: {
          snifferMode: [{required: true, message: '请输入选择扫频模式', trigger: "blur"}],
          selectFreqMode: [{required: true, message: '请输入选择选频模式', trigger: "blur"}],
        }
      }
    },
    methods: {
      getButtonVial(msg) {
        return $.Button.buttonValidator(msg);
      },
      getDevice() {
        return this.$emit('getDevice');
      },
      //设置时间
      setScanTime() {
        this.$refs['lteSniffer'].validate((valid) => {
          if (valid) {
            let param = Object.assign({}, this.lteSniffer);
            if (param.snifferMode !== 3) {
              delete param['runTime'];
              delete param['snifferCycle'];
            } else {
              if (!param.runTime) {
                this.$message.error("选择时间");
                return;
              }
              if (!param.snifferCycle) {
                this.$message.error("输入扫频间隔");
                return;
              }
            }
            this.$post('set/lteSniffer/' + this.deviceId, param, '设置成功', '设置失败');
          }
        })
      },
      handleClick(tab, event) {
        this.networkData = [];
        this.getNetworkData();
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'upTime') {
          return row.upTime ? row.upTime !== 0 ? $.Data.formatDate(new Date(row.upTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--' : '--';
        } else if (column.property === 'nCellInfo') {
          return row.nCellInfo ? row.nCellInfo.length + '个' : '0个';
        } else if (column.property === 'frameOffset') {
          return row.frameOffset == 65535 ? "--" : row.frameOffset;
        } else {
          return row[column.property];
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
            if (data.data && data.data.length > 0) {
              data.data.forEach((item) => {
                if (this.activeItem == item.network) {
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
              if (data.data.lteSnifferParam) {
                this.lteSniffer = data.data.lteSnifferParam;
              }
            }
          }
        })
      }
    },
    mounted() {
      let device = this.$emit('getDevice');
      this.deviceId = this.$route.query.deviceId || device.deviceId || '';
      this.deviceType = this.$route.query.deviceType || device.deviceType;
      this.getNetworkData();
      this.getScanSwitch();
    },
    components: {gsmScan}
  }
</script>
