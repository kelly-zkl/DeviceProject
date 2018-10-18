<template>
  <div>
    <section class="content">
      <h4 style="text-align: left">版本推送 </h4>
      <br/>
      <el-form ref="form" :model="form" label-width="100px" :label-position="labelPosition" style="margin-left: 15px">
        <el-form-item label="推送版本" style="text-align: left">
          <el-select v-model="form.versionId" placeholder="请选择" filterable>
            <el-option v-for="item in versions" :key="item.id" :label="item.versionNum" :value="item.id"
                       v-show="deviceForm == item.deviceForm">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="目标设备" style="text-align: left">
          <el-button type="primary" @click="chooseDevice">选择设备</el-button>
          <p style="color:#888;margin-top: 20px">已选<span style="color:#FF6600">{{sels.length}}</span>台设备</p>
        </el-form-item>
        <!--<el-form-item label="基带板" v-show="applyType == 'BASEBAND'" style="text-align: left" required>-->
        <!--<el-select v-model="form.baseband" placeholder="请选择" filterable>-->
        <!--<el-option v-for="item in baseBands" :key="item.code" :label="item.name" :value="item.code">-->
        <!--</el-option>-->
        <!--</el-select>-->
        <!--</el-form-item>-->
        <el-form-item label="推送时间段" style="text-align: left">
          <el-radio-group v-model="form.pushType" @change="chooseTime">
            <el-radio :label="'NOW'">立即</el-radio>
            <el-radio :label="'TIMING'">定时</el-radio>
          </el-radio-group>
          <p v-show="form.pushType == 'TIMING'" style="margin-top: 10px">
            <el-date-picker v-model="currentTime" type="datetimerange" range-separator="至" start-placeholder="开始日期"
                            end-placeholder="结束日期" :picker-options="pickerBeginDate">
            </el-date-picker>
          </p>
        </el-form-item>
        <el-form-item style="text-align: left;margin-top: 40px">
          <el-button type="primary" @click.native="confirmPush()">确认推送</el-button>
        </el-form-item>
      </el-form>
      <!--选择目标设备-->
      <el-dialog title="选择目标设备" :visible.sync="dialogDevice" :width="dialogWidth">
        <el-row style="margin-bottom: 15px">
          <el-col :span="24" align="left">
            <el-input placeholder="设备名称/ID" v-model="query.deviceName" :maxlength="30"
                      style="width: 150px;margin-right: 10px;margin-top: 10px"></el-input>
            <el-select v-model="query.deviceType" placeholder="全部类型" filterable
                       style="width: 150px;margin-right: 10px;margin-top: 10px" clearable>
              <el-option v-for="item in deviceTypes" :key="item.code" :label="item.name" :value="item.code">
              </el-option>
            </el-select>
            <el-button type="primary" icon="search" style="margin-top: 10px" @click.stop="query.page=1;getData()">搜索
            </el-button>
            <el-button style="margin-top: 10px" @click.stop="clearData()">清除</el-button>
          </el-col>
        </el-row>
        <el-table ref="deviceTable" :data="deviceList" v-loading="listLoading" class="center-block"
                  @selection-change="selsChange" stripe>
          <el-table-column type="selection" width="45" align="left"></el-table-column>
          <el-table-column align="left" prop="deviceId" label="设备ID" min-width="100" max-width="250"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" prop="deviceName" label="设备名称" min-width="100" max-width="250"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" prop="deviceTypeVal" label="类型" min-width="110" max-width="250"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" prop="deviceFormVal" label="形态" min-width="125" max-width="250"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" prop="detailAddress" label="位置" min-width="125" max-width="250"
                           :formatter="formatterAddress"></el-table-column>
        </el-table>
        <div class="block" style="margin-top: 20px">
          <el-pagination
            @size-change="handleSizeChange" @current-change="pageChange" :current-page="query.page" background
            :page-sizes="[10, 15, 20, 30]" :page-size="query.size" layout="total, sizes, prev, pager, next, jumper"
            :total="count"></el-pagination>
        </div>
        <el-row style="margin-top: 30px">
          <el-col :span="8" style="text-align: left">
            <!--<el-checkbox v-model="checkAll" style="margin-right: 15px" @change="handleCheckAll">全选</el-checkbox>-->
            <span style="text-align: left">已选<span style="color:#FF6600">{{sels.length}}</span>台/总计<span
              style="color:#20A0FF">{{count}}</span>台</span>
          </el-col>
          <el-col :span="8">
            <el-button type="primary" @click="dialogDevice = false">确认选择</el-button>
          </el-col>
        </el-row>
      </el-dialog>
    </section>
  </div>
