<template>
  <el-container class="main-container">
    <el-header v-show="linkType !== 'yes'">
      <section>
        <el-row class="header-width">
          <el-col :span="12" align="left">
            <span class="header-btn" @click="isCollNav">
              <i class="fa fa-bars" style="margin-right: 16px"></i>侦码设备管理后台
            </span>
          </el-col>
          <el-col :span="12" align="right">
            <!--用户信息popover v-popover:userPopover-->
            <el-popover ref="userPopover" placement="bottom" width="320" trigger="click">
              <el-form label-width="80px">
                <el-row style="margin: 20px 20px 0 20px">
                  <el-col :span="12" align="left">
                    <span style="color: #409EFF">
                      <i class="fa fa-user-circle fa-2x" style="margin-right: 8px"></i>{{userName}}
                    </span>
                  </el-col>
                  <el-col :span="12" align="right" v-show="getButtonVial('manager:user:update')">
                    <el-button type="text" @click="runModifyUsername = true;user={}">
                      <i class="fa fa-pencil-square-o fa-lg"></i>
                    </el-button>
                  </el-col>
                </el-row>
                <el-form-item label="账号" style="margin: 0">{{account}}</el-form-item>
                <el-form-item label="手机号" style="margin: 0">{{phone}}</el-form-item>
                <el-row style="margin-top: 10px;border-top: 1px #409EFF solid">
                  <el-col :span="12">
                    <el-button
                      style="width: 100%;border-radius: 0 0 0 4px;border: none;border-right: 1px #409EFF solid;height: 45px"
                      type="primary" plain @click="runModifyPsw = true;psw={}">修改密码
                    </el-button>
                  </el-col>
                  <el-col :span="12">
                    <el-button type="primary" style="width: 100%;border-radius: 0 0 4px 0;border: none;height: 45px"
                               plain @click="runModifyPhone = true;bindphone={}" disabled>更换手机号
                    </el-button>
                  </el-col>
                </el-row>
              </el-form>
            </el-popover>
            <el-popover ref="modifyPsw" placement="bottom" width="200" trigger="click">
              <el-col :span="24">
                <el-button
                  style="width: 100%;border-radius: 0 0 0 4px;border: none;height: 45px"
                  type="text" @click="runModifyPsw = true;psw={}">修改密码
                </el-button>
              </el-col>
            </el-popover>
            <el-button type="text" style="height:60px;color: #fff;margin-right: 15px" v-popover:modifyPsw>
              <i class="fa fa-user-circle fa-2x" style="margin-right: 8px"></i>你好，{{userName}}
            </el-button>
            <el-button type="text" style="height:60px;color: #fff;font-size: 25px"
                       class="fa fa-power-off" @click="loginOut">
            </el-button>
          </el-col>
        </el-row>
        <!--修改用户名-->
        <el-dialog title="修改用户名" :width="dialogWidth" :visible.sync="runModifyUsername">
          <div class="block">
            <el-form label-width="100px" :rules="rules" ref="user" :model="user">
              <el-form-item label="新用户名" prop="realName">
                <el-input v-model="user.realName" placeholder="请输入用户名" :maxlength="16" :minlength="2"></el-input>
              </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer" align="center">
              <el-button @click="runModifyUsername = false">取消</el-button>
              <el-button type="primary" @click="modifyUserName('user')">确定</el-button>
            </div>
          </div>
        </el-dialog>
        <!--修改密码-->
        <el-dialog title="修改密码" :width="dialogWidth" :visible.sync="runModifyPsw">
          <div class="block">
            <el-form label-width="100px" :rules="rules" ref="psw" :model="psw">
              <el-form-item label="当前账号" align="left">{{account}}</el-form-item>
              <el-form-item label="当前密码" prop="password">
                <el-input type="password" :maxlength="18" :minlength="6" placeholder="输入密码"
                          v-model="psw.password"></el-input>
              </el-form-item>
              <el-form-item label="新密码" prop="password1">
                <el-input type="password" v-model="psw.password1"
                          placeholder="请输入6-16位密码" :maxlength="18" :minlength="6"></el-input>
              </el-form-item>
              <el-form-item label="密码确认" prop="password2">
                <el-input type="password" v-model="psw.password2"
                          placeholder="请再次输入新密码" :maxlength="18" :minlength="6"></el-input>
              </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer" align="center">
              <el-button @click="runModifyPsw = false">取消</el-button>
              <el-button type="primary" @click="modifyPsw('psw')">确定</el-button>
            </div>
          </div>
        </el-dialog>
        <!--更换手机号-->
        <el-dialog title="更换/绑定手机号" :width="dialogWidth" :visible.sync="runModifyPhone">
          <div class="block">
            <el-form label-width="100px" :rules="rules" ref="bindphone" :model="bindphone">
              <el-form-item label="手机号码" prop="phone">
                <el-input :maxlength="11" type="phone" v-model="bindphone.phone"></el-input>
              </el-form-item>
              <el-form-item label="验证码" prop="code">
                <el-input :maxlength="6" v-model="bindphone.code">
                  <el-button type="primary" slot="append" @click="getCode()">获取验证码</el-button>
                </el-input>
              </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer" align="center">
              <el-button @click="runModifyPhone = false">取消</el-button>
              <el-button type="primary" @click="bandPhone('bindphone')">确定</el-button>
            </div>
          </div>
        </el-dialog>
      </section>
    </el-header>
    <el-container class="main-content">
      <!--左侧菜单栏-->
      <el-aside :width="collapseWidth" v-bind:class="isCollapse ? 'content-aside-close' : 'content-aside'"
                v-show="linkType !== 'yes'">
        <el-menu :default-active="$route.path" :collapse="isCollapse" unique-opened router mode="vertical"
                 background-color="#333" text-color="#ccc" active-text-color="#59aaf4" @select="handleActive">
          <template v-for="item in menu">
            <el-submenu :index="item.permissionId" v-if="item.childs" style="text-align: left">
              <template slot="title">
                <i :class="item.icon" style="margin-right: 16px"></i>
                <span>{{item.name}}</span>
              </template>
              <el-menu-item v-for="child in item.childs" :index="child.permissionUrl" :key="child.permissionUrl"
                            style="padding-left: 55px">{{child.name}}
              </el-menu-item>
            </el-submenu>
            <el-menu-item v-else :index="item.permissionUrl" :key="item.permissionUrl" style="text-align: left">
              <i :class="item.icon" style="margin-right: 16px"></i>
              <span>{{item.name}}</span>
            </el-menu-item>
          </template>
        </el-menu>
      </el-aside>
      <!--main-->
      <el-main class="content-main">
        <div>
          <el-col :span="24" align="left" v-if="$route.path !='/deviceList' && $route.path !='/terminalList' &&
          $route.path !='/warningManager' && $route.path !='/versionManager'&& $route.path !='/deviceLogs' &&
          $route.path !='/adminAdd' && $route.path !='/postManager'&& $route.path !='/menuManager' &&
          $route.path !='/organizationManager' && $route.path !='/macList' && $route.path !='/deviceOverview' &&
          $route.path !='/ftpManager' && $route.path !='/collisionAnalysis' && $route.path !='/caseList'&&
          $route.path !='/followList' && $route.path !='/deviceLogs'">
            <el-button type="text" style="padding: 0;margin-right: 10px" @click="$router.go(-1)">返回上一级</el-button>
            <div class="bar">
              <el-breadcrumb separator-class="el-icon-arrow-right">
                <el-breadcrumb-item v-for="item in $route.matched" v-if="item.name && item.path"
                                    :to="{ path: item.path}" :key="item.name">{{ item.name}}
                </el-breadcrumb-item>
              </el-breadcrumb>
            </div>
          </el-col>
          <el-col :span="24">
            <transition name="fade" mode="out-in">
              <router-view></router-view>
            </transition>
          </el-col>
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
  import md5 from 'js-md5';
  import {pswValidator, nameValidator, mobileValidator, numValid} from '../api';

  export default {
    data() {
      let nickValidate = (rule, value, callback) => {
        if (value.length < 2) {
          callback(new Error('用户名不能小于2位'));
        } else if (value.length > 16) {
          callback(new Error('用户名不能大于16位'));
        } else if (!nameValidator(value)) {
          callback(new Error("请输入正确的用户名，由汉字、英文组成"));
        } else {
          callback();
        }
      };
      let pswValidate = (rule, value, callback) => {
        if (value.length < 6) {
          callback(new Error('密码不能小于6位'));
        } else if (value.length > 18) {
          callback(new Error('密码不能大于18位'));
        } else if (!pswValidator(value)) {
          callback(new Error("密码由英文字母、数字以及~!@#$%^&*=+/-组成"));
        } else {
          callback();
        }
      };
      let phoneValiate = (rule, value, callback) => {
        if (!mobileValidator(value)) {
          callback(new Error("请输入正确的手机号码"));
        } else {
          callback();
        }
      };
      let codeValiate = (rule, value, callback) => {
        if (!numValid(value)) {
          callback(new Error("请输入正确的验证码"));
        } else {
          callback();
        }
      };
      return {
        userName: JSON.parse(sessionStorage.getItem("user")).realName || '--',
        account: JSON.parse(sessionStorage.getItem("user")).account || '--',
        phone: JSON.parse(sessionStorage.getItem("user")).phone || '--',
        userId: JSON.parse(sessionStorage.getItem("user")).userId,
        dialogWidth: $.Device.isPC() ? '35%' : '90%',
        isCollapse: false,
        collapseWidth: '170px',
        runModifyUsername: false,
        runModifyPsw: false,
        runModifyPhone: false,
        rules: {
          realName: [
            {required: true, message: '请输入用户名', trigger: 'blur'},
            {validator: nickValidate, trigger: "change,blur"}
          ],
          password1: [
            {required: true, message: '请输入新密码', trigger: 'blur'},
            {validator: pswValidate, trigger: "change,blur"}
          ], password2: [
            {required: true, message: '请再次输入新密码', trigger: 'blur'},
            {validator: pswValidate, trigger: "change,blur"}
          ], password: [
            {required: true, message: '请输入密码', trigger: 'blur'},
          ], phone: [
            {required: true, message: '请输入手机号码', trigger: 'blur'},
            {validator: phoneValiate, trigger: "change,blur"}
          ], code: [
            {required: true, message: '请输入验证码', trigger: 'blur'},
            {validator: codeValiate, trigger: "change,blur"}
          ]
        },
        user: {realName: ''},
        psw: {password: '', password1: '', password2: ''},
        bindphone: {phone: '', code: ''},
        menu: JSON.parse(sessionStorage.getItem("menu")) || [],
        linkType: sessionStorage.getItem("link") || ''
      }
    },
    methods: {
      getButtonVial(msg) {
        return $.Button.buttonValidator(msg);
      },
      //菜单栏左侧缩小/放大功能
      isCollNav() {
        if (this.isCollapse) {
          this.isCollapse = false;
          this.collapseWidth = '60px';
        } else {
          this.isCollapse = true;
          this.collapseWidth = '170px';
        }
      },
      //菜单激活回调
      handleActive(index, indexPath) {
        sessionStorage.removeItem("deviceTab");
        sessionStorage.removeItem("query");
        sessionStorage.removeItem("activeName");
        sessionStorage.removeItem("cTime");
      },
      //退出
      loginOut() {
        this.$confirm('确认退出吗?', '提示', {type: 'info'}).then(() => {
          sessionStorage.removeItem("user");
          sessionStorage.removeItem("button");
          sessionStorage.removeItem("menu");
          sessionStorage.removeItem("deviceTab");
          sessionStorage.removeItem("query");
          sessionStorage.removeItem("activeName");
          sessionStorage.removeItem("cTime");
          sessionStorage.removeItem("link");
          this.$router.push("/login");
        }).catch(() => {
        });
      },
      //修改密码
      modifyPsw(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.$post('/manager/user/updatePwdByOldPwd', {
              userId: this.userId,
              oldPwd: md5(this.psw.password),
              newPwd: md5(this.psw.password2)
            }, '修改成功');
            this.runModifyPsw = false;
          }
        });
      },
      //修改用户名
      modifyUserName(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.$post('/manager/user/update', {userId: this.userId, realName: this.user.realName}, '修改成功')
              .then((data) => {
                if (data.code === '000000') {
                  this.userName = this.user.realName;
                }
              });
            this.runModifyUsername = false;
          }
        });
      },
      //发送短信验证码
      getCode() {
        if (!this.bindphone.phone) {
          this.$message.error('请输入手机号码');
          return;
        }
        this.$post('', {}, '发送成功').then((data) => {
          if ("000000" === data.code) {
          }
        });
      },
      //绑定手机号
      bandPhone(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.$post('', {}, '绑定成功').then((data) => {
              if (data.code === '000000') {
                this.phone = this.bindphone.phone;
              }
            });
          }
        });
      },
      //获取用户按钮权限
      getButton() {
        //菜单类型(1:目录,2:菜单,3:按钮)
        this.$post('/manager/permission/listByType/' + JSON.parse(sessionStorage.getItem("user")).userId + '/3', {}).then((data) => {
          sessionStorage.setItem("button", JSON.stringify(data.data));
        });
      }
    },
    mounted() {
      this.getButton();
      this.menu = JSON.parse(sessionStorage.getItem("menu")) || [];
      $.Device.isPC() ? this.isCollapse = false : this.isCollapse = true;
    }
  }
