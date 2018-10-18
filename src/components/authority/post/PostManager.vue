<template>
  <div>
    <section class="content">
      <headerTitle></headerTitle>
      <el-row style="margin-top:20px;margin-bottom: 10px">
        <el-col :span="20" align="left">
          <el-input placeholder="岗位名称" v-model="query.roleName" :maxlength="30" size="medium"
                    style="width: 200px;margin-right: 10px;margin-top: 10px"></el-input>
          <el-select v-model="query.roleType" placeholder="类型" size="medium" filterable
                     style="width: 160px;margin-right: 10px;margin-top: 10px" clearable>
            <el-option v-for="item in postTypes" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
          <el-button type="primary" icon="search" style="margin-top: 10px" size="medium"
                     @click.stop="query.page=1;getPosts()">搜索
          </el-button>
          <el-button style="margin-top: 10px" @click.stop="clearData()" size="medium">清除</el-button>
        </el-col>
        <el-col :span="4" align="right">
          <el-button type="primary" icon="el-icon-plus" @click="addPost()" style="margin-top: 10px"
                     v-show="getButtonVial('manager:role:create')" size="medium">创建岗位
          </el-button>
        </el-col>
      </el-row>
      <el-table :data="posts" v-loading="listLoading" class="center-block" stripe>
        <el-table-column align="center" type="index" label="序号" width="70"></el-table-column>
        <el-table-column align="left" prop="roleName" label="岗位名称" min-width="150"
                         max-width="300" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="remark" label="备注" min-width="150"
                         max-width="300" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="roleType" label="类型" min-width="150"
                         max-width="300" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="state" label="状态" min-width="150"
                         max-width="300" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="操作" width="200">
          <template slot-scope="scope">
            <el-button type="text" @click="usePost(scope.row)"
                       v-show="getButtonVial('manager:role:update') && scope.row.roleType==1">
              {{scope.row.state == 0 ? '停用' : '启用'}}
            </el-button>
            <el-button type="text" @click="postInfo(scope.row)"
                       v-show="getButtonVial('manager:role:detail:*') && scope.row.roleType==0">查看
            </el-button>
            <el-button v-show="getButtonVial('manager:role:update')" type="text" @click="modifyPost(scope.row)">修改
            </el-button>
            <el-button @click="deletePost(scope.row.roleId)" type="text"
                       v-show="getButtonVial('manager:role:delete:*') && scope.row.roleType==1">删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="block" style="margin-top: 20px">
        <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page="query.page"
                       :page-sizes="[10, 15, 20, 30]" :page-size="query.size" :total="count" background
                       layout="total, sizes, prev, pager, next, jumper"></el-pagination>
      </div>
      <!--添加/修改角色-->
      <el-dialog :title="addPostTitle" :visible.sync="addPostVisible" :width="dialogWidth" :before-close="handleClose">
        <el-form ref="post" :model="post" :label-width="labelWidth" :rules="rules" labelPosition="right">
          <el-form-item label="岗位名称" prop="roleName" align="left">
            <el-input v-model="post.roleName" placeholder="请输入岗位名称" v-if="isShow" :maxlength="16"></el-input>
            <span v-else>{{post.roleName}}</span>
          </el-form-item>
          <el-form-item label="备注" align="left">
            <el-input v-model="post.remark" placeholder="备注信息" type="textarea" v-if="isShow" :maxlength="50"></el-input>
            <span v-else>{{post.remark}}</span>
          </el-form-item>
          <el-form-item label="功能权限" align="left" required>
            <el-tree :data="permissions" show-checkbox node-key="permissionId" :props="defaultProps" ref="tree"
                     default-expand-all check-strictly :default-checked-keys="post.permissions"></el-tree>
          </el-form-item>
        </el-form>
        <div class="block" style="margin-top: 20px" v-show="isShow">
          <el-button @click="cancelSubmit(addPostTitle)">取消</el-button>
          <el-button type="primary" @click="onSubmit('post',addPostTitle)">确认</el-button>
        </div>
      </el-dialog>
    </section>
  </div>
