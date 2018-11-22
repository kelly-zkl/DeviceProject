<template>
  <div>
    <section class="content">
      <!--/去重总数{{couple}}条-->
      <el-row style="padding: 0;margin: 0">
        <el-col :span="12" style="text-align: left" align="left">
          <h4 style="text-align: left;margin-top: 0">IMSI数据
            <!--<span style="margin-left: 10px;font-size: 15px;color: #888" v-show="isShow">总数{{couple}}条</span>-->
          </h4>
        </el-col>
        <el-col :span="12" style="text-align: right" align="right">
          <el-button type="primary" v-show="activeName=='second'&&getButtonVial('terminate:export')"
                     size="medium" @click="exportData()">导出数据
          </el-button>
        </el-col>
      </el-row>
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="实时查询" name="first">
          <el-row style="margin:0 0 10px 0">
            <el-col :span="18" align="left">
              <el-input placeholder="设备ID" v-model="terminateQuery.deviceName" :maxlength="30" size="medium"
                        style="width: 160px;margin-right: 10px;margin-top: 10px"></el-input>
              <el-tooltip class="item" effect="dark" content="所属组织" placement="bottom">
                <el-select v-model="terminateQuery.groupId" placeholder="请选择组织" size="medium" filterable
                           style="width: 150px;margin-right: 10px;margin-top: 10px" @change="changeParam">
                  <el-option v-for="item in groups" :key="item.groupId" :label="item.groupName" :value="item.groupId">
                  </el-option>
                </el-select>
              </el-tooltip>
              <el-select v-model="terminateQuery.isp" placeholder="全部运营商" size="medium" filterable
                         style="width: 150px;margin-right: 10px;margin-top: 10px" @change="changeParam" clearable>
                <el-option v-for="item in options" :key="item.value" :label="item.label"
                           :value="item.value"></el-option>
              </el-select>
              <el-button type="primary" icon="search" style="margin-top: 10px"
                         @click="getTerminateData()" size="medium">搜索
              </el-button>
              <el-button style="margin-top: 10px" @click="clearTerminateData()" size="medium">清除</el-button>
            </el-col>
            <el-col :span="6" align="right">
              <el-button type="primary" @click="gotoWhite('blackManager')" style="margin-top: 10px"
                         v-show="getButtonVial('bwTerminate:queryBlack')" size="medium">黑名单管理
              </el-button>
              <el-button type="primary" @click="gotoWhite('whiteManager')" style="margin-top: 10px"
                         v-show="getButtonVial('bwTerminate:queryWhite')" size="medium">白名单管理
              </el-button>
            </el-col>
          </el-row>
          <el-table :data="terminateData" class="center-block" stripe>
            <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
            <el-table-column align="left" prop="deviceId" label="设备ID" min-width="150" max-width="250"
                             :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" prop="imei" label="IMEI" min-width="100" max-width="200"
                             :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" prop="imsi" label="IMSI" min-width="150" max-width="200"
                             :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" prop="tmsi" label="TMSI" min-width="100" max-width="200"
                             :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" prop="uptime" label="抓取时间" width="170"
                             :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" prop="isp" label="运营商" max-width="150" min-width="100"
                             :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" prop="netType" label="网络类型" max-width="150" min-width="100"></el-table-column>
            <el-table-column align="left" label="归属地" max-width="200" min-width="150" prop="regional"
                             :formatter="formatterAddress"></el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="历史数据" name="second">
          <el-row style="margin:0 0 10px 0">
            <el-col :span="18" align="left">
              <el-input placeholder="设备ID" v-model="query.deviceName" :maxlength="30" size="medium"
                        style="width: 160px;margin-right: 10px;margin-top: 10px"></el-input>
              <el-input placeholder="多个IMSI用,隔开" v-model="query.imsi" :maxlength="300" size="medium"
                        style="width: 160px;margin-right: 10px;margin-top: 10px"></el-input>
              <el-input placeholder="网络类型" v-model="query.netType" :maxlength="10" size="medium"
                        style="width: 160px;margin-right: 10px;margin-top: 10px"></el-input>
              <el-tooltip class="item" effect="dark" content="所属组织" placement="bottom">
                <el-select v-model="query.groupId" placeholder="请选择组织" size="medium" filterable
                           style="width: 150px;margin-right: 10px;margin-top: 10px">
                  <el-option v-for="item in groups" :key="item.groupId" :label="item.groupName" :value="item.groupId">
                  </el-option>
                </el-select>
              </el-tooltip>
              <el-select v-model="query.isp" placeholder="全部运营商" size="medium" filterable
                         style="width: 150px;margin-right: 10px;margin-top: 10px" clearable>
                <el-option v-for="item in options" :key="item.value" :label="item.label"
                           :value="item.value"></el-option>
              </el-select>
              <el-date-picker v-model="cTime" type="datetimerange" range-separator="至" start-placeholder="开始日期"
                              end-placeholder="结束日期" style="margin-top: 10px;margin-right: 10px"
                              value-format="timestamp" :picker-options="pickerBeginDate" size="medium"
                              :default-time="['00:00:00', '23:59:59']">
              </el-date-picker>
              <el-button type="primary" icon="search" style="margin-top: 10px"
                         @click="isSearch = true;getData();getCouple()" size="medium">搜索
              </el-button>
              <el-button style="margin-top: 10px" @click="clearData()" size="medium">清除</el-button>
            </el-col>
            <el-col :span="6" align="right">
              <el-button type="primary" @click="gotoWhite('blackManager')" style="margin-top: 10px"
                         v-show="getButtonVial('bwTerminate:queryBlack')" size="medium">黑名单管理
              </el-button>
              <el-button type="primary" @click="gotoWhite('whiteManager')" style="margin-top: 10px"
                         v-show="getButtonVial('bwTerminate:queryWhite')" size="medium">白名单管理
              </el-button>
            </el-col>
          </el-row>
          <el-table :data="list10" class="center-block" v-loading="listLoading" stripe>
            <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
            <el-table-column align="left" prop="deviceId" label="设备ID" min-width="150" max-width="250"
                             :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" prop="imei" label="IMEI" min-width="100" max-width="200"
                             :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" prop="imsi" label="IMSI" min-width="150" max-width="200"
                             :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" prop="tmsi" label="TMSI" min-width="100" max-width="200"
                             :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" prop="uptime" label="抓取时间" width="170"
                             :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" prop="isp" label="运营商" max-width="150" min-width="100"
                             :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" prop="netType" label="网络类型" max-width="150" min-width="100"></el-table-column>
            <el-table-column align="left" label="归属地" max-width="200" min-width="150" prop="regional"
                             :formatter="formatterAddress"></el-table-column>
          </el-table>

          <div class="block" style="margin-top: 20px">
            <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page="page"
                           :page-size="10" :total="count" background layout="prev, pager, next"></el-pagination>
          </div>
        </el-tab-pane>
      </el-tabs>
    </section>
  </div>
