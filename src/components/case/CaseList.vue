<template>
  <div>
    <section class="content">
      <headerTitle></headerTitle>
      <el-row>
        <el-col :span="16" align="left" class="tab-card">
          <el-tabs v-model="activeItem" @tab-click="handleType" type="border-card">
            <el-tab-pane label="进行中" name="EXECUTION"></el-tab-pane>
            <el-tab-pane label="已结案" name="HANDLED"></el-tab-pane>
          </el-tabs>
        </el-col>
        <el-col :span="8" align="right">
          <el-button type="primary" size="medium" @click="showCreate()">创建新案件</el-button>
        </el-col>
      </el-row>
      <el-row style="padding: 10px 0">
        <el-col :span="18" align="left">
          <el-form :inline="true" :model="query" align="left">
            <el-form-item style="margin-bottom: 10px">
              <el-input v-model="query.caseName" placeholder="案件名称" size="medium" style="width: 160px"
                        :maxlength=20></el-input>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-input v-model="query.caseType" placeholder="案件类型" size="medium" style="width: 160px"
                        :maxlength=20></el-input>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-cascader :options="provinceList" :props="props" @change="areaChange" change-on-select
                           v-model="areaList" style="width: 180px" placeholder="案发地点" size="medium"
                           filterable clearable>
              </el-cascader>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-date-picker v-model="caseTime" type="datetimerange" range-separator="至"
                              start-placeholder="案发开始日期" size="medium" end-placeholder="结束日期" clearable
                              :default-time="['00:00:00', '23:59:59']" value-format="timestamp"
                              :picker-options="pickerBeginDate">
              </el-date-picker>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-button type="primary" size="medium" @click="query.page=1;getData()">搜索</el-button>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-button size="medium" @click="clearData()">重置</el-button>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="6" align="right">
          <el-button type="primary" size="medium" v-show="query.status == 'EXECUTION'" :disabled="sels.length == 0"
                     @click="finishCase()">结案
          </el-button>
          <el-button type="primary" size="medium" :disabled="sels.length == 0" @click="deleteCase()">删除</el-button>
        </el-col>
      </el-row>
      <el-table :data="caseList" v-loading="listLoading" class="center-block" stripe @selection-change="selsChange">
        <el-table-column type="selection" width="45" align="left"></el-table-column>
        <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
        <el-table-column align="left" v-for="item in defaultProps" :key="item.value" :formatter="formatterAddress"
                         :prop="item.value" :label="item.name" :min-width="item.min"
                         :max-width="item.max"></el-table-column>
        <!--<el-table-column align="left" label="案件编号" prop="caseNo" min-width="150"-->
        <!--max-width="250" :formatter="formatterAddress"></el-table-column>-->
        <!--<el-table-column align="left" label="案件名称" prop="caseName" min-width="150"-->
        <!--max-width="250" :formatter="formatterAddress"></el-table-column>-->
        <!--<el-table-column align="left" label="案件类型" prop="caseType" min-width="150"-->
        <!--max-width="250" :formatter="formatterAddress"></el-table-column>-->
        <!--<el-table-column align="left" label="案发时间" prop="caseTime" width="350"-->
        <!--:formatter="formatterAddress"></el-table-column>-->
        <!--<el-table-column align="left" label="案发地点" prop="caseAddress" min-width="150"-->
        <!--max-width="250" :formatter="formatterAddress"></el-table-column>-->
        <!--<el-table-column align="left" label="创建时间" prop="creatTime" width="170"-->
        <!--:formatter="formatterAddress"></el-table-column>-->
        <!--<el-table-column align="left" label="案件状态" prop="status" width="130"-->
        <!--:formatter="formatterAddress"></el-table-column>-->
        <!--<el-table-column align="left" label="结案时间" prop="updateTime" width="170"-->
        <!--v-show="query.status=='HANDLED'" :formatter="formatterAddress"></el-table-column>-->
        <el-table-column align="left" label="操作" width="160">
          <template slot-scope="scope">
            <el-button type="text" @click="sels = [];sels.push(scope.row);finishCase()"
                       v-show="scope.row.status=='EXECUTION'">结案
            </el-button>
            <el-button type="text" @click="gotoDetail(scope.row)">查看</el-button>
            <el-button type="text" @click="sels = [];sels.push(scope.row);deleteCase()">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="block" style="margin-top: 20px" align="right">
        <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page="query.page"
                       :page-sizes="[10, 15, 20, 30]" :page-size="query.size" :total="count" background
                       layout="total, sizes, prev, pager, next, jumper"></el-pagination>
      </div>
      <!--创建新案件-->
      <el-dialog title="创建新案件" :visible.sync="runningCreateCase" :width="dialogWidth" center>
        <div class="block">
          <el-form ref="createCase" :rules="rules" :model="createCase" label-position="right"
                   :label-width="labelWidth">
            <el-form-item label="案件编号" prop="caseNo">
              <el-input v-model="createCase.caseNo" auto-complete="off" :maxlength="30"></el-input>
            </el-form-item>
            <el-form-item label="案件名称" prop="caseName">
              <el-input v-model="createCase.caseName" auto-complete="off" :maxlength="20"></el-input>
            </el-form-item>
            <el-form-item label="案件类型" prop="caseType">
              <el-input v-model="createCase.caseType" placeholder="案件类型" :maxlength=20></el-input>
            </el-form-item>
            <el-form-item label="案发时间" prop="caseTime">
              <el-date-picker v-model="createCase.caseTime" type="datetimerange" range-separator="至"
                              start-placeholder="案发开始日期" size="medium" end-placeholder="结束日期" clearable
                              :default-time="['00:00:00', '23:59:59']" value-format="timestamp"
                              :picker-options="pickerBeginDate" style="width: 100%"></el-date-picker>
            </el-form-item>
            <el-form-item label="案发地点" prop="caseArea">
              <el-cascader :options="provinceList" :props="props" clearable
                           style="width: 100%" v-model="createCase.caseArea" placeholder="案发地点">
              </el-cascader>
            </el-form-item>
            <el-form-item prop="caseAddress">
              <el-input v-model="createCase.caseAddress" :maxlength="30" placeholder="详细地点"></el-input>
            </el-form-item>
            <el-form-item label="备注">
              <el-input v-model="createCase.remark" type="textarea" :autosize="{ minRows: 2, maxRows: 4}"
                        placeholder="请输入备注"></el-input>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer" align="center">
            <el-button @click="runningCreateCase = false">取消</el-button>
            <el-button type="primary" @click="createNewCase()">确认创建</el-button>
          </div>
        </div>
      </el-dialog>
    </section>
  </div>
