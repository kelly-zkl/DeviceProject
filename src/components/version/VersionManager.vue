<template>
  <div>
    <section class="content">
      <headerTitle></headerTitle>
      <div class="center-block">
        <el-tabs v-model="activeName" @tab-click="handleClick" style="margin-top: 20px">
          <el-tab-pane label="版本管理" name="first">
            <el-row style="margin:0 0 10px 0">
              <el-col :span="18" align="left">
                <el-input placeholder="版本号" v-model="query.versionNum" :maxlength="20" size="medium"
                          style="width: 150px;margin-right: 10px;margin-top: 10px"></el-input>
                <el-select v-model="query.deviceForm" placeholder="全部形态" size="medium" filterable
                           style="width: 150px;margin-right: 10px;margin-top: 10px" clearable>
                  <el-option v-for="item in deviceForms" :key="item.code" :label="item.name" :value="item.code">
                  </el-option>
                </el-select>
                <el-select v-model="query.deviceType" placeholder="全部类型" size="medium" filterable
                           style="width: 150px;margin-right: 10px;margin-top: 10px" clearable>
                  <el-option v-for="item in deviceTypes" :key="item.code" :label="item.name" :value="item.code">
                  </el-option>
                </el-select>
                <el-button type="primary" icon="search" style="width: 80px;margin-top: 10px"
                           @click.stop="getVersionList()" size="medium">搜索
                </el-button>
                <el-button style="width: 80px;margin-top: 10px" @click.stop="clearVersion()" size="medium">清除
                </el-button>
              </el-col>
              <el-col :span="6" align="right">
                <el-button type="primary" icon="el-icon-upload2" style="margin-top: 10px" @click="uploadPck()"
                           v-show="getButtonVial('version:add')" size="medium">上传安装包
                </el-button>
              </el-col>
            </el-row>
            <el-table :data="versionList" v-loading="listLoading1" class="center-block"
                      @row-dblclick="rowClickVersion" stripe>
              <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
              <el-table-column align="left" label="类型" prop="versionType" min-width="125"
                               max-width="250" :formatter="formatterAddress"></el-table-column>
              <el-table-column align="left" label="版本号" prop="versionNum" min-width="125"
                               max-width="250" :formatter="formatterAddress"></el-table-column>
              <el-table-column align="left" label="适用形态" prop="deviceFormVal" min-width="125"
                               max-width="250" :formatter="formatterAddress"></el-table-column>
              <el-table-column align="left" label="适用类型" prop="deviceTypeVal" min-width="125"
                               max-width="250" :formatter="formatterAddress"></el-table-column>
              <el-table-column align="left" label="版本应用类型" prop="applyType" width="120"
                               :formatter="formatterAddress"></el-table-column>
              <el-table-column align="left" label="描述" prop="versionDescription" min-width="150"
                               max-width="400" :formatter="formatterAddress"></el-table-column>
              <el-table-column align="left" label="上传时间" prop="createTime" min-width="160"
                               max-width="250" :formatter="formatterAddress"></el-table-column>
              <el-table-column align="left" label="上传用户" prop="createBy" min-width="125"
                               max-width="250" :formatter="formatterAddress"></el-table-column>
              <el-table-column align="center" label="操作" width="180">
                <template slot-scope="scope">
                  <el-button class="delete" @click="deletePck(scope.row.id,scope.row.versionType)" size="small"
                             v-show="getButtonVial('version:delete:*')"></el-button>
                  <el-button v-show="getButtonVial('version:queryPush:*') && getButtonVial('version:queryPushRecord')"
                             class="record" @click="gotoUpdate(scope.row)" size="small"></el-button>
                  <el-button class="push" @click="gotoPush(scope.row)" size="small"
                             v-show="getButtonVial('version:push')"></el-button>
                </template>
              </el-table-column>
            </el-table>
            <div class="block" style="margin-top: 20px">
              <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page="query.page"
                             :page-sizes="[10, 15, 20, 30]" :page-size="query.size" :total="count" background
                             layout="total, sizes, prev, pager, next, jumper"></el-pagination>
            </div>
          </el-tab-pane>
          <el-tab-pane label="补丁管理" name="second">
            <el-row style="margin:0 0 10px 0">
              <el-col :span="18" align="left">
                <el-input placeholder="补丁编号" v-model="queryPatch.patchVersionNum" :maxlength="20"
                          style="width: 150px;margin-right: 10px;margin-top: 10px" size="medium"></el-input>
                <el-select v-model="queryPatch.versionNum" placeholder="全部版本" size="medium" filterable
                           style="width: 150px;margin-right: 10px;margin-top: 10px" clearable>
                  <el-option v-for="item in versions" :key="item.id" :label="item.versionNum" :value="item.versionNum">
                  </el-option>
                </el-select>
                <el-button type="primary" icon="search" style="width: 80px;;margin-top: 10px"
                           @click.stop="getPatchList()" size="medium">搜索
                </el-button>
                <el-button style="width: 80px;margin-top: 10px" @click.stop="clearPatch()" size="medium">清除</el-button>
              </el-col>
              <el-col :span="6" align="right">
                <el-button type="primary" icon="el-icon-upload2" style="margin-top: 10px" @click="uploadPck()"
                           v-show="getButtonVial('version:add')" size="medium">上传安装包
                </el-button>
              </el-col>
            </el-row>
            <el-table :data="patchList" v-loading="listLoading2" class="center-block"
                      @row-dblclick="rowClickPatch" stripe>
              <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
              <el-table-column align="left" label="类型" prop="versionType" min-width="125"
                               max-width="250" :formatter="formatterAddress"></el-table-column>
              <el-table-column align="left" label="补丁编号" prop="patchVersionNum" min-width="125"
                               max-width="250" :formatter="formatterAddress"></el-table-column>
              <el-table-column align="left" label="适用版本" prop="versionNum" min-width="125"
                               max-width="250" :formatter="formatterAddress"></el-table-column>
              <el-table-column align="left" label="描述" prop="versionDescription" min-width="150"
                               max-width="400" :formatter="formatterAddress"></el-table-column>
              <el-table-column align="left" label="上传时间" prop="createTime" min-width="160"
                               max-width="250" :formatter="formatterAddress"></el-table-column>
              <el-table-column align="left" label="上传用户" prop="createBy" min-width="125"
                               max-width="250" :formatter="formatterAddress"></el-table-column>
              <el-table-column align="center" label="操作" width="180">
                <template slot-scope="scope">
                  <el-button class="delete" @click="deletePck(scope.row.id,scope.row.versionType)" size="small"
                             v-show="getButtonVial('version:delete:*')"></el-button>
                  <el-button v-show="getButtonVial('version:queryPush:*') && getButtonVial('version:queryPushRecord')"
                             class="record" @click="gotoUpdate(scope.row)" size="small"></el-button>
                  <el-button class="push" @click="gotoPush(scope.row)" size="small"
                             v-show="getButtonVial('version:push')"></el-button>
                </template>
              </el-table-column>
            </el-table>
            <div class="block" style="margin-top: 20px">
              <el-pagination @size-change="handleSizeChange1" @current-change="pageChange1" :total="count1" background
                             :current-page="queryPatch.page" :page-sizes="[10, 15, 20, 30]" :page-size="queryPatch.size"
                             layout="total, sizes, prev, pager, next, jumper"></el-pagination>
            </div>
          </el-tab-pane>
        </el-tabs>
        <!--版本详情-->
        <el-dialog title="版本详情" :visible.sync="dialogVersion" :width="dialogWidth">
          <el-form ref="versionDetail" :model="versionDetail" label-width="100px" label-position="left">
            <el-form-item label="安装包" style="text-align: left">{{versionDetail.pckname}}</el-form-item>
            <el-form-item label="版本号" style="text-align: left">{{versionDetail.versionNum}}</el-form-item>
            <el-form-item label="适用形态" style="text-align: left">{{versionDetail.deviceFormVal}}</el-form-item>
            <el-form-item label="适用类型" style="text-align: left">{{versionDetail.deviceTypeVal}}</el-form-item>
            <el-form-item label="版本应用类型" style="text-align: left" v-if="versionDetail.deviceForm == 'CON_OUTDOOR_POLE'
              && !!versionDetail.applyType">
              {{versionDetail.applyType == 'x86' ? 'x86' : '基带板'}}
            </el-form-item>
            <el-form-item label="描述" style="text-align: left">{{versionDetail.versionDescription}}</el-form-item>
            <el-form-item label="MD5" style="text-align: left">{{versionDetail.md5}}</el-form-item>
          </el-form>
        </el-dialog>
        <!--补丁详情-->
        <el-dialog title="补丁详情" :visible.sync="dialogPatch" :width="dialogWidth">
          <el-form ref="patchDetail" :model="patchDetail" label-width="100px" label-position="right">
            <el-form-item label="安装包" style="text-align: left">{{patchDetail.pckname}} </el-form-item>
            <el-form-item label="补丁名称" style="text-align: left">{{patchDetail.patchVersionNum}}</el-form-item>
            <el-form-item label="适用版本" style="text-align: left">{{patchDetail.versionNum}} </el-form-item>
            <el-form-item label="描述" style="text-align: left">{{patchDetail.versionDescription}} </el-form-item>
            <el-form-item label="MD5" style="text-align: left">{{patchDetail.md5}} </el-form-item>
          </el-form>
        </el-dialog>
        <!--上传安装包-->
        <el-dialog title="上传安装包" :visible.sync="dialogUpload" :width="dialogWidth"
                   v-loading="uploading" element-loading-text="正在上传"
                   element-loading-spinner="el-icon-loading" element-loading-background="rgba(0, 0, 0, 0.8)">
          <el-form ref="pckDetail" :model="pckDetail" label-width="100px" :rules="rules" label-position="right">
            <el-form-item label="类型" style="text-align: left">
              <el-radio-group v-model="pckDetail.versionType" @change="changeType">
                <el-radio :label="'RELEASE'">主版本</el-radio>
                <el-radio :label="'PATCH'">补丁</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="版本号" v-show="pckDetail.versionType == 'RELEASE'" prop="versionNum">
              <el-input v-model="pckDetail.versionNum" :maxlength="20"></el-input>
            </el-form-item>
            <el-form-item label="适用形态" v-show="pckDetail.versionType == 'RELEASE'" required>
              <el-select v-model="pckDetail.deviceForm" placeholder="请选择" style="width: 100%" filterable
                         @change="handleChangeForm">
                <el-option v-for="item in deviceForms" :key="item.code" :label="item.name" :value="item.code">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="适用类型" v-show="pckDetail.versionType == 'RELEASE'" required>
              <el-select v-model="pckDetail.deviceType" placeholder="请选择" style="width: 100%" filterable>
                <el-option v-for="item in deviceTypes" :key="item.code" :label="item.name" :value="item.code">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="补丁编号" v-show="pckDetail.versionType == 'PATCH'" prop="patchVersionNum">
              <el-input v-model="pckDetail.patchVersionNum" :maxlength="20"></el-input>
            </el-form-item>
            <el-form-item label="适用版本" v-show="pckDetail.versionType == 'PATCH'" required>
              <el-select v-model="pckDetail.versionNum" placeholder="请选择" style="width: 100%" filterable>
                <el-option v-for="item in versions" :key="item.id" :label="item.versionNum" :value="item.versionNum">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="安装包" required>
              <el-input placeholder="请选择压缩文件" v-model="pckname" disabled>
                <el-upload class="upload" slot="append" :action="uploadPckUrl" :show-file-list="false"
                           :on-success="handleSuccess" :before-upload="beforeUpload" name="file">
                  <el-button type="primary" icon="el-icon-plus"></el-button>
                </el-upload>
              </el-input>
            </el-form-item>
            <!--<el-form-item label="适用范围" required style="text-align: left"-->
            <!--v-show="pckDetail.versionType == 'RELEASE'&& pckDetail.deviceForm=='CON_OUTDOOR_POLE'">-->
            <!--<el-radio-group v-model="pckDetail.applyType">-->
            <!--<el-radio v-for="item in applyTypes" :key="item.code" :label="item.code">{{item.name}}</el-radio>-->
            <!--</el-radio-group>-->
            <!--</el-form-item>-->
            <el-form-item label="描述">
              <el-input type="textarea" v-model="pckDetail.versionDescription" :maxlength="50"></el-input>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer" align="center">
            <el-button type="primary" @click="pckAdd">确认上传</el-button>
          </div>
        </el-dialog>
      </div>
    </section>
  </div>
