<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域  -->
    <el-card class="box-card">
      <!-- 警告区域 -->
      <el-alert
        title="注意：只允许为第三级分类设置相关参数！"
        :closable="false"
        type="warning"
        show-icon
      >
      </el-alert>
      <!-- 选择商品分类区域 -->
      <el-row>
        <el-col class="far">
          <span>选择商品分类：</span>
          <!-- 级联选择框 -->
          <el-cascader
            v-model="selectedCateKeys"
            :options="cateList"
            :props="cateProps"
            @change="cateChange"
            clearable
            change-on-select
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tabs区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabsClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button
            size="mini"
            type="primary"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
            addDialogVisible
            >添加参数</el-button
          >
          <!-- many数据表格区域 -->
          <el-table :data="manyTableData" style="width: 100%" border stripe>
           <!-- 展开行 -->
            <el-table-column type="expand">
              <template v-slot:default="scope">
                <!-- 标签 -->
                <el-tag
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  closable
                  @close="handleClose(index,scope.row)"
                  >{{ item }}</el-tag
                >
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称">
            </el-table-column>
            <el-table-column label="操作">
              <template v-slot:default="scope">
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-edit"
                  @click="editParamsDialog(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  type="danger"
                  size="mini"
                  icon="el-icon-delete"
                  @click="deleteParamsDialog(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="静态属性" name="only"
          ><el-button
            size="mini"
            type="primary"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
            >添加属性</el-button
          >
          <!-- only数据表格区域 -->
          <el-table :data="onlyTableData" style="width: 100%" border stripe>
            <!-- 展开行 -->
          <el-table-column type="expand">
              <template v-slot:default="scope">
                <!-- 标签 -->
                <el-tag
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  closable
                  @close="handleClose(index,scope.row)"
                  >{{ item }}</el-tag
                >
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="属性名称">
            </el-table-column>
            <el-table-column label="操作">
              <template v-slot:default="scope">
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-edit"
                  @click="editParamsDialog(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  type="danger"
                  size="mini"
                  icon="el-icon-delete"
                  @click="deleteParamsDialog(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="40%"
      @close="addDialogClosed"
    >
      <!-- 添加参数的表格 -->
      <el-form
        :model="addParamsForm"
        :rules="addParamsRules"
        ref="addParamsRefs"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改参数对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="editDialogVisible"
      width="40%"
      @close="editDialogClosed"
    >
      <!-- 修改参数的表格 -->
      <el-form
        :model="editParamsForm"
        :rules="editParamsRules"
        ref="editParamsRefs"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Cate",
  data() {
    return {
      //商品分类列表
      cateList: [],
      //指定级联配置对象
      cateProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
        expandTrigger: "true",
      },

      //级联选择框双向绑定的数据
      selectedCateKeys: [],
      //被激活页签名称
      activeName: "many",
      //保存动态数据
      manyTableData: [],
      //保存静态数据
      onlyTableData: [],
      //   参数对话框
      addDialogVisible: false,
      //   添加参数的表单数据对象
      addParamsForm: {},
      //   参数规则
      addParamsRules: {
        attr_name: [
          { required: true, message: "请输入参数名称", trigger: "blur" },
          {
            min: 2,
            max: 10,
            message: "长度在 2 到 10 个字符",
            trigger: "blur",
          },
        ],
      },
      //默认修改对话框为隐藏
      editDialogVisible: false,
      //编辑对话框表单数据
      editParamsForm: [],
      //编辑对话框表单验证规则
      editParamsRules: {
        attr_name: [
          { required: true, message: "请输入参数名称", trigger: "blur" },
          {
            min: 2,
            max: 10,
            message: "长度在 2 到 10 个字符",
            trigger: "blur",
          },
        ],
      },
      //默认情况下隐藏文本输入框
      inputVisible: false,
      //   文本框中输入的内容
      inputValue: "",
    };
  },
  created() {
    //参数列表数据
    this.getCateList();
  },
  computed: {
    //   如果按钮需要被禁用，则返回true,否则返回false
    isBtnDisabled() {
      if (this.selectedCateKeys.length !== 3) {
        return true;
      }
      return false;
    },

    //当前三级分类的id
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2];
      }
      return null;
    },
    titleText() {
      if (this.activeName === "many") {
        return "动态参数";
      }
      return "静态属性";
    },
  },
  methods: {
    //获取分类列表数据
    async getCateList() {
      const { data: res } = await this.$ajax.get("categories");
      if (res.meta.status !== 200) {
        return this.$message.err("获取商品分类数据失败");
      }
      this.cateList = res.data;
      console.log(this.cateList);
    },
    //级联选择框选中项的变化,会触发这个函数
    cateChange() {
      // console.log(this.selectedCateKeys);
      this.getParamsData();
    },
    //tabs切换触发函数
    handleTabsClick() {
      // console.log(this.activeName);
      this.getParamsData();
    },
    //获取参数列表数据
    async getParamsData() {
      //证明不是三级分类
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = [];
        this.manyTableData = [];
        this.onlyTableData = []
        return;
      }
      //证明是三级分类
      const { data: res } = await this.$ajax.get(
        `categories/${this.cateId}/attributes`,
        { params: { sel: this.activeName } }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("获取参数列表失败");
      }
      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
        //控制文本框显示与隐藏
        (item.inputVisible = false),
          //文本框输入的值
          (item.inputValue = "");
      });
      console.log(res.data);
      //many对应数据
      if (this.activeName === "many") {
        this.manyTableData = res.data;
      } else {
        //only对应数据
        this.onlyTableData = res.data;
      }
    },
    //监听对话框的关闭事件
    addDialogClosed() {
      this.$refs.addParamsRefs.resetFields();
    },

    //点击按钮，校验
    addParams() {
      this.$refs.addParamsRefs.validate(async (valid) => {
        if (!valid) {
          return;
        }
        const { data: res } = await this.$ajax.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addParamsForm.attr_name,
            attr_sel: this.activeName,
          }
        );
        console.log(res.data);

        if (res.meta.status !== 201) {
          return this.$message.error("添加参数失败");
        }
        this.$message.success("添加参数成功");
        this.addDialogVisible = false;
        this.getParamsData();
      });
    },
    //打开编辑对话框
    async editParamsDialog(attr_id) {
      const { data: res } = await this.$ajax.get(
        `categories/${this.cateId}/attributes/${attr_id}`,
        {
          params: {
            attr_sel: this.activeName,
          },
        }
      );
      if (res.meta.status !== 200)
        return this.$message.error("获取参数信息失败");
      this.editParamsForm = res.data;
      this.editDialogVisible = true;
    },
    //对话框关闭触发函数
    editDialogClosed() {
      this.$refs.editParamsRefs.resetFields();
    },
    //编辑对话框确定按钮校验
    editParams() {
      this.$refs.editParamsRefs.validate(async (valid) => {
        if (!valid) {
          return;
        }
        const { data: res } = await this.$ajax.put(
          `categories/${this.cateId}/attributes/${this.editParamsForm.attr_id}`,
          {
            attr_name: this.editParamsForm.attr_name,
            attr_sel: this.activeName,
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("获取参数失败");
        }
        this.$message.success("修改参数成功");
        this.getParamsData();
        this.editDialogVisible = false;
        console.log(res.data);
      });
    },
    //删除参数
    async deleteParamsDialog(attr_id) {
      const confirmRus = await this.$confirm(
        "此操作将永久删除该商品的此属性, 是否继续?",
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
      const { data: res } = await this.$ajax.delete(
        `categories/${this.cateId}}/attributes/${attr_id}`
      );
      if (res.meta.status !== 200) {
        return this.$message.error("删除分类信息失败");
      }
      this.$message.success("删除分类信息成功");
      this.getParamsData();
    },
    //文本框失去焦点或者键盘按下enter键均可触发事件
    async handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = "";
        row.inputVisible = false;
        return;
      }
      //如果没有return，证明输入了内容，需要做后续处理
      row.attr_vals.push(row.inputValue.trim());
      row.inputValue = "";
      row.inputVisible = false;
      //发起网络请求，保存此次操作
       this.saveAttrVals(row)
    },
    //点击按钮显示文本输入框
    showInput(row) {
      row.inputVisible = true;
      //让文本框自动获得焦点
      // $this.$nextTick方法的作用, 就是当页面上的元素被重新渲染之后，才会执行回调中的代码
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    //删除对应的参数可选项
   handleClose(index,row){
        row.attr_vals.splice(index,1)
        this.saveAttrVals(row)
    },
    //将数据保存到数据库
   async saveAttrVals(row){
        const { data: res } = await this.$ajax.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(" "),
        }
      );
      console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error("删除参数项失败");
      }
      this.$message.success("修改参数项成功");
    }
  },
};
</script>

<style lang="less" scoped>
.far {
  margin-top: 15px;
}
.el-tabs {
  margin-top: 15px;
}
.el-table {
  margin-top: 15px;
}
.el-tag {
  margin: 8px;
}
.input-new-tag {
  width: 120px;
}
</style>>
