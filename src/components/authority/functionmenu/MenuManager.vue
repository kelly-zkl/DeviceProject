<template>
  <div>
    <section class="content">
      <headerTitle></headerTitle>
      <el-row style="margin-top:20px;margin-bottom: 10px">
        <el-col :span="20" align="left">
          <el-input placeholder="菜单名称" v-model="query.name" :maxlength="30" size="medium"
                    style="width: 200px;margin-right: 10px;margin-top: 10px"></el-input>
          <el-select v-model="query.type" placeholder="类型" size="medium" filterable
                     style="width: 160px;margin-right: 10px;margin-top: 10px" clearable>
            <el-option v-for="item in menuTypes" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
          <el-button type="primary" icon="search" style="margin-top: 10px" @click.stop="query.page=1;getMenus()"
                     size="medium">搜索
          </el-button>
          <el-button style="margin-top: 10px" @click.stop="clearData()" size="medium">清除</el-button>
        </el-col>
        <el-col :span="4" align="right">
          <el-button type="primary" icon="el-icon-plus" @click="addMenu" style="margin-top: 10px"
                     v-show="getButtonVial('manager:permission:create')" size="medium">创建菜单
          </el-button>
        </el-col>
      </el-row>
      <el-table :data="menus" v-loading="listLoading" class="center-block" stripe>
        <el-table-column align="center" type="index" label="序号" width="70"></el-table-column>
        <el-table-column align="left" prop="name" label="菜单名称" min-width="150"
                         max-width="300" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="type" label="类型" width="110"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="pname" label="父级菜单" min-width="150"
                         max-width="300" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="icon" label="菜单图标" width="110">
          <template slot-scope="scope">
            <i :class="scope.row.icon" v-if="scope.row.icon"></i>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column align="left" prop="permissionUrl" label="菜单URL" min-width="150"
                         max-width="300" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="permissionValue" label="授权标识" min-width="150"
                         max-width="300" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="status" label="状态" width="110"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="操作" width="180">
          <template slot-scope="scope">
            <el-button type="text" @click="menuUse(scope.row)" v-show="getButtonVial('manager:permission:update')">
              {{scope.row.status == 0 ? '停用' : '启用'}}
            </el-button>
            <el-button type="text" @click.stop="modifyMenu(scope.row)"
                       v-show="getButtonVial('manager:permission:update')">修改
            </el-button>
            <el-button @click="deleteMenu(scope.row.permissionId)" type="text"
                       v-show="getButtonVial('manager:permission:delete:*')">删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="block" style="margin-top: 20px">
        <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page="query.page"
                       :page-sizes="[10, 15, 20, 30]" :page-size="query.size" :total="count" background
                       layout="total, sizes, prev, pager, next, jumper"></el-pagination>
      </div>
      <!--新建/修改菜单-->
      <el-dialog :title="addMenuTitle" :visible.sync="addMenuVisible" :width="dialogWidth">
        <el-form ref="menu" :model="menu" label-width="100px" :rules="rules" labelPosition="right">
          <el-form-item label="类型" align="left" required>
            <el-radio-group v-model="menu.type">
              <el-radio :label="1">目录</el-radio>
              <el-radio :label="2">菜单</el-radio>
              <el-radio :label="3">按钮</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="菜单名称" prop="name">
            <el-input v-model="menu.name" placeholder="请输入菜单名称" :maxlength="20"></el-input>
          </el-form-item>
          <el-form-item label="父级菜单" v-show="menu.type != '1'" required align="left">
            <el-cascader :options="menuTree" change-on-select :props="defaultProps" :show-all-levels="false"
                         placeholder="请选择父级菜单" @change="handleChange" v-model="menu.pidArray"></el-cascader>
          </el-form-item>
          <el-form-item label="菜单图标">
            <el-input v-model="menu.icon" placeholder="请输入菜单图标" :maxlength="20"></el-input>
          </el-form-item>
          <el-form-item label="菜单URL" v-show="menu.type != '3'" prop="permissionUrl">
            <el-input v-model="menu.permissionUrl" placeholder="请输入菜单URL" :maxlength="20"></el-input>
          </el-form-item>
          <el-form-item label="授权标识" prop="permissionValue">
            <el-input v-model="menu.permissionValue" placeholder="请输入授权标识" :maxlength="40"></el-input>
          </el-form-item>
          <el-form-item label="排序" v-show="menu.type != '3'" :maxlength="2">
            <el-input v-model="menu.orders"></el-input>
          </el-form-item>
        </el-form>
        <div class="block" style="margin-top: 20px">
          <el-button @click="cancelSubmit(addMenuTitle)">取消</el-button>
          <el-button type="primary" @click="onSubmit('menu',addMenuTitle)">确认</el-button>
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
        if (!/[A-Za-z0-9\u4e00-\u9fa5]{1,10}$/.test(value)) {
          callback(new Error("请输入正确的名称，由1-10位汉字、字母、数字组成"));
        } else {
          callback();
        }
      };
      return {
        listLoading: false,
        addMenuVisible: false,
        dialogWidth: $.Device.isPC() ? '35%' : '90%',
        menus: [],
        query: {page: 1, size: 10, name: '', type: ''},
        count: 0,
        menuTypes: [{value: '', label: '全部类型'}, {value: '1', label: '目录'}, {value: '2', label: '菜单'},
          {value: '3', label: '按钮'}],
        menu: {type: 1},
        menu1: {},
        addMenuTitle: '创建菜单',
        rules: {
          name: [
            {required: true, message: '请输入名称', trigger: 'blur'},
            {validator: nickValidator, trigger: "change,blur"}
          ],
          permissionUrl: [
            {required: true, message: '请输入菜单URL', trigger: 'blur'},
//            {validator: nickValidator, trigger: "change,blur"},
          ],
          permissionValue: [
            {required: true, message: '请输入授权标识', trigger: 'blur'},
//            {validator: nickValidator, trigger: "change,blur"},
          ]
        },
        menuTree: [],
        defaultProps: {children: 'childs', label: 'name', value: 'permissionId'},
      }
    },
    methods: {
      getButtonVial(msg) {
        return $.Button.buttonValidator(msg);
      },
      //父菜单
      handleChange(value) {
        this.menu.pid = value[value.length - 1];
      },
      //取消
      cancelSubmit(title) {
        this.addMenuVisible = false;
        if (title === '修改菜单') {
          this.menu.name = this.menu1.name;
          this.menu.type = this.menu1.type;
          this.menu.pidArray = this.menu1.pidArray;
          this.menu.permissionUrl = this.menu1.permissionUrl;
          this.menu.permissionValue = this.menu1.permissionValue;
        } else {
          this.menu = this.menu1;
        }
      },
      //确认提交
      onSubmit(formName, title) {
        this.$refs[formName].validate((valid) => {
//          if (valid) {
          let url = '/manager/permission/create';
          let msg = '创建成功';
          let tip = '创建菜单可能会改变系统的页面布局及功能，请谨慎操作！';
          if (title === '修改菜单') {
            url = '/manager/permission/update';
            msg = '修改成功';
            tip = '修改菜单可能会改变系统的页面布局及功能，请谨慎操作！';
          } else {
            this.menu.userId = JSON.parse(sessionStorage.getItem("user")).userId;
            this.menu.status = 0;
          }
          if (this.menu.pid === '' || this.menu.pid === null) {
            delete this.menu['pid'];
          }
          this.$confirm(tip, '提示', {type: 'warning'}).then(() => {
            this.$post(url, this.menu, msg).then((data) => {
              if ("000000" === data.code) {
                this.addMenuVisible = false;
                this.getMenus();
                this.getMenuTree();
              }
            });
          }).catch((err) => {
          });
//          }
        });
      },
      //创建菜单
      addMenu() {
        this.menu = {type: 1, pid: ''};
        this.menu1 = {type: 1, pid: ''};
        this.addMenuTitle = '创建菜单';
        this.addMenuVisible = true;
      },
      //修改菜单
      modifyMenu(row) {
        this.menu = row;
        this.menu1.name = row.name;
        this.menu1.type = row.type;
        this.menu1.pidArray = row.pidArray;
        this.menu1.permissionUrl = row.permissionUrl;
        this.menu1.permissionValue = row.permissionValue;
        this.addMenuTitle = '修改菜单';
        this.addMenuVisible = true;
      },
      //菜单启用/停用
      menuUse(menu) {
        let param = {permissionId: menu.permissionId};
        let msg = '启用该菜单可能会影响系统的功能，确定要启用？';
        if (menu.status == 0) {
          param.status = 1;
          msg = '停用该菜单可能会影响系统的功能，确定要停用？'
        } else {
          param.status = 0;
        }
        this.$confirm(msg, '提示', {type: 'warning'}).then(() => {
          this.$post('/manager/permission/update', param, '操作成功').then((data) => {
            this.getMenus();
            this.getMenuTree();
          });
        }).catch((err) => {
        });
      },
      //删除菜单
      deleteMenu(permissionId) {
        this.$confirm('删除菜单可能会影响系统功能，请谨慎操作！', '提示', {
          type: 'warning'
        }).then(() => {
          this.$post('/manager/permission/delete/' + permissionId, {}, '删除成功').then((data) => {
            this.getMenus();
            this.getMenuTree();
          });
        }).catch((err) => {
        });
      },
      getMenus() {
        this.listLoading = true;
        this.$post('/manager/permission/query', this.query).then((data) => {
          this.menus = data.data.content;
          this.count = data.data.totalElements;
          setTimeout(() => {
            this.listLoading = false;
          }, 500);
        }).catch((err) => {
          this.listLoading = false;
          this.menus = [];
          this.$message.error(err);
        });
      },
      pageChange(index) {
        this.query.page = index;
        this.getMenus();
      },
      handleSizeChange(val) {
        this.query.size = val;
        this.getMenus();
      },
      clearData() {
        this.query = {page: 1, size: 10, name: '', type: ''};
        this.getMenus();
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property == 'status') {
          return row[column.property] == 0 ? '正常' : '禁用';
        } else if (column.property == 'type') {
          return row[column.property] == 1 ? '目录' : row[column.property] == 2 ? '菜单' : row[column.property] == 3 ? '按钮' : '--';
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      },
      //获取菜单树
      getMenuTree() {
        this.$post('/manager/permission/menuTree/' + JSON.parse(sessionStorage.getItem("user")).userId + '/2', {}).then((data) => {
          this.menuTree = data.data;
        });
      }
    },
    mounted() {
      this.getMenus();
      this.getMenuTree();
    },
    components: {
      headerTitle
    }
  }
</script>
