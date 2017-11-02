<template>
  <el-upload list-type="picture-card"
    :on-success="handleSuccess"
    :on-remove="handleRemove"
    :before-upload="beforeUpload"
    action="//up-z2.qiniu.com/"
    :data="imgData"
    :file-list="fileList"
    :on-preview="handlePreview"
    class="upload"
    multiple>
    <i class="el-icon-plus"></i>
  </el-upload>
</template>
<script>
import api from 'js/axios'
import randomToken from 'random-token'
import config from 'js/config'

export default {
  props: {
    uploadType: {
      type: String,
      default: 'image'
    },
    fileList: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      // pic
      imgData: {},
      imgListKey: []
    }
  },
  methods: {
    handlePreview(response, file) {
      this.$emit('filePreview', response)
    },
    async handleSuccess(response, file, filelist) {
      if (file.status === 'success') {
        this.$emit('fileChange', file)
      }
    },
    handleRemove(file, filelist) {
      this.$emit('fileRemove', file)
    },
    async beforeUpload() {
      let key = randomToken(32)
      let params = { key }
      if (this.uploadType === 'image') {
        params = Object.assign({}, params, {type: 'image'})
      } else if (this.uploadType === 'video') {
        params = Object.assign({}, params, {type: 'video'})
      }
      await api.fetchQiniuToken(params).then(res => {
        const response = res.data.data
        this.imgData = {
          key,
          token: response.upToken
        }
      }).catch(e => {
        if (e.status === 402) {
          this.$message({
            message: e.data,
            type: 'error'
          })
          return
        }
      })
    }
  }
}
</script>
<style lang="scss">
.upload {}
</style>
