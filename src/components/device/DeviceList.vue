<template>
  <div>
    <section class="content">
      <div class="center-block">
        <headerTitle></headerTitle>
        <el-row style="margin-top: 20px;margin-bottom: 10px">
          <el-col :span="20" align="left">
            <el-input placeholder="设备名称/ID" v-model="query.deviceName" :maxlength="30" @change="changeDevice"
                      style="width: 180px;margin-right: 10px;margin-top: 10px" size="medium"></el-input>
            <el-cascader :options="provinceList" :props="props" @change="areaChange" change-on-select v-model="areaList"
                         style="width: 180px;margin-right: 10px;margin-top: 10px" placeholder="全部地区" size="medium"
                         filterable clearable>
            </el-cascader>
            <el-select v-model="query.deviceType" placeholder="全部类型" size="medium" filterable
                       style="width: 150px;margin-right: 10px;margin-top: 10px" clearable>
              <el-option v-for="item in deviceTypes" :key="item.code" :label="item.name" :value="item.code">
              </el-option>
            </el-select>
            <el-select v-model="query.deviceForm" placeholder="全部形态" size="medium" filterable
                       style="width: 150px;margin-right: 10px;margin-top: 10px" clearable>
              <el-option v-for="item in deviceForms" :key="item.code" :label="item.name" :value="item.code">
              </el-option>
            </el-select>
            <el-tooltip class="item" effect="dark" content="所属组织" placement="bottom">
              <el-select v-model="query.groupId" placeholder="请选择组织" size="medium" filterable
                         style="width: 150px;margin-right: 10px;margin-top: 10px">
                <el-option v-for="item in groups" :key="item.groupId" :label="item.groupName" :value="item.groupId">
                </el-option>
              </el-select>
            </el-tooltip>
            <!--<el-select v-model="lineStatus" placeholder="全部状态"-->
            <!--style="width: 150px;margin-right: 10px;margin-top: 10px">-->
            <!--<el-option-->
            <!--v-for="item in online" :key="item.value" :label="item.label" :value="item.value">-->
            <!--</el-option>-->
            <!--</el-select>-->
            <el-button type="primary" style="margin-top: 10px" @click.stop="getData()" size="medium">搜索</el-button>
            <el-button style="margin-top: 10px" @click.stop="clearData()" size="medium">清除</el-button>
          </el-col>
          <el-col :span="4" align="right">
            <el-button type="primary" icon="el-icon-plus" style="margin-top: 10px"
                       @click="runningAddDevice = true;activeName = '1';deviceFile=''" size="medium"
                       v-show="getButtonVial('device:add') || getButtonVial('device:addBatch')">添加设备
            </el-button>
          </el-col>
        </el-row>

        <el-table :data="deviceList" v-loading="listLoading" class="center-block"
                  @selection-change="selsChange" stripe>
          <!--<el-table-column type="selection" width="45" align="left"></el-table-column>-->
          <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
          <el-table-column align="left" prop="deviceId" label="设备ID" min-width="150" max-width="250"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" prop="deviceName" label="设备名称" min-width="150" max-width="250"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" prop="serviceCode" label="场所编码" min-width="150" max-width="200"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" prop="deviceTypeVal" label="类型" min-width="150" max-width="250"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" prop="deviceFormVal" label="形态" min-width="150" max-width="250"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" prop="detailAddress" label="位置" min-width="180" max-width="300"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" prop="groupId" label="所属组织" min-width="125" max-width="200"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" prop="lineStatus" label="在线状态" min-width="100"
                           max-width="120"></el-table-column>
          <el-table-column align="left" label="操作" min-width="150" max-width="200">
            <template slot-scope="scope">
              <el-button type="text" @click.stop="gotoSet(scope.row)" v-show="getButtonVial('device:baseinfo') ||
              getButtonVial('device:sendBaseInfo') || getButtonVial('device:get:deviceStatus') || getButtonVial('terminate:query')
              || getButtonVial('device:get:sniffer') || getButtonVial('device:sniffer') || getButtonVial('set:autoSnifferParam')">
                详情
              </el-button>
              <el-button type="text" v-show="getButtonVial('set:restart')" @click.stop="restartDevice(scope.row)">重启
              </el-button>
              <el-button type="text" v-show="false">休眠</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="block" style="margin-top: 20px">
          <el-pagination
            @size-change="handleSizeChange" @current-change="pageChange" :current-page="query.page" background
            :page-sizes="[10, 15, 20, 30]" :page-size="query.size" layout="total, sizes, prev, pager, next, jumper"
            :total="count"></el-pagination>
        </div>
      </div>
      <!--添加设备-->
      <el-dialog title="添加设备" :visible.sync="runningAddDevice" :width="dialogWidth" center>
        <el-tabs v-model="activeName" type="card">
          <el-tab-pane label="录入设备" name="1">
            <div class="block">
              <el-form ref="addDevice" :rules="rules" :model="addDevice" :label-position="labelPosition"
                       :label-width="labelWidth">
                <el-form-item label="设备ID" prop="deviceId">
                  <el-input v-model="addDevice.deviceId" auto-complete="off" :maxlength="30"></el-input>
                </el-form-item>
                <el-form-item label="设备名称" prop="deviceName">
                  <el-input v-model="addDevice.deviceName" auto-complete="off" :maxlength="20"></el-input>
                </el-form-item>
                <el-form-item label="设备类型" prop="deviceType">
                  <el-select v-model="addDevice.deviceType" placeholder="请选择" style="width: 100%" filterable>
                    <el-option v-for="item in deviceTypes" :key="item.code" :label="item.name" :value="item.code">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="设备形态" prop="deviceForm">
                  <el-select v-model="addDevice.deviceForm" placeholder="请选择" style="width: 100%" filterable>
                    <el-option v-for="item in deviceForms" :key="item.code" :label="item.name" :value="item.code">
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-form>
              <div slot="footer" class="dialog-footer" align="center" v-show="getButtonVial('device:add')">
                <el-button @click="runningAddDevice = false">取消</el-button>
                <el-button type="primary" @click="deviceAdd()">确定</el-button>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="批量导入" name="2" :disabled="!getButtonVial('device:addBatch')">
            <div class="block">
              <el-form :label-position="labelPosition" :label-width="labelWidth">
                <el-form-item label="选择文件">
                  <el-input v-model="deviceFile" placeholder="请选择Excel文件" disabled>
                    <el-upload ref="upload" class="upload" slot="append" :action="uploadUrl" name="file"
                               :on-success="handleSuccess" :on-change="handleChange"
                               :auto-upload="false" :show-file-list="false">
                      <el-button type="primary" icon="el-icon-plus"></el-button>
                    </el-upload>
                  </el-input>
                  <span style="color:#888">请选择Excel文件
                    <a v-bind:href="downloadUrl" target="_blank">下载文件模板</a></span>
                </el-form-item>
              </el-form>
              <div slot="footer" class="dialog-footer" align="center" v-show="getButtonVial('device:addBatch')">
                <el-button type="primary" @click="importDevice">确认导入</el-button>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-dialog>
      <!--批量导入的结果-->
      <el-dialog title="批量导入" :visible.sync="runningImportDevice" :width="dialogWidth" center>
        <el-table :data="importList" v-loading="listLoading" class="center-block" stripe>
          <el-table-column align="left" prop="deviceId" label="设备ID" min-width="100" max-width="250"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" prop="deviceName" label="设备名称" min-width="100" max-width="250"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" prop="deviceTypeVal" label="设备类型" min-width="100" max-width="250"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" prop="deviceFormVal" label="设备形态" min-width="100" max-width="250"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="导入结果" width="100">
            <template slot-scope="scope">
              <el-button type="text" style="color: #dd6161">导入失败</el-button>
            </template>
          </el-table-column>
          <el-table-column align="left" prop="errorMsg" label="失败原因" min-width="100" max-width="250"
                           :formatter="formatterAddress"></el-table-column>
        </el-table>
        <div slot="footer" class="dialog-footer" align="center">
          <el-button type="primary" @click="runningImportDevice = false">关闭</el-button>
        </div>
      </el-dialog>
    </section>
  </div>
