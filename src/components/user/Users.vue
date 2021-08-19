<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <!-- 搜索区 -->
      <div style="margin-top: 15px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-input
              placeholder="请输入内容"
              v-model="queryInfo.query"
              clearable
              @clear="getUserList"
            >
              <el-button
                slot="append"
                icon="el-icon-search"
                @click="getUserList"
              ></el-button>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="addDialogVisible = true"
              >添加用户</el-button
            >
          </el-col>
        </el-row>
      </div>
      <!-- 用户列表区 -->
      <el-table :data="userList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <template v-slot:default="scope">
            <!-- {{ scope.row.mg_state }} -->
            <el-switch
              v-model="scope.row.mg_state"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="saveStateChanged(scope.row)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot:default="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editUser(scope.row.id)"
            ></el-button>

            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteUser(scope.row.id)"
            ></el-button>
            <!-- 含提示信息 -->
            <el-tooltip
              class="item"
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 页码区 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="40%">
      <!-- 内容主题区 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addRuleFormRefs"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelDialog">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
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
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRefs"
        label-width="70px"
      >
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="rightsDialogVisible"
      width="40%"
      @close ="setRoleDialogClosed"
    >
     <div>
       <p>当前的用户:{{userInfo.username }}</p>
       <p>当前角色:{{userInfo.role_name}}</p>
       <p>分配新角色: 
        <el-select v-model="selectedRoleId" placeholder="请选择">
        <el-option
          v-for="item in rolesList"
          :key="item.id"
          :label="item.roleName"
          :value="item.id">
        </el-option>
       </el-select>
       </p>
     </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="rightsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="showRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "users",
  data() {
    //   验证邮箱的规则
    var checkEmail = (rule, value, cb) => {
      //   验证邮箱正则
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
      if (regEmail.test(value)) {
        return cb();
      }
      cb(new Error("请输入合法的邮箱"));
    };
    //   验证手机号规则
    var checkMobile = (rule, value, cb) => {
      const regMobile =
        /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
      if (regMobile.test(value)) {
        return cb();
      }
      cb(new Error("请输入合法的手机号"));
    };
    return {
      //获取用户列表的参数对象
      queryInfo: {
        query: "",
        // 当前页
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 2,
      },
      userList: [],
      total: 0,
      //默认添加对话框为隐藏
      addDialogVisible: false,
      // 默认编辑对话框为隐藏
      editDialogVisible: false,
      // 添加用户表单数据
      addForm: {
        username: "",
        password: "",
        email: "",
        mobile: "",
      },
      // 增加时弹框规则
      addFormRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 3, max: 5, message: "长度在 3 到 8个字符", trigger: "blur" },
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            min: 6,
            max: 15,
            message: "长度在 6 到 15 个字符",
            trigger: "blur",
          },
        ],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" },
        ],
      },
      // 保存编辑信息
      editForm: [],
      // 编辑时弹框规则
      editFormRules: {
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" },
        ],
      },
      //分配权限对话框
      rightsDialogVisible:false,
      // 需要被分配角色的用户信息
      userInfo:{},
      // 所有角色的数据列表
      rolesList:[],
      // 已选中的Id值
      selectedRoleId:''
    };
  },
  created() {
    this.getUserList();
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$ajax.get("users", {
        params: this.queryInfo,
      });

      if (res.meta.status != 200) return this.$message.error(res.meta.msg);
      this.userList = res.data.users;
      this.total = res.data.total;
      //   console.log(res);
    },
    // 监听pagesize改变的事件
    handleSizeChange(newSize) {
      // console.log(newSize);
      this.queryInfo.pagesize = newSize;
      this.getUserList();
    },
    // 监听页码值改变的事件
    handleCurrentChange(newPage) {
      // console.log(newPage);
      this.queryInfo.pagenum = newPage;
      this.getUserList();
    },
    // 监听switch状态的改变
    async saveStateChanged(userInfo) {
      console.log(userInfo);
      const { data: res } = await this.$ajax.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      );
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state;
        return this.$message.error("更新用户状态失败");
      }
      this.$message.success("更新用户状态成功");
    },
    // 点击按钮添加新用户
    addUser() {
      this.$refs.addRuleFormRefs.validate(async (valid) => {
        // console.log(valid);
        if (!valid) return;
        // 可以发起添加用户网络请求
        const { data: res } = await this.$ajax.post("users", this.addForm);
        //    console.log(res);
        if (res.meta.status !== 201) {
          return this.$message.error("添加用户失败");
        }
        this.$message.success("添加用户成功");
        //隐藏添加的对话框
        this.addDialogVisible = false;
        this.getUserList();
        this.$refs.addRuleFormRefs.resetFields();
      });
    },
    //点击取消对话框
    cancelDialog() {
      this.addDialogVisible = false;
      this.$refs.addRuleFormRefs.resetFields();
    },
    //编辑用户
    async editUser(id) {
      const { data: res } = await this.$ajax.get(`users/${id}`);
      if (res.meta.status !== 200) {
        return this.$message.error("查询用户信息失败！");
      }
      this.editForm = res.data;
      this.editDialogVisible = true;

      console.log(res);
      //   console.log(id);
    },
    //监听修改用户对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRefs.resetFields();
    },
    // 点击按钮编辑提交用户
    editUserInfo() {
      this.$refs.editFormRefs.validate(async (valid) => {
        if (!valid) return;
        //发送修改用户请求
        const { data: res } = await this.$ajax.put(
          `users/${this.editForm.id}`,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile,
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("更新用户信息失败");
        }
        //关闭对话框
        this.editDialogVisible = false;
        //刷新列表数据
        this.getUserList();
        //提示修改成功
        this.$message.success("更新用户信息成功");
      });
    },
    //删除用户
    async deleteUser(id) {
      const confirmRus = await this.$confirm(
        "此操作将永久删除该用户, 是否继续?",
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
      const { data: res } = await this.$ajax.delete(`users/${id}`);
      if (res.meta.status !== 200) {
        return this.$message.error("删除用户信息失败");
      }
      this.$message.success("删除用户信息成功");
      this.getUserList();
    },
    // 展示分配角色的对话框
   async setRole(userInfo){
      this.userInfo = userInfo
      // 获取所有的角色列表
     const {data:res} = await this.$ajax.get('roles')
      this.rightsDialogVisible = true
       if (res.meta.status !== 200) {
        return this.$message.error("获取角色列表失败！ ");
      }
      this.rolesList = res.data
    },
    //点击按钮分配角色
     async showRoleInfo(){
     if(!this.selectedRoleId) {
       return this.$message.error('请选择要分配的角色')
     }
     const {data:res}  = await this.$ajax.put(`users/${this.userInfo.id}/role`,{rid:this.selectedRoleId})
    console.log(res);
    if (res.meta.status !== 200) {
        return this.$message.error("更新角色失败！");
      } 
       this.$message.success('更新角色成功')
       this.getUserList()
       this.rightsDialogVisible =false
    },
    //监听分配对话框关闭
    setRoleDialogClosed(){
      this.selectedRoleId ='',
      this.userInfo = ''
    }
  
  },
};
</script>

<style lang="less" scoped>
.el-table {
  margin-top: 15px;
  font-size: 13px;
}
.el-pagination {
  margin-top: 15px;
}
</style>>
