<template>
<div class="products">
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

  <el-table :data="products" border :span="24">
    <el-table-column prop="title" label="标题" align="center"></el-table-column>
    <el-table-column prop="intro" label="简介" align="center" ></el-table-column>
    <el-table-column prop="images" label="图片"  align="center">
      <template scope="scope">
        <img v-if="scope.row.images.length" :src="cdnImage(scope.row.images[0])" style="vertical-align:middle;padding:5px 0;">
      </template>
    </el-table-column>
    <el-table-column prop="price" label="价格" align="center"></el-table-column>
    <el-table-column prop="parameters" label="参数" align="center">
      <template scope="scope">
          <template v-for="(item,index) in scope.row.parameters">
            <div style="display:block;margin: 5px 0;">{{item.key}}</div>
          </template>
      </template>
    </el-table-column>
    <el-table-column label="操作" align="center">
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
  <!--编辑界面-->
  <el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="false">
    <el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
      <el-form-item label="标题" prop="title">
        <el-input v-model="editForm.title" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="简介" prop="intro">
        <el-input type="textarea" v-model="editForm.intro"></el-input>
      </el-form-item>
      <el-form-item label="图片" prop="images">
        <el-upload list-type="picture-card" :on-success="handleSuccess" :on-remove="handleRemove" :before-upload="beforeUpload" action="//up-z2.qiniu.com/" :data="imgData" :file-list="fileList">
          <i class="el-icon-plus"></i>
        </el-upload>
      </el-form-item>
      <el-form-item label="价格" prop="price">
        <el-input v-model="editForm.price" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="参数" prop="parameters">
        <el-row v-for="(item,index) in editForm.parameters" style="margin-bottom: 10px;">
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
      <el-button type="primary" @click.native="save" :loading="editLoading">提交</el-button>
    </div>
  </el-dialog>

  <!--新增界面-->
  <el-dialog title="新增" v-model="addFormVisible" :close-on-click-modal="false">
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
  </el-dialog>
</div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import axios from 'axios'
import randomToken from 'random-token'
const imgCDN = 'http://image.0755mingyi.com'
export default {
  data() {
    return {
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
        images: [],
        price: '',
        intro: '',
        parameters: []
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
        images: [],
        price: '',
        intro: '',
        parameters: []
      },
      // 图片上传参数
      imgData: {},
      supportWebp: false,
      fileList: []
    }
  },
  computed: {
    ...mapGetters([
      'products'
    ])
  },
  async created() {
    await this.fetchProducts()
  },
  methods: {
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
      this.fileList = []
      this.editFormVisible = true
      if (row.images.length > 0) {
        row.images.forEach(item => this.fileList.push({ name: item.split('/').pop(), url: `${imgCDN}/${item}` }))
      }
      this.editForm = Object.assign({}, row)
    },
    // 取消按钮
    cancelBtn() {
      this.addFormVisible ? this.addFormVisible = false : this.editFormVisible = false
    },
    // 删除按钮
    handleDel(index, row) {
      var _this = this;
			this.$confirm('确认删除吗?', '提示', {
				type: 'warning'
			}).then(() => {
				this.delProduct(row._id)
			})
    },
    // 新增参数
    addParameters() {
      this.addFormVisible ? this.addForm.parameters.push({ key: '', value: '' }) : this.editForm.parameters.push({ key: '', value: '' })
    },
    // 删除参数
    delParameters(index) {
      this.addFormVisible ? this.addForm.parameters.splice(index, 1) : this.editForm.parameters.splice(index, 1)
    },
    // 保存/新增商品
    async save() {
      if (this.addFormVisible) {
        this.addLoading = true
        await this.saveProduct(this.addForm)
        this.addFormVisible = false
      } else {
        this.addLoading = true
        console.log(this.editForm)
        await this.putProduct(this.editForm)
        this.editFormVisible = false
      }
    },
    // 图片上传
    beforeUpload(file) {
      let key = `products/${randomToken(32)}`
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
      this.fileList.splice(index,1)
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
      return `${imgCDN}/${item}?imageView2/1/w/60/h/60/interlace/0/q/80`
    },
    ...mapActions([
      'fetchProducts',
      'saveProduct',
      'putProduct',
      'delProduct'
    ])
  },
  watch: {
    fileList(newVal) {
      const temp = []
      if(newVal.length > 0) {
        newVal.forEach(item => {
          const url = item.url.split(`${imgCDN}/`).pop()
          temp.push(url)
        })
      }
      this.addFormVisible ? this.addForm.images = temp : this.editForm.images = temp
    }
  }
}
</script>
<style lang="scss">
.products {
    margin-top: 30px;
}
</style>
