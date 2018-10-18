<template>
  <div>
    <section class="content">
      <headerTitle></headerTitle>
      <div class="center-block">
        <el-tabs v-model="activeName" @tab-click="handleClick" style="margin-top: 20px">
          <el-tab-pane label="当前告警" name="untreated">
            <el-row style="margin:0 0 10px 0">
              <el-col :span="14" align="left">
                <el-input placeholder="设备ID" v-model="query.deviceId" :maxlength="30" size="medium"
                          style="width: 150px;margin-right: 10px;margin-top: 10px"></el-input>
                <el-select v-model="query.wrType" placeholder="告警类型" size="medium" filterable
                           style="width: 200px;margin-right: 10px;margin-top: 10px">
                  <el-option v-for="item in alarmTypes" :key="item.type" :label="item.name" :value="item.type">
                  </el-option>
                </el-select>
                <el-select v-model="query.alarmLevel" placeholder="全部告警等级" filterable
                           style="width: 120px;margin-top: 10px" size="medium" clearable>
                  <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
                <el-tooltip class="item" effect="dark" content="所属组织" placement="bottom">
                  <el-select v-model="query.groupId" placeholder="请选择组织" size="medium" filterable
                             style="width: 150px;margin-right: 10px;margin-top: 10px">
                    <el-option v-for="item in groups" :key="item.groupId" :label="item.groupName" :value="item.groupId">
                    </el-option>
                  </el-select>
                </el-tooltip>
                <el-button type="primary" icon="search" style="margin-top: 10px;margin-left: 10px"
                           @click="query.page=1;getData()" size="medium">搜索
                </el-button>
                <el-button style="margin-top: 10px" @click="clearData()" size="medium">清除</el-button>
              </el-col>
              <el-col :span="10" align="right" v-show="getButtonVial('alarm:batchUpdateStatus')">
                <el-button type="primary" plain style="margin-top: 10px" :disabled="sels.length == 0"
                           @click="updateStatus(0,'HANDLED')" size="medium">已处理
                </el-button>
                <el-button type="primary" plain style="margin-top: 10px" :disabled="sels.length == 0"
                           @click="updateStatus(0,'REPAIR')" size="medium">已报修
                </el-button>
                <el-button type="primary" plain style="margin-top: 10px" :disabled="sels.length == 0"
                           @click="updateStatus(0,'IGNORE')" size="medium">忽略
                </el-button>
                <el-button type="primary" plain style="margin-top: 10px" :disabled="sels.length == 0"
                           @click="updateStatus(0,'FALSE_ALARM')" size="medium">误报
                </el-button>
                <el-button style="margin-top: 10px" type="primary" @click="gotoSet()"
                           v-show="getButtonVial('alarm:updateAlarmSet')" size="medium">告警设置
                </el-button>
              </el-col>
            </el-row>
            <el-table :data="warningList" v-loading="listLoading" class="center-block"
                      @selection-change="selsChange" stripe>
              <el-table-column type="selection" width="50" align="left"></el-table-column>
              <el-table-column align="left" label="告警名称" min-width="150"
                               max-width="250" :formatter="formatterType"></el-table-column>
              <el-table-column align="left" prop="msg" label="告警详情" min-width="150"
                               max-width="250" :formatter="formatterAddress"></el-table-column>
              <el-table-column align="left" label="告警等级" max-width="200" min-width="100"
                               :formatter="formatterLevel"></el-table-column>
              <el-table-column align="left" prop="wrType" label="告警代码" min-width="100"
                               max-width="200" :formatter="formatterAddress"></el-table-column>
              <el-table-column align="left" prop="deviceId" label="目标设备（ID）" min-width="140"
                               max-width="200" :formatter="formatterAddress"></el-table-column>
              <el-table-column align="left" prop="model" label="上报时间" min-width="160"
                               max-width="200" :formatter="formatTime"></el-table-column>
              <el-table-column align="left" prop="status" label="告警状态" min-width="100"
                               max-width="200" :formatter="formatterAddress"></el-table-column>
              <el-table-column align="center" label="操作" width="120">
                <template slot-scope="scope">
                  <el-popover placement="left" width="130" trigger="hover" visible-arrow>
                    <el-row>
                      <el-col :span="24">
                        <el-button type="text" @click.stop="updateStatus(scope.row.id,'HANDLED')" style="width: 100%">
                          已处理
                        </el-button>
                      </el-col>
                    </el-row>
                    <el-row>
                      <el-col :span="24">
                        <el-button type="text" @click.stop="updateStatus(scope.row.id,'REPAIR')" style="width: 100%">已报修
                        </el-button>
                      </el-col>
                    </el-row>
                    <el-row>
                      <el-col :span="24">
                        <el-button type="text" @click.stop="updateStatus(scope.row.id,'IGNORE')" style="width: 100%">忽略
                        </el-button>
                      </el-col>
                    </el-row>
                    <el-row>
                      <el-col :span="24">
                        <el-button type="text" @click.stop="updateStatus(scope.row.id,'FALSE_ALARM')"
                                   style="width: 100%">误报
                        </el-button>
                      </el-col>
                    </el-row>
                    <el-button class="wrench" slot="reference" v-show="getButtonVial('alarm:batchUpdateStatus')">
                    </el-button>
                  </el-popover>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="已处理告警" name="processed">
            <el-row style="margin:0 0 10px 0">
              <el-col :span="18" align="left">
                <el-input placeholder="设备ID" v-model="query.deviceId" :maxlength="30" size="medium"
                          style="width: 150px;margin-right: 10px;margin-top: 10px"></el-input>
                <el-select v-model="query.wrType" placeholder="告警类型" size="medium" filterable
                           style="width: 200px;margin-right: 10px;margin-top: 10px">
                  <el-option v-for="item in alarmTypes" :key="item.type" :label="item.name" :value="item.type">
                  </el-option>
                </el-select>
                <el-select v-model="query.alarmLevel" placeholder="告警等级" filterable
                           style="width: 120px;margin-top: 10px" size="medium" clearable>
                  <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
                <el-tooltip class="item" effect="dark" content="所属组织" placement="bottom">
                  <el-select v-model="query.groupId" placeholder="请选择组织" size="medium" filterable
                             style="width: 150px;margin-right: 10px;margin-top: 10px">
                    <el-option v-for="item in groups" :key="item.groupId" :label="item.groupName" :value="item.groupId">
                    </el-option>
                  </el-select>
                </el-tooltip>
                <el-button type="primary" icon="search" style="margin-left: 10px;margin-top: 10px"
                           @click="query.page=1;getData()" size="medium">搜索
                </el-button>
                <el-button style="margin-top: 10px" @click="clearData()" size="medium">清除</el-button>
              </el-col>
              <el-col :span="6" align="right">
                <el-button style="margin-top: 10px" type="primary" @click="gotoSet()"
                           v-show="getButtonVial('alarm:updateAlarmSet')" size="medium">告警设置
                </el-button>
              </el-col>
            </el-row>
            <el-table :data="warningList" v-loading="listLoading" class="center-block" stripe>
              <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
              <el-table-column align="left" label="告警名称" min-width="100"
                               max-width="200" :formatter="formatterType"></el-table-column>
              <el-table-column align="left" prop="msg" label="告警详情" min-width="150"
                               max-width="250" :formatter="formatterAddress"></el-table-column>
              <el-table-column align="left" label="告警等级" max-width="200"
                               min-width="100" :formatter="formatterLevel"></el-table-column>
              <el-table-column align="left" prop="wrType" label="告警代码" min-width="100"
                               max-width="200" :formatter="formatterAddress"></el-table-column>
              <el-table-column align="left" prop="deviceId" label="目标设备（ID）" min-width="140"
                               max-width="250" :formatter="formatterAddress"></el-table-column>
              <el-table-column align="left" label="上报时间" min-width="160"
                               max-width="200" :formatter="formatTime"></el-table-column>
              <el-table-column align="left" prop="status" label="告警处理" min-width="100"
                               max-width="200" :formatter="formatterAddress"></el-table-column>
              <el-table-column align="left" label="告警处理时间" min-width="160" prop="handlerTime"
                               max-width="200" :formatter="formatTime"></el-table-column>
              <el-table-column align="left" prop="handlerBy" label="操作人" min-width="100"
                               max-width="200" :formatter="formatterAddress"></el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
        <div class="block" style="margin-top: 20px">
          <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page="query.page"
                         :page-sizes="[10, 15, 20, 30]" :page-size="query.size" :total="count" background
                         layout="total, sizes, prev, pager, next, jumper"></el-pagination>
        </div>
      </div>
    </section>
  </div>
