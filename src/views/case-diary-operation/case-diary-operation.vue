<template>
<div class="diary-container">
  <el-form :model="diaryData" ref="caseDiary" :rules="formRules">
    <el-form-item label="日期" prop="title">
      <el-col :span="5">
        <el-input v-model="diaryData.title" placeholder="请填写日期"></el-input>
      </el-col>
    </el-form-item>
    <el-form-item class="upload-wrapper" v-if="uploadImgShow" label="上传图片">
      <el-col>
        <upload upload-type="image" @fileChange="fileChange" @fileRemove="fileRemove" @filePreview="filePreview"></upload>
        <el-button @click="insertEditor">插入文章</el-button>
        <el-button style="margin-left: 0;margin-top: 10px;">全部插入</el-button>
      </el-col>
    </el-form-item>
    <el-form-item class="upload-wrapper" v-if="uploadVideoShow" label="插入视频">
      <upload upload-type="video" :file-list="fileVideoList" @insert="insertEditor"></upload>
    </el-form-item>
    <el-form-item label="选择案例" prop="caseId">
      <el-select placeholder="请选择案例" v-model="diaryData.caseId">
        <el-option v-for="item in pcase" :key="item._id" :label="item.user_name" :value="item._id">
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item class="editor-content-item" label="文章详情" prop="article">
      <el-col :span="24">
        <quill-editor :content="diaryData.article" class="vue-editor" ref="editor" :options="editorOption" @change="onEditorChange($event)" @focus="onEditorFocus($event)">
          <div id="toolbar" slot="toolbar">
            <button class="ql-bold">Bold</button>
            <button class="ql-italic">Italic</button>
            <select class="ql-size">
                <option value="small"></option>
                <option selected></option>
                <option value="large"></option>
                <option value="huge"></option>
              </select>
            <button class="ql-script" value="sub"></button>
            <button class="ql-script" value="super"></button>
            <el-button @click="uploadImgHandler" class="fa fa-file-image-o"></el-button>
            <el-button @click="uploadVideoHandler" class="fa fa-file-video-o" style="margin-left: 0;"></el-button>
          </div>
        </quill-editor>
      </el-col>
    </el-form-item>
  </el-form>
  <div slot="footer" class="dialog-footer">
    <el-button @click.native="diaryCancel">取消</el-button>
    <el-button type="primary" @click.native="diarySave">提交</el-button>
  </div>
</div>
</template>
<script>
import api from 'js/axios'
import config from 'js/config'
import util from 'js/util'
import Quill from 'quill'
import { quillEditor } from 'vue-quill-editor'
import Upload from 'components/upload/upload'
import randomToken from 'random-token'

export default {
  data() {
    return {
      diaryData: {
        title: '',
        article: '',
        caseId: this.$route.query.caseId || ''
      },
      editorOption: {
        modules: {
          toolbar: '#toolbar'
        }
      },
      formRules: {
        title: [
          { required: true, message: '请输入天数', trigger: 'blur' }
        ],
        caseId: [
          { required: true, message: '请输入内容', trigger: 'change' }
        ],
        article: [
          { required: true, message: '请输入内容', trigger: 'blur' }
        ]
      },
      pcase: [],
      editorContent: '',
      uploadVideoShow: false,
      uploadImgShow: false,
      uploadType: 'image',
      fileImgList: [],
      fileVideoList: [],
      editorSelection: 0,
      isAuthorized: false,
    }
  },
  methods: {
    onEditorFocus() {
      this.editorSelection = this.$refs.editor.quill.getSelection().index
    },
    onEditorChange({ editor, html, text }) {
      this.diaryData.article = html
    },
    insertEditor() {
      if (!this.fileImgList.length) {
        return
      }
      const key = this.fileImgList[0].response.key
      const quillHook = this.$refs.editor.quill
      const url = `${config.imgCDN}/${key}`
      if (this.editorSelection >= 0) {
        quillHook.insertEmbed(this.editorSelection, 'image', url)
      } else {
        this.$message({
          message: '请选择插入的位置',
          type: 'error'
        })
      }
    },
    uploadImgHandler() {
      this.uploadImgShow = !this.uploadImgShow
    },
    uploadVideoHandler() {
      this.uploadVideoShow = !this.uploadVideoShow
    },
    fileChange(file) {
      this.fileImgList.push(file)
      console.log(this.fileImgList)
    },
    filePreview(key) {
      console.log(key)
    },
    fileRemove(file) {
      const index = this.fileImgList.findIndex((item) => {
        return item.uid === file.uid
      })
      this.fileImgList.splice(index, 1)
    },
    diaryCancel() {
      this.$router.back()
    },
    diarySave() {
      this.$refs.caseDiary.validate(async(valid) => {
        if (valid) {
          this.diaryData.article = util.removeURLToImage(this.diaryData.article)
          if (this.$route.params.id) {
            await api.putDiary(this.diaryData).then(res => {
              if (!res.success) {
                this.$message({
                  message: '保存失败',
                  type: 'error'
                })
              }
            })
          } else {
            this.diaryData._id = randomToken(32)
            await api.saveDiary(this.diaryData).then(res => {
              if (!res.success) {
                this.$message({
                  message: '新增失败',
                  type: 'error'
                })
              }
            })
          }
          this.$refs.caseDiary.resetFields()
          this.$router.back()
        }
      })
    },
    async _fetchDiaryById(id) {
      await api.fetchDiaryById(id).then(res => {
        res.article = util.addURLToImage(res.article)
        res.caseId = res.caseId._id
        this.diaryData = res
      })
    }
  },
  async beforeCreate() {
    if (!this.isAuthorized) {
      await api.fetchPcase({ limit: 0 }).then(res => {
        this.pcase = res.data
      })
    }
  },
  async created() {
    if (this.$route.params.id) {
      await this._fetchDiaryById(this.$route.params.id)
    }
  },
  components: {
    quillEditor,
    Upload
  }
}
</script>
<style lang="scss">
.diary-container {
    margin-top: 50px;
    .editor-content-item {
        height: 520px;
        .vue-editor {
            line-height: 1!important;
            height: 450px;
            img {
                max-width: 300px!important;
            }
        }
    }
    .el-form-item {
        margin-bottom: 22px !important;
    }
    .upload-wrapper {
        padding: 8px;
        border: 1px solid #ccc;
        box-sizing: border-box;
    }
}
</style>