</template>
<script>
  import json from '../../assets/city.json';
  import axios from "axios";
  import headerTitle from "../publicComponents/headerTitle.vue";
  import {globalValidExcel, noSValidator, noValidator} from "../../api";

  function getQuery() {
    let query = JSON.parse(sessionStorage.getItem("query"));
    if (!query) {
      query = {
        page: 1, size: 10, deviceForm: '', deviceType: '', deviceName: '',
        groupId: JSON.parse(sessionStorage.getItem("user")).groupId
      }
    }
    return query;
  }

  export default {
    data() {
      let idValidator = (rule, value, callback) => {
        if (!/[a-zA-Z0-9_]$/.test(value)) {
          callback(new Error("请输入正确的设备id，由英文字母、数字、下划线组成"));
        } else {
          callback();
        }
      };
      let devValidator = (rule, value, callback) => {
        if (!/[A-Za-z0-9_\u4e00-\u9fa5]$/.test(value)) {
          callback(new Error("请输入正确的设备名称，由汉字、数字、英文字母、下划线组成"));
        } else {
          callback();
        }
      };
      return {
        props: {value: 'o', label: 'n', children: 'c'},
        lineStatus: '',
        areaList: [],
        provinceList: json,
        dialogWidth: $.Device.isPC() ? '40%' : '90%',
        labelWidth: $.Device.isPC() ? '100px' : '80px',
        listLoading: false,
        labelPosition: 'right',
        deviceList: [],
        importList: [],
        query: getQuery(),
        count: 0,
        runningAddDevice: false,
        runningImportDevice: false,
        activeName: '1',
        deviceName: '',
        addDevice: {deviceId: '', deviceName: '', deviceForm: '', deviceType: ''},
        online: [{value: true, label: '在线'}, {value: false, label: '离线'}],
        rules: {
          deviceName: [
            {required: true, message: '请输入设备名称', trigger: 'blur', maxlength: 20},
            {validator: devValidator, trigger: "change,blur"}
          ],
          deviceId: [
            {required: true, message: '请输入设备id', trigger: 'blur', maxlength: 30},
            {validator: idValidator, trigger: "change,blur"}
          ],
          deviceType: [
            {required: true, message: '请选择设备类型', trigger: 'blur'}
          ],
          deviceForm: [
            {required: true, message: '请选择设备形态', trigger: 'blur'}
          ]
        },
        sels: [],
        retrievalRate: '',
        client: {},
        deviceForms: [],
        deviceTypes: [],
        groups: [],
        intervalid: null,
        poverUpdate: false,
        deviceFile: '',
        uploadUrl: axios.defaults.baseURL + '/device/addBatch/' + JSON.parse(sessionStorage.getItem("user")).groupId + '/%20',
        downloadUrl: axios.defaults.baseURL + '/file/download/batchImport.xls'
      }
    },
    //页面关闭时停止更新设备在线状态
    beforeDestroy() {
      clearInterval(this.intervalid);
    },
    methods: {
      getButtonVial(msg) {
        return $.Button.buttonValidator(msg);
      },
      //省市县变化
      areaChange(value) {
        this.areaList = value;
        this.query.provinceCode = '';
        this.query.cityCode = '';
        this.query.areaCode = '';
        if (value.length === 1) {
          this.query.provinceCode = value[0];
        } else if (value.length === 2) {
          this.query.cityCode = value[1];
        } else if (value.length === 3) {
          this.query.areaCode = value[2];
        }
      },
      //批量导入设备的文件格式验证
      handleChange(file, fileList) {
        if (file.status == 'ready') {
          if (globalValidExcel(file.raw, this.$message)) {
            this.deviceFile = file.name;
          }
        }
      },
      handleSuccess(res, file) {
        this.runningAddDevice = false;
        this.deviceFile = file.name;
        if (res.code === '000000') {
          if (res.data && res.data.length > 0) {
            this.runningImportDevice = true;
            this.importList = res.data;
          } else {
            this.$message({type: 'success', message: res.msg});
            this.getData();
          }
        } else {
          this.$message.error(res.msg);
        }
      },
      //确认导入设备
      importDevice() {
        if (!this.deviceFile) {
          this.$message.error('请选择上传文件');
          return;
        }
        this.$refs.upload.submit();
      },
      //跳转到设备设置页面
      gotoSet(device) {
        clearInterval(this.intervalid);
        sessionStorage.setItem("query", JSON.stringify(this.query));
        this.$router.push({
          path: 'deviceSet',
          query: {deviceId: device.deviceId, deviceForm: device.deviceForm, groupId: device.groupId}
        });
      },
      //获取设备类型和形态
      getDeviceTypeAndForm() {
        this.$post('device/get/deviceType').then((data) => {
          if (data.code === '000000' && data.data) {
            this.deviceTypes = data.data;
          }
        });

        this.$post('device/get/deviceForm').then((data) => {
          if (data.code === '000000' && data.data) {
            this.deviceForms = data.data;
          }
        });
      },
      selsChange(sels) {
        this.sels = sels;
      },
      //重启设备
      restartDevice(device) {
        this.$confirm('确认重启当前设备？', '提示', {
          type: 'warning'
        }).then(() => {
          this.$post('set/restart/' + device.deviceId + '/' + device.deviceForm, {}, "重启命令下发成功");
        }).catch(() => {
        });
      },
      //定时刷新设备的在线状态
      statusTask() {
        if (!this.intervalid) {
          this.intervalid = setInterval(() => {
            this.getDeviceStatus();
          }, 5000);
        }
      },
      //获取设备的在线状态
      getDeviceStatus() {
        if (this.deviceList.length > 0) {
          let deviceIds = [];
          this.deviceList.forEach((device) => {
            deviceIds.push(device.deviceId);
          });
          axios.post("device/get/lineStatus", deviceIds).then((res) => {
            let data = res.data;
            if (res.status == 200) {
              this.deviceList.forEach((device) => {
                if (data[device.deviceId] == 0) {
                  this.$set(device, 'lineStatus', "离线");//在数组中增加属性
                } else if (data[device.deviceId] == 1) {
                  this.$set(device, 'lineStatus', "在线");//在数组中增加属性
                } else {
                  this.$set(device, 'lineStatus', "未知");//在数组中增加属性
                }
              });
            } else {
              this.deviceList.forEach((device) => {
                this.$set(device, 'lineStatus', "未知");//在数组中增加属性
              });
            }
          });
        }
      },
      changeDevice(val) {
        if (noSValidator(val)) {
          val = val.substr(0, val.length - 2);
          this.$message.error('请输入正确的设备名称/ID');
        }
      },
      //添加设备
      deviceAdd() {
        if (noValidator(this.addDevice.deviceId)) {
          this.$message.error('请输入正确的设备id，由英文字母、数字、下划线组成');
          return;
        }
        if (noSValidator(this.addDevice.deviceName)) {
          this.$message.error('请输入正确的设备名称，由汉字、数字、英文字母、下划线组成');
          return;
        }
        this.addDevice.groupId = JSON.parse(sessionStorage.getItem("user")).groupId;
        this.$refs['addDevice'].validate((valid) => {
            if (valid) {
            this.$post("device/add", this.addDevice, "创建成功").then((data) => {
              this.addDevice = {deviceId: '', deviceName: '', deviceForm: '', deviceType: ''};
              this.runningAddDevice = false;
              this.getData();
            });
          }
        })
      },
      //获取设备列表
      getData() {
        if (this.query.deviceName) {
          if (noSValidator(this.query.deviceName)) {
            this.$message.error('请输入正确的设备名称/ID');
            return;
          }
        }
        this.listLoading = true;

        this.$post("device/query", this.query).then((data) => {
          this.deviceList = data.data.list;
          this.count = data.data.count;
          this.getDeviceStatus();
          setTimeout(() => {
            this.listLoading = false;
          }, 500);
        }).catch((err) => {
          this.listLoading = false;
          this.deviceList = [];
          this.$message.error(err);
        });
      },
      pageChange(index) {
        this.query.page = index;
        this.getData();
      },
      handleSizeChange(val) {
        this.query.size = val;
        this.getData();
      },
      //搜索设备列表
      clearData() {
        this.query = {
          page: 1, size: 10, deviceForm: '', deviceType: '', deviceName: '',
          groupId: JSON.parse(sessionStorage.getItem("user")).groupId
        };
        this.lineStatus = '';
        this.areaList = [];
        this.getData();
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property == 'groupId') {
          for (let item of this.groups) {
            if (item.groupId == row.groupId) {
              return item.groupName;
            }
          }
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
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
      }
    },
    mounted() {
      sessionStorage.removeItem("deviceTab");
      this.getAllGroups();
      this.getData();
      this.getDeviceTypeAndForm();
      this.statusTask();
    },
    components: {
      headerTitle
    }
  }
