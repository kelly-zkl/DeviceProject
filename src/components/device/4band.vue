<template>
  <section class="content">
    <el-tabs v-model="activeItem" @tab-click="handleClick">
      <el-tab-pane :label="tab.name" v-for="tab in activeName" :key="tab.name" :name="tab.name"></el-tab-pane>
    </el-tabs>
    <div v-if="getmoduleID()<0">
      <el-form ref="opDeviceParameter" label-width="120px" label-position="left" :rules="rules"
               :model="opDeviceParameter">
        <div class="center-block add-appdiv" style="margin-top: 10px">
          <el-row>
            <el-col :span="11">
              <el-form-item label="band" prop="band" required align="left">
                <el-tooltip placement="bottom">
                  <div slot="content">基站频段号 取值范围：<br/>GSM：900/1800<br/>FDD：1/3<br/>TDD：[38-41]</div>
                  <el-select v-model="opDeviceParameter.band" placeholder="请选择" style="width: 100%" filterable>
                    <el-option v-for="item in bands" :key="item.value" :label="item.label" :value="item.value">
                    </el-option>
                  </el-select>
                </el-tooltip>
              </el-form-item>
              <el-form-item label="pci" prop="pci">
                <el-tooltip placement="bottom">
                  <div slot="content">物理小区标识 取值范围：[0-504]</div>
                  <el-input v-model="opDeviceParameter.pci" :maxlength=3></el-input>
                </el-tooltip>
              </el-form-item>
              <el-form-item label="lac" prop="lac">
                <el-tooltip placement="bottom">
                  <div slot="content">位置区码 取值范围：[0001－FFFEH]，码组0000H和FFFFH不可以使用</div>
                  <el-input v-model="opDeviceParameter.lac" :maxlength=4></el-input>
                </el-tooltip>
              </el-form-item>
              <el-form-item label="重复上号间隔" prop="reCapFilterPeriod">
                <el-input v-model.number="opDeviceParameter.reCapFilterPeriod" :maxlength=10></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="11" :offset="2">
              <el-form-item label="bcc" prop="bcc">
                <el-tooltip placement="bottom">
                  <div slot="content">频点号 取值范围：<br/>GSM：移动band900[1-94],band1800[512-562],联通band900[96-124],band1800[686-735]
                    <br/>FDD:band1[0-599],band3[1200-1949]
                    <br/>TDD：移动-38 [37750-38249],移动-39 [38250-38649],移动-40 [38650-39649],移动-41 [39650-41589]
                  </div>
                  <el-input v-model="opDeviceParameter.bcc" :maxlength=5 @change="changeBcc"
                            @blur="changeBcc"></el-input>
                </el-tooltip>
              </el-form-item>
              <el-form-item label="tac周期" prop="tacPeriod">
                <el-input v-model.number="opDeviceParameter.tacPeriod" :maxlength=4></el-input>
              </el-form-item>
              <el-form-item label="小区 ID" prop="cellId">
                <el-input v-model.number="opDeviceParameter.cellId" :maxlength=4></el-input>
              </el-form-item>
              <el-form-item label="plmn" align="left" required>
                <el-radio-group v-model="opDeviceParameter.plmn" align="left">
                  <el-radio-button :label="tab.type" v-for="tab in plmns" :key="tab.type">{{tab.name}}
                  </el-radio-button>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>
    </div>
    <div v-else>
      <el-form ref="opDeviceParameter" label-width="120px" label-position="left" :rules="rules"
               :model="opDeviceParameter">
        <div class="center-block add-appdiv" style="margin-top: 10px">
          <el-row>
            <el-col :span="11">
              <el-form-item label="tac">
                <el-tooltip placement="bottom">
                  <div slot="content">跟踪区域码 取值范围：[0001－FFFEH]，码组0000H和FFFFH不可以使用</div>
                  <el-input v-model="opDeviceParameter.tac" :maxlength=4 readonly></el-input>
                </el-tooltip>
              </el-form-item>
              <el-form-item label="重定向载波频点" prop="redirectEarfcn">
                <el-input v-model.number="opDeviceParameter.redirectEarfcn" :maxlength=10></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="11" :offset="2">
              <el-form-item label="tac周期" prop="tacPeriod">
                <el-input v-model.number="opDeviceParameter.tacPeriod" :maxlength=4></el-input>
              </el-form-item>
              <el-form-item label="bandWidth" required align="left" prop="bandWidth">
                <el-select v-model="opDeviceParameter.bandWidth" placeholder="带宽BandWidth" filterable
                           style="width: 100%">
                  <el-option v-for="item in bandwidths" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>
      <div class="add-appdiv" style="margin-bottom: 0">
        <div v-for="(tab,indx) in frequencyList" :key="indx">
          <el-form :inline="true" align="left" label-width="80px" style="margin-top: 20px">
            <el-form-item v-show="frequencyList.length > 1" style="margin: 0">
              <i class="el-icon-remove" @click="minusPlmn(indx)"
                 style="color: #549FF6;font-size: 20px;text-align: center"></i>
            </el-form-item>
            <el-form-item label="上行频点" style="margin: 0">
              <el-input v-model.number="tab.upFrequency" :maxlength=10 readonly></el-input>
            </el-form-item>
            <el-form-item label="下行频点" style="margin: 0">
              <el-input v-model.number="tab.downFrequency" :maxlength=10 @change="changeTDown($event,indx)"
                        @blur="changeTDown($event,indx)"></el-input>
            </el-form-item>
            <el-form-item label="pci" prop="pci">
              <el-tooltip placement="bottom">
                <div slot="content">物理小区标识 取值范围：[0-504]</div>
                <el-input v-model="tab.pci" :maxlength=3></el-input>
              </el-tooltip>
            </el-form-item>
            <el-form-item label="plmn" style="margin: 0">
              <el-radio-group v-model="tab.plmn">
                <el-radio-button :label="item.type" v-for="item in plmns" :key="item.type">{{item.name}}
                </el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="优先级" style="margin: 0">
              <el-input v-model.number="tab.priority" :maxlength=10 @change="changeOffset"></el-input>
            </el-form-item>
            <el-form-item label="rsrp" style="margin: 0">
              <el-input v-model.number="tab.rsrp" :maxlength=10 @change="changeRsrp"></el-input>
            </el-form-item>
            <el-form-item label="功率等级" style="margin: 0">
              <el-tooltip placement="bottom">
                <div slot="content">功率等级衰减值：<br/>6：0dB&#12288;&#12288;5：3dB&#12288;&#12288;&nbsp;&nbsp;4：6dB
                  <br/>3：9dB&#12288;&#12288;2：12dB&#12288;&#12288;1：15dB
                </div>
                <el-radio-group v-model="tab.powerLevel">
                  <el-radio-button :label="0">6</el-radio-button>
                  <el-radio-button :label="3">5</el-radio-button>
                  <el-radio-button :label="6">4</el-radio-button>
                  <el-radio-button :label="9">3</el-radio-button>
                  <el-radio-button :label="12">2</el-radio-button>
                  <el-radio-button :label="15">1</el-radio-button>
                </el-radio-group>
              </el-tooltip>
            </el-form-item>
          </el-form>
        </div>
        <el-row style="margin-top: 20px" v-show="frequencyList.length < 16">
          <el-col :span="5" align="left" style="margin-left: 80px">
            <el-button type="primary" icon="el-icon-plus" @click="plusPlmn()" size="medium">增加</el-button>
          </el-col>
        </el-row>
      </div>
    </div>
    <div class="block" style="margin-top: 30px">
      <el-button @click="saveGsm" type="primary"
                 v-show="getmoduleID()<0&&getButtonVial('set:wirelessParamGsm')">保存
      </el-button>
      <el-button type="primary" @click="sendGsm"
                 v-show="getmoduleID()<0&&getButtonVial('set:wirelessParamGsm:send')">参数下发
      </el-button>
      <el-button @click="updateParam" type="primary"
                 v-show="getmoduleID()>=0&&getButtonVial('set:wirelessParam4Band')">保存
      </el-button>
      <el-button type="primary" @click="setBaseParam()"
                 v-show="getmoduleID()>=0&&getButtonVial('set:wirelessParam4Band:send')">参数下发
      </el-button>
      <el-button type="primary" @click="queryParamCmd()"
                 v-show="getButtonVial('device:queryDeviceParameterCmd') && deviceForm=='CON_OUTDOOR_MOCRO'">
        查询设备参数
      </el-button>
    </div>
    <br/>
    <!--重启设备-->
    <div class="popu">
      <el-dialog title="" :visible.sync="runStartDevice" :width="dialogWidth">
        <section>
          <p style="font-size: 16px;padding: 0 30px 20px 30px;text-align: left">新的参数配置需要重启设备才能生效，是否立即重启设备？</p>
          <el-row>
            <el-col :span="12">
              <el-button @click="restartDevice" type="text" class="left">立即重启</el-button>
            </el-col>
            <el-col :span="12">
              <el-button @click="runStartDevice = false" type="text" class="right">稍后手动重启</el-button>
            </el-col>
          </el-row>
        </section>
      </el-dialog>
    </div>
  </section>
