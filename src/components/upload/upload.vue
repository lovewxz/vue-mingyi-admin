<template>
  <el-upload list-type="picture-card" :on-success="handleSuccess" :on-remove="handleRemove" :before-upload="beforeUpload" action="//up-z2.qiniu.com/" :data="imgData" :file-list="fileList">
    <i class="el-icon-plus"></i>
  </el-upload>
</template>
<script>
import axios from 'axios'
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
    handleSuccess(response,file) {
      let key = response.key
      let name = file.name
      let prefix = this.supportWebp ? 'webp/' : ''
      this.fileList.push({
        name: file.name,
        url: `${config.imgCDN}/${prefix}${encodeURI(key)}`
      })
    },
    handleRemove(file,filelist) {
      const index = this.fileList.findIndex(item => {
        return item.uid === file.uid
      })
      this.fileList.splice(index, 1)
    },
    beforeUpload() {
      let key = randomToken(32)
      return axios.get('/qiniu/uptoken', { params: { key } }).then(res => {
        const response = res.data.data
        this.supportWebp = response.supportWebp
        this.imgData = {
          key,
          token: response.upToken
        }
      })
    }
  }
}
</script>
<style lang="scss">
</style>
