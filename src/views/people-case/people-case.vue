<template>
<div class="project">
  <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
    <el-form :inline="true" :model="filters">
      <el-form-item>
        <el-input v-model="filters.name" placeholder="标题"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="filter">查询</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleAdd">新增</el-button>
      </el-form-item>
    </el-form>
  </el-col>

  <el-table :data="project" border @selection-change="selsChange" v-loading="listLoading">
    <el-table-column type="selection"></el-table-column>
    <el-table-column prop="title" label="标题" align="left"></el-table-column>
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
import axios from 'axios'
import randomToken from 'random-token'

const imgCDN = config.imgCDN
export default {
  data() {
    return {
      total: 0,
      project: [],
      sels: [], //选中的数据
      // 筛选工具栏
      filters: {
        name: ''
      },
      // 分页
      page: 1,
      pageSize: 20,
      listLoading: false
    }
  },
  async created() {
    await this.fetchProject(this.page, this.pageSize)
  },
  methods: {
    //分页
    async handleCurrentChange(page) {
      await this.fetchProject(page, this.pageSize)
    },
    // 选择按钮
    selsChange(sels) {
      this.sels = sels
    },
    // 增加按钮
    handleAdd() {
      this.$router.push('/projects/add')
    },
    // 编辑按钮
    handleEdit(index, row) {
      this.$router.push(`/projects/edit/${row._id}`)
    },
    // 删除按钮
    handleDel(index, row) {
      var _this = this;
      this.$confirm('确认删除吗?', '提示', {
        type: 'warning'
      }).then(async() => {
        const options = Object.assign({}, { _id: row._id }, { status: -1 })
        const data = await api.delProject(options)
        if (data.success && data.data.ok === 1) {
          await this.fetchProject(this.page, this.pageSize)
        }
        console.log(data)
      }, () => {
        return
      })
    },
    // 过滤查询
    filter() {
      console.log(1)
      let condition = {
        name: new RegExp(this.filter.name)
      }
      console.log(condition)
      const data = await this.fetchProject(this.page, this.pageSize, condition)
      console.log(data)
    }
    // 批量删除
    async batchDel() {
      if (Array.isArray(this.sels)) {
        const options = []
        this.sels.forEach((item) => {
          options.push(Object.assign({}, { _id: item._id }, { status: -1 }))
        })
        let promises = options.map((option) => api.delProject(option))
        let results = await Promise.all(promises)
        await this.fetchProject(this.page, this.pageSize)
      }
    },
    async fetchProject(page, limit, condition = {}) {
      this.listLoading = true
      const list = await api.fetchProject({
        page,
        limit,
        condition
      })
      this.listLoading = false
      this.project = list.data
      this.total = list.total
    }
  },
  components: {
    ProjectParams
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
}
</style>
