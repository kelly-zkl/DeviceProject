<template>
  <div>
    <section class="content">
      <el-row style="margin: 20px 0 10px 0">
        <el-col :span="18" align="left">
          <el-input placeholder="终端imsi" v-model="query.imsi" :maxlength="30" size="medium"
                    style="margin-top: 10px;width: 250px;margin-right: 10px"></el-input>
          <el-button type="primary" icon="search" style="margin-top: 10px" @click="getData()" size="medium">搜索
          </el-button>
          <el-button style="margin-top: 10px" @click="clearData()" size="medium">清除
          </el-button>
        </el-col>
        <el-col :span="6" align="right">
          <el-button type="primary" icon="el-icon-plus" style="margin-top: 10px"
                     @click="runningStatusVisible = true;device={imsi: ''}" size="medium"
                     v-show="getButtonVial('bwTerminate:addWhite')">添加白名单
          </el-button>
        </el-col>
      </el-row>
      <el-table :data="deviceList" v-loading="listLoading" class="center-block" stripe>
        <el-table-column align="center" type="index" label="序号" width="70"></el-table-column>
        <el-table-column align="left" prop="imsi" label="终端imsi" min-width="150" max-width="300"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="创建时间" min-width="150" max-width="300"
                         :formatter="formatTime"></el-table-column>
        <el-table-column align="left" label="操作" min-width="150" max-width="300">
          <template slot-scope="scope">
            <el-button @click.stop="deleteData(deviceList[scope.$index].imsi)" type="danger" style="margin: 5px 0"
                       size="small" v-show="getButtonVial('bwTerminate:deleteWhite')">删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="block" style="margin-top: 20px">
        <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page="query.page"
                       :page-sizes="[10, 15, 20, 30]" :page-size="query.size" :total="count" background
                       layout="total, sizes, prev, pager, next, jumper"></el-pagination>
      </div>
      <!--添加白名单-->
      <el-dialog title="添加白名单" :visible.sync="runningStatusVisible" :width="dialogWidth">
        <el-form :model="device" :label-width="labelWidth" :rules="rules">
          <el-form-item label="白名单" prop="imsi" required>
            <el-input v-model="device.imsi" placeholder="请输入白名单" :maxlength="30"></el-input>
          </el-form-item>
        </el-form>
        <div class="block" style="margin-top: 20px">
          <el-button @click="runningStatusVisible = false;device.imsi=''">取消</el-button>
          <el-button type="primary" @click="addImsi" style="margin-right: 10px">确认</el-button>
        </div>
      </el-dialog>
    </section>
  </div>
</template>
<script>
  import {numValid} from "../../api";

  export default {
    data() {
      let imsiValidator = (rule, value, callback) => {
        if (!numValid(value)) {
          callback(new Error("请输入正确的白名单，只能输入数字"));
        } else {
          callback();
        }
      };
      return {
        dialogWidth: $.Device.isPC() ? '40%' : '90%',
        labelWidth: $.Device.isPC() ? '100px' : '80px',
        listLoading: false,
        deviceList: [],
        count: 0,
        query: {page: 1, size: 10, imsi: ''},
        runningStatusVisible: false,
        device: {imsi: ''},
        rules: {
          imsi: [
            {required: true, message: '请输入白名单', trigger: 'blur'}, {validator: imsiValidator, trigger: "change,blur"}
          ]
        }
      }
    },
    methods: {
      getButtonVial(msg) {
        return $.Button.buttonValidator(msg);
      },
      clearData() {
        this.query = {page: 1, size: 10, imsi: ''};
        this.getData();
      },
      pageChange(index) {
        this.query.page = index;
      },
      handleSizeChange(val) {
        this.query.size = val;
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
      },
      formatTime(row, column) {
        return row.createTime ? $.Data.formatDate(new Date(row.createTime), 'yyyy-MM-dd hh:mm:ss') : '--';
      },
      getLocalTime(nS) {
        return new Date(parseInt(nS)).toLocaleString().replace(/年|月/g, "-").replace(/日/g, " ");
      },
      addImsi() {
        if (!this.device.imsi) {
          this.$message.error('请输入白名单');
          return;
        }
        this.$post("bwTerminate/addWhite", this.device, "添加成功").then(() => {
          this.getData();
          this.runningStatusVisible = false;
        });
      },
      deleteData(imsi) {
        this.$confirm('确定要删除该白名单吗？', '提示', {
          type: 'warning'
        }).then(() => {
          this.$post("bwTerminate/deleteWhite", {"imsi": imsi}, "删除成功", "删除失败")
            .then(() => {
              this.getData();
            });
        }).catch(() => {
        });
      },
      getData() {
        if (this.query.imsi) {
          if (!/[0-9]$/.test(this.query.imsi)) {
            this.$message.error('请输入正确的imsi');
            return;
          }
        }
        this.listLoading = true;
        this.$post("bwTerminate/queryWhite", this.query).then((data) => {
          this.count = data.data.count;
          this.deviceList = data.data.list;
          setTimeout(() => {
            this.listLoading = false
          }, 500);
        }).catch((err) => {
          this.listLoading = false;
          this.deviceList = [];
          this.$message.error(err);
        });
      }
    },
    mounted() {
      this.getData();
    }
  }
</script>
