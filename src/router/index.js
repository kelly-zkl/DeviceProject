import Vue from "vue";
import Router from "vue-router";

//概览
import DeviceOverview from "../components/terminal/DeviceOverview.vue";

//设备管理
import DeviceList from "../components/device/DeviceList.vue";
import Terminal from "../components/device/TerminalData.vue";
import DeviceSet from "../components/device/DeviceSet.vue";
import DeviceStatus from "../components/device/DeviceStatus.vue";
import NetworkData from "../components/device/NetworkData.vue";
import TaskList from "../components/device/TaskList.vue";

import CameraList from "../components/camera/CameraList.vue";
import AddCamera from "../components/camera/AddCamera.vue";

//侦码管理
import TerminalList from "../components/terminal/TerminalList.vue";
import BlackManager from "../components/terminal/BlackManager.vue";
import WhiteManager from "../components/terminal/WhiteManager.vue";
import MacList from "../components/terminal/MacList.vue";

//首页、登录
import Login from "../components/Login.vue";
import Home from "../components/Home.vue";
import PageError from "../components/404.vue";

//管理员
import AdminAdd from "../components/authority/member/AdminAdd.vue";
import PostManager from "../components/authority/post/PostManager.vue";
import MenuManager from "../components/authority/functionmenu/MenuManager.vue";
import OrganizationManager from "../components/authority/organization/OrganizationManager.vue";
import FtpManager from "../components/authority/ftpManager/ftpManager.vue";

//告警管理
import WarningManager from "../components/warning/WarningManager.vue";
import WarningSet from "../components/warning/WarningSet.vue";

//版本管理
import VersionManager from "../components/version/VersionManager.vue";
import PushUpdate from "../components/version/PushUpdate.vue";
import UpdateRecords from "../components/version/UpdateRecords.vue";

//日志管理
import DeviceLogs from "../components/log/DeviceLogs.vue";

//碰撞分析
import AddCollision from "../components/collision/AddCollision.vue";
import TaskDetail from "../components/collision/TaskDetail.vue";
import CollisionAnalysis from "../components/collision/CollisionAnalysis.vue";
import ImsiRecords from "../components/collision/ImsiRecords.vue";
import ImageRecords from "../components/collision/ImageRecords.vue";

//案件管理
import CaseList from "../components/case/CaseList.vue";
import CaseDetail from "../components/case/CaseDetail.vue";