</script>
<style scoped lang="scss">
  .bar {
    width: 50%;
    display: inline-block;
  }

  .el-header {
    height: 60px;
    line-height: 60px;
    background-color: #262626;
  }

  .content-aside-close {
    flex: 0 0 60px;
    width: 60px;
    background-color: #333;
  }

  .content-aside {
    flex: 0 0 170px;
    width: 170px;
    background-color: #333;
  }

  .main-content {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  @media screen and (min-width: 320px) and (max-width: 799px) {
    .content-main {
      padding-right: 10px;
      background-color: #ECF0F5;
      flex: 1;
      overflow-y: scroll;
    }
    .header-width {
      width: 100%;
    }
    .header-btn {
      height: 60px;
      color: #fff;
      font-size: 18px;
      background: rgba(0, 0, 0, 0);
      padding: 0;
      cursor: pointer;
    }
    .main-container {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 800px;
      margin-left: -8px;
    }
  }

  @media screen and (min-width: 800px) {
    .content-main {
      padding-right: 5%;
      background-color: #ECF0F5;
      flex: 1;
      overflow-y: scroll;
    }
    .header-width {
      width: 95%;
    }
    .header-btn {
      height: 60px;
      color: #fff;
      font-size: 18px;
      background: rgba(0, 0, 0, 0);
      cursor: pointer;
      padding: 0
    }
    .main-container {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 100%;
      margin-left: -8px;
    }
  }
</style>
