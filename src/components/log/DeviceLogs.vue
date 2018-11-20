<template>
  <div>
    <section class="content">
      <headerTitle></headerTitle>
      <el-row style="margin-bottom: 15px">
        <el-col :span="18" align="left">
          <el-input placeholder="设备ID" v-model="query.deviceId" :maxlength="30" size="medium"
                    style="width: 150px;margin-right: 10px;margin-top: 10px"></el-input>
          <el-select v-model="query.deviceForm" placeholder="全部形态" size="medium" filterable
                     style="width: 150px;margin-right: 10px;margin-top: 10px" clearable>
            <el-option v-for="item in deviceForms" :key="item.code" :label="item.name" :value="item.code">
            </el-option>
          </el-select>
          <el-select v-model="query.moduleId" placeholder="基带板" filterable clearable
                     style="width: 120px;margin-right: 10px;margin-top: 10px">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
          <el-date-picker v-model="logStartTime" type="datetimerange" format="yyyy/MM/dd HH:mm:ss"
                          end-placeholder="结束日期" :default-time="['00:00:00', '23:59:59']"
                          value-format="timestamp" range-separator="至" start-placeholder="开始日期"
                          style="width: 350px;margin-right: 10px;margin-top: 10px"
                          :picker-options="pickerBeginDate">
          </el-date-picker>
          <el-button type="primary" icon="search" style="margin-top: 10px" @click.stop="query.page=1;getLogList()"
                     size="medium">搜索
          </el-button>
          <el-button style="margin-top: 10px" @click.stop="clearData()" size="medium">清除
          </el-button>
        </el-col>
        <el-col :span="6" align="right">
          <!--<el-button style="margin-top: 10px" type="primary" @click.stop="gotoSet()" size="medium">设置日志</el-button>-->
          <el-button style="margin-top: 10px" type="primary"
                     @click.stop="runningExtractLog=true;sendOrder={logStartTime:''}"
                     size="medium" v-show="getButtonVial('device:log:extract')">提取日志
          </el-button>
          <el-button style="margin-top: 10px" type="primary" @click.stop="deleteLog()"
                     size="medium" :disabled="sels.length==0" v-show="getButtonVial('device:log:delete')">删除
          </el-button>
        </el-col>
      </el-row>
      <el-table :data="logs" v-loading="listLoading" class="center-block" @selection-change="selsChange" stripe>
        <el-table-column type="selection" width="45" align="left"></el-table-column>
        <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
        <el-table-column align="left" label="设备ID" prop="deviceId" min-width="125"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="设备形态" prop="deviceForm" width="150"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="基带板" prop="moduleId" width="120"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="类型" prop="logType" width="130"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="文件名" prop="logFileName" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="打印日期" prop="logStartTime"
                         width="350" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="创建时间" prop="createTime" width="170"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="center" label="操作" width="180">
          <template slot-scope="scope">
            <el-button type="text" @click="sels = [];sels.push(scope.row);deleteLog()"
                       v-show="getButtonVial('device:log:delete')">删除
            </el-button>
            <a v-bind:href="scope.row.logUrl" target="_blank">下载</a>
          </template>
        </el-table-column>
      </el-table>
      <div class="block" style="margin-top: 20px">
        <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page="query.page"
                       :page-sizes="[10, 15, 20, 30]" :page-size="query.size" :total="count" background
                       layout="total, sizes, prev, pager, next, jumper"></el-pagination>
      </div>

      <!--提取日志-->
      <el-dialog title="提取日志" :visible.sync="runningExtractLog" :width="dialogWidth" center>
        <el-form ref="sendOrder" :rules="rules" :model="sendOrder" label-position="left"
                 :label-width="labelWidth">
          <el-form-item label="设备ID" prop="deviceId">
            <el-select v-model="sendOrder.deviceId" placeholder="请选择设备" filterable clearable>
              <el-option v-for="item in deviceList" :key="item.deviceId" :label="item.deviceId" :value="item.deviceId">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="基带板" prop="moduleId">
            <el-select v-model="sendOrder.moduleId" placeholder="基带板" filterable clearable>
              <el-option v-for="item in options1" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="设备形态" prop="deviceForm">
            <el-select v-model="sendOrder.deviceForm" placeholder="请选择" filterable>
              <el-option v-for="item in deviceForms" :key="item.code" :label="item.name" :value="item.code">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="日志类型" prop="logType">
            <el-select v-model="sendOrder.logType" placeholder="请选择日志类型" filterable clearable>
              <el-option v-for="item in logTypes" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="打印日期" prop="logStartTime">
            <el-date-picker v-model="sendOrder.logStartTime" type="datetimerange" format="yyyy/MM/dd HH:mm:ss"
                            end-placeholder="结束日期" :default-time="['00:00:00', '23:59:59']"
                            value-format="timestamp" range-separator="至" start-placeholder="开始日期"
                            :picker-options="pickerBeginDate">
            </el-date-picker>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer" align="center">
          <el-button type="primary" @click="sendLogOrder()">确认提取</el-button>
        </div>
      </el-dialog>
    </section>
  </div>