</template>
<script>
  import headerTitle from "../../publicComponents/headerTitle.vue";

  export default {
    data() {
      let nickValidator = (rule, value, callback) => {
        if (!/[A-Za-z0-9\u4e00-\u9fa5]{2,16}$/.test(value)) {
          callback(new Error("请输入正确的岗位名称，由2-16位汉字、数字、英文字母组成"));
        } else {
          callback();
        }
      };
      return {
        listLoading: false,
        addPostVisible: false,
        isShow: false,
        dialogWidth: $.Device.isPC() ? '40%' : '90%',
        labelWidth: $.Device.isPC() ? '120px' : '80px',
        query: {
          page: 1, size: 10, roleName: '', roleType: '', lastNode: true,
          creatorGroupId: JSON.parse(sessionStorage.getItem("user")).groupId
        },
        count: 0,
        postTypes: [{value: '', label: '全部类型'}, {value: 0, label: '通用'}, {value: 1, label: '自定义'}],
        posts: [],
        addPostTitle: '创建岗位',
        post: {},
        post1: {},
        rules: {
          roleName: [
            {required: true, message: '请输入岗位名称', trigger: 'blur'}, {validator: nickValidator, trigger: "change,blur"}
          ]
        },
        permissions: [],
        defaultProps: {children: 'childs', label: 'name'}
      }
    },
    methods: {
      getButtonVial(msg) {
        return $.Button.buttonValidator(msg);
      },
      //创建岗位
      addPost() {
        this.post = {};
        this.addPostTitle = '创建岗位';
        this.isShow = true;
        this.addPostVisible = true;
        this.$refs.tree.setCheckedKeys([]);
      },
      //修改岗位
      modifyPost(row) {
        this.post = row;
        this.post1.roleName = row.roleName;
        this.post1.remark = row.remark;
        this.post1.permissions = row.permissions;
        this.addPostTitle = '修改岗位';
        this.isShow = true;
        this.addPostVisible = true;
        this.$refs.tree.setCheckedKeys(this.post.permissions);
      },
      //查看岗位
      postInfo(row) {
        this.post = row;
        this.post1.roleName = row.roleName;
        this.post1.remark = row.remark;
        this.post1.permissions = row.permissions;
        this.addPostTitle = '岗位信息';
        this.isShow = false;
        this.addPostVisible = true;
        this.$refs.tree.setCheckedKeys(this.post.permissions);
      },
      //取消
      cancelSubmit(title) {
        this.addPostVisible = false;
        if (title === '修改岗位' || title === '岗位信息') {
          this.post.roleName = this.post1.roleName;
          this.post.remark = this.post1.remark;
          this.post.permissions = this.post1.permissions;
        } else {
          this.post = this.post1;
        }
      },
      handleClose(done) {
        done();
        if (this.addPostTitle === '修改岗位' || this.addPostTitle === '岗位信息') {
          this.post.roleName = this.post1.roleName;
          this.post.remark = this.post1.remark;
          this.post.permissions = this.post1.permissions;
        } else {
          this.post = this.post1;
        }
      },
      //确认提交
      onSubmit(formName, title) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.post.permissions = this.$refs.tree.getCheckedKeys();
            if (this.post.permissions.length === 0) {
              this.$message.error('请选择功能权限');
              return;
            }
            let url = '/manager/role/create';
            let msg = '创建成功';
            if (title === '修改岗位') {
              url = '/manager/role/update';
              msg = '修改成功';
            } else {
              this.post.creatorId = JSON.parse(sessionStorage.getItem("user")).userId;
              this.post.creatorGroupId = JSON.parse(sessionStorage.getItem("user")).groupId;
              this.post.state = '0';
              this.post.roleType = 1;
            }
            this.$post(url, this.post, msg).then((data) => {
              this.$refs.tree.setCheckedKeys([]);
              if ("000000" === data.code) {
                this.addPostVisible = false;
                this.getPosts();
              } else {
                this.$message.error(data.msg);
              }
            });
          }
        });
      },
      //删除岗位
      deletePost(id) {
        this.$confirm('确定要删除该岗位？', '提示', {
          type: 'warning'
        }).then(() => {
          this.$post('/manager/role/delete/' + id, {}, '删除成功').then((data) => {
            this.getPosts();
          });
        }).catch((err) => {
        });
      },
      //启用/停用岗位
      usePost(role) {
        let param = {roleId: role.roleId};
        let msg = '确定要启用该岗位？';
        if (role.state == 0) {
          param.state = 1;
          msg = '确定要停用该岗位？'
        } else {
          param.state = 0;
        }
        this.$confirm(msg, '提示', {
          type: 'warning'
        }).then(() => {
          this.$post('/manager/role/update', param, '操作成功').then((data) => {
            this.getPosts();
          });
        }).catch((err) => {
        });
      },
      //获取岗位列表
      getPosts() {
        this.listLoading = true;
        this.$post('/manager/role/query', this.query).then((data) => {
          this.posts = data.data.content;
          this.count = data.data.totalElements;
          setTimeout(() => {
            this.listLoading = false;
          }, 500);
        }).catch((err) => {
          this.listLoading = false;
          this.posts = [];
          this.$message.error(err);
        });
      },
      pageChange(index) {
        this.query.page = index;
        this.getPosts();
      },
      handleSizeChange(val) {
        this.query.size = val;
        this.getPosts();
      },
      clearData() {
        this.query = {
          page: 1, size: 10, roleName: '', roleType: '', lastNode: true,
          creatorGroupId: JSON.parse(sessionStorage.getItem("user")).groupId
        };
        this.getPosts();
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property == 'state') {
          return row[column.property] == 0 ? '正常' : row[column.property] == 1 ? '禁用' : '--';
        } else if (column.property == 'roleType') {
          return row[column.property] == 0 ? '通用' : row[column.property] == 1 ? '自定义' : '--';
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      },
      //获取菜单树
      getMenuTree() {
        this.$post('/manager/permission/menuTree/' + JSON.parse(sessionStorage.getItem("user")).userId + '/3', {}).then((data) => {
          this.permissions = data.data;
        });
      }
    },
    mounted() {
      this.getPosts();
      this.getMenuTree();
    },
    components: {
      headerTitle
    }
  }
</script>
