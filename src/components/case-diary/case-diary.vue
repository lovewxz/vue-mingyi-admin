<template>
<div class="case-diary">
  <filter-bar @filter="filter" @add="handleAdd"></filter-bar>
  <el-table :data="tableData" border @selection-change="selsChange">
    <el-table-column type="selection" width="55"></el-table-column>
    <el-table-column prop="title" label="日期" width="120"></el-table-column>
    <el-table-column prop="text" label="文章">
      <template scope="scope">
          {{_subText(scope.row.text)}}
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
  <el-dialog :visible.sync="diaryShow" class="case-dialog" title="日记详情" :close-on-click-modal="false">
    <el-form :model="diaryData">
      <el-form-item label="日期" prop="title">
        <el-col :span="10">
          <el-input v-model="diaryData.title"></el-input>
        </el-col>
      </el-form-item>
      <el-form-item class="editor-content-item" label="文章详情">
        <el-col :span="24">
          <quill-editor v-model="addURLToImage" class="vue-editor" ref="editor" :options="editorOption" @blur="onEditorBlur($event)" @focus="onEditorFocus($event)" @ready="onEditorReady($event)">
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
      formData: [],
      sels: [],
      total: 0,
      pageSize: 5,
      diaryData: {},
      diaryShow: false,
      editorOption: {
        modules: {
          toolbar: '#toolbar'
        }
      },
      uploadShow: false,
      fileList: [],
      editorSelection: null
    }
  },
  computed: {
    addURLToImage() {
      if (this.diaryData && this.diaryData.article) {
        let res = this.diaryData.article
        res = res.replace(/src=(\"|\')/g, `src="${config.imgCDN}/`)
        return res
      }
    }
  },
  methods: {
    selsChange(sels) {
      this.sels = sels
    },
    filter(keyword) {
      keyword = new RegExp(keyword, 'i')
      this.formData = this.formData.filter(item => {
        return item.text.match(keyword)
      })
    },
    handleAdd(index, value) {

    },
    handleEdit(index, value) {
      this.diaryShow = true
      this.diaryData = value
      this.uploadShow = false
    },
    batchDel() {

    },
    onEditorBlur(editor) {
      console.log('editor blur!', editor)
    },
    onEditorFocus(editor) {
      this.editorSelection = editor.getSelection().index
      console.log(this.editorSelection)
    },
    onEditorReady(editor) {
      console.log('editor ready!', editor)
    },
    insertEditor(file) {
      const index = this.fileList.findIndex(item => item.uid === file.uid)
      const quillHook = this.$refs.editor.quill
      if (this.editorSelection) {
        console.log(1)
        quillHook.insertEmbed(this.editorSelection, 'image', file.url)
        this.fileList.splice(index, 1)
      }
    },
    uploadHandler() {
      this.uploadShow = !this.uploadShow
    },
    _subText(str) {
      str = `${util.removeHTMLTag(str).substring(0,50)}...`
      return str
    }
  },
  watch: {
    tableData(newVal) {
      this.formData = newVal
    },
    formData(newVal) {
      this.$emit('form-change', newVal)
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
