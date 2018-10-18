<template>
  <div>
    <section class="content">
      <headerTitle></headerTitle>
      <el-row style="margin-top:20px;margin-bottom: 10px">
        <el-col :span="20" align="left">
          <el-input placeholder="地址" v-model="query.ftpHost" :maxlength="30"
                    style="width: 200px;margin-right: 10px;margin-top: 10px" size="medium"></el-input>
          <el-input placeholder="用户名" v-model="query.ftpUserName" :maxlength="30"
                    style="width: 200px;margin-right: 10px;margin-top: 10px" size="medium"></el-input>
          <el-select v-model="query.groupId" placeholder="全部组织" size="medium" filterable
                     style="width: 150px;margin-right: 10px;margin-top: 10px">
            <el-option v-for="item in organizations" :key="item.groupId" :label="item.groupName"
                       :value="item.groupId">
            </el-option>
          </el-select>
          <el-button type="primary" icon="search" style="margin-top: 10px"
                     @click.stop="query.page=1;getFtpList()" size="medium">搜索
          </el-button>
          <el-button style="margin-top: 10px" @click.stop="clearData()" size="medium">清除</el-button>
        </el-col>
        <el-col :span="4" align="right">
          <el-button type="primary" icon="el-icon-plus" @click="addFtp()" style="margin-top: 10px"
                     v-show="getButtonVial('ftpConfig:add')" size="medium">添加FTP
          </el-button>
        </el-col>
      </el-row>
      <el-table :data="ftps" v-loading="listLoading" class="center-block" stripe>
        <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
        <el-table-column align="left" prop="ftpHost" label="地址" min-width="150"
                         max-width="300" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="ftpPort" label="端口" min-width="120"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="ftpUserName" label="用户名" min-width="150"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="ftpPassword" label="密码" min-width="150"
                         max-width="300" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="companyCode" label="公司代码" min-width="150"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="dataGenerateSrc" label="数据来源编码" min-width="150"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="groupId" label="组织名称" min-width="150"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="status" label="状态" width="100"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="操作" width="150">
          <template slot-scope="scope">
            <el-button type="text" style="margin-right: 10px" @click.stop="updateInfo(scope.row)"
                       v-show="getButtonVial('ftpConfig:update')">修改
            </el-button>
            <el-button type="text" @click="ftpStatus(scope.row)"
                       v-show="getButtonVial('ftpConfig:statusSwitch:*')">
              {{scope.row.status == 'ENABLE' ? '禁用' : '启用'}}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="block" style="margin-top: 20px">
        <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page="query.page"
                       :page-sizes="[10, 15, 20, 30]" :page-size="query.size" :total="count" background
                       layout="total, sizes, prev, pager, next, jumper"></el-pagination>
      </div>
      <!--添加FTP-->
      <el-dialog :title="addUserTitle" :visible.sync="addUserVisible" :width="dialogWidth">
        <el-form ref="ftp" :model="ftp" label-width="120px" :rules="rules" labelPosition="right">
          <el-form-item label="地址" prop="ftpHost">
            <el-input v-model="ftp.ftpHost" placeholder="请输入ftp地址" :maxlength="15"></el-input>
          </el-form-item>
          <el-form-item label="端口" prop="ftpPort">
            <el-input v-model.number="ftp.ftpPort" placeholder="请输入端口号" :maxlength="8"></el-input>
          </el-form-item>
          <el-form-item label="用户名" prop="ftpUserName">
            <el-input v-model="ftp.ftpUserName" placeholder="请输入用户名" :maxlength="18" :minlength="2"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="ftpPassword">
            <el-input v-model="ftp.ftpPassword" placeholder="请输入密码" :maxlength="18"
                      :minlength="2" type="password"></el-input>
          </el-form-item>
          <el-form-item label="公司代码" prop="companyCode">
            <el-input v-model="ftp.companyCode" placeholder="请输入公司代码" :maxlength="15"></el-input>
          </el-form-item>
          <el-form-item label="数据来源编码" prop="dataGenerateSrc">
            <el-input v-model="ftp.dataGenerateSrc" placeholder="请输入数据来源编码" :maxlength="10"></el-input>
          </el-form-item>
          <el-form-item label="所属组织" align="left" prop="groupId">
            <el-select v-model="ftp.groupId" placeholder="请选择组织" filterable>
              <el-option v-for="item in organizations" :key="item.groupId" :label="item.groupName"
                         :value="item.groupId">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <div class="block" style="margin-top: 20px">
          <el-button @click="cancelSubmit(addUserTitle)">取消</el-button>
          <el-button type="primary" @click="onSubmit('ftp',addUserTitle)">确认</el-button>
        </div>
      </el-dialog>
    </section>
  </div>