</template>
<script>
  import {noValidator} from "../../api";
  import headerTitle from "../publicComponents/headerTitle.vue";

  function getQuery() {
    let query = JSON.parse(sessionStorage.getItem("query"));
    if (!query) {
      query = {
        page: 1, size: 10, wrType: '0', alarmLevel: '', deviceId: '',
        groupId: JSON.parse(sessionStorage.getItem("user")).groupId
      }
    }
    return query;
  }

  export default {
    data() {
      return {
        warningList: [],
        listLoading: false,
        count: 0,
        query: getQuery(),
        alarmTypes: [{type: '0', name: "全部类型"}],
        options: [{value: '', label: '全部等级'}, {value: 'SERIOUS', label: '严重'}, {value: 'NORMAL', label: '普通'}],
        activeName: 'untreated',
        sels: [],
        groups: []
      }
    },
    methods: {
      getButtonVial(msg) {
        return $.Button.buttonValidator(msg);
      },
      selsChange(sels) {
        this.sels = sels;
      },
      handleClick(tab, event) {
        this.query = {
          page: 1, size: 10, wrType: 0, alarmLevel: '', deviceId: '',
          groupId: JSON.parse(sessionStorage.getItem("user")).groupId
        };
        if (tab.name === 'untreated') {
          this.query.statusArray = undefined;
          this.query.status = 'UNHANDLED';
        } else {
          this.query.status = undefined;
          this.query.statusArray = ['IGNORE', 'HANDLED', 'FALSE_ALARM', 'REPAIR'];
        }
        this.getData();
      },
      //告警设置
      gotoSet() {
        sessionStorage.setItem("activeName", this.activeName);
        sessionStorage.setItem("query", JSON.stringify(this.query));
        this.$router.push({path: '/warningSet'});
      },
      pageChange(index) {
        this.query.page = index;
        this.getData();
      },
      handleSizeChange(val) {
        this.query.size = val;
        this.getData();
      },
      clearData() {
        this.query = {
          page: 1, size: 10, alarmLevel: '', wrType: 0, deviceId: '',
          groupId: JSON.parse(sessionStorage.getItem("user")).groupId
        };
        if (this.activeName === 'untreated') {
          this.query.statusArray = undefined;
          this.query.status = 'UNHANDLED';
        } else {
          this.query.status = undefined;
          this.query.statusArray = ['IGNORE', 'HANDLED', 'FALSE_ALARM', 'REPAIR'];
        }
        this.getData();
      },
      getData() {
        if (this.query.deviceId) {
          if (noValidator(this.query.deviceId)) {
            this.$message.error('请输入正确的设备ID');
            return;
          }
        }
        this.listLoading = true;
        this.$post("alarm/get/list", this.query).then((data) => {
          this.warningList = data.data.list;
          this.count = data.data.count;
          setTimeout(() => {
            this.listLoading = false
          }, 500);
        }).catch((err) => {
          this.listLoading = false;
          this.warningList = [];
          this.$message.error(err);
        });
      },
      formatterLevel(row, column) {
        return row.alarmLevel && row.alarmLevel === 'SERIOUS' ? "严重" : "普通";
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'status') {
          return row[column.property] === 'HANDLED' ? '已处理' : row[column.property] === 'IGNORE' ? '忽略' :
            row[column.property] === 'FALSE_ALARM' ? '误报' : row[column.property] === 'REPAIR' ? '已报修' : '未处理';
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      },
      formatterType(row, column) {
        let nType = "--";
        if (this.alarmTypes && this.alarmTypes.length > 0) {
          for (let item of this.alarmTypes) {
            if (row.wrType == item.type) {
              nType = item.name;
              break;
            }
          }
        }
        return nType;
      },
      //获取告警类型
      getAlarmType() {
        this.$post('alarm/get/alarmType').then((data) => {
          if (data.code === '000000' && data.data) {
            this.alarmTypes = data.data;
            this.alarmTypes.unshift({type: 0, name: "全部类型"});
          }
        });
      },
      formatTime(row, column) {
        if (column.property === 'handlerTime') {
          return row.handlerTime ? $.Data.formatDate(new Date(row.handlerTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else {
          return row.time ? $.Data.formatDate(new Date(row.time * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
        }
      },
      updateStatus(id, status) {
        let param = [];
        if (id == 0) {
          for (let item of this.sels) {
            param.push({
              handlerBy: JSON.parse(sessionStorage.getItem("user")).account,
              id: item.id, status: status
            })
          }
        } else {
          param.push({
            handlerBy: JSON.parse(sessionStorage.getItem("user")).account,
            id: id, status: status
          })
        }
        this.$post('alarm/batchUpdateStatus/', param, '处理成功', '处理失败').then((data) => {
          this.getData();
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
      if (tab && bol) {
        this.activeName = tab;
      } else {
        this.query.statusArray = undefined;
        this.query.status = 'UNHANDLED';
      }
      this.getData();
      this.getAllGroups();
      this.getAlarmType();
    },
    components: {
      headerTitle
    }
  }
</script>
<style scoped>
  .wrench, .wrench:visited, .wrench:link, .wrench:active, .wrench:focus {
    width: 30px;
    height: 30px;
    background: url("../../assets/img/icon_wrench.png") no-repeat center;
    border: none;
  }

  .wrench:hover {
    background: none;
    font-size: 0;
  }

  .wrench:hover:before {
    color: #539FF8;
    content: '处理';
    font-size: 12px;
    margin-top: -5px;
    margin-left: -10px;
  }
</style>
