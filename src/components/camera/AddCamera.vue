<template>
  <div>
    <section class="content card-width">
      <el-form label-width="120px" label-position="left" ref="deviceMonitor" :rules="rules" :model="deviceMonitor"
               style="margin-top: 20px">
        <div class="content add-appdiv">
          <el-form-item label="相机编码" style="text-align: left" prop="cameraCode">
            <el-input v-model="deviceMonitor.cameraCode" placeholder="请输入相机编码" :maxlength="20"></el-input>
          </el-form-item>
          <el-form-item label="相机名称" style="text-align: left" prop="name">
            <el-input v-model="deviceMonitor.name" placeholder="请输入相机名称" :maxlength="20"></el-input>
          </el-form-item>
          <el-form-item label="IP地址" style="text-align: left" prop="ip" align="left">
            <el-input v-model="deviceMonitor.ip" placeholder="请输入IP地址" :maxlength="15"
                      class="input-width"></el-input>
          </el-form-item>
          <el-form-item label="安装地址" required>
            <el-row>
              <el-col :span="8" style="margin-right: 15px">
                <el-cascader expand-trigger="hover" :options="provinceList" v-model="selectedOptions2"
                             :props="props" @change="areaChange" style="width: 100%" filterable>
                </el-cascader>
              </el-col>
              <el-col :span="15">
                <el-input v-model="deviceMonitor.detailAddress" placeholder="请输入详细地址，例：某大厦x楼/某小区x房间号"
                          :maxlength=50></el-input>
              </el-col>
            </el-row>
          </el-form-item>
          <el-form-item label="经纬度" required>
            <el-row>
              <el-col :span="10" style="margin-right: 15px">
                <el-input v-model="deviceMonitor.longitude" readonly>
                  <template slot="prepend">经度</template>
                </el-input>
              </el-col>
              <el-col :span="10" style="margin-right: 15px">
                <el-input v-model="deviceMonitor.latitude" readonly>
                  <template slot="prepend">纬度</template>
                </el-input>
              </el-col>
              <el-col :span="3">
                <el-button type="primary" @click="selectAdd()">地图选址</el-button>
              </el-col>
            </el-row>
          </el-form-item>
          <el-form-item style="text-align: left" label="场所类型" prop="serviceType">
            <el-select v-model="deviceMonitor.serviceType" placeholder="请选择" @change="typeChange"
                       style="width:250px" filterable>
              <el-option v-for="item in serviceTypes" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="场所编码" required>
            <el-row>
              <el-col :span="10" style="margin-right: 10px">
                <el-input v-model="placeCode" readonly></el-input>
              </el-col>
              <el-col :span="10">
                <el-tooltip placement="bottom">
                  <div slot="content">4位场所编码</div>
                  <el-input v-model="numberCode" :maxlength=4></el-input>
                </el-tooltip>
              </el-col>
            </el-row>
          </el-form-item>
        </div>
      </el-form>
      <div>
        <el-button type="primary" @click="saveInfo()"
                   v-show="getButtonVial('camera:add')||getButtonVial('camera:update')">保存
        </el-button>
      </div>
    </section>
    <!--选择安装地址--》地图-->
    <el-dialog title="" :visible.sync="mapVisible" :width="dialogWidth">
      <MapView @getLocation="getLocation" v-bind:formattedAddress="getAddress"></MapView>
      <div class="block" style="margin-top: 20px">
        <el-button @click="mapVisible = false">取消</el-button>
        <el-button type="primary" @click="setLocation">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import json from '../../assets/city.json';
  import MapView from '../device/map';
  import {ipValid, numValid, mobileValidator, isMac, noSValidator, noValidator} from '../../api.js'

  export default {
    data() {
      let numValidator = (rule, value, callback) => {
        if (!numValid(value)) {
          callback(new Error("只能输入数字"));
        } else {
          callback();
        }
      };
      let ipValidator = (rule, value, callback) => {
        if (!ipValid(value)) {
          callback(new Error("请输入正确的IP"));
        } else {
          callback();
        }
      };
      let devValidator = (rule, value, callback) => {
        if (noSValidator(value)) {
          callback(new Error("请输入正确的设备名称，由汉字、数字、英文字母、下划线、横线组成"));
        } else {
          callback();
        }
      };
      return {
        dialogWidth: $.Device.isPC() ? '50%' : '90%',
        mapVisible: false,
        deviceMonitor: {},
        deviceId: this.$route.query.id || '',
        props: {value: 'o', label: 'n', children: 'c'},
        provinceList: json,
        selectedOptions2: [],
        deviceForms: [],
        deviceTypes: [],
        position: {},
        getAddress: '',
        code: '',
        placeCode: '',
        numberCode: '',
        serviceTypes: [{value: '0', label: '网吧'}, {value: '1', label: '旅店宾馆类（住宿服务场所）'},
          {value: '2', label: '图书馆阅览室'}, {value: '3', label: '电脑培训中心类'}, {value: '4', label: '娱乐场所类'},
          {value: '5', label: '交通枢纽'}, {value: '6', label: '公共交通工具'}, {value: '7', label: '餐饮服务场所'},
          {value: '8', label: '金融服务场所'}, {value: 'A', label: '购物场所'}, {value: 'B', label: '公共服务场所'},
          {value: 'C', label: '文化服务场所'}, {value: 'D', label: '公共休闲场所'}, {value: '9', label: '其他'}],
        rules: {
          cameraCode: [{required: true, message: '请输入相机编码', trigger: 'blur', maxlength: 20},
            {validator: numValidator, trigger: "change,blur"}],
          name: [{required: true, message: '请输入相机名称', trigger: 'blur', maxlength: 20},
            {validator: devValidator, trigger: "change,blur"}],
          serviceType: [{required: true, message: '请选择场所类型', trigger: 'blur'}],
          ip: [{required: true, message: '请输入IP地址', trigger: 'blur'},
            {validator: ipValidator, trigger: "change,blur"}],
        }
      }
    },
    methods: {
      getButtonVial(msg) {
        return $.Button.buttonValidator(msg);
      },
      //保存
      saveInfo() {
        let url = 'camera/add';
        let msg = '添加成功';
        if (this.deviceId.length > 0) {
          url = 'camera/update';
          msg = '修改成功';
        }
        if (this.selectedOptions2.length === 0) {
          this.$message.error('请选择安装地址省市区');
          return;
        }
        if (!this.deviceMonitor.serviceType) {
          this.$message.error('请选择场所类型');
          return;
        }
        if (this.numberCode.length !== 4 || !numValid(this.numberCode)) {
          this.$message.error('场所编码需手动输入4位数字');
          return;
        }
        this.getScode(this.selectedOptions2);
        this.deviceMonitor.serviceCode = this.placeCode + this.numberCode;
        this.$refs['deviceMonitor'].validate((valid) => {
          if (valid) {
            this.$post(url, this.deviceMonitor, msg).then((data) => {
              if (this.deviceId.length > 0) {
                this.getInfo();
              } else {
                this.$router.go(-1);
              }
            })
          }
        });
      },
      //场所类型的选择
      typeChange(value) {
        //value为场所类型
        this.deviceMonitor.serviceType = value;
        if (this.deviceMonitor.serviceType) {
          this.placeCode = this.code + '8' + this.deviceMonitor.serviceType + '01';
        } else {
          this.placeCode = this.code + '801';
        }
      },
      //地图选址，显示dialog
      selectAdd() {
        if (!this.code) {
          this.$message.error('请选择省市区');
          return;
        }
        if (this.code) {
          if (this.deviceMonitor.detailAddress) {
            this.getAddress = this.getAreaLable(this.code) + this.deviceMonitor.detailAddress;
          } else {
            this.getAddress = this.getAreaLable(this.code);
          }
        }
        this.mapVisible = true;
      },
      //地图选址完成设置经纬度
      setLocation() {
        this.deviceMonitor.longitude = this.position.lng;
        this.deviceMonitor.latitude = this.position.lat;
        this.deviceMonitor.detailAddress = this.position.detailAddress;
        this.selectedOptions2 = this.getCode(this.position.code);
        this.mapVisible = false;
      },
      //获得地图选择的经纬度
      getLocation(pos) {
        this.position = pos;
      },
      //根据区域码找到对应的省市县
      getCode(code) {
        json.forEach((province) => {
          if (province.c) {
            province.c.forEach((city) => {
              if (city.c) {
                city.c.forEach((country) => {
                  if (code === country.o) {
                    this.selectedOptions2 = [province.o, city.o, country.o];
                  }
                })
              } else {
                if (code === city.o) {
                  this.selectedOptions2 = [province.o, city.o];
                }
              }
            })
          } else {
            if (code === province.o) {
              this.selectedOptions2 = [province.o];
            }
          }
        });
        return this.selectedOptions2;
      },
      //省市区
      getScode(value) {
        if (value.length === 1) {
          this.deviceMonitor.provinceCode = value[0];
        } else if (value.length === 2) {
          this.deviceMonitor.provinceCode = value[0];
          this.deviceMonitor.cityCode = value[1];
        } else if (value.length === 3) {
          this.deviceMonitor.provinceCode = value[0];
          this.deviceMonitor.cityCode = value[1];
          this.deviceMonitor.areaCode = value[2];
        }
      },
      //省市县变化
      areaChange(value) {
        this.selectedOptions2 = value;
        if (value.length === 1) {
          this.code = value[0];
        } else if (value.length === 2) {
          this.code = value[1];
        } else if (value.length === 3) {
          this.code = value[2];
        }
        if (this.deviceMonitor.serviceType) {
          this.placeCode = this.code + '8' + this.deviceMonitor.serviceType + '01';
        } else {
          this.placeCode = this.code + '801';
        }
      },
      //获得省市县
      getAreaLable(code) {
        let lable = '';
        this.provinceList.forEach((province) => {
          if (province.c) {
            province.c.forEach((city) => {
              if (city.c) {//省级+市级+县级
                city.c.forEach((country) => {
                  if (code === country.o) {
                    lable = province.n + city.n + country.n;
                  }
                })
              } else {//省级+市级
                if (code === city.o) {
                  lable = province.n + city.n;
                }
              }
            })
          } else {//只包含省级
            if (code === province.o) {
              lable = province.n;
            }
          }
        });
        return lable;
      },
      getInfo() {
        this.$post("camera/get/" + this.deviceId, {}).then((data) => {
          if (data.code === '000000') {
            if (data.data) {
              this.deviceMonitor = data.data;
              //场所编码
              if (data.data.serviceCode) {
                this.placeCode = data.data.serviceCode.substring(0, 10);
                this.numberCode = data.data.serviceCode.substring(data.data.serviceCode.length - 4, data.data.serviceCode.length);
              }
              // 地址
              if (data.data.areaCode) {
                this.selectedOptions2 = this.getCode(data.data.areaCode);
                this.code = data.data.areaCode;
              } else if (data.data.cityCode) {
                this.selectedOptions2 = this.getCode(data.data.cityCode);
                this.code = data.data.cityCode;
              } else if (data.data.provinceCode) {
                this.selectedOptions2 = this.getCode(data.data.provinceCode);
                this.code = data.data.provinceCode;
              } else {
                this.selectedOptions2 = [];
                this.code = '';
              }
            }
          }
        });
      }
    },
    mounted() {
      this.deviceId = this.$route.query.id || '';
      if (this.deviceId.length > 0) {
        this.getInfo();
      }
    },
    components: {
      MapView
    }
  }
</script>
<style scoped>
  @media screen and (min-width: 320px) and (max-width: 799px) {
    .card-width {
      width: 98%;
      margin-left: 0
    }
  }

  @media screen and (min-width: 800px) {
    .card-width {
      width: 90%;
      margin-left: 20px
    }
  }
</style>
