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
      <tag :tag-list="form.all_item"></tag>
    </el-form-item>
  </el-form>
  <el-row v-show="diaryListShow">
    <el-col>相关日记</el-col>
  </el-row>
  <case-diary :table-data="diaryList" @filter="diaryFitler" @save="diarySave" @add="diaryAdd" @del="diaryDel" @batchDel="diaryBatchDel" ref="caseDiary" v-show="diaryListShow"></case-diary>
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
import Tag from 'components/tag/tag'
import randomToken from 'random-token'

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
        all_item: []
      },
      diaryListShow: true,
      diaryList: [],
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
          let res = ''
          const data = this._saveResult(this.form)
          if (this.$route.params.id) {
            res = await api.putPcase(data)
          } else {
            res = await api.savePcase(data)
          }
          res.success ? this.$router.back() : this.$message({
            message: res.err,
            type: 'error'
          })
        }
      })
    },
    // 取消按钮
    cancelBtn() {
      this.$router.back()
    },
    async diarySave(diaryData, diaryIndex) {
      diaryData.article = util.removeURLToImage(diaryData.article)
      await api.putDiary(diaryData).then(res => {
        if (res.success) {
          res.data.article = util.addURLToImage(res.data.article)
          this.diaryList = this.diaryList.map((item, index) => {
            if (index === diaryIndex) {
              item = res.data
            }
            return item
          })
        }
      })
      this.$refs.caseDiary.resetFields()
    },
    async diaryAdd(diaryData) {
      diaryData.article = util.removeURLToImage(diaryData.article)
      diaryData.caseId = this.form._id
      diaryData._id = randomToken(32)
      await api.saveDiary(diaryData).then(res => {
        if (res.success) {
          res.data.article = util.addURLToImage(res.data.article)
          this.diaryList.push(res.data)
        }
      })
      this.$refs.caseDiary.resetFields()
    },
    diaryBatchDel(diaryArr) {
      this.$confirm('确认删除吗?', '提示', {
        type: 'warning'
      }).then(async() => {
        if (Array.isArray(diaryArr)) {
          const options = []
          diaryArr.forEach((item) => {
            options.push(Object.assign({}, { _id: item._id }, { status: -1 }))
          })
          let promises = options.map((option) => api.delDiary(option))
          let results = await Promise.all(promises)
          if (results) {
            this.diaryList = this.diaryList.filter(item => {
              let bool = true
              diaryArr.forEach(diary => {
                if (diary.id === item.id) {
                  bool = false
                }
              })
              return bool
            })
          }
        }
      }, () => {
        return
      })
    },
    diaryDel(index, diary) {
      this.$confirm('确认删除吗?', '提示', {
        type: 'warning'
      }).then(async() => {
        const options = Object.assign({}, { _id: diary._id }, { status: -1 })
        await api.delDiary(options).then(res => {
          if (res.success && res.data.ok === 1) {
            this.diaryList.splice(index, 1)
          }
        })
      }, () => {
        return
      })
    },
    diaryFitler(keyword) {
      if (!keyword) {
        return
      }
      keyword = new RegExp(keyword, 'i')
      this.diaryList = this.diaryList.filter(item => {
        return item.article.match(keyword)
      })
    },
    _saveResult(data) {
      const _data = JSON.parse(JSON.stringify(data))
      _data.doctor = this.formExpertSelectVal
      _data.project = this.formProjectSelectVal
      const beforePhotoURL = util.removeURLToImage(_data.compare_photo.before[0].url)
      const afterPhotoURL = util.removeURLToImage(_data.compare_photo.after[0].url)
      _data.compare_photo = {
        before: beforePhotoURL,
        after: afterPhotoURL
      }
      return _data
    },
    _genResult(data) {
      if (data.compare_photo) {
        data.compare_photo.before = [{ name: data.compare_photo.before, url: `${config.imgCDN}/${data.compare_photo.before}` }]
        data.compare_photo.after = [{ name: data.compare_photo.after, url: `${config.imgCDN}/${data.compare_photo.after}` }]
      }
      return Object.assign({}, data)
    },
    async _fetchPcaseById(id) {
      await api.fetchPcaseById(id).then(res => {
        this.form = this._genResult(res)
        if (this.form.doctor) {
          this.formExpertSelectVal = this.form.doctor._id
        }
        if (this.form.project) {
          this.formProjectSelectVal = this.form.project._id
        }
      })
    },
    async _batchDiaryByCaseId(caseId) {
      await api.batchDiaryByCaseId(caseId).then(res => {
        if (res.success) {
          const diary = res.data
          this.diaryList = diary.map(item => {
            if (item.article) {
              item.article = util.addURLToImage(item.article)
            }
            return item
          })
        }
      })
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
      await this._fetchPcaseById(this.$route.params.id)
      await this._batchDiaryByCaseId(this.$route.params.id)
    } else {
      this.diaryListShow = false
    }
  },
  watch: {
    '$route' (to, from) {
      if (to.path.indexOf('add') > -1) {
        console.log(1)
        this.formExpertSelectVal = ''
        this.formProjectSelectVal = ''
        this.form.all_item = []
        this.form.compare_photo = {}
        this.diaryList = []
        this.diaryListShow = false
        this.$refs.form.resetFields()
      }
    }
  },
  components: {
    Upload,
    CaseDiary,
    Tag
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
}
</style>
