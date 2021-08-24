<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 视图区域 -->
    <el-card>
      <!-- 搜索框 -->
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 表格内容区 -->
      <el-table :data="orderList" border stripe>
        <el-table-column type="index" label="#"> </el-table-column>
        <el-table-column prop="order_number" label="订单编号">
        </el-table-column>
        <el-table-column prop="order_price" label="订单价格" width="120px">
        </el-table-column>
        <el-table-column prop="pay_status" label="是否付款" width="120px">
          <template v-slot:default="scope">
            <el-tag v-if="scope.row.order_pay === '1'" type="success"
              >已付款</el-tag
            >
            <el-tag v-else type="danger">未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货" width="120px">
        </el-table-column>
        <el-table-column prop="create_time" label="下单时间" width="180px">
          <template v-slot:default="scope">
            {{ scope.row.create_time | momentFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog"
            ></el-button>
            <el-button
              type="success"
              icon="el-icon-location"
              size="mini"
              @click="showProgress"
            ></el-button>
        </el-table-column>
      </el-table>
      <!-- 分页区 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 5, 8, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 编辑对话框 -->
    <el-dialog
      title="提示"
      :visible.sync="EditDialogVisible"
      width="40%"
      @close="addressDialogClosed"
    >
      <!-- form表单 -->
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRefs"
        label-width="100px"
      >
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            v-model="editForm.address1"
            :options="cityData"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="editForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="EditDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="EditDialogVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>
    <!-- 物流进度对话框 -->
    <el-dialog
      title="物流进度"
      :visible.sync="locationDialogVisible"
      width="40%"
    >
      <!-- 时间线  -->

      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time"
        >
          {{ activity.content }}
        </el-timeline-item>
      </el-timeline>
      <span slot="footer" class="dialog-footer">
        <el-button @click="locationDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="locationDialogVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import cityData from "../../assets/js/cityData";
export default {
  name: "order",
  data() {
    return {
      //订单列表数据
      orderList: [],
      total: 0,
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10,
      },
      //编辑对话框默认关闭
      EditDialogVisible: false,
      //编辑表单数据
      editForm: {
        address1: [],
        address2: "",
      },
      //   编辑表单规则
      editFormRules: {
        address1: [
          { required: true, message: "请选择省市区/县", trigger: "blur" },
        ],
        address2: [
          { required: true, message: "请输入详细地址", trigger: "blur" },
        ],
      },
      //城市级联数据
      cityData,
      //物流进度对话框
      locationDialogVisible: false,
      //物流信息微数据
      progressInfo: [
        {
          consignee_addr: "",
          create_time: 1512533560,
          goods: [
            {
              goods_id: 96,
              goods_number: 2,
              goods_price: 333,
              goods_total_price: 999,
              id: 82,
              order_id: 67,
            },
            {
              goods_id: 95,
              goods_number: 5,
              goods_price: 666,
              goods_total_price: 999,
              id: 83,
              order_id: 67,
            },
          ],
          is_send: "否",
          order_fapiao_company: "",
          order_fapiao_content: "",
          order_fapiao_title: "个人",
          order_id: 67,
          order_number: "itcast-g7kmck71vjaujfgoi",
          order_pay: "0",
          order_price: 20,
          pay_status: "0",
          trade_no: "",
          update_time: 1512533560,
          user_id: 1,
        },
      ],
    };
  },
  created() {
    this.getOrderList();
  },
  methods: {
    //请求订单列表数据
    async getOrderList() {
      const { data: res } = await this.$ajax.get("orders", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) {
        return this.$message.error("订单列表数据获取失败！");
      }
      console.log(res.data);
      this.orderList = res.data.goods;
      this.total = res.data.total;
    },
    //一页几条
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getOrderList();
    },
    //当前第几页
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getOrderList();
    },
    //编辑对话框
    showEditDialog() {
      this.EditDialogVisible = true;
    },
    addressDialogClosed() {
      this.$refs.editFormRefs.resetFields();
    },
    //定位对话框
    async showProgress() {
      //   const {data:res} = await this.$ajax.get(`/kuaidi/${订单号}`)
      //   if(res.meta.status !==200){
      //       return this.$message.error('获取物流信息失败')
      //   }
      //   this.progressInfo = res.data
      //   console.log(this.progressInfo);

      this.locationDialogVisible = true;
    },
  },
};
</script>

<style lang="less" scoped>
.el-table {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>