</template>
<script>
  import {noValidator} from "../../api";
  import headerTitle from "../publicComponents/headerTitle.vue";

  export default {
    data() {
      return {
        logs: [],
        dialogWidth: $.Device.isPC() ? '40%' : '90%',
        labelWidth: $.Device.isPC() ? '100px' : '80px',
        runningExtractLog: false,
        listLoading: false,
        sendOrder: {logStartTime: ''},
        query: {page: 1, size: 10, deviceForm: '', moduleId: '', deviceId: ''},
        logStartTime: '',
        logModules: [{value: 1, label: 'if_app日志'}, {value: 2, label: 'ltedetector日志'},
          {value: 3, label: 'postdemo日志'}, {value: 4, label: 'cli日志'}, {value: 5, label: 'GSM串口日志'},
          {value: 6, label: 'FDD0串口日志'}, {value: 7, label: 'FDD1串口日志'}, {value: 8, label: 'TDD0串口日志'},
          {value: 9, label: 'TDD1串口日志'}, {value: 10, label: '基带板临终遗言'}, {value: 11, label: 'ping网络状态日志'}
          , {value: 12, label: '3G上网卡拨号日志'}, {value: 13, label: '4G上网卡拨号日志'}],
        options: [{value: 2, label: '电信'}, {value: 0, label: '移动'}, {value: 1, label: '联通'},
          {value: '', label: '全部基带板'}],
        options1: [{value: 0, label: '0'}, {value: 1, label: '1'}, {value: 2, label: '2'}, {value: 3, label: '3'},
          {value: 4, label: '4'}, {value: 5, label: '5'}, {value: 6, label: '6'}, {value: 7, label: '7'},
          {value: 8, label: '8'}, {value: 9, label: '9'}, {value: 10, label: '10'}, {value: 11, label: '11'},
          {value: 12, label: '12'}, {value: 13, label: '13'}, {value: 14, label: '14'}, {value: 15, label: '15'},
          {value: 16, label: '16'}, {value: 17, label: '17'}, {value: 18, label: '18'}, {value: 19, label: '19'},
          {value: 20, label: '20'}],
        logTypes: [{value: 0, label: 'srv'}, {value: 1, label: 'enb_deamon'}, {value: 2, label: 'enb'},
          {value: 3, label: 'kernel'}, {value: 4, label: 'logserver'}],
        deviceList: [],
        count: 0,
        sels: [],
        deviceForms: [],
        rules: {
          deviceId: [{required: true, message: '请选择设备', trigger: 'blur'}],
          moduleId: [{required: true, message: '请选择基带板', trigger: 'blur'}],
          logType: [{required: true, message: '请选择日志类型', trigger: 'blur'}],
          logStartTime: [{required: true, message: '请选择打印时间', trigger: 'blur'}],
          deviceForm: [{required: true, message: '请选择设备形态', trigger: 'blur'}],
        },
        pickerBeginDate: {
          disabledDate: (time) => {
            let beginDateVal = new Date().getTime();
            if (beginDateVal) {
              return beginDateVal < time.getTime();
            }
          }
        }
      }
    },
    methods: {
      getButtonVial(msg) {
        return $.Button.buttonValidator(msg);
      },
      selsChange(sels) {
        this.sels = sels;
      },
//      跳转到日志设置页面
      gotoSet() {
//        this.$router.push({
//          path: '/logSet'
////          query: {deviceId: device.deviceId, deviceForm: device.deviceForm, groupId: device.groupId}
//        });
      },
      //删除日志
      deleteLog() {
        let arr = [];
        this.sels.forEach((item) => {
          arr.push(item.id);
        });
        this.$confirm('确认要删除该日志吗?', '提示', {type: 'info'}).then(() => {
          this.$post('/device/log/delete', arr, '删除成功').then((data) => {
            if ("000000" === data.code) {
              this.getLogList();
              this.sels = [];
            }
          }).catch((err) => {
          });
        }).catch(() => {
        });
      },
      //发送日志查询命令
      sendLogOrder() {
        this.$refs['sendOrder'].validate((valid) => {
          if (valid) {
            this.sendOrder.logEndTime = this.sendOrder.logStartTime[1] / 1000;
            this.sendOrder.logStartTime = this.sendOrder.logStartTime[0] / 1000;
            this.$post('/device/log/extract', this.sendOrder, '日志提取令下发成功', '日志提取命令下发失败');
            this.runningExtractLog = false;
          }
        });
      },
      clearData() {
        this.query = {page: 1, size: 10, deviceForm: '', moduleId: '', deviceId: ''};
        this.logStartTime = '';
        this.getLogList();
      },
      pageChange(index) {
        this.query.page = index;
        this.getLogList();
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'deviceForm') {
          for (let item of this.deviceForms) {
            if (item.code == row.deviceForm) {
              return item.name;
            }
          }
        } else if (column.property === 'moduleId') {
          return row.moduleId == 0 ? '移动' : row.moduleId == 1 ? '联通' : row.moduleId == 2 ? '电信' : '--';
        } else if (column.property === 'logType') {
          return row.logType == 0 ? 'srv' : row.logType == 1 ? 'enb_deamon' : row.logType == 2 ? 'enb' : row.logType == 3 ? 'kernel' : row.logType == 4 ? 'logserver' : '--';
        } else if (column.property === 'createTime') {
          return row.createTime ? $.Data.formatDate(new Date(row.createTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else if (column.property === 'logStartTime') {
          let start = row.logStartTime ? $.Data.formatDate(new Date(row.logStartTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
          let end = row.logEndTime ? $.Data.formatDate(new Date(row.logEndTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
          return start + " ~ " + end;
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      },
      handleSizeChange(val) {
        this.query.size = val;
        this.getLogList();
      },
      //日志列表查询
      getLogList() {
        if (this.query.deviceId) {
          if (noValidator(this.query.deviceId)) {
            this.$message.error('请输入正确的设备ID');
            return;
          }
        }
        if (!!this.logStartTime) {
          this.query.logEndTime = this.logStartTime[1] / 1000;
          this.query.logStartTime = this.logStartTime[0] / 1000;
        } else {
          delete this.query['logStartTime'];
          delete this.query['logEndTime'];
        }
        this.listLoading = true;
        this.$post('/device/log/query', this.query).then((data) => {
          this.logs = data.data.list;
          this.count = data.data.count;
          setTimeout(() => {
            this.listLoading = false
          }, 500);
        }).catch((err) => {
          this.listLoading = false;
          this.logs = [];
          this.$message.error(err);
        });
      },
      //获取设备类型和形态
      getDeviceTypeAndForm() {
        this.$post('device/get/deviceForm').then((data) => {
          if (data.code === '000000' && data.data) {
            this.deviceForms = data.data;
          }
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
      this.getDeviceList();
      this.getDeviceTypeAndForm();
      this.getLogList();
    },
    components: {
      headerTitle
    }
  }
</script>