</template>
<script>
  import {pcknumValidator, globalValidZIP} from '../../api';
  import headerTitle from "../publicComponents/headerTitle.vue";

  export default {
    data() {
      let pckValidate = (rule, value, callback) => {
        if (value.length < 3) {
          callback(new Error('编号不能小于3位'));
        } else if (value.length > 20) {
          callback(new Error('编号不能大于20位'));
        } else if (!pcknumValidator(value)) {
          callback(new Error("请输入正确的编号，由英文字母、数字、下划线及点组成"));
        } else {
          callback();
        }
      };
      return {
        dialogWidth: $.Device.isPC() ? '40%' : '90%',
        versionList: [],
        patchList: [],
        listLoading1: false,
        listLoading2: false,
        activeName: 'first',
        query: {page: 1, size: 10, versionType: 'RELEASE', deviceType: "", deviceForm: "", versionNum: ""},
        queryPatch: {page: 1, size: 10, versionType: 'PATCH', patchVersionNum: '', versionNum: ''},
        count: 0,
        count1: 0,
        deviceForms: [],
        deviceTypes: [],
        versions: [],
        dialogVersion: false,
        dialogPatch: false,
        dialogUpload: false,
        uploading: false,
        versionDetail: {},//版本详情
        patchDetail: {},//补丁详情
        pckDetail: {
          versionType: 'RELEASE',
          deviceForm: 'CON_OUTDOOR_MOCRO',
          deviceType: '',
          versionNum: '',
          versionDescription: '',
          createBy: JSON.parse(sessionStorage.getItem("user")).name
        },//上传安装包参数
        pckname: '',
        releaseName: '',
        releaseUrl: '',
        releasemd5: '',
        applyType: '',
        baseband: '',
        pckName: '',
        pckUrl: '',
        pckmd5: '',
        rules: {
          versionNum: [
            {required: true, message: '请输入版本号', trigger: 'blur'},
            {validator: pckValidate, trigger: "change,blur"}
          ],
          patchVersionNum: [
            {required: true, message: '请输入补丁编号', trigger: 'blur'},
            {validator: pckValidate, trigger: "change,blur"}
          ]
        },
        uploadPckUrl: this.axios.defaults.baseURL + '/file/upload',
        applyTypes: [{name: 'x86', code: 'x86'}, {name: '基带板', code: 'BASEBAND'}],
      }
    },
    methods: {
      getButtonVial(msg) {
        return $.Button.buttonValidator(msg);
      },
      //      选择设备形态
      handleChangeForm(val) {
        if (val === 'CON_OUTDOOR_MOCRO') {//小站上传安装包地址
          this.uploadPckUrl = this.axios.defaults.baseURL + '/file/upload';
        } else {//大站上传安装包地址
          this.uploadPckUrl = this.axios.defaults.baseURL + '/file/uploadBS';
        }
        this.pckname = this.releaseName = '';
        this.pckDetail.versionUrl = this.releaseUrl = '';
        this.pckDetail.md5 = this.releasemd5 = '';
        this.pckDetail.applyType = this.applyType = '';
        this.pckDetail.baseband = this.baseband = '';
      },
      //文件上传前的验证
      beforeUpload(file) {
        if (globalValidZIP(file, this.$message)) {
          this.uploading = true;
        }
        return globalValidZIP(file, this.$message);
      },
      handleSuccess(res, file) {
        if (res.code === '000000') {
          this.uploading = false;
          const data = res.data;
          this.pckname = data.fileName;
          if (this.pckDetail.versionType === 'RELEASE') {
            this.releaseName = data.fileName;
            this.releaseUrl = this.axios.defaults.baseURL + '/file/download/' + data.fileName;
            this.releasemd5 = data.md5;
            this.applyType = data.applyType;
            this.baseband = data.baseband;

            this.pckDetail.applyType = this.applyType;
            this.pckDetail.baseband = this.baseband;
          } else {
            this.pckName = data.fileName;
            this.pckUrl = this.axios.defaults.baseURL + '/file/download/' + data.fileName;
            this.pckmd5 = data.md5;
          }
          this.pckDetail.versionUrl = this.axios.defaults.baseURL + '/file/download/' + data.fileName;
          this.pckDetail.md5 = data.md5;
        } else {
          this.$message.error(res.msg);
        }
      },
      //主版本/补丁切换
      changeType(val) {
        if (val === 'RELEASE') {//主版本
          this.pckDetail.versionType = 'RELEASE';
          delete this.pckDetail['patchVersionNum'];
          if (this.pckDetail.deviceForm === 'CON_OUTDOOR_MOCRO') {//小站上传安装包地址
            this.uploadPckUrl = this.axios.defaults.baseURL + '/file/upload';
          } else {//大站上传安装包地址
            this.uploadPckUrl = this.axios.defaults.baseURL + '/file/uploadBS';
          }
          if (!this.releaseUrl) {
            this.pckname = '';
          } else {
            this.pckname = this.releaseName;
            this.pckDetail.versionUrl = this.releaseUrl;
            this.pckDetail.md5 = this.releasemd5;
            this.pckDetail.applyType = this.applyType;
            this.pckDetail.baseband = this.baseband;
          }
        } else {//补丁
          this.pckDetail.versionType = 'PATCH';
          delete this.pckDetail['versionNum'];
          this.uploadPckUrl = this.axios.defaults.baseURL + '/file/upload';

          if (!this.pckUrl) {
            this.pckname = '';
          } else {
            this.pckname = this.pckName;
            this.pckDetail.versionUrl = this.pckUrl;
            this.pckDetail.md5 = this.pckmd5;
          }
        }
      },
      gotoUpdate(version) {
        sessionStorage.setItem("activeName", this.activeName);
        if (this.activeName === 'first') {
          sessionStorage.setItem("query", JSON.stringify(this.query));
        } else {
          sessionStorage.setItem("query", JSON.stringify(this.queryPatch));
        }
        this.$router.push({
          path: 'updateRecords',
          query: {
            versionId: version.id,
            versionNum: version.patchVersionNum ? version.patchVersionNum : version.versionNum
          }
        });
      },
      gotoPush(version) {
        sessionStorage.setItem("activeName", this.activeName);
        if (this.activeName === 'first') {
          sessionStorage.setItem("query", JSON.stringify(this.query));
        } else {
          sessionStorage.setItem("query", JSON.stringify(this.queryPatch));
        }
        this.$router.push({
          path: 'pushUpdate',
          query: {versionId: version.id, deviceForm: version.deviceForm, applyType: version.applyType}
        });
      },
      handleClick(tab, event) {
        if (tab.name === 'first') {
          this.getVersionList();
          this.pckDetail.versionType = 'RELEASE';
        } else {
          this.getPatchList();
          this.pckDetail.versionType = 'PATCH';
        }
      },
      //搜索版本列表
      clearVersion() {
        this.query = {page: 1, size: 10, versionType: 'RELEASE', deviceType: "", deviceForm: "", versionNum: ""};
        this.getVersionList();
      },
      pageChange(index) {
        this.query.page = index;
        this.getVersionList();
      },
      handleSizeChange(val) {
        this.query.size = val;
        this.getVersionList();
      },
      getVersionList() {
        if (this.query.versionNum) {
          if (!pcknumValidator(this.query.versionNum)) {
            this.$message.error('请输入正确的版本号');
            return;
          }
        }
        this.listLoading1 = true;
        this.$post('/version/query', this.query).then((data) => {
          this.versionList = data.data.list;
          this.count = data.data.count;
          setTimeout(() => {
            this.listLoading1 = false;
          }, 500);
        }).catch((err) => {
          this.listLoading1 = false;
          this.versionList = [];
          this.$message.error(err);
        });
      },
      getAllVersion() {
        this.$post('/version/query', {page: 1, size: 1000, versionType: 'RELEASE'}).then((data) => {
          this.versions = data.data.list;
        });
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'versionType') {
          return row.versionType === 'RELEASE' ? '主版本' : '补丁';
        } else if (column.property === 'applyType') {//版本应用类型
          return row.applyType ? row.applyType === 'X86' ? 'X86' : row.applyType === 'BASEBAND' ? '基带板' : 'kernel基带板' : '--';
        } else if (column.property === 'createTime') {
          return row.createTime ? $.Data.formatDate(new Date(row.createTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      },
      rowClickVersion(row, event, column) {
        this.dialogVersion = true;
        this.versionDetail = row;
        this.versionDetail.pckname = this.versionDetail.versionUrl.substr(this.versionDetail.versionUrl.lastIndexOf('/') + 1,
          this.versionDetail.versionUrl.length - 1);
      },
      //搜索补丁列表
      clearPatch() {
        this.queryPatch = {page: 1, size: 10, versionType: 'PATCH', patchVersionNum: '', versionNum: ''};
        this.getPatchList();
      },
      pageChange1(index) {
        this.queryPatch.page = index;
        this.getPatchList();
      },
      handleSizeChange1(val) {
        this.queryPatch.size = val;
        this.getPatchList();
      },
      getPatchList() {
        if (this.queryPatch.patchVersionNum) {
          if (!pcknumValidator(this.query.patchVersionNum)) {
            this.$message.error('请输入正确的补丁编号');
            return;
          }
        }
        this.listLoading2 = true;
        this.$post('/version/query', this.queryPatch).then((data) => {
          this.patchList = data.data.list;
          this.count1 = data.data.count;
          setTimeout(() => {
            this.listLoading2 = false;
          }, 500);
        }).catch((err) => {
          this.listLoading2 = false;
          this.patchList = [];
          this.$message.error(err);
        });
      },
      deletePck(id, type) {
        let msg = '';
        if (type === 'RELEASE') {
          msg = '确定删除该版本？';
        } else {
          msg = '确定删除该补丁？';
        }
        this.$confirm(msg, '提示', {type: 'warning'}).then(() => {
          this.$post("/version/delete/" + id, {}, '删除成功', '删除失败').then((data) => {
            if (type === 'RELEASE') {
              this.getVersionList();
              this.getAllVersion();
            } else {
              this.getPatchList();
            }
          })
        }).catch(() => {
        });
      },
      rowClickPatch(row, event, column) {
        this.dialogPatch = true;
        this.patchDetail = row;
        this.patchDetail.pckname = this.patchDetail.versionUrl.substr(this.patchDetail.versionUrl.lastIndexOf('/') + 1,
          this.patchDetail.versionUrl.length - 1);
      },
      //获取设备类型和形态
      getDeviceTypeAndForm() {
        this.$post('device/get/deviceType').then((data) => {
          if (data.code === '000000' && data.data) {
            this.deviceTypes = data.data;
          }
        });

        this.$post('device/get/deviceForm').then((data) => {
          if (data.code === '000000' && data.data) {
            this.deviceForms = data.data;
          }
        });
      },
      //上传安装包
      uploadPck() {
        this.dialogUpload = true;
        this.pckname = '';
        if (this.pckDetail.versionType === 'RELEASE') {
          this.pckDetail = {
            versionType: 'RELEASE', deviceForm: 'CON_OUTDOOR_MOCRO', deviceType: '',
            versionNum: '', versionDescription: '', md5: '', versionUrl: ''
          };
        } else {
          this.pckDetail = {versionType: 'PATCH', patchVersionNum: '', versionNum: '', versionDescription: ''};
        }
      },
      //安装包上传
      pckAdd() {
        this.$refs['pckDetail'].validate((valid) => {
          if (this.pckDetail.versionType === 'RELEASE') {
            if (!this.pckDetail.deviceForm || !this.pckDetail.deviceType
              || !this.pckDetail.versionNum || !this.pckDetail.versionUrl) {
              this.$message.error('请完善安装包信息');
              return;
            }
          } else {
            if (!this.pckDetail.patchVersionNum || !this.pckDetail.versionNum || !this.pckDetail.versionUrl) {
              this.$message.error('请完善补丁包信息');
              return;
            }
            for (let item of this.versions) {
              if (item.versionNum === this.pckDetail.versionNum) {
                this.pckDetail.deviceForm = item.deviceForm;
                this.pckDetail.deviceType = item.deviceType;
                break;
              }
            }
          }
          this.pckDetail.createBy = JSON.parse(sessionStorage.getItem("user")).account;
          this.$post('/version/add', this.pckDetail, '上传成功', '上传失败').then((data) => {
            this.dialogUpload = false;
            if (this.pckDetail.versionType === 'RELEASE') {
              this.getVersionList();
              this.getAllVersion();
            } else {
              this.getPatchList();
            }
          });
        });
      }
    },
    mounted() {//activeName
      let bol = JSON.parse(sessionStorage.getItem("query"));
      let tab = sessionStorage.getItem("activeName");
      if (tab && bol) {
        this.activeName = tab;
        if (tab === 'first') {
          this.query = JSON.parse(sessionStorage.getItem("query"));
          this.getVersionList();
        } else {
          this.queryPatch = JSON.parse(sessionStorage.getItem("query"));
          this.getPatchList();
        }
      } else {
        this.getVersionList();
      }
      this.getDeviceTypeAndForm();
      this.getAllVersion();
    },
    components: {
      headerTitle
    }
  }
</script>
<style scoped>
  .delete, .delete:visited, .delete:active, .delete:link, .delete:focus {
    width: 30px;
    height: 30px;
    background: url("../../assets/img/icon_delete.png") no-repeat center;
    border: none;
  }

  .delete:hover {
    background: none;
    font-size: 0;
  }

  .delete:hover:before {
    color: #539FF8;
    content: '删除';
    font-size: 12px;
    margin-top: -5px;
    margin-left: -10px;
  }

  .record, .record:visited, .record:link, .record:active, .record:focus {
    width: 30px;
    height: 30px;
    background: url("../../assets/img/icon_pushRecord.png") no-repeat center;
    border: none;
  }

  .record:hover {
    background: none;
    font-size: 0;
  }

  .record:hover:before {
    color: #539FF8;
    content: '记录';
    font-size: 12px;
    margin-top: -5px;
    margin-left: -10px;
  }

  .push, .push:visited, .push:link, .push:active, .push:focus {
    width: 30px;
    height: 30px;
    background: url("../../assets/img/icon_push.png") no-repeat center;
    border: none;
  }

  .push:hover {
    background: none;
    font-size: 0;
  }

  .push:hover:before {
    color: #539FF8;
    content: '推送';
    font-size: 12px;
    margin-top: -5px;
    margin-left: -10px;
  }
</style>
