<template>
  <login @loginSuccess="loginSuccess"></login>
</template>

<script>
import Login from 'components/login/login'
export default {
  methods: {
    loginSuccess() {
      //如果用户手动输入"/"那么会跳转到这里来，即this.$route.query.redirect有参数
      let redirectUrl = decodeURIComponent(this.$route.query.redirect || '/projects')
      this.$router.replace({
        path: redirectUrl
      })
    }
  },
  components: {
    Login
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