</template>

<script>
  import md5 from 'js-md5';
  import {pswValidator, noValidator, numValid, ipValid} from '../../../api';
  import headerTitle from "../../publicComponents/headerTitle.vue";

  export default {
    data() {
      let ipValidate = (rule, value, callback) => {
        if (!ipValid(value)) {
          callback(new Error("请输入正确的ip地址"));
        } else {
          callback();
        }
      };
      let nameValidate = (rule, value, callback) => {
        if (noValidator(value)) {
          callback(new Error("只能输入英文字母、数字、下划线"));
        } else {
          callback();
        }
      };
      let pswValidate = (rule, value, callback) => {
        if (!pswValidator(value)) {
          callback(new Error("只能输入英文字母、数字以及~!@#$%^&*=+/-"));
        } else {
          callback();
        }
      };
      let numValidate = (rule, value, callback) => {
        if (!numValid(value)) {
          callback(new Error("只能输入整数"));
        } else {
          callback();
        }
      };
      return {
        listLoading: false,
        addUserVisible: false,
        modifyUserVisible: false,
        modifyPswVisible: false,
        resetPswVisible: false,
        addUserTitle: '添加FTP',
        dialogWidth: $.Device.isPC() ? '35%' : '90%',
        userId: JSON.parse(sessionStorage.getItem("user")).userId,
        ftp: {},
        ftp1: {},
        rules: {
          ftpHost: [
            {required: true, message: '请输入ftp地址', trigger: 'blur'}, {validator: ipValidate, trigger: "change,blur"}],
          ftpPort: [
            {required: true, message: '请输入端口号', trigger: 'blur'}, {validator: numValidate, trigger: "change,blur"}
          ],
          ftpUserName: [
            {required: true, message: '请输入用户名', trigger: 'blur'}, {validator: nameValidate, trigger: "change,blur"}
          ],
          ftpPassword: [
            {required: true, message: '请输入密码', trigger: 'blur'}, {validator: pswValidate, trigger: "change,blur"}],
          companyCode: [
            {required: true, message: '请输入公司代码', trigger: 'blur'}, {validator: numValidate, trigger: "change,blur"}
          ],
          dataGenerateSrc: [
            {required: true, message: '请输入数据来源编码', trigger: 'blur'},
            {validator: numValidate, trigger: "change,blur"},
          ],
          groupId: [{required: true, message: '请选择组织', trigger: 'blur'}]
        },
        count: 0,
        query: {page: 1, size: 10, ftpHost: "", ftpUserName: "", groupId: ''},
        organizations: [],
        ftps: []
      }
    },
    methods: {
      getButtonVial(msg) {
        return $.Button.buttonValidator(msg);
      },
      addFtp() {
        this.ftp = {
          ftpHost: "", ftpPort: '', ftpUserName: "", ftpPassword: "", companyCode: "",
          dataGenerateSrc: "", groupId: ""
        };
        this.ftp1 = {
          ftpHost: "", ftpPort: '', ftpUserName: "", ftpPassword: "", companyCode: "",
          dataGenerateSrc: "", groupId: ""
        };
        this.addUserVisible = true;
        this.addUserTitle = '添加FTP';
      },
      updateInfo(row) {
        this.ftp = row;
        this.ftp1.ftpHost = row.ftpHost;
        this.ftp1.ftpPort = row.ftpPort;
        this.ftp1.ftpUserName = row.ftpUserName;
        this.ftp1.ftpPassword = row.ftpPassword;
        this.ftp1.companyCode = row.companyCode;
        this.ftp1.dataGenerateSrc = row.dataGenerateSrc;
        this.ftp1.groupId = row.groupId;
        this.addUserTitle = '修改FTP';
        this.addUserVisible = true;
      },
      cancelSubmit(title) {
        this.addUserVisible = false;
        if (title === '修改FTP') {
          this.ftp.ftpHost = this.ftp1.ftpHost;
          this.ftp.ftpPort = this.ftp1.ftpPort;
          this.ftp.ftpUserName = this.ftp1.ftpUserName;
          this.ftp.ftpPassword = this.ftp1.ftpPassword;
          this.ftp.companyCode = this.ftp1.companyCode;
          this.ftp.dataGenerateSrc = this.ftp1.dataGenerateSrc;
          this.ftp.groupId = this.ftp1.groupId;
        } else {
          this.ftp = this.ftp1;
        }
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column, cellValue) {
        if (column.property === 'status') {
          return row[column.property] === 'ENABLE' ? '启用' : row[column.property] === 'UNABLE' ? '禁用' : '--';
        } else if (column.property === 'groupId') {
          for (let item of this.organizations) {
            if (item.groupId === row.groupId) {
              return item.groupName;
            }
          }
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      },
      //账号启用/停用
      ftpStatus(ftp) {
        let param = false;
        let msg = '确定要启用该ftp？';
        if (ftp.status === 'ENABLE') {
          param = false;
          msg = '确定要禁用该ftp？'
        } else {
          param = true;
        }
        this.$confirm(msg, '提示', {type: 'warning'}).then(() => {
          this.$post('/ftpConfig/statusSwitch/' + ftp.id + '/' + param, {}, '操作成功').then((data) => {
            this.getFtpList();
          });
        }).catch((err) => {
        });
      },
      getFtpList() {
        this.listLoading = true;
        this.$post("/ftpConfig/queryFtpConfig", this.query).then((data) => {
          this.ftps = data.data.list;
          this.count = data.data.count;
          setTimeout(() => {
            this.listLoading = false
          }, 500);
        }).catch((err) => {
          this.listLoading = false;
          this.ftps = [];
          this.$message.error(err);
        });
      },
      pageChange(index) {
        this.query.page = index;
        this.getFtpList();
      },
      handleSizeChange(val) {
        this.query.size = val;
        this.getFtpList();
      },
      clearData() {
        this.query = {page: 1, size: 10, ftpHost: "", ftpUserName: "", groupId: ''};
        this.getFtpList();
      },
      onSubmit(formName, title) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            let url = '/ftpConfig/add';
            let msg = '添加成功';
            if (title === '修改FTP') {
              url = '/ftpConfig/update';
              msg = '修改成功';
            } else {
//              this.admin.creatorId = this.userId;
//              this.admin.locked = 0;
//              this.admin.password = md5(this.admin.password);
            }
            this.$post(url, this.ftp, msg).then((data) => {
              if ("000000" === data.code) {
                this.addUserVisible = false;
                this.getFtpList();
              }
            });
          }
        })
      },
      //获取组织列表
      getOrganizations() {
        this.$post('/manager/group/query', {page: 1, size: 9999, userId: this.userId}).then((data) => {
          this.organizations = data.data.content;
        });
      }
    },
    mounted() {
      this.getFtpList();
      this.getOrganizations();
    },
    components: {
      headerTitle
    }
  }
</script>
