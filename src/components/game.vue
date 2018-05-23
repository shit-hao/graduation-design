 <template>
    <div id='app'>
        <ul id='wrap' @touchstart = 'touchStart' @touchend = 'touchEnd' >
            <li class='box'
                v-for='(num, index) in nums'
                v-text="num"
                v-getclass='num'
                v-getposition="index"
                :key='index'
                ></li>
        </ul>
        <div class="btn">
          <el-button @click='reset'>重置</el-button>
        <el-button  @click='exit' type="danger">退出</el-button>
        </div>
        
    </div>
</template>


<script>
import axios from "axios";
let Base64 = require("js-base64").Base64;
export default {
  name: "HelloWorld",
  data() {
    return {
      flag: false,
      show: 0,
      msg: "",
      pass: false,
      el: "",
      start: {}, // 记录移动端触摸起始点
      nums: [] // 记录16个框格的数字
    };
  },
  watch: {
    nums(newVal, oldVal) {
      console.log("watch");
      console.log(newVal);
      window.localStorage.setItem("save1", newVal);
    }
  },
  created() {
    socket.on("message", value => {
      console.log(value);
    });
    console.log(document.cookie);
    if (document.cookie) {
      console.log("has");
      let username = Base64.decode(document.cookie.split("=")[1]);
      let param = {
        username: username
      };
      axios.post("/api/check", { param }).then(res => {
        let data = res.data;
        console.log(data);
        if (data.preRecord.length == 0) {
          this.reset();
        } else {
          var array = data.preRecord
            .replace(/\"/g, "")
            .replace("[", "")
            .replace("]", "")
            .split(",");
          this.nums = array;
        }
        this.flag = true;
      });
    } else {
      console.log("none");
      this.$alert("非法进入", "警告", {
        confirmButtonText: "确定",
        callback: () => {
          this.flag = true;
          console.log("hhhh");
          this.$router.push({ path: "/" });
        }
      });
    }
  },
  mounted() {
    let preRecord = JSON.parse(window.localStorage.getItem("info"));
    preRecord = preRecord.preRecord;
    if (preRecord && this.flag) {
      this.$confirm("您有上一次游戏记录的备份, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          var array = preRecord
            .replace(/\"/g, "")
            .replace("[", "")
            .replace("]", "")
            .split(",");
          console.log(array);
          this.nums = array;
          window.localStorage.setItem("save1", JSON.stringify(array));
        })
        .catch(() => {
          window.localStorage.getItem("save1")
            ? (this.nums = JSON.parse(window.localStorage.getItem("save1")))
            : this.reset();
        });
    }
    document.addEventListener("keyup", this.keyDown);
    document.addEventListener("touchmove", e => {
      e.target.classList.contains("box") && e.preventDefault();
    });
  },
  // 自定义指令
  directives: {
    getclass: {
      inserted: (el, value) => {
        let classes = el.classList;
        [].forEach.call(el.classList, _ => {
          /^s\w+$/.test(_) && classes.remove(_);
        });
        el.classList.remove("empty");
        value.value
          ? el.classList.add("s" + value.value)
          : classes.add("empty");
      },
      update: (el, value) => {
        let classes = el.classList;
        [].forEach.call(el.classList, _ => {
          /^s\w+$/.test(_) && classes.remove(_);
        });
        el.classList.remove("empty");
        value.value
          ? el.classList.add("s" + value.value)
          : classes.add("empty");
      }
    },
    getposition: {
      //在dom插入父节点的时候初始化方格的位置
      inserted: (el, index) => {
        let pos = this.a.methods.getIndexPos(index.value, true);
        el.style.left = pos.left;
        el.style.top = pos.top;
      }
    }
  },
  methods: {
    //删除cookie中所有定变量函数
    clearAllCookie() {
      var keys = document.cookie.match(/[^ =;]+(?=\=)/g);
      if (keys) {
        for (var i = keys.length; i--; )
          document.cookie = keys[i] + "=0;expires=" + new Date(0).toUTCString();
      }
    },

    exit() {
      this.$alert("您是否要退出", "警告", {
        confirmButtonText: "确定",
        callback: action => {
          let param = {
            username: JSON.parse(window.localStorage.getItem("info")).username,
            preRecord: window.localStorage.save1
          };
          console.log(param);
          axios.post("/api/savePreRecord", { param }).then(res => {
            if (res.data.code == 0) {
              window.localStorage.clear();
              this.clearAllCookie();
              this.$router.push({ path: "/" });
            }
          });
        }
      });
    },
    /* 获取指定索引位置的css:top，left百分比值 */
    getIndexPos(index, percent) {
      let p = percent ? "%" : "";
      return {
        left: (index % 4) * 25 + p,
        top: Math.floor(index / 4) * 25 + p
      };
    },
    /* 在一个随机的空白位添加2或4 概率9:1 */
    randomAdd() {
      let arr = this.shuffle(this.blankIndex()); //获得打乱后的空白方格的数组
      let pos = this.getIndexPos(arr.pop()); //获取打乱后的空白方格的数组最后一个的位置
      // 延时100毫秒添加
      setTimeout(() => {
        this.$set(this.nums, arr.pop(), Math.random() > 0.9 ? 4 : 2);
        // this.nums.$set(arr.pop(), Math.random() > 0.9 ? 4 : 2);
      }, 100);
    },
    /* 添加一个新的方块，并指定索引和里面的内容 */
    newBoxApear(index, num, combin) {
      let cls = num ? "s" + num : "empty";
      let cb = combin ? " combin" : "";
      let box = document.createElement("div");
      let pos = this.getIndexPos(index, true);
      box.className = cls + " box" + cb;
      box.style.left = pos.left;
      box.style.top = pos.top;
      box.innerText = num || "";
      document.getElementById("wrap").appendChild(box);
      return box;
    },
    /* 获取当前空白隔索引组成的数组 */
    blankIndex() {
      let arr = [];
      this.nums.forEach((num, index) => {
        num === "" && arr.push(index);
      });
      return arr;
    },
    /**
     *打乱空白符组成的数组？有何意义
     */
    shuffle(arr) {
      let len = arr.length;
      let j;
      while (len--) {
        j = parseInt(Math.random() * len);
        [arr[len], arr[j]] = [arr[j], arr[len]]; //??？黑人问号
      }
      return arr;
    },
    /* 把数组arr当成矩阵，转置keycode次 */
    /*
        [1,2,   1次转置变为     [3,1,
        3,4]                   4,2]
    */
    T(arr, keycode) {
      // console.log('T----------')
      // console.log(arr)
      keycode = keycode % 4;
      if (keycode === 0) return arr;
      let len = arr.length; //写死的是17
      let d = Math.sqrt(len);
      // console.log(len)
      let tmp = [];
      for (let i = 0; i < d; i += 1) {
        for (let j = 0; j < d; j += 1) tmp[d - i - 1 + j * d] = arr[i * d + j];
      }
      if (keycode > 1) tmp = this.T(tmp, keycode - 1);
      return tmp;
    },
    touchStart(e) {
      this.start["x"] = e.changedTouches[0].pageX;
      this.start["y"] = e.changedTouches[0].pageY;
    },
    touchEnd(e) {
      let curPoint = e.changedTouches[0];
      let x = curPoint.pageX - this.start.x;
      let y = curPoint.pageY - this.start.y;
      let xx = Math.abs(x);
      let yy = Math.abs(y);
      let i = 0;
      // 移动范围太小 不处理
      if (xx < 50 && yy < 50) return;
      if (xx >= yy) {
        // 横向滑动
        i = x < 0 ? 0 : 2;
      } else {
        // 纵向滑动
        i = y < 0 ? 3 : 1;
      }
      this.handle(i);
    },
    /*
        *方向键 事件处理
        *把上、右、下方向通过旋转 变成左向操作
        */
    keyDown(e) {
      socket.emit("send", "hahhahha");
      // console.log('send')
      // 左上右下 分别转置0 3 2 1 次
      const map = {
        37: 0, // LEFT
        38: 3, // UP
        39: 2, // RIGHT
        40: 1, // DOWN
        87: 3, // W
        68: 2, // D
        83: 1, // S
        65: 0 // A
      };
      if (!(e.keyCode in map)) return;
      this.handle(map[e.keyCode]);
    },
    handle(keycode) {
      this.move(keycode);

      this.isPass(); // 判断是否过关
      setTimeout(this.save(), 1 * 1000);
    },
    /* 移动滑块 i:转置次数 */
    /**
     * @author Luxroid
     * @argument {int} 传进来的keycode
     * @description 键盘移动逻辑
     */
    move(keycode) {
      //真的牛皮 Object.keys(String(Array(17)))
      let indexs = this.T(Object.keys(String(Array(17))), keycode); // 记录旋转前的各个位置索引
      // console.log('move----------')
      // console.log(indexs)
      let tmp = this.T(this.nums, keycode); // 把任意方向键转置，当成向左移动
      let hasMove = false; // 一次操作有移动方块时才添加方块
      /*
        *记录已经合并过一次的位置 避免重复合并
        *如 2 2 4 4 在一次合并后应为 4 8 0 0  而非8 4 0 0
        */
      let hasCombin = {};
      tmp.forEach((j, k) => {
        let newIndex = 0; // 方块挪动后的索引 （转换后的索引）
        let index = indexs[k] - 0; // 换算到转换前的索引
        let thisMoved = false; // 此方块有数字，且被移动了 标记  需要应用动画
        let combinNum = 0; // 方块若有合并，记录合并后的数字
        while (k % 4 && j !== "") {
          //遍历数组符合条件的进行移动
          if (tmp[k - 1] === "") {
            // 当前位置的前一位置为空,交换俩位置
            tmp[k - 1] = j;
            tmp[k] = "";
            hasMove = true;
            thisMoved = true;
            if (hasCombin[k]) {
              // 该位置有过合并，挪动后要记录到挪动后的位置
              hasCombin[k - 1] = true;
              hasCombin[k] = false;
            }
            newIndex = k - 1;
          } else if (tmp[k - 1] === j && !hasCombin[k] && !hasCombin[k - 1]) {
            // 当前位置与前一位置数字相同，合并到前一位置，然后清空当前位置
            j *= 2;
            tmp[k - 1] = j;
            tmp[k] = "";
            hasMove = true;
            thisMoved = true;
            combinNum = j;
            hasCombin[k - 1] = true; // 记录合并位置
            newIndex = k - 1;
          } else {
            break;
          }
          k--;
        }
        thisMoved && this.moveNode(index, indexs[newIndex], combinNum);
      });
      setTimeout(_ => {
        this.nums = this.T(tmp, 4 - keycode); // 转置回去，把数据还给this.nums
        hasMove && this.randomAdd();
      }, 101);
    },
    // 索引index的元素移动到nextIndex
    moveNode(index, nextIndex, combinNum) {
      let allBox = document.querySelectorAll(".box");
      let curEle = allBox[index]; // 将被移动的元素

      let clone = curEle.cloneNode(true); // 当前元素克隆 包括里面的数组 用作移动动画
      let pEle = curEle.parentNode;
      let curPos = this.getIndexPos(index, true);
      let box = allBox[allBox.length - 1].cloneNode(); // 复制最后一个元素做当前元素的遮罩
      box.className = "box empty";
      box.style.left = curPos.left;
      box.style.top = curPos.top;
      pEle.insertAdjacentElement("beforeEnd", box);
      curEle.style.opacity = 0;
      let nextEle = null;
      if (combinNum) {
        nextEle = this.newBoxApear(nextIndex, combinNum, true);
      }
      let nextPos = this.getIndexPos(nextIndex);
      clone.style.left === nextPos.left + "%"
        ? clone.classList.add("y" + nextPos.top)
        : clone.classList.add("x" + nextPos.left);
      pEle.insertAdjacentElement("beforeEnd", clone);
      // 移动动画结束
      clone.addEventListener("animationend", _ => {
        clone.remove();
        nextEle && nextEle.remove();
        box.remove();
        curEle.style.opacity = 1;
      });
      console.log("move");
    },
    save() {
      console.log("save");
      console.log(this.nums);
      window.localStorage.setItem("save1", JSON.stringify(this.nums));
    },
    // 重置游戏
    reset() {
      //fix 后续可以支持自定义难度
      this.nums = new Array(16).join(",").split(",");
      let i = 0;
      while (i++ < 2) {
        // 随机添加2个
        this.randomAdd();
      }
      this.show = 0;
    },
    isPass() {
      let isOver = true;
      let hasBlank = false;
      let tmp = this.T(this.nums, 1);
      this.nums.forEach((i, j) => {
        if (
          !i ||
          this.nums[j - 4] == i ||
          this.nums[j + 4] == i ||
          tmp[j - 4] == tmp[j] ||
          tmp[j + 4] == tmp[j]
        ) {
          isOver = false;
        }
        if (i == 2048 && !this.pass) {
          this.msg = "2048";
          this.show = 1;
          // 确保只提示一次 达到2048仍可以继续玩
          this.pass = true;
        }
      });
      if (isOver) {
        this.msg = "Game Over";
        this.show = 1;
      }
    }
  }
};
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style scoped>
@import url("../style/main.css");
.btn {
  margin-top: 20px;
  text-align: center;
}
</style>