</template>

<script>
  import {noValidator} from "../../api";

  var fileDownload = require('js-file-download');
  let md5 = require("crypto-js/md5");

  export default {
    data() {
      return {
        activeName: 'first',
        fileList: [],
        cTime: [new Date(($.Data.formatDate(new Date(), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime(),
          new Date(($.Data.formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime()],
        count: 0,
        list: [],
        list10: [],
        isShow: false,
        listLoading: false,
        isFirst: true,
        isSearch: false,
        firstPage: 0,
        terminateData: [],
        terminateQuery: {
          size: 5, deviceId: this.$route.query.deviceId || '',
          groupId: JSON.parse(sessionStorage.getItem("user")).groupId
        },
        query: {
          size: 100, deviceId: this.$route.query.deviceId || '',
          groupId: JSON.parse(sessionStorage.getItem("user")).groupId
        },
        page: 1,
        options: [{value: '', label: '全部运营商'}, {value: '2', label: '电信'}, {value: '0', label: '移动'},
          {value: '1', label: '联通'}],
        type: '',
        intervalid: null,
        couple: 0,
        groups: [],
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
    //页面关闭时停止刷新
    beforeDestroy() {
      clearInterval(this.intervalid);
    },
    methods: {
      getButtonVial(msg) {
        return $.Button.buttonValidator(msg);
      },
      //导出数据
      exportData() {
        var param = Object.assign({}, this.query);
        delete param['size'];
        delete param['uptime'];
        delete param['netType'];
        if (this.cTime) {//时间戳的毫秒转化成秒
          param.startUploadTime = this.cTime[0] / 1000;
          param.endUploadTime = this.cTime[1] / 1000;
        }
        let config;
        if (sessionStorage.getItem("user")) {
          let userId = JSON.parse(sessionStorage.getItem("user")).userId;
          if (userId) {
            if (!param) {
              param = {}
            }
            let stringify = JSON.stringify(param);
            let token = md5(stringify + userId + "key-hz-20180123").toString();
            config = {headers: {token: token, tokenId: userId}, responseType: 'arraybuffer'};
          }
        }
        this.axios.post('/terminate/export', param, config).then((res) => {
          let fileStr = res.headers['content-disposition'].split(";")[1].split("filename=")[1];
          let fileName = decodeURIComponent(fileStr);
          fileDownload(res.data, fileName);
        }).catch(function (res) {
        });
      },
      handleClick(tab, event) {
        if (tab.name === 'first') {
          this.isShow = false;
          this.getTerminateData();
          this.dataTask();
        } else {
          clearInterval(this.intervalid);
          this.intervalid = null;
          this.isShow = true;
          this.getData();
          this.getCouple();
        }
      },
      //实时数据参数
      changeParam(val) {
        this.terminateData = [];
      },
      //定时刷新侦码数据
      dataTask() {
        if (!this.intervalid) {
          this.intervalid = setInterval(() => {
            this.getTerminateData();
          }, 2000);
        }
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'uptime') {
          return row.uptime ? $.Data.formatDate(new Date(row.uptime), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else if (column.property === 'isp') {
          return row.isp === 0 ? '移动' : row.isp === 1 ? '联通' : row.isp === 2 ? '电信' : '未知';
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      },
      //实时数据
      getTerminateData() {
        if (this.terminateQuery.deviceName) {
          if (noValidator(this.terminateQuery.deviceName)) {
            this.$message.error('请输入正确的设备设备ID');
            return;
          }
          this.terminateData = [];
        }
        if (this.terminateQuery.imsi) {
          if (!/[0-9]$/.test(this.terminateQuery.imsi)) {
            this.$message.error('请输入正确的imsi');
            return;
          }
          this.terminateData = [];
        }
        if (this.terminateQuery.netType) {
          if (!/[a-zA-Z0-9]$/.test(this.terminateQuery.netType)) {
            this.$message.error('请输入正确的网络类型');
            return;
          }
          this.terminateData = [];
        }
        this.terminateQuery.startUploadTime = (new Date(($.Data.formatDate(new Date(), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime()) / 1000;
        this.terminateQuery.endUploadTime = (new Date(($.Data.formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime()) / 1000;

        this.$post("terminate/queryNoCount", this.terminateQuery).then((data) => {
          if (this.terminateData.length >= 10) {
            this.terminateData = [];
          }
          if (this.terminateData.length === 0) {//
            data.data.forEach((item) => {
              if ((new Date().getTime() - item.uptime) >= -120 * 1000 && (new Date().getTime() - item.uptime) <= 120 * 1000) {//10s内的数据
                setTimeout(() => {
                  this.terminateData.push(item);
                }, 1000);
              }
            });
          } else {//
            data.data.forEach((item) => {
              if ((new Date().getTime() - item.uptime) >= -120 * 1000 && (new Date().getTime() - item.uptime) <= 120 * 1000) {//10s内的数据
                for (let terminate of this.terminateData) {
                  if (terminate.id === item.id) {
                    return;
                  }
                }
                setTimeout(() => {
                  this.terminateData.push(item);
                }, 1000);
              }
            });
          }
        }).catch((err) => {
          this.terminateData = [];
          this.$message.error(err);
        });
      },
      //历史数据
      getData() {
        if (this.query.deviceName) {
          if (noValidator(this.query.deviceName)) {
            this.$message.error('请输入正确的设备设备ID');
            return;
          }
        }
        if (this.query.imsi) {
          if (!/[0-9]$/.test(this.query.imsi)) {
            this.$message.error('请输入正确的imsi');
            return;
          }
        }
        if (this.query.netType) {
          if (!/[a-zA-Z0-9]$/.test(this.query.netType)) {
            this.$message.error('请输入正确的网络类型');
            return;
          }
        }
        if (this.cTime) {//时间戳的毫秒转化成秒
          this.query.startUploadTime = this.cTime[0] / 1000;
          this.query.endUploadTime = this.cTime[1] / 1000;
        }
        if (this.isSearch) {
          this.list = [];
          this.list10 = [];
          this.query.uptime = '';
          this.isSearch = false;
        }
        this.$post("/terminate/queryNoCount", this.query).then((data) => {
          if (this.query.uptime && !this.isSearch) {
            this.list = this.list.concat(data.data);
          } else {
            this.list = data.data;
            this.page = 1;
            this.firstPage = 0
          }
          this.list10 = this.list;
          if (this.list.length - this.page * 10 >= 0) {
            this.list10 = this.list10.slice((this.page * 10 - 10), (this.page * 10));
          } else {
            this.list10 = this.list10.slice((this.page * 10 - 10), this.list.length);
          }
          this.count = this.list.length;
          if (this.list.length - this.firstPage === 100) {
            this.isFirst = false;
          } else {
            this.isFirst = true;
          }
        }).catch((err) => {
          this.list = [];
          this.list10 = [];
          this.$message.error(err);
        });
      },
      //跳转到黑/白名单
      gotoWhite(path) {
        sessionStorage.setItem("activeName", this.activeName);
        sessionStorage.setItem("cTime", this.cTime);
        if (this.activeName === 'first') {
          sessionStorage.setItem("query", JSON.stringify(this.terminateQuery));
        } else {
          sessionStorage.setItem("query", JSON.stringify(this.query));
        }
        this.$router.push({path: path});
      },
      pageChange(index) {
        this.page = index;
        if (!this.isFirst && this.list.length > this.firstPage) {
          this.isFirst = true;
        }
        if ((Math.ceil(this.list.length / 10) - index) <= 5 && this.isFirst &&
          (this.list.length % 100 === 0 || this.list.length === this.couple)) {
          this.firstPage = this.list.length;
          this.query.uptime = this.list[this.list.length - 1].uptime / 1000;
          this.getData();
        }
        if ((index % 10) === 3) {
          this.getCouple();
        }
        this.list10 = this.list;
        if ((this.list.length - (index * 10)) >= 0) {
          this.list10 = this.list10.slice((index * 10 - 10), (index * 10));
        } else {
          this.list10 = this.list10.slice((index * 10 - 10), this.list.length);
        }
      },
      handleSizeChange(val) {
//        this.query.size = val;
      },
      clearTerminateData() {
        this.terminateQuery = {
          size: 5, deviceId: this.$route.query.deviceId || '',
          groupId: JSON.parse(sessionStorage.getItem("user")).groupId
        };
        this.terminateData = [];
        this.getTerminateData();
      },
      clearData() {
        this.query = {
          size: 100, deviceId: this.$route.query.deviceId || '',
          groupId: JSON.parse(sessionStorage.getItem("user")).groupId
        };
        this.cTime = [new Date(($.Data.formatDate(new Date(), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime(),
          new Date(($.Data.formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime()];
        this.$refs.sort.columnConfig.order = '';
        this.isSearch = true;
        this.getData();
        this.getCouple();
      },
      //查找侦码总数
      getCouple() {
        if (this.cTime) {//时间戳的毫秒转化成秒
          this.query.startUploadTime = this.cTime[0] / 1000;
          this.query.endUploadTime = this.cTime[1] / 1000;
        }
        let cQuery = {
          isp: this.query.isp, deviceId: this.query.deviceId, netType: this.query.netType,
          imsi: this.query.imsi, groupId: this.query.groupId
        };
        this.$post('/terminate/findCount', cQuery).then((data) => {
          this.couple = data.data;
        });
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
      let bol = JSON.parse(sessionStorage.getItem("query"));
      let tab = sessionStorage.getItem("activeName");
      let time1 = sessionStorage.getItem("cTime");
      if (tab && bol) {
        this.activeName = tab;
        if (tab === 'first') {
          this.terminateQuery = JSON.parse(sessionStorage.getItem("query"));
        } else {
          this.query = JSON.parse(sessionStorage.getItem("query"));
        }
      }
      if (time1) {
        this.cTime = time1.split(',');
      }
      this.isSearch = true;
      this.getTerminateData();
      this.getAllGroups();
      this.dataTask();
    }
  }
</script>