</template>
<script>
  import headerTitle from "../publicComponents/headerTitle.vue";
  import json from '../../assets/city.json';
  import {noSValidator, noValidator} from "../../api";

  export default {
    data() {
      let codeValidator = (rule, value, callback) => {
        if (noValidator(value)) {
          callback(new Error("由英文字母、数字、下划线组成"));
        } else {
          callback();
        }
      };
      let nameValidator = (rule, value, callback) => {
        if (noSValidator(value)) {
          callback(new Error("由汉字、数字、英文字母、下划线组成"));
        } else {
          callback();
        }
      };
      return {
        runningCreateCase: false,
        listLoading: false,
        dialogWidth: $.Device.isPC() ? '40%' : '90%',
        labelWidth: $.Device.isPC() ? '100px' : '80px',
        props: {value: 'o', label: 'n', children: 'c'},
        areaList: [],
        provinceList: json,
        caseTime: '',
        query: {page: 1, size: 10},
        caseTypes: [{value: '1', label: '盗窃'}, {value: '2', label: '抢劫'}, {value: '3', label: '吸毒'}],
        activeItem: 'EXECUTION',
        count: 0,
        sels: [],
        caseList: [],
        caseArea: [],
        createCase: {},
        defaultProps: [{value: 'caseNo', name: '案件编号', min: 150, max: 250},
          {value: 'caseName', name: '案件名称', min: 150, max: 250},
          {value: 'caseType', name: '案件类型', min: 150, max: 250},
          {value: 'caseTime', name: '案发时间', min: 350, max: 350},
          {value: 'caseAddress', name: '案发地点', min: 150, max: 250},
          {value: 'creatTime', name: '创建时间', min: 170, max: 170},
          {value: 'status', name: '案件状态', min: 120, max: 120}],
        rules: {
          caseNo: [
            {required: true, message: '请输入案件编号', trigger: 'blur', maxlength: 20},
            {validator: codeValidator, trigger: "change,blur"}
          ],
          caseName: [
            {required: true, message: '请输入案件名称', trigger: 'blur', maxlength: 30},
            {validator: nameValidator, trigger: "change,blur"}
          ],
          caseType: [
            {required: true, message: '请输入案件类型', trigger: 'blur'}
          ],
          caseArea: [
            {required: true, message: '请选择案发地点', trigger: 'blur'}
          ],
          caseTime: [
            {required: true, message: '请选择案发时间', trigger: 'blur'}
          ],
          caseAddress: [
            {required: true, message: '请输入详细地点', trigger: 'blur'}
          ]
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
      //全选  ==>  删除/结案
      selsChange(sels) {
        this.sels = sels;
      },
      handleType(val) {
        if (val.name === 'EXECUTION') {
          this.defaultProps = [{value: 'caseNo', name: '案件编号', min: 150, max: 250},
            {value: 'caseName', name: '案件名称', min: 150, max: 250},
            {value: 'caseType', name: '案件类型', min: 150, max: 250},
            {value: 'caseTime', name: '案发时间', min: 350, max: 350},
            {value: 'caseAddress', name: '案发地点', min: 150, max: 250},
            {value: 'creatTime', name: '创建时间', min: 170, max: 170},
            {value: 'status', name: '案件状态', min: 120, max: 120}];
        } else {
          this.defaultProps = [{value: 'caseNo', name: '案件编号', min: 150, max: 250},
            {value: 'caseName', name: '案件名称', min: 150, max: 250},
            {value: 'caseType', name: '案件类型', min: 150, max: 250},
            {value: 'caseTime', name: '案发时间', min: 350, max: 350},
            {value: 'caseAddress', name: '案发地点', min: 150, max: 250},
            {value: 'creatTime', name: '创建时间', min: 170, max: 170},
            {value: 'status', name: '案件状态', min: 120, max: 120},
            {value: 'updateTime', name: '结案时间', min: 170, max: 170}];
        }
        this.getData();
      },
      gotoDetail(task) {
        this.$router.push({path: '/caseDetail', query: {caseId: task.id}});
      },
      //创建新案件
      showCreate() {
        this.createCase = {};
        this.runningCreateCase = true;
      },
      createNewCase() {
        this.$refs['createCase'].validate((valid) => {
          if (valid) {
            this.createCase.caseToTime = this.createCase.caseTime[1] / 1000;
            this.createCase.caseTime = this.createCase.caseTime[0] / 1000;

            this.createCase.provinceCode = this.createCase.caseArea[0];
            this.createCase.cityCode = this.createCase.caseArea[1];
            this.createCase.areaCode = this.createCase.caseArea[2];
            delete this.createCase['caseArea'];

            this.$post("case/add", this.createCase, "创建成功").then((data) => {
              this.createCase = {};
              this.runningCreateCase = false;
              this.getData();
            });
          }
        })
      },
      //结案
      finishCase() {
        this.$confirm('确认已结案?', '提示', {type: 'info'}).then(() => {
          let param = [];
          this.sels.forEach((item) => {
            let caseItem = {id: item.id, handlerBy: 'superAdmin', status: 'HANDLED'};
            param.push(caseItem);
          });
          this.$post('/case/batchUpdateStatus', param, '操作成功').then((data) => {
            if ("000000" === data.code) {
              this.getData();
              this.sels = [];
            }
          }).catch((err) => {
          });
        }).catch(() => {
        });
      },
      //删除案件
      deleteCase() {
        let arr = [];
        this.sels.forEach((item) => {
          arr.push(item.id);
        });
        this.$confirm('确认要删除该案件吗?', '提示', {type: 'info'}).then(() => {
          this.$post('/case/delete', arr, '删除成功').then((data) => {
            if ("000000" === data.code) {
              this.getData();
              this.sels = [];
            }
          }).catch((err) => {
          });
        }).catch(() => {
        });
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
          this.query.provinceCode = value[0];
          this.query.cityCode = value[1];
        } else if (value.length === 3) {
          this.query.provinceCode = value[0];
          this.query.cityCode = value[1];
          this.query.areaCode = value[2];
        }
      },
      //清除查询条件
      clearData() {
        this.query = {page: 1, size: 10};
        this.areaList = [];
        this.caseTime = '';
        this.getData();
      },
      pageChange(index) {
        this.query.page = index;
        this.getData();
      },
      handleSizeChange(val) {
        this.query.size = val;
        this.getData();
      },
      getData() {
        if (!!this.caseTime) {
          this.query.caseTime = this.caseTime[0] / 1000;
          this.query.caseToTime = this.caseTime[1] / 1000;
        } else {
          delete this.query['caseTime'];
          delete this.query['caseToTime'];
        }
        this.query.status = this.activeItem;
        this.listLoading = true;
        this.$post('/case/query', this.query).then((data) => {
          this.caseList = data.data.list;
          this.count = data.data.count;
          this.listLoading = false;
        }).catch((err) => {
          this.caseList = [];
          this.listLoading = false;
        });
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'updateTime') {
          return row.updateTime ? $.Data.formatDate(new Date(row.updateTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else if (column.property === 'creatTime') {
          return row.creatTime ? $.Data.formatDate(new Date(row.creatTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else if (column.property === 'caseTime') {
          let start = row.caseTime ? $.Data.formatDate(new Date(row.caseTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
          let end = row.caseToTime ? $.Data.formatDate(new Date(row.caseToTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
          return start + " ~ " + end;
        } else if (column.property === 'status') {
          return row.status === 'UNHANDLED' ? '未处理' : row.status === 'EXECUTION' ? '进行中' : row.status === 'HANDLED' ? '已结案' : '--';
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      },
    },
    mounted() {
      this.getData();
//      this.$router.push({path: 'caseDetail'})
    },
    components: {
      headerTitle
    }
  }
</script>
