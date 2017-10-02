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
import { mapActions,mapGetters } from 'vuex'
import { USER_KEY } from '../common/js/cache'
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
      this.$refs.loginForm.validate(async (valid) => {
        if (valid) {
          this.logining = true
          var loginParams = { email: this.loginForm.account, password: this.loginForm.checkPass }
          await this.userLogin(loginParams)
          const info = this.loginInfo
          console.log(this.loginInfo)
          if (info.success) {
            storage.set(USER_KEY, this.user)
            this.$router.replace({
              path: '/projects'
            })
          } else {
            this.$message({
              message: info.err,
              type: 'error'
            })
            this.logining = false
          }
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
    /*box-shadow: 0 0px 8px 0 rgba(0, 0, 0, 0.06), 0 1px 0px 0 rgba(0, 0, 0, 0.02);*/
    -webkit-border-radius: 5px;
    border-radius: 5px;
    -moz-border-radius: 5px;
    background-clip: padding-box;
    margin: 180px auto;
    width: 350px;
    padding: 35px 35px 15px;
    background: #fff;
    border: 1px solid #eaeaea;
    box-shadow: 0 0 25px #cac6c6;
    .title {
        margin: 0 auto 40px;
        text-align: center;
        color: #505458;
    }
    .remember {
        margin: 0 0 35px;
    }
}
</style>
