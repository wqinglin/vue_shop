<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域  -->
    <el-card class="box-card">
      <!-- 搜索区 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="goodsInfo.query"
            clearable
            @clear="getGoodsList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getGoodsList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddGood">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 商品列表区 -->
      <el-table :data="goodsList" style="width: 100%" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="120px">
        </el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="100px">
        </el-table-column>
        <el-table-column prop="add_time" label="创建时间" width="180px">
          <template v-slot:default="scope">
            {{ scope.row.add_time | momentFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140px">
          <template v-slot:default="scope">
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-edit"
            ></el-button>
            <el-button
              type="danger"
              size="mini"
              icon="el-icon-delete"
              @click="deleteGood(scope.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="goodsInfo.pagenum"
        :page-sizes="[1, 5, 8, 10]"
        :page-size="goodsInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      >
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "list",
  data() {
    return {
      //查询信息
      goodsInfo: {
        query: "",
        pagenum: 1,
        pagesize: 5,
      },
      //商品列表数据
      goodsList: [],
      //总数据条数
      total: 0,
    };
  },
  created() {
    this.getGoodsList();
  },
  methods: {
    async getGoodsList() {
      const { data: res } = await this.$ajax.get("goods", {
        params: this.goodsInfo,
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品列表数据失败");
      }
      // this.$message.success('获取商品列表数据成功')
      this.goodsList = res.data.goods;
      this.total = res.data.total;
      console.log(res);
    },
    //每页几条
    handleSizeChange(newSize) {
      this.goodsInfo.pagesize = newSize;
      this.getGoodsList();
    },
    //当前第几页
    handleCurrentChange(newPage) {
      this.goodsInfo.pagenum = newPage;

      this.getGoodsList();
    },
    //删除商品
    async deleteGood(id) {
      const result = await this.$confirm(
        "此操作将永久删除该商品, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      console.log(result);
      if (result !== "confirm") {
        return;
      }
      const { data: res } = await this.$ajax.delete(`goods/${id}`);
      if (res.meta.status !== 200) {
        return this.$message.error("删除数据失败");
      }
      this.$message.success("删除数据成功");
      this.getGoodsList();
    },
    // 去增加商品
    goAddGood(){
        this.$router.push('/goods/add')
    }
  },
};
</script>

<style lang="less" scoped>
.el-table {
  margin-top: 15px;
}
.el-pagination {
  margin-top: 15px;
}
</style>
