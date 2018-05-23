<template>
  <div class="login">
      <div>
          <p>用户名</p>  
        <el-input v-model="username" placeholder="请输入用户名"></el-input>
      </div>
      <div>
          <p>密码</p>
        <el-input v-model="pwd" placeholder="请输入密码"></el-input>
      </div>
      <span v-if="state" class="tips" @click="goregist">没有账号请注册</span>
      <span v-else class="tips" @click="gologin">已有账号请登录</span>
      <div class="btn">
          <el-button v-if="state" type="primary" @click="login">登录</el-button>
          <el-button v-else type="primary" @click="regist">注册</el-button>
          <el-button  @click="reset">重置</el-button>
      </div>
  </div>
</template>

<script>
import axios from "axios";
import md5 from "js-md5";
export default {
  name: "login",
  data() {
    return {
      state: true, //true为有账号 false为无账号
      username: "",
      pwd: ""
    };
  },
  created() {},
  methods: {
    login() {
      let param = {
        username: this.username,
        pwd: md5(this.pwd),
        withCredentials: true
      };
      axios.post("/api/login", { param }).then(res => {
        let data = res.data;
        if (data.code == 1) {
          this.$alert("您没有账号,请先注册一个", "警告", {
            confirmButtonText: "确定",
            callback: action => {
              this.state = false;
            }
          });
        } else {
          this.$message({
            message: "登录成功",
            type: "success"
          });
          window.localStorage.setItem("info", JSON.stringify(res.data));
          this.$router.push({ path: "game" });
        }
      });
    },
    gologin() {
      this.state = true;
    },
    goregist() {
      this.state = false;
    },
    regist() {
      let param = {
        username: this.username,
        pwd: md5(this.pwd),
        withCredentials: true
      };
      axios.post("/api/regist", { param }).then(res => {
        let data = res.data;
        if (data.code == 1) {
          this.$alert("您的账号已存在", "警告", {
            confirmButtonText: "确定",
            callback: action => {
              this.state = true;
              this.reset();
            }
          });
        } else {
          this.$message({
            message: "注册成功,可以登录啦",
            type: "success"
          });
          this.state = true;
        }
      });
    },
    reset() {
      (this.username = ""), (this.pwd = "");
    }
  }
};
</script>

<style lang='less'>
div {
  overflow: hidden;
  margin-bottom: 10px;
}
.btn {
  margin-top: 10px;
  text-align: center;
}
.el-button {
  text-align: center;
  height: 40px;
}
p {
  display: inline-block;
  line-height: 40px;
  display: inline-block;
  float: left;
  margin-right: 16px;
}
.tips {
  color: green;
  cursor: pointer;
  margin-top: 20px;
  margin-bottom: 10px;
}
.el-input {
  width: 200px;
  float: right;
  // text-align: right;
}
.login {
  height: 300px;
  display: inline-block;
  position: absolute;
  left: 50%;
  top: 50%;
  text-align: center;
  transform: translate(-50%, -50%);
}
</style>