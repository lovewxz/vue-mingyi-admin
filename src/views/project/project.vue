<template>
<div class="project">
  <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
    <el-form :inline="true" :model="filters">
      <el-form-item>
        <el-input v-model="filters.price" placeholder="标题"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary">查询</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleAdd">新增</el-button>
      </el-form-item>
    </el-form>
  </el-col>

  <el-table :data="project" border @selection-change="selsChange">
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
    <el-button type="danger" :disabled="this.sels.length===0">批量删除</el-button>
    <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="pageSize" :total="total" style="float:right;">
    </el-pagination>
  </el-col>
  <!--编辑界面-->
  <el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="false">
    <el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
      <el-form-item label="标题" prop="title">
        <el-input v-model="editForm.title" auto-complete="off" placeholder="请输入标题"></el-input>
      </el-form-item>
      <el-form-item label="简介" prop="description">
        <el-input type="textarea" v-model="editForm.description" placeholder="请输入简介"></el-input>
      </el-form-item>
      <el-form-item label="封面图" prop="cover_image">
        <el-upload list-type="picture-card" :on-success="handleSuccess" :on-remove="handleRemove" :before-upload="beforeUpload" action="//up-z2.qiniu.com/" :data="imgData" :file-list="coverImg">
          <i class="el-icon-plus"></i>
        </el-upload>
      </el-form-item>
      <el-form-item label="现价" prop="price" style="display:inline-block">
        <el-input v-model="editForm.price" auto-complete="off" placeholder="请输入原价">
          <template slot="prepend">¥</template>
        </el-input>
      </el-form-item>
      <el-form-item label="原价" prop="original_price" style="display:inline-block;text-decoration:line-through">
        <el-input v-model="editForm.original_price" auto-complete="off" placeholder="请输入原价">
          <template slot="prepend">¥</template>
        </el-input>
      </el-form-item>
      <el-form-item label="图片列表" prop="detail_images">
        <el-upload list-type="picture-card" :on-success="handleSuccess" :on-remove="handleRemove" :before-upload="beforeUpload" action="//up-z2.qiniu.com/" :data="imgData" :file-list="detailImgs">
          <i class="el-icon-plus"></i>
        </el-upload>
      </el-form-item>
      <project-params :params="editForm.params"></project-params>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click.native="cancelBtn">取消</el-button>
      <el-button type="primary" @click.native="save" :loading="editLoading">提交</el-button>
    </div>
  </el-dialog>
  <!--新增界面-->
  <!-- <el-dialog title="新增" v-model="addFormVisible" :close-on-click-modal="false">
    <el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
      <el-form-item label="标题" prop="title">
        <el-input v-model="addForm.title" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="简介">
        <el-input type="textarea" v-model="addForm.intro"></el-input>
      </el-form-item>
      <el-form-item label="图片">
        <el-upload list-type="picture-card" :on-success="handleSuccess" :on-remove="handleRemove" :before-upload="beforeUpload" action="//up-z2.qiniu.com/" :data="imgData" :file-list="fileList">
          <i class="el-icon-plus"></i>
        </el-upload>
      </el-form-item>
      <el-form-item label="价格">
        <el-input v-model="addForm.price" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="参数">
        <el-row v-for="(item,index) in addForm.parameters" style="margin-bottom: 10px;">
          <el-col :span="10">
            <el-input v-model="item.key" placeHolder="属性"></el-input>
          </el-col>
          <el-col :span="2" style="text-align:center">
            -
          </el-col>
          <el-col :span="10">
            <el-input v-model="item.value" placeHolder="值"></el-input>
          </el-col>
          <el-col :span="2" class="parameters-close" style="text-align:center">
            <span class="el-icon-close" @click="delParameters(index)" ></span>
          </el-col>
        </el-row>
        <el-button type="primary" @click="addParameters">新增参数</el-button>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click.native="cancelBtn">取消</el-button>
      <el-button type="primary" @click.native="save" :loading="addLoading">提交</el-button>
    </div>
  </el-dialog> -->
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
        price: ''
      },
      // 新增区域
      addFormVisible: false,
      addLoading: false,
      addFormRules: {
        title: [
          { required: true, message: '请输入标题', trigger: 'blur' }
        ]
      },
      addForm: {
        title: '',
        description: '',
        price: '',
        original_price: '',
        cover_image: '',
        parameters: [{
          key: '',
          value: ''
        }]
      },
      // 编辑区域
      editFormVisible: false,
      editLoading: false,
      editFormRules: {
        title: [
          { required: true, message: '请输入标题', trigger: 'blur' }
        ]
      },
      editForm: {
        title: '',
        description: '',
        price: '',
        original_price: '',
        cover_image: '',
        parameters: [{
          key: '',
          value: ''
        }]
      },
      editIndex: 0,
      // 图片上传参数
      imgData: {},
      supportWebp: false,
      coverImg: [],
      detailImgs: [],
      // 分页
      page: 1,
      pageSize: 20
    }
  },
  async created() {
    const list = await api.fetchProject({
      limit: this.pageSize
    })
    this.project = list.data
    this.total = list.total
  },
  methods: {
    //分页
    async handleCurrentChange(page) {
      this.page = page
      const list = await api.fetchProject({
        page: this.page,
        limit: this.pageSize
      })
      this.project = list.list
      this.total = list.total
    },
    // 选择按钮
    selsChange(sels) {
      this.sels = sels
    },
    // 增加按钮
    handleAdd() {
      this.addFormVisible = true
      this.fileList = []
      this.addForm = {
        title: '',
        images: [],
        price: '',
        intro: '',
        parameters: []
      }
    },
    // 编辑按钮
    handleEdit(index, row) {
      // this.coverImg = []
      // this.detailImgs = []
      // this.editFormVisible = true
      // if (row.cover_image) {
      //   this.coverImg.push({ name: row.cover_image.split('/').pop(), url: `${imgCDN}/${row.cover_image}` })
      // }
      // if (row.detail_images.length > 0) {
      //   row.detail_images.forEach(item => this.detailImgs.push({ name: item.split('/').pop(), url: `${imgCDN}/${item}` }))
      // }
      // this.editForm = Object.assign({}, row)
      // this.editIndex = index
      this.$router.push(`/projects/edit/${row._id}`)
    },
    // 取消按钮
    cancelBtn() {
      this.editFormVisible = false
    },
    // 删除按钮
    handleDel(index, row) {
      var _this = this;
      this.$confirm('确认删除吗?', '提示', {
        type: 'warning'
      }).then(() => {
        this.delProject(row._id)
      })
    },
    // 保存/新增商品
    async save() {
      if (this.addFormVisible) {
        this.addLoading = true
        await this.saveProject(this.addForm)
        this.addFormVisible = false
      } else {
        this.addLoading = true
        const data = await api.putProject(this.editForm)
        if (data.success) {
          await api.fetchProject({
            page: this.page,
            limit: this.pageSize
          })
        }
        this.editFormVisible = false
      }
    },
    // 图片上传
    beforeUpload(file) {
      let key = `${this.projects._id}/${randomToken(32)}`
      return axios.get('/qiniu/uptoken', { params: { key } }).then(res => {
        const response = res.data.data
        this.supportWebp = response.supportWebp
        this.imgData = {
          key,
          token: response.upToken
        }
      })
    },
    handleRemove(file, filelist) {
      const index = this.fileList.findIndex(item => {
        return item.uid === file.uid
      })
      this.fileList.splice(index, 1)
    },
    handleSuccess(response, file) {
      let key = response.key
      let name = file.name
      let prefix = this.supportWebp ? 'webp/' : ''
      this.fileList.push({
        name: file.name,
        url: `${imgCDN}/${prefix}${encodeURI(key)}`
      })
    },
    cdnImage(item) {
      return `${imgCDN}/${item}?imageView2/1/w/200/h/200/interlace/0/q/80`
    }
  },
  watch: {
    fileList(newVal) {
      const temp = []
      if (newVal.length > 0) {
        newVal.forEach(item => {
          const url = item.url.split(`${imgCDN}/`).pop()
          temp.push(url)
        })
      }
      this.addFormVisible ? this.addForm.images = temp : this.editForm.images = temp
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
