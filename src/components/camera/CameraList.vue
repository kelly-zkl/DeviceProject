<template>
  <div>
    <section class="content">
      <el-form :inline="true" style="text-align: left;margin-top: 20px" align="left">
        <el-row>
          <el-col :span="18" style="text-align: left" align="left">
            <el-form-item style="margin-bottom: 10px">
              <el-input placeholder="输入相机编码" v-model="query.cameraCode" :maxlength="30" size="medium"></el-input>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-cascader :options="provinceList" :props="props" @change="areaChange" change-on-select
                           v-model="areaList" placeholder="全部地区" size="medium" filterable clearable>
              </el-cascader>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-button type="primary" @click.stop="query.page=1;getData()" size="medium">搜索</el-button>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-button @click.stop="clearData()" size="medium">清除</el-button>
            </el-form-item>
          </el-col>
          <el-col :span="6" style="text-align: right" align="right">
            <el-form-item style="margin-bottom: 10px">
              <el-button type="primary" size="medium" :disabled="sels.length == 0" @click="deleteDevice()"
                         v-show="getButtonVial('camera:delete')">删除
              </el-button>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-button type="primary" icon="el-icon-plus" size="medium" @click="$router.push('/addCamera')"
                         v-show="getButtonVial('camera:add')">添加相机设备
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <el-table :data="cameraList" v-loading="listLoading" class="center-block" stripe @selection-change="selsChange">
        <el-table-column type="selection" width="45" align="left"></el-table-column>
        <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
        <el-table-column align="left" label="相机编码" prop="cameraCode" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="相机名称" prop="name" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="相机状态" prop="status" min-width="100"
                         max-width="150" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="安装地区" prop="areaCode" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="详细地址" prop="detailAddress" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="经纬度" prop="longitude" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="操作" width="160">
          <template slot-scope="scope">
            <el-button type="text" @click="gotoDetail(scope.row)"
                       v-show="getButtonVial('camera:get')">详情
            </el-button>
            <el-button type="text" @click="sels = [];sels.push(scope.row);deleteDevice()"
                       v-show="getButtonVial('camera:delete')">删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="block" style="margin-top: 20px" align="right">
        <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page="query.page"
                       :page-sizes="[10, 15, 20, 30]" :page-size="query.size" :total="count" background
                       layout="total, sizes, prev, pager, next, jumper"></el-pagination>
      </div>
    </section>
  </div>
</template>
<script>
  import json from '../../assets/city.json';

  export default {
    data() {
      return {
        listLoading: false,
        query: {page: 1, size: 10},
        props: {value: 'o', label: 'n', children: 'c'},
        provinceList: json,
        areaList: [],
        cameraList: [],
        count: 0,
        sels: []
      }
    },
    methods: {
      getButtonVial(msg) {
        return $.Button.buttonValidator(msg);
      },
      //全选  ==>  删除/结案
      selsChange(sels) {
        this.sels = sels;
      },
      //删除相机设备
      deleteDevice() {
        let arr = [];
        this.sels.forEach((item) => {
          arr.push(item.id);
        });
        this.$confirm('确认要删除该相机设备吗?', '提示', {type: 'info'}).then(() => {
          this.$post('camera/delete', arr, '删除成功').then((data) => {
            if ("000000" === data.code) {
              this.getData();
              this.sels = [];
            }
          }).catch((err) => {
          });
        }).catch(() => {
        });
      },
      gotoDetail(row) {
        this.$router.push({path: '/addCamera', query: {id: row.id}});
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
          this.query.cityCode = value[1];
        } else if (value.length === 3) {
          this.query.areaCode = value[2];
        }
        this.getData();
      },
      //获取相机设备列表
      getData() {
        this.listLoading = true;

        this.$post("camera/query", this.query).then((data) => {
          this.cameraList = data.data.list;
          this.count = data.data.count;
          setTimeout(() => {
            this.listLoading = false;
          }, 500);
        }).catch((err) => {
          this.listLoading = false;
          this.cameraList = [];
          this.$message.error(err);
        });
      },
      //清除查询条件
      clearData() {
        this.query = {page: 1, size: 10};
        this.areaList = [];
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
      //获得省市县
      getAreaLable(code) {
        let lable = '';
        this.provinceList.forEach((province) => {
          if (province.c) {
            province.c.forEach((city) => {
              if (city.c) {//省级+市级+县级
                city.c.forEach((country) => {
                  if (code === country.o) {
                    lable = province.n + city.n + country.n;
                  }
                })
              } else {//省级+市级
                if (code === city.o) {
                  lable = province.n + city.n;
                }
              }
            })
          } else {//只包含省级
            if (code === province.o) {
              lable = province.n;
            }
          }
        });
        return lable;
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'status') {
          return row.status === 0 ? '正常' : row.status === 1 ? '故障' : row.status === 2 ? '已下线' : '--';
        } else if (column.property === 'areaCode') {
          return row.areaCode ? this.getAreaLable(row.areaCode) : '--';
        } else if (column.property === 'longitude') {
          return row.latitude + ',' + row.longitude;
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      }
    },
    mounted() {
      this.getData();
    }
  }
</script>
