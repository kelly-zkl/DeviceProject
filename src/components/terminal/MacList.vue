<template>
  <section class="content">
    <h4 style="text-align: left;margin-top: 0">MAC数据
      <span style="color: #666;font-size: 14px;margin-left: 10px">总数{{couple}}条</span>
    </h4>
    <!--<headerTitle></headerTitle>-->
    <el-row style="margin-top: 20px;margin-bottom: 10px">
      <el-col :span="20" align="left">
        <el-input placeholder="设备ID" v-model="query.deviceId" :maxlength="30"
                  style="width: 180px;margin-right: 10px;margin-top: 10px" size="medium"></el-input>
        <el-input placeholder="MAC" v-model="query.mac" :maxlength="30"
                  style="width: 180px;margin-right: 10px;margin-top: 10px" size="medium"></el-input>
        <el-input placeholder="BSSID" v-model="query.bssid" :maxlength="30"
                  style="width: 180px;margin-right: 10px;margin-top: 10px" size="medium"></el-input>
        <el-input placeholder="ESSID" v-model="query.essid" :maxlength="30"
                  style="width: 180px;margin-right: 10px;margin-top: 10px" size="medium"></el-input>
        <el-tooltip class="item" effect="dark" content="所属组织" placement="bottom">
          <el-select v-model="query.groupId" placeholder="请选择组织" size="medium" filterable
                     style="width: 150px;margin-right: 10px;margin-top: 10px">
            <el-option v-for="item in groups" :key="item.groupId" :label="item.groupName" :value="item.groupId">
            </el-option>
          </el-select>
        </el-tooltip>
        <el-date-picker v-model="cTime" type="datetimerange" range-separator="至" start-placeholder="开始日期"
                        end-placeholder="结束日期" style="margin-top: 10px;margin-right: 10px"
                        value-format="timestamp" :picker-options="pickerBeginDate" size="medium"
                        :default-time="['00:00:00', '23:59:59']">
        </el-date-picker>
        <el-button type="primary" icon="search" style="margin-top: 10px"
                   @click.stop="isSearch = true;getMacList();getCouple()" size="medium">搜索
        </el-button>
        <el-button style="margin-top: 10px" @click.stop="clearData()" size="medium">清除</el-button>
      </el-col>
      <el-col :span="4" style="text-align: right" align="right">
        <el-button type="primary" size="medium" @click="exportData()" v-show="getButtonVial('wifi:export')">导出数据
        </el-button>
      </el-col>
    </el-row>
    <el-table :data="list10" class="center-block" v-loading="listLoading" stripe>
      <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
      <el-table-column align="left" prop="deviceId" label="设备ID" min-width="120" max-width="200"
                       :formatter="formatterAddress"></el-table-column>
      <el-table-column align="left" prop="mac" label="MAC" min-width="170" max-width="250"
                       :formatter="formatterAddress"></el-table-column>
      <el-table-column align="left" label="BSSID" max-width="250" min-width="170" prop="bssid"
                       :formatter="formatterAddress"></el-table-column>
      <el-table-column align="left" prop="essid" label="ESSID" min-width="170" max-width="250"
                       :formatter="formatterAddress"></el-table-column>
      <el-table-column align="left" prop="firstTime" label="首次出现时间" max-width="250" min-width="170"
                       :formatter="formatterAddress"></el-table-column>
      <el-table-column align="left" prop="onLineTime" label="上线时间" max-width="250" min-width="170"
                       :formatter="formatterAddress"></el-table-column>
      <el-table-column align="left" prop="offLineTime" label="下线时间" max-width="250" min-width="170"
                       :formatter="formatterAddress"></el-table-column>
      <el-table-column align="left" prop="createTime" label="上报时间" max-width="250" min-width="170"
                       :formatter="formatterAddress"></el-table-column>
    </el-table>
    <div class="block" style="margin-top: 20px">
      <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page="page"
                     :page-size="10" :total="count" background layout="prev, pager, next"></el-pagination>
    </div>
  </section>
