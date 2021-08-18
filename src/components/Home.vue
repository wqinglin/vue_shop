<template>
  <el-container class="home_container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/logo.svg" alt="" />
        <span>后台管理系统</span>
      </div>
      <el-button type="default" @click="logout">退出</el-button>
    </el-header>
    <!-- 内容主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px':'200px'">
        <div class="toggle_button" @click="toggleCollapse">|||</div>
        <el-menu
          background-color="#3e4042"
          text-color="#b7987b"
          active-text-color="#ffffff"
          unique-opened
          :collapse = 'isCollapse'
          :collapse-transition="false"
          router
          :default-active="activePath"
        >
          <!-- 一级菜单 -->
          <el-submenu
            :index="item.id + ''"
            v-for="item in menuList"
            :key="item.id"
          >
            <!-- 一级菜单模板区 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconObj[item.id]"></i>
              <!-- 文本 -->
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/'+subItem.path + ''"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click ="saveNavState('/'+subItem.path)"
            >
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容主体 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: "Home",
  data() {
    return {
      menuList: [], //左侧菜单数据
      iconObj: {
        125: "iconfont icon-yonghuguanli",
        103: "iconfont icon-quanxianguanli",
        101: "iconfont icon-shangpinguanli",
        102: "iconfont icon-dingdanguanli",
        145: "iconfont icon-shujuguanli",
      },
      //菜单是否折叠
      isCollapse:false,
      // 保存点击导航的状态
      activePath:''
    };
  },
  created() {
    this.getMenuList();
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
    //获取所有的菜单
    async getMenuList() {
      const { data: res } = await this.$ajax.get("menus");
      if (res.meta.status != 200)
        return this.$message.error(res.meta.msg);
      this.menuList = res.data;
      console.log(res);
    },
    //点击按钮，菜单的折叠与展开
    toggleCollapse(){
       this.isCollapse = !this.isCollapse
    },
    //保存链接的激活状态
    saveNavState(activePath){
      window.sessionStorage.setItem('activePath',activePath)
      this.activePath = activePath
    }
  },
};
</script>

<style lang="less" scoped>
.home_container {
  height: 100%;
}
.el-header {
  background-color: #20222a;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #b7987b;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    img {
      width: 10%;
      margin-right: 10px;
    }
  }
}
.el-aside {
  background-color: #3e4042;
  .el-menu{
    border-right: none;
  }
}
.el-main {
  background-color: #eaedf1;
}
.iconfont {
  margin-right: 10px;
}
.toggle_button{
  background-color: rgba(0, 0, 0, 0.3);
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.3em;
  cursor: pointer;
}
</style>>
