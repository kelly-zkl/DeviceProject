<template>
  <div>
    <section class="content">
      <div class="add-appdiv" style="margin-top: 30px">
        <el-row>
          <el-col :span="6" align="left" style="border-right: 1px #e5e5e5 solid">
            <p style="font-size: 13px;color:#CCC;margin: 0 20px;">任务名称</p>
            <p style="margin: 5px 20px 0 20px">{{task.taskName}}</p>
          </el-col>
          <el-col :span="6" align="left" style="border-right: 1px #e5e5e5 solid">
            <p style="font-size: 13px;color:#CCC;margin: 0 20px;">任务类型</p>
            <p style="margin: 5px 20px 0 20px">
              {{collisionType == 'IMSI' ? 'IMSI' : collisionType == 'FACE' ? '图像' : 'MAC'}}
            </p>
          </el-col>
          <el-col :span="6" align="left" style="border-right: 1px #e5e5e5 solid">
            <p style="font-size: 13px;color:#CCC;margin: 0 20px;">创建时间</p>
            <p style="margin: 5px 20px 0 20px">{{task.timeStr}}</p>
          </el-col>
          <el-col :span="6" align="right">
            <el-button type="text" @click="runTaskDetail = true">查看任务</el-button>
            <el-button type="text" @click="deleteTask()">删除任务</el-button>
          </el-col>
        </el-row>
      </div>
      <el-row v-show="activeType == 'IMSI'" style="margin-bottom: 10px">
        <el-col :span="16" align="left" class="tab-card">
          <el-tabs v-model="activeItem" @tab-click="handleType" type="border-card">
            <el-tab-pane label="分析结果" name="first"></el-tab-pane>
            <el-tab-pane label="归属地统计" name="second"></el-tab-pane>
            <el-tab-pane label="地区统计" name="third"></el-tab-pane>
            <el-tab-pane label="源IMSI记录" name="fourth"></el-tab-pane>
          </el-tabs>
        </el-col>
        <el-col :span="8" align="right">
          <el-button type="primary" size="medium" @click="exportData()">导出数据</el-button>
        </el-col>
      </el-row>
      <div v-show="activeType == 'IMSI'&&activeItem=='second'">
        <regionalCount ref="regionalCount"></regionalCount>
      </div>
      <div v-show="activeType == 'IMSI'&&activeItem=='third'">
        <areaCount ref="areaCount"></areaCount>
      </div>
      <div v-show="activeType == 'IMSI'&&activeItem=='fourth'">
        <imsiList ref="imsiList"></imsiList>
      </div>
      <div class="content" style="margin-left: 10px" v-show="activeType == 'IMSI'&&activeItem=='first'">
        <el-form :inline="true" :model="query" align="left">
          <el-form-item>
            <el-input v-model="query.imsi" placeholder="请输入IMSI" size="medium" style="width: 160px"
                      :maxlength=20></el-input>
          </el-form-item>
          <el-form-item>
            <el-select v-model="query.isp" placeholder="请选择运营商" style="width: 120px" size="medium" clearable>
              <el-option v-for="item in operators" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-input v-model="query.regional" placeholder="请输入归属地" style="width: 160px" size="medium"
                      :maxlength=20></el-input>
          </el-form-item>
          <el-form-item label="条件1出现次数">
            <el-input v-model="query.count1" type="number" size="medium" style="width: 80px" :maxlength=5></el-input>
          </el-form-item>
          <el-form-item label="条件2出现次数">
            <el-input v-model="query.count2" type="number" size="medium" style="width: 80px" :maxlength=5></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="medium" @click="query.page=1;getData()">搜索</el-button>
          </el-form-item>
          <el-form-item>
            <el-button size="medium" @click="clearData()">重置</el-button>
          </el-form-item>
        </el-form>
        <el-table :data="records" v-loading="listLoading" class="center-block" stripe>
          <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
          <el-table-column align="left" label="IMSI" prop="imsi" min-width="150"
                           max-width="300" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="运营商" prop="isp" min-width="125"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="网络类型" prop="netType" min-width="125"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="归属地" prop="regional" min-width="125"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="条件1出现次数" prop="imsiCount1" min-width="125"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="条件2出现次数" prop="imsiCount2" min-width="125"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="操作" width="130">
            <template slot-scope="scope">
              <el-button type="text" @click="gotoImsi(scope.row.imsi)">查看IMSI</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="block" style="margin-top: 20px" align="right">
          <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page="query.page"
                         :page-sizes="[10, 15, 20, 30]" :page-size="query.size" :total="count" background
                         layout="total, sizes, prev, pager, next, jumper"></el-pagination>
        </div>
      </div>
      <el-row v-show="activeType == 'FACE'" style="margin-bottom: 10px">
        <el-col :span="16" align="left" class="tab-card">
          <el-tabs v-model="imageItem" @tab-click="handleType" type="border-card">
            <el-tab-pane label="图像" name="image"></el-tab-pane>
            <el-tab-pane label="图像记录" name="list"></el-tab-pane>
          </el-tabs>
        </el-col>
        <el-col :span="8" align="right">
          <el-button type="primary" size="medium" @click="exportData()">导出数据</el-button>
        </el-col>
      </el-row>
      <div v-show="activeType == 'FACE'&&imageItem=='list'">
        <imageList ref="imageList"></imageList>
      </div>
      <div class="content" style="margin-left: 10px" v-show="activeType == 'FACE'&&imageItem=='image'">
        <el-form :inline="true" :model="query" align="left">
          <el-form-item label="年龄">
            <el-row>
              <el-input v-model="query.age1" type="number" size="medium" style="width: 80px" :maxlength=3></el-input>
              <span>~</span>
              <el-input v-model="query.age2" type="number" size="medium" style="width: 80px" :maxlength=3></el-input>
            </el-row>
          </el-form-item>
          <el-form-item label="性别">
            <el-select v-model="query.sex" placeholder="请选择" style="width: 100px" size="medium" clearable>
              <el-option v-for="item in sexs" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="条件1出现次数">
            <el-input v-model="query.count1" type="number" size="medium" style="width: 80px" :maxlength=5></el-input>
          </el-form-item>
          <el-form-item label="条件2出现次数">
            <el-input v-model="query.count2" type="number" size="medium" style="width: 80px" :maxlength=5></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="medium" @click="query.page=1;getData()">搜索</el-button>
          </el-form-item>
          <el-form-item>
            <el-button size="medium" @click="clearData()">重置</el-button>
          </el-form-item>
        </el-form>
        <el-table :data="records" v-loading="listLoading" class="center-block" stripe>
          <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
          <el-table-column align="left" label="现场图像" prop="scensePicURL" min-width="125"
                           max-width="250">
            <template slot-scope="scope">
              <img v-bind:src="faceUrl+scope.row.userFacePicURL" style="width: 90px;height:90px"/>
            </template>
          </el-table-column>
          <el-table-column align="left" label="年龄" prop="age" min-width="125"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="性别" prop="sex" min-width="125"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="条件1出现次数" prop="faceCount1" min-width="125"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="条件2出现次数" prop="faceCount2" min-width="125"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="操作" min-width="125" max-width="250">
            <template slot-scope="scope">
              <el-button type="text" @click="gotoImage(faceUrl+scope.row.scensePicURL,scope.row.personID)">查看图像
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="block" style="margin-top: 20px" align="right">
          <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page="query.page"
                         :page-sizes="[10, 15, 20, 30]" :page-size="query.size" :total="count" background
                         layout="total, sizes, prev, pager, next, jumper"></el-pagination>
        </div>
      </div>

      <!--任务详情-->
      <el-dialog title="任务详情" :width="dialogWidth" :visible.sync="runTaskDetail">
        <div class="block gray-form">
          <el-form label-width="100px" :model="task" label-position="right" style="margin-right: 20px">
            <el-form-item label="任务名称" align="left" style="margin: 0">{{task.taskName}}</el-form-item>
            <el-form-item label="创建时间" align="left" style="margin: 0">{{task.timeStr}}</el-form-item>
            <el-form-item label="数据类型" align="left" style="margin: 0">
              {{collisionType == 'IMSI' ? 'IMSI' : collisionType == 'FACE' ? '图像' : 'MAC'}}
            </el-form-item>
            <el-form-item label="数据组合" align="left" style="margin: 0">
              {{task.collisionMode == 'INTERSECT' ? '交集' : task.collisionMode == 'UNION' ? '并集' : '差集'}}
            </el-form-item>
            <el-form-item label="条件1" align="left" style="margin: 0">
              <div v-for="(item,indx) in task.condition1" :key="indx">
                <span
                  style="display:inline-block;width:90%;word-wrap:break-word;white-space:normal">{{item}}</span>
              </div>
            </el-form-item>
            <el-form-item label="条件2" align="left" style="margin: 0">
              <div v-for="(item,indx) in task.condition2" :key="indx">
                <span
                  style="display:inline-block;width:90%;word-wrap:break-word;white-space:normal">{{item}}</span>
              </div>
            </el-form-item>
          </el-form>
        </div>
      </el-dialog>
    </section>
  </div>