</template>
<script>
  import headerTitle from "../publicComponents/headerTitle.vue";
  import {noSValidator, noValidator, macVal, isMac} from "../../api";

  var fileDownload = require('js-file-download');

  export default {
    data() {
      return {
        listLoading: false,
        list: [],
        list10: [],
        query: {
          size: 100, deviceId: '', mac: '', bssid: '', essid: '',
          groupId: JSON.parse(sessionStorage.getItem("user")).groupId
        },
        isFirst: true,
        isSearch: false,
        firstPage: 0,
        page: 1,
        couple: 0,
        count: 0,
        groups: [],
        cTime: [new Date(($.Data.formatDate(new Date(), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime(),
          new Date(($.Data.formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime()],
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
      //导出数据
      exportData() {
        var param = Object.assign({}, this.query);
        delete param['size'];
        if (this.cTime) {//时间戳的毫秒转化成秒
          param.startUploadTime = this.cTime[0] / 1000;
          param.endUploadTime = this.cTime[1] / 1000;
        }
        this.axios.post('/wifi/export', param, {responseType: 'arraybuffer'}).then((res) => {
          let fileStr = res.headers['content-disposition'].split(";")[1].split("filename=")[1];
          let fileName = decodeURIComponent(fileStr);
          fileDownload(res.data, fileName);
        }).catch(function (res) {
        });
      },
      //获取mac采集的列表
      getMacList() {
        if (this.query.deviceId) {
          if (noValidator(this.query.deviceId)) {
            this.$message.error('请输入正确的设备id，由英文字母、数字、下划线组成');
            return;
          }
        }
        if (this.query.mac) {
          if (!macVal(this.query.mac)) {
            this.$message.error('请输入正确的MAC地址');
            return;
          }
        }
        if (this.query.bssid) {
          if (!macVal(this.query.bssid)) {
            this.$message.error('请输入正确的BSSID');
            return;
          }
        }
        if (this.query.essid) {
          if (noValidator(this.query.essid)) {
            this.$message.error('请输入正确的ESSID');
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
          this.query.createTime = '';
          this.isSearch = false;
        }
        this.$post("/wifi/queryNoCount", this.query).then((data) => {
          if (this.query.createTime && !this.isSearch) {
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
      //分页
      pageChange(index) {
        this.page = index;
        if (!this.isFirst && this.list.length > this.firstPage) {
          this.isFirst = true;
        }
        if ((Math.ceil(this.list.length / 10) - index) <= 5 && this.isFirst &&
          (this.list.length % 100 === 0 || this.list.length === this.couple)) {
          this.firstPage = this.list.length;
          this.query.createTime = this.list[this.list.length - 1].createTime;
          this.getMacList();
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
      //清除查询条件
      clearData() {
        this.query = {
          size: 100, deviceId: '', mac: '', bssid: '', essid: '',
          groupId: JSON.parse(sessionStorage.getItem("user")).groupId
        };
        this.cTime = [new Date(($.Data.formatDate(new Date(), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime(),
          new Date(($.Data.formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime()];
        this.getMacList();
        this.getCouple();
      },
      //查找mac记录的总数
      getCouple() {
        let cQuery = {
          mac: this.query.mac, bssid: this.query.bssid, essid: this.query.essid,
          deviceId: this.query.deviceId, groupId: this.query.groupId
        };
        this.$post('/wifi/findCount', cQuery).then((data) => {
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
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'firstTime' || column.property === 'onLineTime' || column.property === 'offLineTime' || column.property === 'createTime') {
          return row[column.property] ? row[column.property] !== 0 ? $.Data.formatDate(new Date(row[column.property] * 1000), 'yyyy-MM-dd hh:mm:ss') : '--' : '--';
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      }
    },
    mounted() {
      this.getAllGroups();
      this.getMacList();
      this.getCouple();
    },
    components: {
      headerTitle
    }
  }
</script>
<style>

</style>
