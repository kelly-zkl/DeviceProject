# admin-device

> A Vue.js project

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

For detailed explanation on how things work, checkout the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

首页按钮样式的修改
    <i class="fa fa-cog fa-lg" @click.stop="gotoSet(scope.row)"
       v-show="getButtonVial('device:baseinfo') || getButtonVial('device:sendBaseInfo')"></i>
    <i class="fa fa-tachometer fa-lg" @click.stop="gotoStatus(scope.row)"
       v-show="getButtonVial('device:get:deviceStatus')"></i>
    <i class="fa fa-mixcloud fa-lg" @click.stop="gotoTerminal(scope.row)"
       v-show="getButtonVial('terminate:query')"></i>
    <el-popover ref="btnMore" placement="left" width="180" trigger="hover" visible-arrow="isShow">
      <el-row v-show="scope.row.deviceForm === 'CON_OUTDOOR_POLE'">
        <el-col :span="24" v-show="getButtonVial('device:get:sniffer') || getButtonVial('device:sniffer')
        || getButtonVial('set:autoSnifferParam')">
          <el-button class="btn_green" type="text" @click.stop="gotoScan(scope.row)">
            <i class="fa fa-crosshairs fa-lg" style="margin-right: 10px"></i>扫频工具
          </el-button>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-button class="btn_green" type="text" disabled>
            <i class="fa fa-stethoscope  fa-lg" style="margin-right: 10px"></i>诊断工具
          </el-button>
        </el-col>
      </el-row>
      <el-row v-show="getButtonVial('device:get:deviceMessage')">
        <el-col :span="24">
          <el-button class="btn_green" type="text" @click.stop="gotoTask(scope.row)">
            <i class="fa fa-clock-o fa-lg" style="margin-right: 10px"></i>任务列表
          </el-button>
        </el-col>
      </el-row>
      <el-row style="margin-top: 20px">
        <el-col :span="12" v-show="getButtonVial('set:restart')">
          <el-button class="btn_green" type="text"
                     @click.stop="restartDevice(scope.row)">重启
          </el-button>
        </el-col>
        <el-col :span="12">
          <el-button class="btn_green" type="text" disabled>休眠
          </el-button>
        </el-col>
      </el-row>
    </el-popover>
    <el-button class="glmb" v-popover:btnMore v-show="getButtonVial('device:get:sniffer') ||
    getButtonVial('device:get:deviceMessage') || getButtonVial('device:sniffer')
        || getButtonVial('set:autoSnifferParam') || getButtonVial('set:restart')">
      <i class="fa fa-th-large fa-lg"></i></el-button>
  .fa-cog, .fa-tachometer, .fa-mixcloud, .fa-th-large {
      color: #539FF8;
      white-space: pre-wrap;
      padding-left: 8px;
      padding-right: 8px;
      cursor: pointer;
    }

    .fa-cog:hover, .fa-tachometer:hover, .fa-mixcloud:hover, .fa-th-large:hover {
      margin-left: 0;
      font-size: 0;
    }

    .fa-cog:hover:before {
      color: #539FF8;
      content: '设置';
      font-size: 12px;
    }

    .fa-tachometer:hover:before {
      color: #539FF8;
      content: '状态';
      font-size: 12px;
    }

    .fa-mixcloud:hover:before {
      color: #539FF8;
      content: '侦码';
      font-size: 12px;
    }

    .fa-th-large:hover:before {
      color: #539FF8;
      content: '更多';
      font-size: 12px;
    }

    .glmb {
      background: none;
      border: none;
      padding: 0;
    }

    .btn_green, .btn_green:visited, .btn_green:link {
      width: 100%;
      text-align: center;
      color: #539FF8;
      font-size: 14px;
      background-color: #ffffff;
      border: none;
    }

    .btn_green:hover, .btn_green:active, .btn_green:focus {
      color: #ffffff;
      background-color: #539FF8;
    }

    .btn_green[disabled] {
      color: #bbb;
      background-color: #fff;
    }


告警列表
<el-button class="glmb" v-popover:deal v-show="getButtonVial('alarm:batchUpdateStatus')"><i
                    class="fa fa-wrench fa-lg"></i>
                  </el-button>
.glmb {
    background: none;
    border: none;
    padding: 0;
  }

  .fa-wrench {
    color: #539FF8;
    white-space: pre-wrap;
    padding-left: 8px;
    padding-right: 8px;
    cursor: pointer;
  }

  .fa-wrench:hover {
    margin-left: 0;
    font-size: 0;
  }

  .fa-wrench:hover:before {
    color: #539FF8;
    content: '处理';
    font-size: 12px;
  }


  版本管理
  <i class="fa fa-trash fa-lg" @click="deletePck(scope.row.id,scope.row.versionType)"
     v-show="getButtonVial('version:delete:*')"></i>
  <i class="fa fa-file-text-o fa-lg" @click="gotoUpdate(scope.row)"
     v-show="getButtonVial('version:queryPush:*') && getButtonVial('version:queryPushRecord')"></i>
  <i class="fa fa-paper-plane fa-lg" @click="gotoPush(scope.row)"
     v-show="getButtonVial('version:push')"></i>
  .fa-trash, .fa-file-text-o, .fa-paper-plane {
      color: #539FF8;
      white-space: pre-wrap;
      padding-left: 8px;
      padding-right: 8px;
      cursor: pointer;
    }

    .fa-trash:hover, .fa-file-text-o:hover, .fa-paper-plane:hover {
      margin-left: 0;
      font-size: 0;
    }

    .fa-trash:hover:before {
      color: #539FF8;
      content: '删除';
      font-size: 12px;
    }

    .fa-file-text-o:hover:before {
      color: #539FF8;
      content: '记录';
      font-size: 12px;
    }

    .fa-paper-plane:hover:before {
      color: #539FF8;
      content: '推送';
      font-size: 12px;
    }
