<template>
  <div class="ar-container" id="app">
    <div class="ar-main">
      <div class="rtcp-bg">

      </div>
      <div class="rtcp-form">
        <div class="rtcp-form_title">anyRTC实时直播效果演示</div>
        <!-- <div class="rtcp-form_option">
          <span :class="{'on': isOpenRtcp === 0}"  @click="isOpenRtcp = 0">开启直播</span>
          <span :class="{'on': isOpenRtcp === 1}" @click="isOpenRtcp = 1">观看直播</span>
        </div> -->
        <button type="button" class="rtcp-form_submit green" @click="joinRtcp(0)">开启直播</button>
        <button type="button" class="rtcp-form_submit wirte" @click="joinRtcp(1)">观看直播</button>
      </div>
      <div class="rtcp-footer">
        <div class="rtcp-footer_item">v3.0.0</div>
        <div class="rtcp-footer_item">技术支持：<a href="">zhangjianqiang@dync.cc</a></div>
        <div class="rtcp-footer_item">anyRTC官网：<a href="https://www.anyrtc.io" target="_blank">www.anyrtc.io</a></div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'ArRtcp',
    data() {
      return {
        rtcpId: '',
        // isOpenRtcp: 0
      }
    },
    watch: {
      rtcpId(val, oVal) {
        if (val) {
          let reg = /^[a-z0-9]+$/i;
          if (reg.test(val)) {

          } else {
            this.rtcpId = oVal;
          }
        }
      }
    },
    methods: {
      joinRtcp(val) {
        if(val === 0){
          this.$router.push({ path: `/rtcp/0` })
        }else if(val === 1){
          this.$router.push({ path: `/rtcp/1` })
        }
      }
    },
  };
</script>

<style lang="scss">
html, body {
  margin: 0;
  width: 100%;
  height: 100%;
}

h1,h2,h3,h4,h5,h6,p {
  margin: 0;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100%;
}

.ar-container {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: row;
  flex: 1 0 auto;
  box-sizing: border-box;
  flex-basis: auto;
  min-width: 0;

  &.is-vertical { flex-direction: column }
}

.ar-main {
  display: block;
  flex: 1;
}

.ar-aside,
.ar-main {
  overflow: auto;
}

.ar-main,
.ar-aside,
.ar-header,
.ar-footer {  
  flex-shrink: 0;
  box-sizing: border-box;
}
  .rtcp-bg {
    z-index: -1;
    width: 100%;
    height: 100%;
    object-fit: cover;
    background-image: url('../assets/img/bg.jpg');
  }

  .rtcp-form {
    position: fixed;
    padding: 0 80px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width:520px;
    height:360px;
    background:rgba(255,255,255,1);
    box-shadow:0px 8px 21px 0px rgba(102,138,255,0.18);
    border-radius:10px;
    box-sizing: border-box;
    z-index: 1;

    .rtcp-form_title {
      margin-top: 70px;
      margin-bottom: 60px;
      font-size:24px;
      font-family:PingFang-SC-Bold;
      font-weight:bold;
      color:#555;
      line-height:24px;
      text-align: center;
    }
    .rtcp-form_option{
      width: 100%;
      height: 50px;
      span{
        display: inline-block;
        width: 50%;
        height: 50px;
        line-height: 50px;
        text-align: center;
        box-sizing: border-box;
        border-bottom: 1px solid #ddd;
        &.on{
          color: #33B15D;
          border-top: 1px solid #ddd;
          border-bottom: none;
        }
        &:nth-child(1){
          border-right: 1px solid #ddd;
        }
      }
    }
    .rtcp-form_iput {
      display: block;
      padding: 0 20px;
      width: 100%;
      height: 50px;
      background:rgba(255,255,255,0.3);
      border:1px solid rgba(221,221,221,1);
      border-radius:4px;
      font-size: 14px;
      outline: none;
      box-sizing: border-box;
      margin-top: 40px;
    }

    .rtcp-form_submit {
      margin-top: 20px;
      display: block;
      width: 100%;
      height:50px;
      background:#fff;
      border: 1px solid rgba(51,177,93,1);
      border-radius:4px;
      outline: none;
      color: rgba(51,177,93,1);
      cursor: pointer;
      &.green{
        color: #fff;
        background:rgba(51,177,93,1);
        border: 1px solid rgba(51,177,93,1);
      }
    }
  }

  .rtcp-footer {
    position: fixed;
    width: 100%;
    bottom: 0;
    text-align: center;
    
    .rtcp-footer_item {
      margin-bottom: 5px;
      font-size: 12px;
      color: #777;
    }

  }
  
</style>