</template>
<script>
  import {numValid, intValid, hexValidator, mccValidator, pciValidator} from '../../api'

  export default {
    props: ['deviceId'],

    data() {
      let numVal = (rule, value, callback) => {
        if (!numValid(value)) {
          callback(new Error("只能输入整数"));
        } else {
          callback();
        }
      };
      let intVal = (rule, value, callback) => {
        if (!intValid(value)) {
          callback(new Error("只能输入整数"));
        } else {
          callback();
        }
      };
      let hexValid = (rule, value, callback) => {
        if (!hexValidator(value)) {
          callback(new Error("只能输入0001－FFFE"));
        } else {
          callback();
        }
      };
      let mccValid = (rule, value, callback) => {
        if (!mccValidator(value)) {
          callback(new Error("请输入正确的mcc：000-999"));
        } else {
          callback();
        }
      };
      let pciValid = (rule, value, callback) => {
        if (!pciValidator(value)) {
          callback(new Error("请输入正确的pci：0-504"));
        } else if (parseInt(value) < 0 || parseInt(value) > 504) {
          callback(new Error("pci的范围是0-504"));
        } else {
          callback();
        }
      };
      return {
        runStartDevice: false,
        dialogWidth: $.Device.isPC() ? '380px' : '300px',
        param: {moduleID: 0, datatag: 'M'},
        opDeviceParameter: {
          redirectEarfcn: 37900, tac: 1, tacPeriod: '180', bandWidth: 5
        },
        activeName: [{moduleID: 0, name: '移动', type: 'M'}, {moduleID: 1, name: '联通', type: 'U'},
          {moduleID: 2, name: '电信', type: 'T'}],
        labelBcc: 'bcch',
        activeItem: '移动',
        deviceForm: 'CON_OUTDOOR_MOCRO',//大站
        deviceId1: this.deviceId,
        bands: [{value: 900, label: 900}, {value: 1800, label: 1800}],
        bandwidths: [{value: 1, label: '3MHz'}, {value: 2, label: '5MHz'}, {value: 3, label: '10MHz'},
          {value: 4, label: '15MHz'}, {value: 5, label: '20MHz'}],
        rules: {
          downFrequency: [
            {required: true, message: '请输入下行频点', trigger: "blur"}, {validator: numVal, trigger: "change,blur"}],
          pci: [{required: true, message: '请输入pci', trigger: "blur"}, {validator: pciValid, trigger: "change,blur"}],
          // tac: [{required: true, message: '请输入tac', trigger: "blur"}, {validator: hexValid, trigger: "change,blur"}],
          tacPeriod: [{required: true, message: '请输入重复抓取时间', trigger: "blur"},
            {validator: numVal, trigger: "change,blur"}],
          bandWidth: [{required: true, message: '请选择带宽', trigger: "blur"}],
          powerLevel: [{required: true, message: '请选择功率等级', trigger: "blur"}],
          redirectEarfcn: [{required: true, message: '请输入重定向载波频点', trigger: "blur"},
            {validator: numVal, trigger: "change,blur"}],
          bcc: [{required: true, message: '请输入bcc', trigger: "blur"}, {validator: numVal, trigger: "change,blur"}],
          lac: [
            {required: true, message: '请输入lac', trigger: "blur"}, {validator: hexValid, trigger: "change,blur"}],
          reCapFilterPeriod: [{required: true, message: '请输入重复上号间隔', trigger: "blur"},
            {validator: numVal, trigger: "change,blur"}],
          cellId: [{required: true, message: '请输入小区ID', trigger: "blur"},
            {validator: numVal, trigger: "change,blur"}]
        },
        plmns: [{type: '460.00', name: '460.00'}, {type: '460.01', name: '460.01'}, {type: '460.11', name: '460.11'}],
        frequencyList: [{
          upFrequency: 37900, downFrequency: 37900, plmn: '460.00', rsrp: 0,
          priority: 7, pci: 5, powerLevel: 6
        }],
        plmn: '460.00',
        down: 37900,
        up: 37900,
        deviceType: ''
      }
    },
    watch: {
      deviceId: function () {
        this.deviceId1 = this.deviceId;
      }
    },
    created() {
      this.deviceId1 = this.deviceId;
    },
    methods: {
      getButtonVial(msg) {
        return $.Button.buttonValidator(msg);
      },
      handleClick(tab, event) {
        if (this.getmoduleID() < 3) {//移动
          this.bands = [{value: 38, label: 38}, {value: 39, label: 39}, {value: 40, label: 40}, {value: 41, label: 41}];
        } else {//2G
          this.bands = [{value: 900, label: 900}, {value: 1800, label: 1800}];
        }
        this.clear();
        this.getParam();
      },
      //查询设备参数
      queryParamCmd() {
        this.$post('device/queryDeviceParameterCmd/' + this.deviceId1 + '/' + this.deviceForm + '/' + this.getmoduleID(), {}, '查询命令下发成功').then((data) => {
          this.getParam();
        });
      },
      //增加跳频
      plusPlmn() {
        this.frequencyList.push({
          upFrequency: this.up, downFrequency: this.down, plmn: this.plmn, rsrp: 0,
          priority: 7, pci: this.pci, powerLevel: 6
        });
      },
      //删除跳频
      minusPlmn(index) {
        this.frequencyList.splice(index, 1);
      },
      //下行频点变化
      changeTDown(val, idx) {
        if (val.length > 0) {
          if (this.getActiveType() === 'M') {//小站移动
            this.frequencyList[idx].upFrequency = (val ? parseInt(val) : 0);
          } else {//联通电信
            this.frequencyList[idx].upFrequency = (val ? parseInt(val) + 18000 : 18000);
          }
        }
      },
      changeRsrp(val) {
        let isVaild = true;
        if (val) {
          if (!intValid(val)) {
            this.$message.error('请输入正确的rsrp');
            isVaild = false;
          }
        }
        return isVaild;
      },
      changeOffset(val) {
        let isVaild = true;
        if (val) {
          if (!numValid(val)) {
            this.$message.error('请输入正确的优先级');
            isVaild = false;
          }
        }
        return isVaild;
      },
      //bcc取值范围 GSM：移动[1-94][512-562],联通[96-124][686-735]FDD：[0-599][1200-1949]
      //TDD：移动-38 [37750-38249],移动-39 [38250-38649],移动-40 [38650-39649],移动-41 [39650-41589]
      changeBcc(val) {
        let isVaild = true;
        if (this.getmoduleID() === 3) {//移动2G
          if (this.opDeviceParameter.band === 900) {//[1-94]
            if (parseInt(val) < 1 || parseInt(val) > 94) {
              this.$message.error(this.labelBcc + '的范围为[1-94]');
              isVaild = false;
            }
          } else {//[512-562]
            if (parseInt(val) < 512 || parseInt(val) > 562) {
              this.$message.error(this.labelBcc + '的范围为[512-562]');
              isVaild = false;
            }
          }
        } else if (this.getmoduleID() === 4) {//联通2G
          if (this.opDeviceParameter.band === 900) {//[96-124]
            if (parseInt(val) < 96 || parseInt(val) > 124) {
              this.$message.error(this.labelBcc + '的范围为[96-124]');
              isVaild = false;
            }
          } else {//[686-735]
            if (parseInt(val) < 686 || parseInt(val) > 735) {
              this.$message.error(this.labelBcc + '的范围为[686-735]');
              isVaild = false;
            }
          }
        }
        return isVaild;
      },
      //下行频点变化
      changeDown(val) {
        if (this.getActiveType() === 'M') {//移动
          this.opDeviceParameter.upFrequency = val ? parseInt(val) : 0;
        } else if (this.getActiveType() === 'T' || this.getActiveType() === 'U') {//联通电信
          this.opDeviceParameter.upFrequency = val ? parseInt(val) + 18000 : 18000;
        }
      },
      clear() {
        //初始化
        if (this.getActiveType() === 'M') {//移动4G38/40
          this.param = {moduleID: 0, datatag: 'M'};
          this.opDeviceParameter = {redirectEarfcn: 37900, tac: 1, tacPeriod: 180, bandWidth: 5};
        } else if (this.getActiveType() === 'U') {//联通4G
          this.param = {moduleID: 1, datatag: 'U'};
          this.opDeviceParameter = {redirectEarfcn: 1650, tac: 1, tacPeriod: 180, bandWidth: 3};
        } else if (this.getActiveType() === 'T') {//电信4G
          this.param = {moduleID: 2, datatag: 'T'};
          this.opDeviceParameter = {redirectEarfcn: 100, tac: 1, tacPeriod: '180', bandWidth: 3};
        } else if (this.getActiveType() === 'GSMCMCC') {
          this.opDeviceParameter = {
            network: 'GSMCMCC', band: 900, bcc: 1, lac: 9, pci: 1,
            tacPeriod: '180', plmn: "460.11", reCapFilterPeriod: 300, cellId: 3
          };
        } else if (this.getActiveType() === 'GSMCMUC') {
          this.opDeviceParameter = {
            network: 'GSMCMUC', band: 900, bcc: 96, lac: 9, pci: 1,
            tacPeriod: '180', plmn: "460.11", reCapFilterPeriod: 300, cellId: 3
          };
        }
        this.defaultFrequencyList();
      },
      //跳频默认参数
      defaultFrequencyList() {
        if (this.getActiveType() === 'M') {//移动4G38/40
          this.plmn = '460.00';
          this.down = 37900;
          this.up = 37900;
          this.pci = 5;
          this.frequencyList = [{
            upFrequency: this.up, downFrequency: this.down, plmn: this.plmn, rsrp: 0,
            priority: 7, pci: this.pci, powerLevel: 0
          }];
        } else if (this.getActiveType() === 'U') {//联通4G
          this.plmn = '460.01';
          this.down = 1650;
          this.up = 19650;
          this.pci = 6;
          this.frequencyList = [{
            upFrequency: this.up, downFrequency: this.down, plmn: this.plmn, rsrp: 0,
            priority: 7, pci: this.pci, powerLevel: 0
          }];
        } else if (this.getActiveType() === 'T') {//电信4G
          this.plmn = '460.11';
          this.down = 100;
          this.up = 18100;
          this.pci = 7;
          this.frequencyList = [{
            upFrequency: this.up, downFrequency: this.down, plmn: this.plmn, rsrp: 0,
            priority: 7, pci: this.pci, powerLevel: 0
          }];
        } else {
          this.frequencyList = [{
            upFrequency: 0, downFrequency: 0, plmn: '460.00', rsrp: 0,
            priority: 7, pci: 5, powerLevel: 0
          }];
        }
      },
      getActiveType() {
        for (let item of this.activeName) {
          if (this.activeItem === item.name) {
            return item.type;
          }
        }
      },
      getmoduleID() {
        let idx = -1;
        for (let item of this.activeName) {
          if (this.activeItem === item.name) {
            idx = item.moduleID;
          }
        }
        return idx;
      },
      getBand() {
        for (let item of this.activeName) {
          if (this.activeItem === item.name) {
            return parseInt(item.band);
          }
        }
      },
      //获取载波参数
      getParam() {
        this.$post('device/get/deviceParameter/' + this.deviceId1, {}).then((data) => {
          if (data.code === '000000') {
            if (data.data) {
              if (this.getmoduleID() < 3) {
                if (data.data.subModuleParam && data.data.subModuleParam.length > 0) {
                  data.data.subModuleParam.forEach((subModuleParam) => {
                    if (subModuleParam.moduleId === this.getmoduleID()) {
                      if (subModuleParam.wirelessParam4Band) {
                        if (subModuleParam.wirelessParam4Band.moduleID === this.getmoduleID()) {
                          this.opDeviceParameter = subModuleParam.wirelessParam4Band.commonParam;
                          this.frequencyList = subModuleParam.wirelessParam4Band.frequencyList;
                        }
                      }
                    }
                  });
                }
              } else {//GSM
                if (data.data.gsmModuleParam && data.data.gsmModuleParam.length > 0) {
                  data.data.gsmModuleParam.forEach((gsmModuleParam) => {
                    if (gsmModuleParam.network === this.getActiveType()) {
                      this.opDeviceParameter = gsmModuleParam;
                    }
                  });
                }
              }
            }
          }
        })
      },
      //保存GSM参数
      saveGsm() {
        let forName = 'opDeviceParameter';
        if (this.changeBcc(this.opDeviceParameter.bcc)) {
          this.$refs[forName].validate((valid) => {
            if (valid) {
              this.$post('set/wirelessParamGsm/' + this.deviceId1 + '/' + this.deviceForm, this.opDeviceParameter,
                '修改成功').then((data) => {
                this.getParam();
              });
            }
          });
        }
      },
      //下发GSM参数
      sendGsm() {
        let forName = 'opDeviceParameter';
        if (this.changeBcc(this.opDeviceParameter.bcc)) {
          this.$refs[forName].validate((valid) => {
            if (valid) {
              this.$confirm('确认下发当前参数？', '提示', {type: 'warning'}).then(() => {
                this.$post('set/wirelessParamGsm/send/' + this.deviceId1 + '/' + this.deviceForm, this.opDeviceParameter,
                  '命令下发成功').then((data) => {
                  if (data.code === '000000') {
                    this.runStartDevice = true;
                  }
                  this.getParam();
                });
              }).catch(() => {
              });
            }
          });
        }
      },
      //下发参数
      setBaseParam() {
        let forName = 'opDeviceParameter';
        this.$refs[forName].validate((valid) => {
          if (valid) {
            this.$confirm('确认下发当前参数？', '提示', {type: 'warning'}).then(() => {
              this.param.commonParam = this.opDeviceParameter;
              this.param.frequencyList = this.frequencyList;

              this.$post('set/wirelessParam4Band/send/' + this.deviceId1 + '/' + this.deviceForm, this.param,
                '命令下发成功').then((data) => {
                if (data.code === '000000') {
                  this.runStartDevice = true;
                }
                this.getParam();
              });
            }).catch(() => {
            });
          }
        });
      },
      //保存/更新参数
      updateParam() {
        let forName = 'opDeviceParameter';
        this.$refs[forName].validate((valid) => {
          if (valid) {
            this.param.commonParam = this.opDeviceParameter;
            this.param.frequencyList = this.frequencyList;

            this.$post('set/wirelessParam4Band/' + this.deviceId1 + '/' + this.deviceForm, this.param,
              '修改成功').then((data) => {
              this.getParam();
            });
          }
        });
      },
      //重启设备
      restartDevice() {
        this.$post('set/restart/' + this.deviceId1 + '/' + this.deviceForm, {}, "重启命令下发成功");
        this.runStartDevice = false;
      },
      //获取设备的基本信息
      getBaseInfo() {
        this.$post("device/get/byDeviceId/" + this.deviceId, {}).then((data) => {
            if (data.code === '000000') {
              if (data.data) {
                this.deviceType = data.data.deviceType;
                if (this.deviceType === '2' || this.deviceType === '3' || this.deviceType === '4' ||
                  this.deviceType === '5' || this.deviceType === '6' || this.deviceType === 'C') {
                  this.activeName = [{moduleID: -1, name: '移动（GSM）', type: 'GSMCMCC'},
                    {moduleID: -1, name: '联通（GSM）', type: 'GSMCMUC'}, {moduleID: 0, name: '移动', type: 'M'},
                    {moduleID: 1, name: '联通', type: 'U'}, {moduleID: 2, name: '电信', type: 'T'}];
                  this.activeItem = '移动（GSM）'
                }

                this.clear();
                this.getParam();
              }
            }
          }
        )
      }
    },
    mounted() {
      this.getBaseInfo();
    }
  }
</script>
