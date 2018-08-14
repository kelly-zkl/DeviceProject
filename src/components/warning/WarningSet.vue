<template>
  <div>
    <section class="content">
      <el-tabs v-model="activeItem" @tab-click="handleClick" type="card" style="margin-top: 30px">
        <el-tab-pane v-bind:label="tab.name" v-for="tab in activeName" style="padding-left: 20px"
                     :key="tab.code" v-bind:name="tab.code" :value="tab.code"></el-tab-pane>
      </el-tabs>
      <el-form label-width="130px" label-position="left">
        <h4 style="text-align: left">告警通知设置</h4>
        <el-row style="margin-left: 20px">
          <el-col :span="12" align="left">
            <el-form-item label="普通告警通知" style="margin: 0">
              <span style="margin-right: 60px;margin-left: 20px">{{switchList.normalSwitch ? "开启" : "关闭"}}</span>
              <el-switch v-model="switchList.normalSwitch" active-color="#409EFF" inactive-color="#C1C1C1">
              </el-switch>
            </el-form-item>
            <!--<el-form-item label="普通告警短信通知">-->
            <!--<span style="margin-right: 60px;margin-left: 20px">{{switchList.normalSmsSwitch ? "开启" : "关闭"}}</span>-->
            <!--<el-switch v-model="switchList.normalSmsSwitch" active-color="#409EFF" inactive-color="#C1C1C1">-->
            <!--</el-switch>-->
            <!--</el-form-item>-->
          </el-col>
          <el-col :span="12" align="left">
            <el-form-item label="严重告警通知" style="margin: 0">
              <span style="margin-right: 60px;margin-left: 20px">{{switchList.seriousSwitch ? "开启" : "关闭"}}</span>
              <el-switch v-model="switchList.seriousSwitch" active-color="#409EFF" inactive-color="#C1C1C1">
              </el-switch>
            </el-form-item>
            <!--<el-form-item label="严重告警短信通知">-->
            <!--<span style="margin-right: 60px;margin-left: 20px">{{switchList.seriousSmsSwitch ? "开启" : "关闭"}}</span>-->
            <!--<el-switch v-model="switchList.seriousSmsSwitch" active-color="#409EFF" inactive-color="#C1C1C1">-->
            <!--</el-switch>-->
            <!--</el-form-item>-->
          </el-col>
        </el-row>
        <h4 style="text-align: left">异常告警设置</h4>
        <div class="center-block add-appdiv" style="margin-left: 20px;margin-top: 0">
          <h4 style="text-align: left;margin-top: 0">主板异常告警</h4>
          <el-row style="margin-bottom: 10px">
            <el-col :xs="16" :sm="14" :md="12" :lg="10" :xl="8" align="left">
              <el-form-item label="设备温度（℃）" style="margin: 0">
                <el-radio-group v-model="buttonList.deviceTemp" size="mini" @change="changeTemp">
                  <el-radio-button label="no">不告警</el-radio-button>
                  <el-radio-button label="normal">普通</el-radio-button>
                  <el-radio-button label="serious">严重</el-radio-button>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :xs="8" :sm="10" :md="12" :lg="10" :xl="10" align="left">
              <el-slider v-model="deviceValue.temperature" :min="0" :max="90" @change="changeTempN"
                         show-input></el-slider>
            </el-col>
          </el-row>
          <el-row style="margin-bottom: 10px">
            <el-col :xs="16" :sm="14" :md="12" :lg="10" :xl="8" align="left">
              <el-form-item label="CPU占用率（%）" style="margin: 0">
                <el-radio-group v-model="buttonList.deviceCpu" size="mini" @change="changeCpu">
                  <el-radio-button label="no">不告警</el-radio-button>
                  <el-radio-button label="normal">普通</el-radio-button>
                  <el-radio-button label="serious">严重</el-radio-button>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :xs="8" :sm="10" :md="12" :lg="10" :xl="10" align="left">
              <el-slider v-model="deviceValue.cpu" :min="0" :max="100" @change="changeCpuN" show-input></el-slider>
            </el-col>
          </el-row>
          <el-row style="margin-bottom: 10px">
            <el-col :xs="16" :sm="14" :md="12" :lg="10" :xl="8" align="left">
              <el-form-item label="内存占用率（%）" style="margin: 0">
                <el-radio-group v-model="buttonList.deviceMemory" size="mini" @change="changeMemory">
                  <el-radio-button label="no">不告警</el-radio-button>
                  <el-radio-button label="normal">普通</el-radio-button>
                  <el-radio-button label="serious">严重</el-radio-button>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :xs="8" :sm="10" :md="12" :lg="10" :xl="10" align="left">
              <el-slider v-model="deviceValue.memory" :min="0" :max="100" @change="changeMemoryN"
                         show-input></el-slider>
            </el-col>
          </el-row>
          <el-row style="margin-bottom: 10px">
            <el-col :xs="16" :sm="14" :md="12" :lg="10" :xl="8" align="left">
              <el-form-item label="输入功率（dbm）" style="margin: 0">
                <el-radio-group v-model="buttonList.deviceInput" size="mini" @change="changeInput">
                  <el-radio-button label="no">不告警</el-radio-button>
                  <el-radio-button label="normal">普通</el-radio-button>
                  <el-radio-button label="serious">严重</el-radio-button>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :xs="8" :sm="10" :md="12" :lg="10" :xl="10" align="left">
              <el-slider v-model="deviceValue.inputPower" :min="0" :max="45" @change="changeInputN"
                         show-input></el-slider>
            </el-col>
          </el-row>
          <el-row style="margin-bottom: 10px">
            <el-col :xs="16" :sm="14" :md="12" :lg="10" :xl="8" align="left">
              <el-form-item label="输出功率（dbm）" style="margin: 0">
                <el-radio-group v-model="buttonList.deviceOut" size="mini" @change="changeOutput">
                  <el-radio-button label="no">不告警</el-radio-button>
                  <el-radio-button label="normal">普通</el-radio-button>
                  <el-radio-button label="serious">严重</el-radio-button>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :xs="8" :sm="10" :md="12" :lg="10" :xl="10" align="left">
              <el-slider v-model="deviceValue.outPower" :min="0" :max="45" @change="changeOutputN"
                         show-input></el-slider>
            </el-col>
          </el-row>
        </div>
        <div class="center-block add-appdiv" style="margin-left: 20px">
          <h4 style="text-align: left;margin-top: 0">子模块异常告警</h4>
          <el-row style="margin-bottom: 10px">
            <el-col :xs="16" :sm="14" :md="12" :lg="10" :xl="8" align="left">
              <el-form-item label="驻波比" style="margin: 0">
                <el-radio-group v-model="buttonList.deviceSwr" size="mini" @change="changeSwr">
                  <el-radio-button label="no">不告警</el-radio-button>
                  <el-radio-button label="normal">普通</el-radio-button>
                  <el-radio-button label="serious">严重</el-radio-button>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :xs="8" :sm="10" :md="12" :lg="10" :xl="10" align="left">
              <el-slider v-model="deviceValue.swr" :min="0" :max="1" :step="0.1" @change="changeSwrN"
                         show-input></el-slider>
            </el-col>
          </el-row>
          <el-row style="margin-bottom: 10px">
            <el-col :xs="16" :sm="14" :md="12" :lg="10" :xl="8" align="left">
              <el-form-item label="PA温度（℃）" style="margin: 0">
                <el-radio-group v-model="buttonList.devicePatemp" size="mini" @change="changePatemp">
                  <el-radio-button label="no">不告警</el-radio-button>
                  <el-radio-button label="normal">普通</el-radio-button>
                  <el-radio-button label="serious">严重</el-radio-button>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :xs="8" :sm="10" :md="12" :lg="10" :xl="10" align="left">
              <el-slider v-model="deviceValue.patemp" :min="0" :max="90" @change="changePatempN" show-input></el-slider>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12" align="left">
              <el-form-item label="过功率告警" style="margin: 0">
                <span style="margin-right: 60px;margin-left: 20px">{{switchList.overPower ? "开启" : "关闭"}}</span>
                <el-switch v-model="switchList.overPower" active-color="#409EFF" inactive-color="#C1C1C1">
                </el-switch>
              </el-form-item>
              <el-form-item label="射频模块异常" style="margin: 0">
                <span style="margin-right: 60px;margin-left: 20px">{{switchList.radioNotifySwitch ? "开启" : "关闭"}}</span>
                <el-switch v-model="switchList.radioNotifySwitch" active-color="#409EFF" inactive-color="#C1C1C1">
                </el-switch>
              </el-form-item>
              <el-form-item label="功放告警">
                <span style="margin-right: 60px;margin-left: 20px">{{switchList.paNotifySwitch ? "开启" : "关闭"}}</span>
                <el-switch v-model="switchList.paNotifySwitch" active-color="#409EFF" inactive-color="#C1C1C1">
                </el-switch>
              </el-form-item>
            </el-col>
            <el-col :span="12" align="left">
              <el-form-item label="欠功率告警" style="margin: 0">
                <span style="margin-right: 60px;margin-left: 20px">{{switchList.underPower ? "开启" : "关闭"}}</span>
                <el-switch v-model="switchList.underPower" active-color="#409EFF" inactive-color="#C1C1C1">
                </el-switch>
              </el-form-item>
              <el-form-item label="锁相环" style="margin: 0">
                <span style="margin-right: 60px;margin-left: 20px">{{switchList.pllNotifySwitch ? "开启" : "关闭"}}</span>
                <el-switch v-model="switchList.pllNotifySwitch" active-color="#409EFF" inactive-color="#C1C1C1">
                </el-switch>
              </el-form-item>
              <el-form-item label="低嗓放告警">
                <span style="margin-right: 60px;margin-left: 20px">{{switchList.lnaNotifySwitch ? "开启" : "关闭"}}</span>
                <el-switch v-model="switchList.lnaNotifySwitch" active-color="#409EFF" inactive-color="#C1C1C1">
                </el-switch>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>

      <div slot="footer" class="dialog-footer" align="center" style="margin: 40px">
        <el-button type="primary" @click="saveSetting" v-show="getButtonVial('alarm:updateAlarmSet')">保存设置</el-button>
      </div>
    </section>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        switchList: {
          normalSwitch: false, seriousSwitch: false, normalSmsSwitch: false,
          seriousSmsSwitch: false, radioNotifySwitch: false, pllNotifySwitch: false,
          lnaNotifySwitch: false, paNotifySwitch: false, overPower: false, underPower: false
        },
        activeItem: "CON_OUTDOOR_POLE",
        activeName: [{code: 'CON_OUTDOOR_POLE', name: '通用室外抱杆型'}, {code: 'CON_OUTDOOR_MOCRO', name: '室外微热点'}],
        buttonList: {
          deviceTemp: 'normal', deviceCpu: 'normal', deviceMemory: 'normal', deviceInput: 'normal',
          deviceOut: 'normal', deviceSwr: 'normal', devicePatemp: 'normal'
        },
        deviceValue: {temperature: 0, cpu: 0, memory: 0, inputPower: 0, outPower: 0, swr: 0, patemp: 0},
        warningSetting: {
          generalAlarmNotify: 0, seriousAlarmNotify: 0, generalAlarmSms: 0, seriousAlarmSms: 0, radioNotify: 0,
          pllNotify: 0, lnaNotify: 0, temperature: {high: 60, mid: 20, low: 0}, cpu: {high: 60, mid: 20, low: 0},
          memory: {high: 60, mid: 20, low: 0}, swr: {high: 0.6, mid: 0.2, low: 0}, patemp: {high: 60, mid: 20, low: 0},
          inputPower: {high: 60, mid: 20, low: 0}, outPower: {high: 60, mid: 20, low: 0}
        }
      }
    },
    methods: {
      getButtonVial(msg) {
        return $.Button.buttonValidator(msg);
      },
      //子模块切换
      handleClick(tab, event) {
        this.defaultSetting();
        this.getSetting();
      },
      //默认设置
      defaultSetting() {
        this.warningSetting.deviceForm = this.activeItem;
        this.buttonList = {
          deviceTemp: 'normal', deviceCpu: 'normal', deviceMemory: 'normal', deviceInput: 'normal',
          deviceOut: 'normal', deviceSwr: 'normal', devicePatemp: 'normal'
        };
        this.deviceValue = {temperature: 0, cpu: 0, memory: 0, inputPower: 0, outPower: 0, swr: 0, patemp: 0};
        this.warningSetting = {
          generalAlarmNotify: 0, seriousAlarmNotify: 0, generalAlarmSms: 0, seriousAlarmSms: 0,
          radioNotify: 0, pllNotify: 0, lnaNotify: 0, temperature: {high: 0, mid: 0, low: 0},
          cpu: {high: 0, mid: 0, low: 0}, memory: {high: 0, mid: 0, low: 0}, swr: {high: 0, mid: 0, low: 0},
          patemp: {high: 0, mid: 0, low: 0}, inputPower: {high: 0, mid: 0, low: 0}, outPower: {high: 0, mid: 0, low: 0}
        };
        this.switchList = {
          normalSwitch: false, seriousSwitch: false, normalSmsSwitch: false,
          seriousSmsSwitch: false, radioNotifySwitch: false, pllNotifySwitch: false,
          lnaNotifySwitch: false, paNotifySwitch: false, overPower: false, underPower: false
        };
      },
      //设备温度
      changeTemp(val) {
        if (val === 'normal') {
          this.deviceValue.temperature = (this.warningSetting.temperature.mid);
        } else if (val === 'serious') {
          this.deviceValue.temperature = (this.warningSetting.temperature.high);
        } else {
          this.deviceValue.temperature = (this.warningSetting.temperature.low);
        }
      },
      changeTempN(val) {
        if (this.buttonList.deviceTemp === 'normal') {
          this.warningSetting.temperature.mid = val;
        } else if (this.buttonList.deviceTemp === 'serious') {
          this.warningSetting.temperature.high = val;
        } else {
          this.warningSetting.temperature.low = val;
        }
      },
      //cpu占用率
      changeCpu(val) {
        if (val === 'normal') {
          this.deviceValue.cpu = this.warningSetting.cpu.mid;
        } else if (val === 'serious') {
          this.deviceValue.cpu = this.warningSetting.cpu.high;
        } else {
          this.deviceValue.cpu = this.warningSetting.cpu.low;
        }
      },
      changeCpuN(val) {
        if (this.buttonList.deviceCpu === 'normal') {
          this.warningSetting.cpu.mid = val;
        } else if (this.buttonList.deviceCpu === 'serious') {
          this.warningSetting.cpu.high = val;
        } else {
          this.warningSetting.cpu.low = val;
        }
      },
      //内存占用率memory
      changeMemory(val) {
        if (val === 'normal') {
          this.deviceValue.memory = this.warningSetting.memory.mid;
        } else if (val === 'serious') {
          this.deviceValue.memory = this.warningSetting.memory.high;
        } else {
          this.deviceValue.memory = this.warningSetting.memory.low;
        }
      },
      changeMemoryN(val) {
        if (this.buttonList.deviceMemory === 'normal') {
          this.warningSetting.memory.mid = val;
        } else if (this.buttonList.deviceMemory === 'serious') {
          this.warningSetting.memory.high = val;
        } else {
          this.warningSetting.memory.low = val;
        }
      },
      //输入功率inputPower
      changeInput(val) {
        if (val === 'normal') {
          this.deviceValue.inputPower = (this.warningSetting.inputPower.mid);
        } else if (val === 'serious') {
          this.deviceValue.inputPower = (this.warningSetting.inputPower.high);
        } else {
          this.deviceValue.inputPower = (this.warningSetting.inputPower.low);
        }
      },
      changeInputN(val) {
        if (this.buttonList.deviceInput === 'normal') {
          this.warningSetting.inputPower.mid = val;
        } else if (this.buttonList.deviceInput === 'serious') {
          this.warningSetting.inputPower.high = val;
        } else {
          this.warningSetting.inputPower.low = val;
        }
      },
      //输出功率outPower
      changeOutput(val) {
        if (val === 'normal') {
          this.deviceValue.outPower = (this.warningSetting.outPower.mid);
        } else if (val === 'serious') {
          this.deviceValue.outPower = (this.warningSetting.outPower.high);
        } else {
          this.deviceValue.outPower = (this.warningSetting.outPower.low);
        }
      },
      changeOutputN(val) {
        if (this.buttonList.deviceOut === 'normal') {
          this.warningSetting.outPower.mid = val;
        } else if (this.buttonList.deviceOut === 'serious') {
          this.warningSetting.outPower.high = val;
        } else {
          this.warningSetting.outPower.low = val;
        }
      },
      //驻波比
      changeSwr(val) {
        if (val === 'normal') {
          this.deviceValue.swr = (this.warningSetting.swr.mid);
        } else if (val === 'serious') {
          this.deviceValue.swr = (this.warningSetting.swr.high);
        } else {
          this.deviceValue.swr = (this.warningSetting.swr.low);
        }
      },
      changeSwrN(val) {
        if (this.buttonList.deviceSwr === 'normal') {
          this.warningSetting.swr.mid = val;
        } else if (this.buttonList.deviceSwr === 'serious') {
          this.warningSetting.swr.high = val;
        } else {
          this.warningSetting.swr.low = val;
        }
      },
      //PA温度
      changePatemp(val) {
        if (val === 'normal') {
          this.deviceValue.patemp = (this.warningSetting.patemp.mid);
        } else if (val === 'serious') {
          this.deviceValue.patemp = (this.warningSetting.patemp.high);
        } else {
          this.deviceValue.patemp = (this.warningSetting.patemp.low);
        }
      },
      changePatempN(val) {
        if (this.buttonList.devicePatemp === 'normal') {
          this.warningSetting.patemp.mid = val;
        } else if (this.buttonList.devicePatemp === 'serious') {
          this.warningSetting.patemp.high = val;
        } else {
          this.warningSetting.patemp.low = val;
        }
      },
      //获取设置的参数
      getSetting() {
        this.$post('/alarm/get/alarmSet/' + this.activeItem, {}).then((data) => {
          if (data.code === '000000') {
            if (data.data) {
              data.data.forEach((item) => {
                if (item.deviceForm === this.activeItem) {
                  this.warningSetting = item;
                  this.buttonList = {
                    deviceTemp: 'normal', deviceCpu: 'normal', deviceMemory: 'normal', deviceInput: 'normal',
                    deviceOut: 'normal', deviceSwr: 'normal', devicePatemp: 'normal'
                  };
                  this.switchList.normalSwitch = (this.warningSetting.generalAlarmNotify === 1);
                  this.switchList.seriousSwitch = (this.warningSetting.seriousAlarmNotify === 1);
                  this.switchList.normalSmsSwitch = (this.warningSetting.generalAlarmSms === 1);
                  this.switchList.seriousSmsSwitch = (this.warningSetting.seriousAlarmSms === 1);
                  this.switchList.radioNotifySwitch = (this.warningSetting.radioNotify === 1);
                  this.switchList.pllNotifySwitch = (this.warningSetting.pllNotify === 1);
                  this.switchList.lnaNotifySwitch = (this.warningSetting.lnaNotify === 1);
                  this.switchList.paNotifySwitch = (this.warningSetting.paNotify === 1);
                  this.switchList.underPower = (this.warningSetting.underPower === 1);
                  this.switchList.overPower = (this.warningSetting.overPower === 1);

                  this.deviceValue.temperature = this.warningSetting.temperature.mid;
                  this.deviceValue.cpu = this.warningSetting.cpu.mid;
                  this.deviceValue.memory = this.warningSetting.memory.mid;
                  this.deviceValue.inputPower = this.warningSetting.inputPower.mid;
                  this.deviceValue.outPower = this.warningSetting.outPower.mid;
                  this.deviceValue.swr = this.warningSetting.swr.mid;
                  this.deviceValue.patemp = this.warningSetting.patemp.mid;
                }
              })
            }
          }
        });
      },
      //保存参数前的开关参数转换
      saveSwitch() {
        this.warningSetting.deviceForm = this.activeItem;
        this.warningSetting.generalAlarmNotify = (this.switchList.normalSwitch ? 1 : 0);
        this.warningSetting.seriousAlarmNotify = (this.switchList.seriousSwitch ? 1 : 0);
        this.warningSetting.generalAlarmSms = (this.switchList.normalSmsSwitch ? 1 : 0);
        this.warningSetting.seriousAlarmSms = (this.switchList.seriousSmsSwitch ? 1 : 0);
        this.warningSetting.radioNotify = (this.switchList.radioNotifySwitch ? 1 : 0);
        this.warningSetting.pllNotify = (this.switchList.pllNotifySwitch ? 1 : 0);
        this.warningSetting.lnaNotify = (this.switchList.lnaNotifySwitch ? 1 : 0);
        this.warningSetting.paNotify = (this.switchList.paNotifySwitch ? 1 : 0);
        this.warningSetting.overPower = (this.switchList.overPower ? 1 : 0);
        this.warningSetting.underPower = (this.switchList.underPower ? 1 : 0);
      },
      //保存设置
      saveSetting() {
        this.saveSwitch();
        if (this.warningSetting.temperature.low < this.warningSetting.temperature.mid < this.warningSetting.temperature.high) {
          if (this.warningSetting.cpu.low * 100 < this.warningSetting.cpu.mid * 100 < this.warningSetting.cpu.high * 100) {
            if (this.warningSetting.memory.low * 100 < this.warningSetting.memory.mid * 100 < this.warningSetting.memory.high * 100) {
              if (this.warningSetting.inputPower.low < this.warningSetting.inputPower.mid < this.warningSetting.inputPower.high) {
                if (this.warningSetting.outPower.low < this.warningSetting.outPower.mid < this.warningSetting.outPower.high) {
                  if (this.warningSetting.swr.low * 10 < this.warningSetting.swr.mid * 10 < this.warningSetting.swr.high * 10) {
                    if (this.warningSetting.patemp.low < this.warningSetting.patemp.mid < this.warningSetting.patemp.high) {
                      this.$post('/alarm/updateAlarmSet', this.warningSetting, '保存成功', '保存失败').then((data) => {
                        this.getSetting();
                      });
                    } else {
                      this.$message.error('PA温度的值应满足：不告警 < 普通 < 严重');
                    }
                  } else {
                    this.$message.error('驻波比的值应满足：不告警 < 普通 < 严重');
                    console.log(this.warningSetting.swr);
                  }
                } else {
                  this.$message.error('输出功率的值应满足：不告警 < 普通 < 严重');
                }
              } else {
                this.$message.error('输入功率的值应满足：不告警 < 普通 < 严重');
              }
            } else {
              this.$message.error('内存占用率的值应满足：不告警 < 普通 < 严重');
            }
          } else {
            this.$message.error('cpu占用率的值应满足：不告警 < 普通 < 严重');
          }
        } else {
          this.$message.error('设备温度的值应满足：不告警 < 普通 < 严重');
        }
      }
    },
    mounted() {
      this.getSetting();
    }
  }
</script>
