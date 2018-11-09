<template>
  <div>
    <section class="content">
      <h4 style="text-align: left">设备设置 <span
        style="font-size: 15px;color: #888;margin-left: 10px">设备ID：{{deviceId}}</span></h4>
      <div class="center-block">
        <el-tabs v-model="activeName" type="card" @tab-click="handleClick" class="card-width">
          <el-tab-pane label="基本信息" name="first"
                       v-if="getButtonVial('device:baseinfo') || getButtonVial('device:sendBaseInfo')">
            <baseInfo v-bind:deviceId="deviceId" class="card-margin"></baseInfo>
          </el-tab-pane>
          <el-tab-pane label="载波信息" name="second"
                       v-if="band4==0?getButtonVial('set:wirelessParam') || getButtonVial('set:wirelessParam:send') :
                       getButtonVial('set:wirelessParam4Band') || getButtonVial('set:wirelessParam4Band:send')">
            <setParam v-bind:deviceId="deviceId" class="card-margin" v-show="band4==0"></setParam>
            <band4 v-bind:deviceId="deviceId" class="card-margin" v-show="band4==1"></band4>
          </el-tab-pane>
          <el-tab-pane label="设备状态" name="third" v-if="getButtonVial('device:get:deviceStatus')">
            <deviceStatus @getDevice="getDevice" class="card-margin"></deviceStatus>
          </el-tab-pane>
          <el-tab-pane label="侦码数据" name="fourth" v-if="getButtonVial('terminate:query')">
            <terminal @getDevice="getDevice" class="card-margin"></terminal>
          </el-tab-pane>
          <el-tab-pane label="扫频工具" name="fifth" v-if="(getButtonVial('device:get:sniffer') ||
                getButtonVial('device:sniffer') || getButtonVial('set:autoSnifferParam'))">
            <lteScan @getDevice="getDevice" class="card-margin" v-if="deviceForm == 'CON_OUTDOOR_MOCRO'"></lteScan>
            <scanTool @getDevice="getDevice" class="card-margin" v-if="deviceForm == 'CON_OUTDOOR_POLE'"></scanTool>
          </el-tab-pane>
          <el-tab-pane label="PA信息" name="sixth" v-if="selfDeviceType == 'ZDK' && (getButtonVial('device:get:deviceStatus')
           || getButtonVial('device:get:deviceParameter:*'))">
            <PaSet @getDevice="getDevice" class="card-margin"></PaSet>
          </el-tab-pane>
          <el-tab-pane label="日志设置" name="seven" v-if="deviceForm == 'CON_OUTDOOR_MOCRO' && (getButtonVial('set:log:getParam') ||
                getButtonVial('set:log:sendParam'))">
            <LogSet @getDevice="getDevice" class="card-margin"></LogSet>
          </el-tab-pane>
          <el-tab-pane label="任务列表" name="eight" v-if="getButtonVial('device:get:deviceMessage')">
            <taskList @getDevice="getDevice" class="card-margin"></taskList>
          </el-tab-pane>
        </el-tabs>
      </div>
    </section>
  </div>
</template>
<script>
  import baseInfo from '../device/BaseInfo';
  import setParam from '../device/SetParam';
  import band4 from '../device/4band';
  import deviceStatus from '../device/DeviceStatus';
  import terminal from '../device/TerminalData';
  import scanTool from '../device/NetworkData';
  import lteScan from '../device/LteScan';
  import taskList from '../device/TaskList';
  import LogSet from "../log/LogSet.vue";
  import PaSet from "../device/PaSet.vue";

  export default {
    data() {
      return {
        activeName: 'first',
        deviceId: this.$route.query.deviceId || '',
        deviceForm: this.$route.query.deviceForm || '',
        groupId: this.$route.query.groupId || '',
        deviceType: this.$route.query.deviceType || '',
        band4: 0,
        selfDeviceType: ''
      }
    },
    methods: {
      getButtonVial(msg) {
        return $.Button.buttonValidator(msg);
      },
      handleClick(tab, event) {//保存当前标签页的位置
        sessionStorage.setItem("deviceTab", this.activeName);
      },
      getDevice() {
        let device = {
          deviceId: this.deviceId, deviceForm: this.deviceForm, groupId: this.groupId,
          deviceType: this.deviceType
        };
        return device;
      },
      //获取设备的基本信息
      getBaseInfo() {
        this.$post("device/get/byDeviceId/" + this.deviceId, {}).then((data) => {
            if (data.code === '000000') {
              if (data.data) {
                this.band4 = data.data.band4;
                this.deviceType = data.data.deviceType;
                this.selfDeviceType = data.data.selfDeviceType;
              }
            }
          }
        )
      }
    },
    mounted() {
      this.deviceId = this.$route.query.deviceId || '';
      this.deviceForm = this.$route.query.deviceForm || '';
      this.groupId = this.$route.query.groupId || '';
      this.deviceType = this.$route.query.deviceType || '';

      this.getBaseInfo();

      let tab = sessionStorage.getItem("deviceTab");
      if (tab) {
        this.activeName = tab;
      }
    },
    components: {
      baseInfo, setParam, band4, deviceStatus, terminal,
      scanTool, taskList, LogSet, PaSet, lteScan
    }
  }
</script>
<style scoped>
  @media screen and (min-width: 320px) and (max-width: 799px) {
    .card-width {
      margin-top: 15px;
      width: 100%
    }

    .card-margin {
      margin-left: 0
    }
  }

  @media screen and (min-width: 800px) {
    .card-width {
      margin-top: 15px;
      width: 100%
    }

    .card-margin {
      margin-left: 20px
    }
  }
</style>
