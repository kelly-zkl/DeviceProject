<template>
  <div>
    <section>
      <h4 style="text-align: left;margin-top: 0">PA信息</h4>
      <div class="content add-appdiv">
        <el-form :inline="true" v-for="(item,idx) in paParam" :key="item.index" align="left">
          <el-form-item
            :label="idx==0?'TDD1900：功放开关':idx==1?'TDD2600：功放开关':idx==2?'FDD2100：功放开关':idx==3?'FDD1800：功放开关':'GSM：功放开关'"
            align="left">
            <el-switch v-model="item.dlSwitch" active-color="#409EFF"></el-switch>
          </el-form-item>
          <!--<el-form-item label="功放等级" align="left" style="margin-left: 15px">-->
          <!--<el-radio-group v-model="item.dlPower">-->
          <!--<el-radio-button :label="0">6</el-radio-button>-->
          <!--<el-radio-button :label="3">5</el-radio-button>-->
          <!--<el-radio-button :label="6">4</el-radio-button>-->
          <!--<el-radio-button :label="9">3</el-radio-button>-->
          <!--<el-radio-button :label="12">2</el-radio-button>-->
          <!--<el-radio-button :label="15">1</el-radio-button>-->
          <!--</el-radio-group>-->
          <!--</el-form-item>-->
        </el-form>
        <el-row style="margin-top: 15px">
          <el-col :span="10">
            <el-button type="primary" @click="saveParam()" style="margin-left: 0"
                       v-show="getButtonVial('set:sendPAParam')">参数下发
            </el-button>
          </el-col>
        </el-row>
      </div>
      <h4 style="text-align: left;margin-top: 0">PA工作状态</h4>
      <div class="content add-appdiv">
        <el-row v-for="(item,idx) in paWorkStatus" :key="item.index" style="margin-top: 10px">
          <el-col :span="5" align="left">
            <span style="font-size: 14px;color: #5F6165">{{idx==0?'TDD1900：':idx==1?'TDD2600：':idx==2?'FDD2100：':idx==3?'FDD1800：':'GSM：'}}输入功率<span
              style="margin-left: 15px">{{item.paInputPower}}</span></span>
          </el-col>
          <el-col :span="4" align="left">
            <span style="font-size: 14px;color: #5F6165">输出功率
              <span style="margin-left: 15px">{{item.paOutputPower}}</span>
            </span>
          </el-col>
          <el-col :span="4" align="left">
            <span style="font-size: 14px;color: #5F6165">PA开关
              <span style="margin-left: 15px">{{item.paSwitch == 1 ? '开' : '关'}}</span>
            </span>
          </el-col>
          <el-col :span="4" align="left">
            <span style="font-size: 14px;color: #5F6165">
              PA温度<span v-bind:class="item.paTemp > 80 ? 'text-red' : item.paTemp > 50 ? 'text-yellow' :'text-green'"
                        style="ont-size: 14px;margin-left: 15px">{{item.paTemp}}</span></span>
          </el-col>
          <el-col :span="4" align="left">
            <span style="font-size: 14px;color: #5F6165">驻波比
              <span style="margin-left: 15px">{{item.swr}}</span>
            </span>
          </el-col>
        </el-row>
      </div>
    </section>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        deviceId: this.$route.query.deviceId || '',
        deviceForm: this.$route.query.deviceForm || '',
        paParam: [{dlSwitch: 0, dlPower: 0, index: 0}, {dlSwitch: 0, dlPower: 0, index: 1},
          {dlSwitch: 0, dlPower: 0, index: 2}, {dlSwitch: 0, dlPower: 0, index: 3},
          {dlSwitch: 0, dlPower: 0, index: 4}],
        rules: {},
        paWorkStatus: []
      }
    },
    methods: {
      getButtonVial(msg) {
        return $.Button.buttonValidator(msg);
      },
      //获取载波参数
      getParam() {
        this.$post('device/get/deviceParameter/' + this.deviceId, {}).then((data) => {
          if (data.code === '000000') {
            if (data.data && data.data.paParam) {
              this.paParam = data.data.paParam;
            }
          }
        })
      },
      //设备状态
      getDeviceStatus() {
        this.$post('device/get/deviceStatus/' + this.deviceId).then((data) => {
          if (data.code === '000000') {
            if (data.data && data.data.paWorkStatus) {
              this.paWorkStatus = data.data.paWorkStatus;
            }
          }
        })
      },
      //参数下发
      saveParam() {
        this.$post('/set/sendPAParam/' + this.deviceId + '/' + this.deviceForm, this.paParam, "参数下发成功").then((data) => {
          if (data.code === '000000') {
            this.getParam();
          }
        })
      }
    },
    mounted() {
      this.getParam();
      this.getDeviceStatus();
    }
  }
</script>
<style scoped>
  .text-green {
    color: #00aa00;
  }

  .text-yellow {
    color: #ff8a00;
  }

  .text-red {
    color: #ff0000;
  }
</style>
