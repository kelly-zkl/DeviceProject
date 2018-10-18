<template>
  <div>
    <section class="content">
      <h4 style="text-align: left">升级记录 <span
        style="margin-left:10px;font-size: 15px;color: #888">{{versionNum}}</span></h4>
      <br/>
      <div class="center-block add-appdiv">
        <el-tabs :tab-position="'left'" @tab-click="handleClick" v-model="activeItem" v-if="activeName.length > 0">
          <el-tab-pane v-bind:label="tab.dateStr" v-for="tab in activeName" :key="tab.id" v-bind:name="tab.id"
                       style="padding-left: 20px">
            <el-row>
              <el-col :span="16" align="left">
                <el-input placeholder="设备ID" v-model="query.deviceId" :maxlength="30" size="medium"
                          style="width: 150px;margin-right: 10px;margin-top: 10px"></el-input>
                <el-select v-model="query.deviceForm" placeholder="全部形态" filterable size="medium"
                           style="width: 150px;margin-right: 10px;margin-top: 10px" clearable>
                  <el-option v-for="item in deviceForms" :key="item.code" :label="item.name" :value="item.code">
                  </el-option>
                </el-select>
                <el-select v-model="query.deviceType" placeholder="全部类型" filterable size="medium"
                           style="width: 150px;margin-right: 10px;margin-top: 10px" clearable>
                  <el-option v-for="item in deviceTypes" :key="item.code" :label="item.name" :value="item.code">
                  </el-option>
                </el-select>
                <el-button type="primary" icon="search" style="margin-top: 10px"
                           @click.stop="query.page=1;getUpdateData()" size="medium">搜索
                </el-button>
                <el-button style="margin-top: 10px" @click.stop="clearData()" size="medium">清除</el-button>
              </el-col>
              <el-col :span="8" align="right">
                <el-radio-group v-model="query.upgradeStatus" style="margin-top: 10px"
                                @change="changeStatus" size="medium">
                  <el-radio-button label="FINISH">升级成功</el-radio-button>
                  <el-radio-button label="SENDED">未升级</el-radio-button>
                  <el-radio-button label="FAILE">升级失败</el-radio-button>
                </el-radio-group>
              </el-col>
            </el-row>
            <el-table :data="records" v-loading="listLoading" class="center-block" stripe>
              <el-table-column align="left" label="设备ID" prop="deviceId" min-width="125"
                               max-width="250" :formatter="formatterAddress"></el-table-column>
              <el-table-column align="left" label="设备名称" prop="deviceName" min-width="125"
                               max-width="250" :formatter="formatterAddress"></el-table-column>
              <el-table-column align="left" label="设备类型" prop="deviceTypeVal" min-width="125"
                               max-width="250" :formatter="formatterAddress"></el-table-column>
              <el-table-column align="left" label="设备形态" prop="deviceFormVal" min-width="125"
                               max-width="250" :formatter="formatterAddress"></el-table-column>
              <el-table-column align="left" label="推送版本" width="130">
                <template slot-scope="scope">{{versionNum}}</template>
              </el-table-column>
              <el-table-column align="left" label="推送状态" prop="pushStatus" width="130"
                               :formatter="formatterAddress"></el-table-column>
              <el-table-column align="left" label="推送时间" prop="pushTime" width="180"
                               :formatter="formatterAddress"></el-table-column>
              <el-table-column align="left" prop="upgradeStatus" label="升级状态" width="130">
                <template slot-scope="scope">
                  <el-button type="text" v-show="scope.row.upgradeStatus == 'SENDED'">已发送</el-button>
                  <el-button type="text" style="color:#41DC7E" v-show="scope.row.upgradeStatus == 'FINISH'">升级成功
                  </el-button>
                  <el-button type="text" style="color:#dd6161" v-show="scope.row.upgradeStatus == 'FAILE'">升级失败
                  </el-button>
                  <el-button type="text" v-show="scope.row.upgradeStatus == 'START'">开始升级</el-button>
                  <el-button type="text" v-show="scope.row.upgradeStatus == 'EXECUTION'">升级中</el-button>
                </template>
              </el-table-column>
            </el-table>
            <div class="block" style="margin-top: 20px">
              <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page="query.page"
                             :page-sizes="[10, 15, 20, 30]" :page-size="query.size" :total="count" background
                             layout="total, sizes, prev, pager, next, jumper"></el-pagination>
            </div>
          </el-tab-pane>
        </el-tabs>
        <span v-else style="color: #888">没有推送记录</span>
      </div>
    </section>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        versionNum: this.$route.query.versionNum,
        versionId: this.$route.query.versionId,
        activeItem: '',
        activeName: [],
        query: {
          page: 1, size: 10, deviceId: '', deviceForm: '', deviceType: '', versionId: this.$route.query.versionId
        },
        count: 0,
        listLoading: false,
        records: [],
        deviceForms: [],
        deviceTypes: [],
      }
    },
    methods: {
      handleClick(tab, event) {
        this.query = {
          page: 1, size: 10, deviceId: '', deviceForm: '', deviceType: '', versionId: this.$route.query.versionId
        };
        this.query.versionPushId = tab.name;
        this.getUpdateData();
      },
      //升级状态变化
      changeStatus(val) {
        this.getUpdateData();
      },
      pageChange(index) {
        this.query.page = index;
        this.getUpdateData();
      },
      handleSizeChange(val) {
        this.query.size = val;
        this.getUpdateData();
      },
      //搜索推送列表
      clearData() {
        this.query = {
          page: 1, size: 10, deviceId: '', deviceForm: '', deviceType: '', versionId: this.$route.query.versionId
        };
        this.query.versionPushId = this.activeItem;
        this.getUpdateData();
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'pushStatus') {
          return row.pushStatus === 'NO_PUSH' ? '待推送' : row.pushStatus === 'PUSHED' ? '推送完成' : '推送失败';
        } else if (column.property === 'pushTime') {
          return row.pushTime ? $.Data.formatDate(new Date(row.pushTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      },
      //获取升级记录
      getUpdateData() {
        this.listLoading = true;
        this.query.versionPushId = this.activeItem;
        this.$post('/version/queryPushRecord', this.query).then((data) => {
          this.records = data.data.list;
          this.count = data.data.count;
          setTimeout(() => {
            this.listLoading = false;
          }, 500);
        }).catch((err) => {
          this.listLoading = false;
          this.records = [];
          this.$message.error(err);
        });
      },
      //获取推送的批次
      getPushTime() {
        this.$post('/version/queryPush/' + this.versionId, {}).then((data) => {
          this.activeName = data.data;
          if (data.data && data.data.length > 0) {
            this.activeItem = data.data[0].id;
            this.query.versionPushId = data.data[0].id;
            this.getUpdateData();
          }
        })
      },
      //获取设备类型和形态
      getDeviceTypeAndForm() {
        this.$post('device/get/deviceType').then((data) => {
          if (data.code === '000000' && data.data) {
            this.deviceTypes = data.data;
            this.deviceTypes.unshift({code: '', name: "全部类型"});
          }
        });

        this.$post('device/get/deviceForm').then((data) => {
          if (data.code === '000000' && data.data) {
            this.deviceForms = data.data;
            this.deviceForms.unshift({code: '', name: "全部形态"});
          }
        });
      }
    },
    mounted() {
      this.getDeviceTypeAndForm();
      this.getPushTime();
    }
  }
</script>