//伴随分析
import FollowList from "../components/follow/FollowList.vue";
import AddFollow from "../components/follow/AddFollow.vue";
import FollowResult from "../components/follow/FollowResult.vue";
import IMSIDetail from "../components/follow/IMSIDetail.vue";
import ImageDetail from "../components/follow/ImageDetail.vue";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: '概览',
      component: Home,
      icon: 'fa fa-th-large',
      index: '1',
      leaf: true,//只有一个节点
      children: [
        {path: '/deviceOverview', component: DeviceOverview, name: '侦码统计', hidden: true},
      ]
    },
    {
      path: '/deviceList',
      name: '设备管理',
      component: Home,
      icon: 'fa fa-tv',
      index: '2',
      leaf: true,//只有一个节点
      children: [
        {path: '/deviceList', component: DeviceList, name: '设备列表', hidden: true},
        {path: '/deviceSet', component: DeviceSet, name: '设备详情', hidden: true},
      ]
    },
    {
      path: '/cameraList',
      name: '相机管理',
      component: Home,
      icon: 'fa fa-camera',
      index: '3',
      leaf: true,//只有一个节点
      children: [
        {path: '/cameraList', component: CameraList, name: '相机设备列表', hidden: true},
        {path: '/addCamera', component: AddCamera, name: '添加/修改相机设备', hidden: true},
      ]
    },
    {
      path: '/terminalList',
      name: '侦码管理',
      component: Home,
      icon: 'fa fa-cloud',
      index: '4',
      leaf: true,//只有一个节点
      children: [
        {path: '/terminalList', component: TerminalList, name: 'IMSI数据'},
        {path: '/macList', component: MacList, name: 'MAC数据'},
        {path: '/blackManager', component: BlackManager, name: '黑名单管理', hidden: true},
        {path: '/whiteManager', component: WhiteManager, name: '白名单管理', hidden: true},
      ]
    },
    {
      path: '/warningManager',
      name: '告警管理',
      component: Home,
      icon: 'fa fa-warning',
      index: '5',
      leaf: true,//只有一个节点
      children: [
        {path: '/warningManager', component: WarningManager, name: '告警列表', hidden: true},
        {path: '/warningSet', component: WarningSet, name: '告警设置', hidden: true}
      ]
    },
    {
      path: '/versionManager',
      name: '版本管理',
      component: Home,
      icon: 'fa fa-upload',
      index: '6',
      leaf: true,//只有一个节点
      children: [
        {path: '/versionManager', component: VersionManager, name: '版本列表', hidden: true},
        {path: '/updateRecords', component: UpdateRecords, name: '推送记录', hidden: true},
        {path: '/pushUpdate', component: PushUpdate, name: '版本推送', hidden: true},
      ]
    },
    {
      path: '/deviceLogs',
      name: '设备日志',
      component: Home,
      icon: 'fa fa-file-text-o',
      index: '7',
      leaf: true,//只有一个节点
      children: [
        {path: '/deviceLogs', component: DeviceLogs, name: '设备日志列表', hidden: true}
      ]
    },
    {
      path: '/adminAdd',
      name: '系统管理',
      component: Home,
      icon: 'fa fa-user-md',
      index: '8',
      children: [
        {path: '/adminAdd', component: AdminAdd, name: '成员管理'},
        {path: '/postManager', component: PostManager, name: '岗位管理'},
        {path: '/menuManager', component: MenuManager, name: '功能菜单管理'},
        {path: '/organizationManager', component: OrganizationManager, name: '组织管理'},
        {path: '/ftpManager', component: FtpManager, name: 'FTP管理'}
      ]
    },
    {
      path: '/collisionAnalysis',
      name: '碰撞',
      component: Home,
      icon: 'fa fa-cloud',
      index: '9',
      leaf: true,//只有一个节点
      children: [
        {path: '/collisionAnalysis', component: CollisionAnalysis, name: '碰撞分析', hidden: true},
        {path: '/taskDetail', component: TaskDetail, name: '任务详情', hidden: true},
        {path: '/addCollision', component: AddCollision, name: '新建碰撞任务', hidden: true},
        {path: '/imsiRecords', component: ImsiRecords, name: 'IMSI记录', hidden: true},
        {path: '/imageRecords', component: ImageRecords, name: '图像记录', hidden: true},
      ]
    },
    {
      path: '/caseList',
      name: '案件',
      component: Home,
      icon: 'fa fa-user-md',
      index: '10',
      children: [
        {path: '/caseList', component: CaseList, name: '案件管理'},
        {path: '/caseDetail', component: CaseDetail, name: '案件详情'}
      ]
    },
    {
      path: '/followList',
      name: '伴随',
      component: Home,
      icon: 'fa fa-user-md',
      index: '11',
      children: [
        {path: '/followList', component: FollowList, name: '伴随分析'},
        {path: '/addFollow', component: AddFollow, name: '新建伴随任务'},
        {path: '/followResult', component: FollowResult, name: '分析结果'},
        {path: '/iMSIDetail', component: IMSIDetail, name: 'IMSI详情'},
        {path: '/imageDetail', component: ImageDetail, name: '图像详情'}
      ]
    },
    {
      path: '/',
      name: '',
      component: Home,
      hidden: true,
      children: [
        {path: '/Page404', component: PageError, name: '404', hidden: true},
      ]
    },
    {
      path: '/login',
      name: "登录",
      hidden: true,
      component: Login
    },
    {
      path: '/404',
      name: '',
      hidden: true,
      component: PageError
    },
    {
      path: '*',
      hidden: true,
      redirect: {path: '/404'}
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return {x: 0, y: 0}
    }
  }
})