</script>

<style scoped>
  a {
    color: #539FF8;
    margin-left: 10px;
    text-decoration: none;
  }

  .setting, .setting:visited, .setting:link, .setting:active, .setting:focus {
    width: 30px;
    height: 30px;
    background: url("../../assets/img/icon_setting.png") no-repeat center;
    border: none;
  }

  .setting:hover {
    background: none;
    font-size: 0;
  }

  .setting:hover:before {
    color: #539FF8;
    content: '设置';
    font-size: 12px;
    margin-top: -5px;
    margin-left: -10px;
  }

  .status, .status:visited, .status:link, .status:active, .status:focus {
    width: 30px;
    height: 30px;
    background: url("../../assets/img/icon_status.png") no-repeat center;
    border: none;
  }

  .status:hover {
    background: none;
    font-size: 0;
  }

  .status:hover:before {
    color: #539FF8;
    content: '状态';
    font-size: 12px;
    margin-top: -5px;
    margin-left: -10px;
  }

  .zmdata, .zmdata:visited, .zmdata:link, .zmdata:active, .zmdata:focus {
    width: 30px;
    height: 30px;
    background: url("../../assets/img/icon_zhenma.png") no-repeat center;
    border: none;
  }

  .zmdata:hover {
    background: none;
    font-size: 0;
  }

  .zmdata:hover:before {
    color: #539FF8;
    content: '侦码';
    font-size: 12px;
    margin-top: -5px;
    margin-left: -10px;
  }

  .more, .more:visited, .more:link, .more:active, .more:focus {
    width: 40px;
    height: 30px;
    background: url("../../assets/img/icon_more.png") no-repeat center;
    border: none;
  }

  .more:hover {
    background: none;
    font-size: 0;
  }

  .more:hover:before {
    color: #539FF8;
    content: '更多';
    font-size: 12px;
    margin-top: -5px;
    margin-left: -10px;
  }

  .btn_green, .btn_green:visited, .btn_green:link {
    width: 100%;
    text-align: center;
    color: #539FF8;
    font-size: 14px;
    background-color: #ffffff;
    border: none;
  }

  .btn_green:hover, .btn_green:active, .btn_green:focus {
    color: #ffffff;
    background-color: #539FF8;
  }

  .btn_green[disabled] {
    color: #bbb;
    background-color: #fff;
  }
</style>