</template>

<script>
  import headerTitle from "../publicComponents/headerTitle.vue";
  import {isNull} from "../../api";
  import areaCount from '../collision/AreaCount.vue';
  import regionalCount from '../collision/RegionalCount.vue';
  import imsiList from '../collision/ImsiList.vue';
  import imageList from '../collision/ImageList.vue';

  export default {
    data() {
      return {
        dialogWidth: $.Device.isPC() ? '35%' : '90%',
        taskId: this.$route.query.taskId || '',
        collisionType: this.$route.query.collisionType || '',
        activeType: "IMSI",
        activeItem: 'first',
        imageItem: 'image',
        records: [],
        listLoading: false,
        runTaskDetail: false,
        query: {page: 1, size: 10},
        count: 0,
        task: {},
        sexs: [{value: '0', label: '男'}, {value: '2', label: '女'}],
        operators: [{value: 0, label: '移动'}, {value: 1, label: '联通'}, {value: 2, label: '电信'}],
        param: ''
      }
    },
    methods: {
      //任务类型-->IMSI、图像、疑似人员
      handleType(tab, event) {

      },
      //碰撞结果导出
      exportData() {
        var param = Object.assign({}, this.query);
        param.page = 1;
        param.size = 100000;
        if ((this.activeType === 'IMSI' && this.activeItem === 'first') || (this.activeType === 'FACE' && this.imageItem === 'image')) {
          this.axios.post('/collision/export/analyze', param, {responseType: 'arraybuffer'}).then((res) => {
//            let fileName = res.headers['content-disposition'].match(/fushun(\S*)xls/)[0];
//            fileDownload(res.data, fileName);
            //如果用方法一 ，这里需要安装 npm install js-file-download --save ,然后引用 var fileDownload = require('js-file-download')，使用详情见github;
            let blob = new Blob([res.data], {type: "application/vnd.ms-excel"});
            let objectUrl = URL.createObjectURL(blob);
            window.location.href = objectUrl;
          }).catch(function (res) {
          });
        } else if (this.activeType === 'IMSI' && this.activeItem === 'second') {
          this.$refs.regionalCount.exportData();
        } else if (this.activeType === 'IMSI' && this.activeItem === 'third') {
          this.$refs.areaCount.exportData();
        } else if (this.activeType === 'IMSI' && this.activeItem === 'fourth') {
          this.$refs.imsiList.exportData();
        } else if (this.activeType === 'FACE' && this.imageItem === 'list') {
          this.$refs.imageList.exportData();
        }
      },
      //跳转IMSI记录
      gotoImsi(imsi) {
        this.$router.push({
          path: '/imsiRecords', query: {
            taskId: this.taskId,
            collisionType: this.collisionType, imsi: imsi
          }
        });
      },
      //跳转图像记录页面
      gotoImage(pic, personID) {
        this.$router.push({
          path: '/imageRecords', query: {
            taskId: this.taskId, personID: personID,
            collisionType: this.collisionType, picUrl: pic
          }
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
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'sex') {//0-女  1-男  2-未知
          return row.sex === '0' ? '男' : row.sex === '2' ? '女' : '未知';
        } else if (column.property === 'isp') {
          return row.isp === 0 ? '移动' : row.isp === 1 ? '联通' : row.isp === 2 ? '电信' : '未知';
        } else if (column.property === 'netType') {//网络类型 --> 根据运营商判断
          return this.getNetType(row.isp);
        } else if (column.property === 'pushTime') {
          return row.pushTime ? $.Data.formatDate(new Date(row.pushTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else if (column.property === 'imsiCount1' || column.property === 'imsiCount2' || column.property === 'faceCount1' || column.property === 'faceCount2') {
          return row[column.property];
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      },
      getNetType(isp) {
        let moduleId = "未知";
        switch (isp) {
          case 0:
            moduleId = "CMCC";
            break;
          case 1:
            moduleId = "CMUC";
            break;
          case 2:
            moduleId = "CMTC";
            break;
          default:
            break;
        }
        return moduleId;
      },
      //删除任务
      deleteTask() {
        this.$confirm('确认要删除该任务吗?', '提示', {type: 'info'}).then(() => {
          this.$post('/collision/delete', [this.taskId], '删除成功').then((data) => {
            if ("000000" === data.code)
              this.$router.go(-1);
          }).catch((err) => {
          });
        }).catch(() => {
        });
      },
      //清除查询条件
      clearData() {
        this.query = {page: 1, size: 10};
        this.query.collisionType = this.collisionType;
        this.query.collisionTaskId = this.taskId;
        this.getData();
      },
      //获取记录
      getData() {
        if (this.collisionType === 'FACE') {//人脸
          if (!isNull(this.query.age1) || !isNull(this.query.age2)) {
            if (isNull(this.query.age1) || isNull(this.query.age2)) {
              this.$message.error('请输入正确的年龄范围');
              return;
            } else {
              this.query.age1 = parseInt(this.query.age1);
              this.query.age2 = parseInt(this.query.age2);
              if (this.query.age1 >= this.query.age2) {
                this.$message.error('请输入正确的年龄范围');
                return;
              }
            }
          }
        }

        this.listLoading = true;
        this.$post('/collision/queryResult', this.query).then((data) => {
          this.records = data.data.list;
          this.count = data.data.count;
          this.listLoading = false;
        }).catch((err) => {
          this.records = [];
          this.listLoading = false;
        });
      },
      //任务详情
      taskDetail() {
        this.$post('/collision/get/' + this.taskId, {}).then((data) => {
          this.task = data.data;
          this.task.condition1 = this.task.condition1.split("\r\n");
          this.task.condition2 = this.task.condition2.split("\r\n");
          this.task.timeStr = $.Data.formatDate(new Date(this.task.createTime * 1000), 'yyyy-MM-dd hh:mm:ss')
        }).catch((err) => {
        });
      }
    }
    ,
    mounted() {
      this.taskId = this.$route.query.taskId || '';
      this.collisionType = this.$route.query.collisionType || '';

      this.activeType = this.collisionType;

      this.query.collisionType = this.collisionType;
      this.query.collisionTaskId = this.taskId;

      this.taskDetail();
      this.getData();
    }
    ,
    components: {
      headerTitle,
      areaCount,
      regionalCount,
      imsiList,
      imageList
    }
  }
</script>
