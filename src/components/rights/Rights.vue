<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域  -->
    <el-card class="box-card">
      <el-table :data="powerList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="authName" label="权限名称"></el-table-column>
        <el-table-column prop="path" label="路径"></el-table-column>
        <el-table-column prop="level" label="权限等级">
          <template v-slot:default="scope">
            <el-tag v-if="scope.row.level === '0'">一级</el-tag>
            <el-tag type="success" v-else-if="scope.row.level === '1'">二级</el-tag>
            <el-tag type="danger" v-else>三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "rights",
  data() {
    return {
      //权限列表数据
      powerList: [],
    };
  },
  created() {
    //获取列表权限
    this.getPowerList();
  },
  methods: {
    async getPowerList() {
      const { data: res } = await this.$ajax.get("rights/list");
      console.log(res);
      if (res.meta.status != 200)
        return this.$message.error("获取权限列表失败");
      this.powerList = res.data;
    },
  },
};
</script>

<style lang="less" scoped>

</style>