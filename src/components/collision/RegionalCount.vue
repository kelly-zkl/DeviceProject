<template>
  <div>
    <section class="content">
      <el-form :inline="true" :model="query" align="left">
        <el-form-item label="数量">
          <el-input v-model.number="query.count1" type="number" size="medium" style="width: 80px"
                    :maxlength=5></el-input>
          <span>~</span>
          <el-input v-model.number="query.count2" type="number" size="medium" style="width: 80px"
                    :maxlength=5></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="medium" @click="query.page=1;getData()">搜索</el-button>
        </el-form-item>
        <el-form-item>
          <el-button size="medium" @click="clearData()">重置</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="records" v-loading="listLoading" class="center-block" stripe>
        <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
        <el-table-column align="left" label="归属地" prop="regional" min-width="125"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="IMSI数量" prop="count1" min-width="125"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
      </el-table>
      <div class="block" style="margin-top: 20px" align="right">
        <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page="query.page"
                       :page-sizes="[10, 15, 20, 30]" :page-size="query.size" background
                       layout="sizes, prev, pager, next, jumper"></el-pagination>
      </div>
    </section>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        taskId: this.$route.query.taskId || '',
        collisionType: this.$route.query.collisionType || '',
        listLoading: false,
        query: {page: 1, size: 10},
        records: []
      }
    },
    methods: {
      //清除查询条件
      clearData() {
        this.query = {page: 1, size: 10};
        this.getData();
      },
      //碰撞统计导出
      exportData() {
        var param = Object.assign({}, this.query);
        param.page = 1;
        param.size = 100000;
        this.axios.post('/collision/export/regional', param, {responseType: 'arraybuffer'}).then((res) => {
          let blob = new Blob([res.data], {type: "application/vnd.ms-excel"});
          let objectUrl = URL.createObjectURL(blob);
          window.location.href = objectUrl;
        }).catch(function (res) {
        });
      },
      //获取归属地统计记录
      getData() {
        this.query.collisionType = this.collisionType;
        this.query.collisionTaskId = this.taskId;
        this.query.groupType = "regional";//分组统计类型regional 归属地,device 地区

        this.listLoading = true;
        this.$post('/collision/regional/count', this.query).then((data) => {
          this.records = data.data;
          this.listLoading = false;
        }).catch((err) => {
          this.records = [];
          this.listLoading = false;
        });
      },
      pageChange(index) {
        this.query.page = index;
        this.getData();
      },
      handleSizeChange(val) {
        this.query.size = val;
        this.getData();
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'isp') {
          return row.isp === 0 ? '移动' : row.isp === 1 ? '联通' : row.isp === 2 ? '电信' : '未知';
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      },
      getNetType(isp) {
        let moduleId = "未知";
        switch (isp) {
          case 0:
            moduleId = "CMCC";
            break;
          case 1:
            moduleId = "CMUC";
            break;
          case 2:
            moduleId = "CMTC";
            break;
          default:
            break;
        }
        return moduleId;
      }
    },
    mounted() {
      this.taskId = this.$route.query.taskId || '';
      this.collisionType = this.$route.query.collisionType || '';

      this.getData();
    }
  }
</script>
