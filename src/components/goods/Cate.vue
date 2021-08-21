<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域  -->
    <el-card class="box-card">
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <zk-table
        class="zktable"
        :data="cateList"
        :columns="columns"
        :show-index="true"
        index-text="#"
        :expand-type="false"
        :show-row-hover="false"
        :selection-type="false"
        border
      >
        <!-- 是否有效 -->
        <template v-slot:isok="scope">
          <i
            v-if="scope.row.cat_deleted === false"
            class="el-icon-success"
            style="color: blue"
          ></i>
          <i v-else class="el-icon-error" style="color: red"></i>
        </template>
        <!-- 排序 -->
        <template v-slot:order="scope">
          <el-tag v-if="scope.row.cat_level === 0" size="mini">一级</el-tag>
          <el-tag
            v-else-if="scope.row.cat_level === 1"
            size="mini"
            type="success"
            >二级</el-tag
          >
          <el-tag v-else size="mini" type="warning">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template v-slot:opt="scope">
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            @click="editCate(scope.row.cat_id)"
          ></el-button>
          <el-button
            size="mini"
            type="danger"
            icon="el-icon-delete"
            @click="deleteCate(scope.row.cat_id)"
          ></el-button>
        </template>
      </zk-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="40%"
      @close="addCateClosed"
    >
      <el-form
        :model="cateForm"
        :rules="cateRules"
        ref="ruleFormRefs"
        label-width="100px"
      >
        <el-form-item label="活动名称:" prop="cat_name">
          <el-input v-model="cateForm.cat_name"></el-input>
        </el-form-item>

        <el-form-item label="父级分类:">
          <!-- options用来指定数据源 -->
          <!-- props 用来指定配置对象 -->
          <!-- v-model必须为[] -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cateProps"
            @change="parentCateChange"
            clearable
            change-on-select
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
     <!-- 编辑对话框 -->
    <el-dialog
      title="修改分类"
      :visible.sync="editCateDialogVisible"
      width="40%"
    >
      <el-form
        :model="editCateForm"
        :rules="editCateFormRules"
        ref="editCateFormRefs"
        label-width="90px"
      >
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCateInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "cate",
  data() {
    return {
      // 分类列表数据
      cateList: [],
      // 分类列表发送网络请求参数
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      //总数据条数
      total: 0,
      //为table指定列的定义
      columns: [
        { label: "分类名称", prop: "cat_name" },
        //template表示当前列使用的模板名称
        { label: "是否有效", type: "template", template: "isok" },
        { label: "排序", type: "template", template: "order" },
        { label: "操作", type: "template", template: "opt" },
      ],
      //增加分类对话框默认关闭
      addCateDialogVisible: false,
      //分类表单数据
      cateForm: {
        // 将要添加的分类名称
        cat_name: "",
        //父级分类Id
        cat_pid: 0,
        //分类的等级，默认添加的是一级分类
        cat_level: 0,
      },
      //分类数据表单验证规则
      cateRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
          { min: 3, max: 8, message: "长度在 3 到 8 个字符", trigger: "blur" },
        ],
      },
      //父级分类列表
      parentCateList: [],
      //指定级联配置对象
      cateProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
        expandTrigger: "true",
      },

      //选择的父级分类Id数
      selectedKeys: [],
      //编辑对话框默认隐藏
      editCateDialogVisible: false,
      // 保存编辑信息
      editCateForm: [],
      //默认编辑对话框为隐藏
      editCateDialogVisible: false,
      //编辑角色表单数据验证
      editCateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
          { min: 3, max: 8, message: "长度在 3 到 8 个字符", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$ajax.get(`categories`, {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取分类列表失败");
      }
      //注意渲染！！
      this.cateList = res.data.result;
      this.total = res.data.total;
      console.log(res);
    },
    // 每页多少条
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getCateList();
    },
    // 当前第几页
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getCateList();
    },
    //点击弹出增加分类对话框
    showCateDialog() {
      this.getParentCateList();
      this.addCateDialogVisible = true;
    },
    //获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$ajax.get("categories", {
        params: { type: 2 },
      });
      console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error("获取父级分类列表数据失败");
      }
      this.parentCateList = res.data;
    },

    //选择项发生变化触发
    parentCateChange() {
      console.log(this.selectedKeys);
      //如果selectedKeys.length>0 证明选中了父级分类
      // 反之，没有选中任何父级分类
      if (this.selectedKeys.length > 0) {
        //   父级分类的id
        this.cateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1];
        // 为当前分类等级赋值
        this.cateForm.cat_level = this.selectedKeys.length;
        return;
      } else {
        this.cateForm.cat_pid = 0;
        this.cateForm.cat_level = 0;
      }
    },
    // 点击按钮确定新的分类
    addCate() {
      console.log(this.cateForm);
      this.$refs.ruleFormRefs.validate(async (valid) => {
        if (!valid) ruturn;
        const { data: res } = await this.$ajax.post(
          "categories",
          this.cateForm
        );
        console.log(res);
        if (res.meta.status !== 201) {
          return this.$message.error("添加分类失败");
        }
        this.$message.success("添加分类成功");
        this.getCateList();
        this.addCateDialogVisible = false;
      });
    },
    //监听对话框的关闭事件,重置表单数据
    addCateClosed() {
      this.$refs.ruleFormRefs.resetFields();
      this.selectedKeys = [];
      this.cateForm.cat_pid = 0;
      this.cateForm.cat_level = 0;
    },
    // 点击编辑按钮
    async editCate(id) {
      const { data: res } = await this.$ajax.get(`categories/${id}`);
      if (res.meta.status !== 200) {
        return this.$message.error("查询分类信息失败！");
      }
      this.editCateForm = res.data;
      this.editCateDialogVisible = true;

      console.log(res);
    },
    //编辑确定校验
    editCateInfo() {
      this.$refs.editCateFormRefs.validate(async (valid) => {
        if (!valid) return;
        //发送修改用户请求
        const { data: res } = await this.$ajax.put(
          `categories/${this.editCateForm.cat_id}`,
          {
            cat_name: this.editCateForm.cat_name,
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("更新分类名称失败");
        }
        //关闭对话框
        this.editCateDialogVisible = false;
        //刷新列表数据
        this.getCateList();
        //提示修改成功
        this.$message.success("更新分类名称成功");
      });
    },
      async deleteCate(id) {
      const confirmRus = await this.$confirm(
        "此操作将永久删除该分类及该分类下列表, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      // console.log(confirmRus);  //确认删除为confirm 取消删除返回为cancel
      if (confirmRus !== "confirm") {
        return this.$message.info("已取消删除");
      }
      const { data: res } = await this.$ajax.delete(`categories/${id}`);
      if (res.meta.status !== 200) {
        return this.$message.error("删除分类信息失败");
      }
      this.$message.success("删除分类信息成功");
      this.getCateList();
    },
  },
};
</script>

<style lang="less" scoped>
.zktable {
  margin-top: 15px;
}
.el-pagination {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>>
