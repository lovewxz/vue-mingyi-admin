<template>
<div class="case-diary">
  <filter-bar @filter="filter" @add="handleAdd"></filter-bar>
  <el-table :data="tableData" border @selection-change="selsChange">
    <el-table-column type="selection" width="55"></el-table-column>
    <el-table-column prop="title" label="日期" width="120"></el-table-column>
    <el-table-column prop="article" label="文章">
      <template scope="scope">
          {{_subText(scope.row.article)}}
      </template>
    </el-table-column>
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
  </el-col>
  <el-dialog :visible.sync="diaryShow" class="case-dialog" title="日记详情">
    <el-form :model="diaryData" ref="diary" :rules="formRules">
      <el-form-item label="日期" prop="title">
        <el-col :span="10">
          <el-input v-model="diaryData.title"></el-input>
        </el-col>
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
              <!-- Add subscript and superscript buttons -->
              <button class="ql-script" value="sub"></button>
              <button class="ql-script" value="super"></button>
              <el-button @click="uploadHandler" class="el-icon-picture"></el-button>
            </div>
          </quill-editor>
        </el-col>
      </el-form-item>
      <el-form-item class="upload-wrapper" v-if="uploadShow">
        <upload :file-list="fileList" @insert="insertEditor"></upload>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click.native="diaryHide">取消</el-button>
      <el-button type="primary" @click.native="diarySave">提交</el-button>
    </div>
  </el-dialog>
</div>
</template>
<script>
import util from 'js/util'
import config from 'js/config'
import Upload from 'components/upload/upload'
import FilterBar from 'components/filter-bar/filter-bar'
import Quill from 'quill'
import { quillEditor } from 'vue-quill-editor'

export default {
  props: {
    tableData: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      formRules: {
        title: [
          { required: true, message: '请输入天数', trigger: 'blur' }
        ]
      },
      formData: [],
      sels: [],
      total: 0,
      pageSize: 5,
      diaryData: {},
      diaryDataIndex: 0,
      diaryShow: false,
      editorOption: {
        modules: {
          toolbar: '#toolbar'
        }
      },
      editorContent: '',
      uploadShow: false,
      fileList: [],
      editorSelection: null
    }
  },
  methods: {
    selsChange(sels) {
      this.sels = sels
    },
    filter(keyword) {
      this.$emit('filter', keyword)
    },
    handleAdd() {
      this.diaryShow = true
      this.diaryData = {}
    },
    handleEdit(index, value) {
      this.diaryShow = true
      this.diaryData = Object.assign({}, value)
      this.diaryDataIndex = index
      this.uploadShow = false
    },
    handleDel(index, value) {
      this.$emit('del', index, value)
    },
    batchDel() {
      this.$emit('batchDel', this.sels)
    },
    onEditorFocus() {
      this.editorSelection = this.$refs.editor.quill.getSelection().index
    },
    onEditorChange({ editor, html, text }) {
      this.diaryData.article = html
    },
    insertEditor(file) {
      const index = this.fileList.findIndex(item => item.uid === file.uid)
      const quillHook = this.$refs.editor.quill
      if (this.editorSelection) {
        quillHook.insertEmbed(this.editorSelection, 'image', file.url)
        this.fileList.splice(index, 1)
      } else {
        this.$message({
          message: '请选择插入的位置',
          type: 'error'
        })
      }
    },
    uploadHandler() {
      this.uploadShow = !this.uploadShow
    },
    diaryHide() {
      this.diaryShow = false
    },
    diarySave() {
      this.$refs.diary.validate((valid) => {
        if (valid) {
          if (this.diaryData._id) {
            this.$emit('save', this.diaryData, this.diaryDataIndex)
          } else {
            this.$emit('add', this.diaryData, this.diaryDataIndex)
          }
          this.diaryShow = false
        }
      })
    },
    resetFields() {
      this.$refs.diary.resetFields()
    },
    _subText(str) {
      if (!str) {
        return
      }
      str = `${util.removeHTMLTag(str).substring(0,50)}...`
      return str
    }
  },
  watch: {
    tableData(newVal) {
      this.formData = newVal
    }
  },
  components: {
    FilterBar,
    quillEditor,
    Upload
  }
}
</script>
<style lang="scss">
.case-diary {
    .case-dialog {
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
}
</style>
