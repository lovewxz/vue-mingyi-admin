<template>
<div class="project-handler">
  <el-form :model="form" label-width="80px" :rules="formRules" ref="form">
    <el-form-item label="标题" prop="title">
      <el-input v-model="form.title" auto-complete="off" placeholder="请输入标题"></el-input>
    </el-form-item>
    <el-form-item label="简介" prop="description">
      <el-input type="textarea" v-model="form.description" placeholder="请输入简介"></el-input>
    </el-form-item>
    <el-form-item label="封面图" prop="cover_image">
      <upload :upload-type="coverImg" :file-list="form.cover_image"></upload>
    </el-form-item>
    <el-form-item label="现价" prop="price" style="display:inline-block">
      <el-input v-model="form.price" auto-complete="off" placeholder="请输入现价">
        <template slot="prepend">¥</template>
      </el-input>
    </el-form-item>
    <el-form-item label="原价" prop="original_price" style="display:inline-block;text-decoration:line-through">
      <el-input v-model="form.original_price" auto-complete="off" placeholder="请输入原价">
        <template slot="prepend">¥</template>
      </el-input>
    </el-form-item>
    <el-form-item label="图片列表" prop="detail_images">
      <upload :upload-type="detailImgs" :file-list="form.detail_images"></upload>
    </el-form-item>
    <project-params :params="form.params"></project-params>
  </el-form>
  <div slot="footer" class="dialog-footer">
    <el-button @click.native="cancelBtn">取消</el-button>
    <el-button type="primary" @click.native="save" :loading="loading">提交</el-button>
  </div>
</div>
</template>
<script>
import api from 'js/axios'
import config from 'js/config'
import ProjectParams from 'components/project-params/project-params'
import Upload from 'components/upload/upload'

export default {
  data() {
    return {
      coverImg: 'coverImg',
      detailImgs: 'detailImgs',
      loading: false,
      formRules: {
        title: [
          { required: true, message: '请输入标题', trigger: 'blur' }
        ]
      },
      form: {
        title: '',
        description: '',
        price: '',
        original_price: '',
        cover_image: [],
        params: [{
          key: '',
          value: ''
        }],
        detail_images: []
      }
    }
  },
  methods: {
    // 保存
    async save() {
      this.addLoading = true
      console.log(this._saveResult(this.form))
      // const data = await api.putProject(this._saveResult(this.form))
      // data.success ? this.$router.push('/projects') : this.$message({
      //   message: data.err,
      //   type: 'error'
      // })
    },
    // 取消按钮
    cancelBtn() {
      this.$router.push('/projects')
    },
    _saveResult(data) {

      data.doctor = data.doctor._id
      data.cover_image = data.cover_image[0].url.replace(`${config.imgCDN}/`,'')
      data.detail_images = data.detail_images.map(item => item.url.replace(`${config.imgCDN}/`,''))
      return data
    },
    _genResult(data) {
      if (data.cover_image) {
        let coverImg = data.cover_image
        data.cover_image = [{
          name: coverImg.split('/').pop(),
          url: `${config.imgCDN}/${coverImg}`
        }]
      }
      if (data.detail_images.length > 0) {
        const newImgs = []
        data.detail_images.forEach(item => newImgs.push({ name: item.split('/').pop(), url: `${config.imgCDN}/${item}` }))
        data.detail_images = newImgs
      }
      return Object.assign({}, data)
    }
  },
  async created() {
    if (!this.$route.params.id) {
      this.$router.back()
    }
    await api.fetchProjectById(this.$route.params.id).then(res => {
      this.form = this._genResult(res)
    })
  },
  components: {
    ProjectParams,
    Upload
  }
}
</script>
<style lang="scss">
.project-handler {
  .dialog-footer {
    text-align: center;
  }
}
</style>
