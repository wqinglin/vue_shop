<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>角色管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域  -->
    <el-card class="box-card">
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true"
            >添加角色</el-button
          >
        </el-col>
      </el-row>
      <el-table :data="roleList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template v-slot:default="scope">
            <el-row
              :class="['bdbottom', index1 === 0 ? 'bdtop' : '', 'vcenter']"
              v-for="(item1, index1) in scope.row.children"
              :key="item1.id"
              @close="removeRightById(scope.row, item1.id)"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable>{{ item1.authName }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级三级权限 -->
              <el-col :span="19">
                <el-row
                  :class="[index2 === 0 ? '' : 'bdtop', 'vcenter']"
                  v-for="(item2, index2) in item1.children"
                  :key="item2.id"
                >
                  <!-- 渲染二级权限 -->
                  <el-col :span="6">
                    <el-tag
                      closable
                      type="success"
                      @close="removeRightById(scope.row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 渲染三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                    >
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色权限"></el-table-column>
        <el-table-column label="操作">
          <template v-slot:default="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="editRole(scope.row.id)"
              >编辑</el-button
            >
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="deleteRoles(scope.row.id)"
              >删除</el-button
            >
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSettingRightsDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="40%">
      <!-- 内容主题区 -->
      <el-form
        :model="addRolesForm"
        :rules="addRolesFormRules"
        ref="addRolesFormRefs"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色权限" prop="roleDesc">
          <el-input v-model="addRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelDialog">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑用户对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editDialogVisible"
      width="40%"
      @close="editDialogClosed"
    >
      <el-form
        :model="editRolesForm"
        :rules="editRolesFormRules"
        ref="editRolesFormRefs"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色权限" prop="roleDesc">
          <el-input v-model="editRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRolesInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="rightsDialogVisible"
      width="40%"
      @close="settingRightsDialogClosed"
    >
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="keys"
        ref="treeRefs"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="rightsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: "roles",
  data() {
    return {
      // 角色列表
      roleList: [],
      //默认添加对话框为隐藏
      addDialogVisible: false,
      //添加角色表单数据
      addRolesForm: {
        roleName: "",
        roleDesc: "",
      },
      //添加角色表单数据验证
      addRolesFormRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
          { min: 2, max: 10, message: "长度在 2 到 10个字符", trigger: "blur" },
        ],
        roleDesc: [
          { required: true, message: "请输入角色权限", trigger: "blur" },
          { min: 3, max: 15, message: "长度在 3 到 15个字符", trigger: "blur" },
        ],
      },
      // 保存编辑信息
      editRolesForm: [],
      //默认编辑对话框为隐藏
      editDialogVisible: false,
      //编辑角色表单数据验证
      editRolesFormRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
          { min: 2, max: 10, message: "长度在 2 到 10个字符", trigger: "blur" },
        ],
        roleDesc: [
          { required: true, message: "请输入角色权限", trigger: "blur" },
          { min: 3, max: 15, message: "长度在 3 到 15个字符", trigger: "blur" },
        ],
      },
      //   分配权限对话框默认为false
      rightsDialogVisible: false,
      //所有权限数据
      rightsList: [],
      // 树形控件属性绑定对象
      treeProps: {
        //父子嵌套用的那个属性
        children: "children",
        //显示在页面是哪个字段
        label: "authName",
      },
      //默认选中的树形控件的项
      keys: [],
      // 当前即将分配角色的权限Id
      roleId: "",
    };
  },
  created() {
    //角色列表
    this.getRoleList();
  },
  methods: {
    async getRoleList() {
      const { data: res } = await this.$ajax.get("roles");
      if (res.meta.status != 200)
        return this.$message.error("获取角色列表失败");
      this.roleList = res.data;
      console.log(res);
    },
    //增加表单确认验证
    addRole() {
      this.$refs.addRolesFormRefs.validate(async (valid) => {
        // console.log(valid);
        if (!valid) return;
        // 可以发起添加用户网络请求
        const { data: res } = await this.$ajax.post("roles", this.addRolesForm);
        console.log(res);
        if (res.meta.status !== 201) {
          return this.$message.error("添加用户失败");
        }
        this.$message.success("添加用户成功");
        //隐藏添加的对话框
        this.addDialogVisible = false;
        this.getRoleList();
        this.$refs.addRolesFormRefs.resetFields();
      });
    },
    //取消弹框
    cancelDialog() {
      this.addDialogVisible = false;
      this.$refs.addRolesFormRefs.resetFields();
    },
    async editRole(id) {
      const { data: res } = await this.$ajax.get(`roles/${id}`);
      if (res.meta.status !== 200) {
        return this.$message.error("查询角色信息失败！");
      }
      this.editRolesForm = res.data;
      this.editDialogVisible = true;

      console.log(res);
    },
    //监听修改用户对话框的关闭事件
    editDialogClosed() {
      this.$refs.editRolesFormRefs.resetFields();
    },
    editRolesInfo() {
      this.$refs.editRolesFormRefs.validate(async (valid) => {
        if (!valid) return;
        //发送修改用户请求
        const { data: res } = await this.$ajax.put(
          `roles/${this.editRolesForm.roleId}`,
          {
            roleName: this.editRolesForm.roleName,
            roleDesc: this.editRolesForm.roleDesc,
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("更新角色信息失败");
        }
        //关闭对话框
        this.editDialogVisible = false;
        //刷新列表数据
        this.getRoleList();
        //提示修改成功
        this.$message.success("更新角色信息成功");
      });
    },
    async deleteRoles(id) {
      const confirmRus = await this.$confirm(
        "此操作将永久删除该角色, 是否继续?",
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
      const { data: res } = await this.$ajax.delete(`roles/${id}`);
      if (res.meta.status !== 200) {
        return this.$message.error("删除角色信息失败");
      }
      this.$message.success("删除角色信息成功");
      this.getRoleList();
    },
    // 根据Id删除对于的权限
    async removeRightById(role, rightId) {
      const confirmRus = await this.$confirm(
        "此操作将永久删除用户该权限, 是否继续?",
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
        `roles/${role.id}/rights/${rightId}`
      );
      if (res.meta.status !== 200) {
        return this.$message.error("删除用户权限失败");
      }
      this.$message.success("删除用户权限成功");
      role.children = res.data;
    },
    async showSettingRightsDialog(role) {
      //保存role,供后续分配权限使用allotRights
      this.roleId = role.id;
      //对话框关闭之前获取所有的权限数据
      const { data: res } = await this.$ajax.get(`rights/tree`);
      if (res.meta.status !== 200) {
        return this.$message.error("获取权限失败");
      }
      this.rightsList = res.data;
      console.log(this.rightsList);
      //递归获取三级节点Id
      this.getKeys(role, this.keys);
      this.rightsDialogVisible = true;
    },
    // 通过递归的形式，获取角色下所有三级权限id,并保存到keys中
    getKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id);
      }
      node.children.forEach((item) => {
        this.getKeys(item, arr);
      });
    },
    // 关闭对话框清空数组keys
    settingRightsDialogClosed() {
      this.keys = [];
    },
    // 分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRefs.getCheckedKeys(),
        ...this.$refs.treeRefs.getHalfCheckedKeys(),
      ];
      console.log(keys);
      const idStr = keys.join(",");
      console.log(idStr);
      const { data: res } = await this.$ajax.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("更新权限失败");
      }
      this.$message.success("更新权限权限成功");
      this.getRoleList()
      this.rightsDialogVisible = false
    },
  },
};
</script>

<style lang="less" scoped>
.el-table {
  margin-top: 15px;
}
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>>
