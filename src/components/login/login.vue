<template>
<el-form :model="loginForm" :rules="rules2" ref="loginForm" label-position="left" label-width="0px" class="demo-ruleForm login-container">
  <h3 class="title">系统登录</h3>
  <el-form-item prop="account">
    <el-input type="text" v-model="loginForm.account" auto-complete="off" placeholder="账号"></el-input>
  </el-form-item>
  <el-form-item prop="checkPass">
    <el-input type="password" v-model="loginForm.checkPass" auto-complete="off" placeholder="密码"></el-input>
  </el-form-item>
  <el-form-item style="width:100%;">
    <el-button type="primary" style="width:100%;" @click.native.prevent="handleLogin" :loading="logining">登录</el-button>
  </el-form-item>
</el-form>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { USER_KEY } from 'js/cache'
import storage from 'good-storage'

export default {
  data() {
    return {
      loginForm: {
        account: '',
        checkPass: ''
      },
      logining: false,
      rules2: {
        account: [
          { required: true, message: '请输入账号', trigger: 'blur' },
        ],
        checkPass: [
          { required: true, message: '请输入密码', trigger: 'blur' },
        ]
      }
    }
  },
  computed: {
    ...mapGetters([
      'loginInfo',
      'user'
    ])
  },
  methods: {
    handleLogin() {
      this.$refs.loginForm.validate(async(valid) => {
        if (valid) {
          this.logining = true
          var loginParams = { email: this.loginForm.account, password: this.loginForm.checkPass }
          await this.userLogin(loginParams)

          const info = this.loginInfo
          if (info.success) {
            storage.set(USER_KEY, this.user)
            this.$emit('loginSuccess')
          } else {
            this.$emit('loginError')
            this.$message({
                message: info.err,
                type: 'error'
              })
          }
          this.logining = false
          // if (info.success) {
          //   storage.set(USER_KEY, this.user)
          //   //如果用户手动输入"/"那么会跳转到这里来，即this.$route.query.redirect有参数
          //   let redirectUrl = decodeURIComponent(this.$route.query.redirect || '/projects')
          //   this.$router.replace({
          //     path: redirectUrl
          //   })
          // } else {
          //   this.$message({
          //     message: info.err,
          //     type: 'error'
          //   })
          //   this.logining = false
          // }
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    ...mapActions([
      'userLogin'
    ])
  }
}
</script>

<style lang="scss" scoped rel="stylesheet/scss">
.login-container {
    .title {
        margin: 0 auto 40px;
        text-align: center;
        color: #505458;
    }
}
</style>