</template>
<script>
  import {noSValidator} from "../../api";

  export default {
    data() {
      return {
        dialogWidth: $.Device.isPC() ? '60%' : '92%',
        deviceForm: this.$route.query.deviceForm || '',
        applyType: this.$route.query.applyType || '',
        form: {versionId: this.$route.query.versionId, pushType: 'NOW'},
        labelPosition: 'left',
        dialogDevice: false,
        deviceList: [],
        listLoading: false,
        checkAll: false,
        query: {page: 1, size: 10, deviceType: '', deviceName: ''},
        count: 0,
        sels: [],
        deviceTypes: [],
        versions: [],
        currentTime: [new Date(), new Date(new Date().getTime() + (60 * 65 * 1000))],
        pickerBeginDate: {
          disabledDate: (time) => {
            let beginDateVal = this.currentTime[0].getTime();
            if (beginDateVal) {
              return time.getTime() < beginDateVal;
            }
          }
        },
        baseBands: [{name: 'GSM_1', code: 'GSM_1'}, {name: 'FDDLTE_2', code: 'FDDLTE_2'},
          {name: 'FDDLTE_3', code: 'FDDLTE_3'}, {name: 'TDDLTE_4', code: 'TDDLTE_4'},
          {name: 'TDDLTE_5', code: 'TDDLTE_5'}]
      }
    },
    methods: {
      //选择设备
      chooseDevice() {
        if (!this.form.versionId) {
          this.$message.error('请选择推送版本');
          return;
        }
        this.getData();
        this.dialogDevice = true;
      },
      //设备当前页全选
      selsChange(sels) {
        this.sels = sels;
        this.form.deviceList = [];
        for (let item of this.sels) {
          this.form.deviceList.push(item.deviceId);
        }
      },
      //全选
      handleCheckAll(val) {
        if (val) {
          this.query.size = this.count;
          this.$post("device/query", this.query).then((data) => {
            this.deviceList = data.data.list;
            this.count = data.data.count;
            for (let device of this.deviceList) {
              console.log(device.deviceId);
              this.$refs.deviceTable.toggleRowSelection(device);
            }
          });
        } else {
          this.$refs.deviceTable.clearSelection();
        }
      },
      //选择推送时间段
      chooseTime(val) {
        if (val === 'TIMING') {
          this.currentTime = [new Date(), new Date(new Date().getTime() + (60 * 65 * 1000))];
        }
      },
      //确认推送
      confirmPush() {
        if (!this.form.versionId) {
          this.$message.error('请选择推送版本');
          return;
        }
        if (!this.form.deviceList) {
          this.$message.error('请选择目标设备');
          return;
        }
//        if (this.applyType === 'BASEBAND') {
//          if (!this.form.baseband) {
//            this.$message.error('请选择基带板');
//            return;
//          }
//        }
        if (this.form.pushType === 'TIMING') {
          this.form.pushStart = parseInt(this.currentTime[0].getTime() / 1000);
          this.form.pushEnd = parseInt(this.currentTime[1].getTime() / 1000);
          if (this.form.pushEnd - this.form.pushStart < (60 * 60)) {
            this.$message.error('起始时间间隔不能低于1小时');
            return;
          }
        }

        this.form.deviceForm = this.$route.query.deviceForm;
        this.form.createBy = JSON.parse(sessionStorage.getItem("user")).account;
        this.$post("/version/push", this.form, '版本升级命令推送成功', '版本升级命令推送失败').then((data) => {
          if ("000000" === data.code) {
            this.$router.go(-1);
          }
        });
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
        this.query = {page: 1, size: 10, deviceType: '', deviceName: ''};
        this.query.deviceForm = this.$route.query.deviceForm;
        this.getData();
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
      },
      //获取设备类型和形态
      getDeviceTypeAndForm() {
        this.$post('device/get/deviceType').then((data) => {
          if (data.code === '000000' && data.data) {
            this.deviceTypes = data.data;
            this.deviceTypes.unshift({code: '', name: "全部类型"});
          }
        });
      },
      getAllVersion() {
        this.$post('/version/query', {page: 1, size: 1000, versionType: 'RELEASE'}).then((data) => {
          this.versions = data.data.list;
          this.$post('/version/query', {page: 1, size: 1000, versionType: 'PATCH'}).then((data) => {
            data.data.list.forEach((item) => {
              let param = {versionNum: item.patchVersionNum, id: item.id, deviceForm: item.deviceForm};
              this.versions.push(param);
            });
          });
        });
      },
    },
    mounted() {
      this.query.deviceForm = this.$route.query.deviceForm;
      this.applyType = this.$route.query.applyType || '';
      this.getAllVersion();
      this.getDeviceTypeAndForm();
    }
  }
</script>
