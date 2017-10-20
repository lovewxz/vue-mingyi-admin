<template>
<div class="pcase">
  <filter-bar @filter="filter" @add="handleAdd" style="padding-bottom:0;"></filter-bar>
  <el-table :data="pcase" border @selection-change="selsChange" v-loading="listLoading">
    <el-table-column type="selection"></el-table-column>
    <el-table-column prop="title" label="日记标题" align="left"></el-table-column>
    <el-table-column prop="user_name" label="模特姓名" align="left"></el-table-column>
    <el-table-column prop="time" label="发布时间" align="center" width="200">
      <template scope="scope">
        {{scope.row.meta.createdAt.split('T')[0]}}
      </template>
    </el-table-column>
    <el-table-column prop="category" label="分类" align="center" width="120"></el-table-column>
    <el-table-column label="操作" align="center" width="200">
      <template scope="scope">
          <el-button
            size="small"
            @click="handleEdit(scope.$index, scope.row)"
          >编辑</el-button>
          <el-button
            size="small"
            type="danger"
            @click="handleDel(scope.$index,scope.row)"
          >删除</el-button>
        </template>
    </el-table-column>
  </el-table>
  <el-col :span="24" class="toolbar">
    <el-button type="danger" :disabled="this.sels.length===0" @click="batchDel">批量删除</el-button>
    <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="pageSize" :total="total" style="float:right;">
    </el-pagination>
  </el-col>
</div>
</template>
<script>
import config from 'js/config'
import util from 'js/util'
import api from 'js/axios'
import ProjectParams from 'components/project-params/project-params'
import FilterBar from 'components/filter-bar/filter-bar'
import axios from 'axios'
import randomToken from 'random-token'

const imgCDN = config.imgCDN
export default {
  data() {
    return {
      total: 0,
      pcase: [],
      sels: [], //选中的数据
      // 分页
      page: 1,
      pageSize: 20,
      listLoading: false
    }
  },
  async created() {
    await this.fetchPcase(this.page, this.pageSize)
  },
  methods: {
    //分页
    async handleCurrentChange(page) {
      await this.fetchPcase(page, this.pageSize)
    },
    // 选择按钮
    selsChange(sels) {
      this.sels = sels
    },
    // 增加按钮
    handleAdd() {
      this.$router.push('/pcases/add')
    },
    // 编辑按钮
    handleEdit(index, row) {
      this.$router.push(`/pcases/edit/${row._id}`)
    },
    // 删除按钮
    handleDel(index, row) {
      this.$confirm('确认删除吗?', '提示', {
        type: 'warning'
      }).then(async() => {
        const options = Object.assign({}, { _id: row._id }, { status: -1 })
        const data = await api.delPcase(options)
        if (data.success && data.data.ok === 1) {
          await this.fetchPcase(this.page, this.pageSize)
        }
        console.log(data)
      }, () => {
        return
      })
    },
    // 过滤查询
    async filter(keyword) {
      keyword = encodeURIComponent(keyword)
      await this.fetchPcase(this.page, this.pageSize, keyword)
    },
    // 批量删除
    async batchDel() {
      if (Array.isArray(this.sels)) {
        const options = []
        this.sels.forEach((item) => {
          options.push(Object.assign({}, { _id: item._id }, { status: -1 }))
        })
        let promises = options.map((option) => api.delPcase(option))
        let results = await Promise.all(promises)
        await this.fetchPcase(this.page, this.pageSize)
      }
    },
    async fetchPcase(page, limit, keyword = '') {
      this.listLoading = true
      const list = keyword ? await api.fetchPcase({
        page,
        limit,
        keyword
      }) : await api.fetchPcase({
        page,
        limit
      })
      this.listLoading = false
      this.pcase = list.data
      this.total = list.total
      console.log(this.pcase)
    }
  },
  components: {
    ProjectParams,
    FilterBar
  }
}
</script>
<style lang="scss">
.project {
    .now-price {
        display: block;
        font-size: 18px;
        color: #ff4949;
    }
    .or-price {
        display: block;
        text-decoration: line-through;
        color: #666;
    }
    .el-loading-mask {
      z-index: 500;
    }
}
</style>
