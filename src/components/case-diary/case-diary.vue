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
  <el-dialog :visible="diaryShow">
    <el-form :model="diaryData">
      <el-form-item label="日期" prop="title">
        <el-input v-model="diaryData.title"></el-input>
      </el-form-item>
      <quill-editor v-model="diaryData.article" :options="editorOption" class="quill-editor">
        <div id="toolbar" slot="toolbar">
            <!-- Add a bold button -->
            <button class="ql-bold">Bold</button>
            <button class="ql-italic">Italic</button>
            <!-- Add font size dropdown -->
            <select class="ql-size">
              <option value="small"></option>
              <!-- Note a missing, thus falsy value, is used to reset to default -->
              <option selected></option>
              <option value="large"></option>
              <option value="huge"></option>
            </select>
            <!-- Add subscript and superscript buttons -->
            <button class="ql-script" value="sub"></button>
            <button class="ql-script" value="super"></button>
            <button @click="customButtonClick" class="ql-image">custom button</button>
        </div>
      </quill-editor>
    </el-form>
  </el-dialog>
</div>
</template>
<script>
import { quillEditor } from 'vue-quill-editor'
import util from 'js/util'
import FilterBar from 'components/filter-bar/filter-bar'

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
    },
    batchDel() {

    },
    _subText(str) {
      str = `${util.removeHTMLTag(str).substring(0,30)}...`
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
    quillEditor
  }
}
</script>
<style lang="scss">
.case-diary {
  .quill-editor {
    line-height: 1!important;
  }
}
</style>
