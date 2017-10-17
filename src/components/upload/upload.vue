<template>
  <el-upload list-type="picture-card" :on-success="handleSuccess" :on-remove="handleRemove" :before-upload="beforeUpload" action="//up-z2.qiniu.com/" :data="imgData" :file-list="fileList" class="upload">
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
      default: ''
    },
    fileList: {
      type: Array,
      default: []
    }
  },
  data() {
    return {
      // pic
      imgData: {},
      supportWebp: false
    }
  },
  methods: {
    handleSuccess(response, file) {
      let key = response.key
      let name = file.name
      let prefix = this.supportWebp ? 'webp/' : ''
      this.fileList.push({
        name: file.name,
        url: `${config.imgCDN}/${prefix}${encodeURI(key)}`
      })
    },
    handleRemove(file, filelist) {
      const index = this.fileList.findIndex(item => {
        return item.uid === file.uid
      })
      this.fileList.splice(index, 1)
    },
    beforeUpload() {
      let key = randomToken(32)
      const params = { key }
      return api.fetchQiniuToken(params).then(res => {
        const response = res.data.data
        this.supportWebp = response.supportWebp
        this.imgData = {
          key,
          token: response.upToken
        }
      }).catch(e => {
        if (e.status === 401) {
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
