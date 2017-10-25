<template>
<div class="people-case-handler" style="margin-top:30px;">
  <el-form :model="form" label-width="80px" :rules="formRules" ref="form">
    <el-form-item label="标题" prop="title">
      <el-input v-model="form.title" auto-complete="off" placeholder="请输入标题"></el-input>
    </el-form-item>
    <el-form-item label="模特姓名" prop="user_name">
      <el-input v-model="form.user_name" auto-complete="off" placeholder="请输入模特姓名"></el-input>
    </el-form-item>
    <el-form-item label="术前照片" prop="before" v-if="form.compare_photo" style="display:inline-block">
      <upload :file-list="form.compare_photo.before"></upload>
    </el-form-item>
    <el-form-item label="术后照片" prop="after" v-if="form.compare_photo" style="display:inline-block">
      <upload :file-list="form.compare_photo.after"></upload>
    </el-form-item>
    <el-form-item label="简介" prop="contents">
      <el-input type="textarea" v-model="form.contents" placeholder="请输入简介"></el-input>
    </el-form-item>
    <el-form-item label="是否置顶" prop="isTop">
      <el-checkbox v-model="form.isTop">置顶</el-checkbox>
    </el-form-item>
    <el-form-item label="操作专家" prop="doctor">
      <el-select placeholder="请选择专家" v-model="formExpertSelectVal">
        <el-option v-for="item in doctors" :key="item._id" :label="item.realname" :value="item._id">
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="关联项目" prop="project">
      <el-select placeholder="请选择项目" v-model="formProjectSelectVal" style="width: 80%;">
        <el-option v-for="item in projects" :key="item._id" :label="item.title" :value="item._id">
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="标签" v-if="form.all_item" prop="tag">
      <el-tag :key="tag" v-for="tag in form.all_item" :closable="true" :close-transition="false" type="primary" class="tag-item">{{tag}}</el-tag>
    </el-form-item>
    <el-form-item label="相关日记">
      <case-diary :table-data="form.sections" @save="diarySave" @add="diaryAdd" ref="caseDiary"></case-diary>
    </el-form-item>
  </el-form>
  <div slot="footer" class="dialog-footer">
    <el-button @click.native="cancelBtn">取消</el-button>
    <el-button type="primary" @click.native="save" :loading="loading">提交</el-button>
  </div>
</div>
</template>
<script>
import util from 'js/util'
import api from 'js/axios'
import config from 'js/config'
import Upload from 'components/upload/upload'
import CaseDiary from 'components/case-diary/case-diary'

export default {
  data() {
    return {
      loading: false,
      formRules: {
        title: [
          { required: true, message: '请输入标题', trigger: 'blur' }
        ]
      },
      form: {
        title: '',
        contents: '',
        isTop: false,
        user_name: '',
        compare_photo: {
          before: [],
          after: []
        },
        all_item: [],
        sections: [{
          title: '',
          article: '',
          text: ''
        }]
      },
      doctors: [],
      projects: [],
      formExpertSelectVal: '',
      formProjectSelectVal: '',
      isAuthorized: false // 是否验证过
    }
  },
  methods: {
    // 保存
    save() {
      this.$refs.form.validate(async(valid) => {
        if (valid) {
          console.log(this._saveResult(this.form))
          // let data = ''
          // if (this.$route.params.id) {
          //   data = await api.putProject(this._saveResult(this.form))
          // } else {
          //   data = await api.saveProject(this._saveResult(this.form))
          // }
          // data.success ? this.$router.back() : this.$message({
          //   message: data.err,
          //   type: 'error'
          // })
        }
      })
    },
    // 取消按钮
    cancelBtn() {
      this.$router.back()
    },
    async diarySave(diaryData) {
      this.form.sections = diaryData
      let params = this._formateResult(this.form)
      // await api.putPcase(this.form).then(res => {
      //   console.log(res)
      // })
    },
    diaryAdd(diaryData) {
      this.form.sections.push(diaryData)
    },
    _saveResult(data) {
      const _data = Object.assign({}, data)
      _data.doctor = this.formSelectVal
      _data.cover_image = _data.cover_image.map(item => item.url.replace(`${config.imgCDN}/`, ''))
      _data.detail_images = _data.detail_images.map(item => item.url.replace(`${config.imgCDN}/`, ''))
      return _data
    },
    _genResult(data) {
      if (data.compare_photo) {
        data.compare_photo.before = [{ name: data.compare_photo.before, url: `${config.imgCDN}/${data.compare_photo.before}` }]
        data.compare_photo.after = [{ name: data.compare_photo.after, url: `${config.imgCDN}/${data.compare_photo.after}` }]
      }
      if (data.sections) {
        data.sections = data.sections.map(item => {
          if (item.article) {
            item.article = util.addURLToImage(item.article)
          }
          return item
        })
      }
      return Object.assign({}, data)
    },
    _formateResult(data) {
      let params = Object.assign({},data)
      params.doctor = params.doctor._id
      params.project = params.project._id
    }
  },
  async beforeCreate() {
    if (!this.isAuthorized) {
      await api.fetchDoctor().then(res => {
        res = res.data
        this.doctors = res
      }).catch(e => {
        if (e.status === 402) {
          this.isAuthorized = true
          this.$message({
            message: e.data,
            type: 'error'
          })
        }
      })
    }
    if (!this.isAuthorized) {
      const params = {
        page: 0,
        limit: 0
      }
      await api.fetchProject(params).then(res => {
        res = res.data
        this.projects = res
      }).catch(e => {
        if (e.status === 402) {
          this.isAuthorized = true
          this.$message({
            message: e.data,
            type: 'error'
          })
        }
      })
    }
  },
  async created() {
    if (this.$route.params.id && !this.isAuthorized) {
      await api.fetchPcaseById(this.$route.params.id).then(res => {
        this.form = this._genResult(res)
        if (this.form.doctor) {
          this.formExpertSelectVal = this.form.doctor._id
        }
        if (this.form.project) {
          this.formProjectSelectVal = this.form.project._id
        }
        console.log(this.form)
      })
    }
  },
  watch: {
    '$route' (to, from) {
      if (to.path.indexOf('add') > -1) {
        this.$refs.form.resetFields()
      }
    }
  },
  components: {
    Upload,
    CaseDiary
  }
}
</script>
<style lang="scss">
.people-case-handler {
    .dialog-footer {
        text-align: center;
    }
    .el-upload-list__item {
        text-align: center;
        .el-upload-list__item-thumbnail {
            width: auto;
        }
    }
    .tag-item {
        margin-right: 10px;
    }
}
</style>
