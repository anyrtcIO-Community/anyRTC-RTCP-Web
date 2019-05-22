<template>
  <div class="ar-container">
    <div class="ar-rtcp_side ar-aside">
      <div class="ar-container ar-ara-ar is-vertical">
        <div class="ar-rtcp_info">
          <div class="flex info_item isHoster1" v-if="isHoster == 0">
            <span class="inof_item_label">直播ID:</span>
            <input type="text" v-model="rtcpId" id="rtcpId">
            <a @click="copyID('rtcpId')">复制</a>
          </div>
          <div class="flex info_item isHoster2" v-else>
            <input type="text" v-model="rtcpId" id="rtcpId" placeholder="请输入直播ID">
            <button @click="getSubscribe()">订阅</button>
          </div>
          <div class="flex info_item" v-if="isHoster == 0">
            <span class="inof_item_label">视频源:</span>
            <select class="ar-device_select" v-model="cameraDeviceId" @change="handleCameraChange">
              <option v-for="(camera, idx) in cameraList" :key="idx" :value="camera.value">{{camera.label}}</option>
            </select>
          </div>
          <div class="flex info_item" v-if="isHoster == 0">
            <span class="inof_item_label">音频源:</span>
            <select class="ar-device_select" v-model="micphoneDeviceId" @change="handleMicponeChange">
              <option v-for="(micphone, idx) in micphoneList" :key="idx" :value="micphone.value">{{micphone.label}}</option>
            </select>
          </div>
          <div class="video info_item" v-if="isHoster == 0">
            <div class="my_video" ref="myVideoView"></div>
            <span style="cursor: pointer;" @click="isLocalSrc = !isLocalSrc">{{isLocalSrc ? '隐藏': '显示'}}二维码</span>
            <div class="my_video" style="height:134px; background: #fff; border: 1px solid #ddd;" v-show="isLocalSrc">
              <img :src="localSrc" />
            </div>
          </div>
          <!-- <div class="video info_item" v-if="screenSharing && isHoster == 0">
            <div class="my_video" ref="myScreenView"></div>
            <span>辅流窗口</span>
          </div> -->
        </div>
        <div class="ar-rtcp_log_title">日志</div>
        <div class="ar-rtcp_box_background"></div>
        <div class="ar-main ar-log_view" ref="logView">
          <div class="ar-rtcp_log" ref="logList">
            <div :class="['ar-rtcp_log_item', {'error': log.type === 'error'}]" v-for="(log, n) in logs" :key="n">{{log.content}}</div>
          </div>
        </div>
        <div class="ar-rtcp_box_background"></div>
      </div>
    </div>
    <!--  -->
    <div class="ar-main ar-rtcp_view">
      <div class="ar-container is-vertical">
        <!--  -->
        <div class="ar-rtcp_control">
          <div class="ar-rtcp_control_left">
            <button class="boxShow" v-if="!screenSharing && isHoster == 0" @click="subScribe">发布屏幕辅流</button>
            <button class="boxShow" v-else-if="screenSharing && isHoster == 0" @click="unSubScribe">取消屏幕辅流</button>
          </div>
          <div class="ar-rtcp_control_right">
            <!-- <input type="text" v-model="broadCastId">
            <button type="primary" @click="setBroadCast">setBroadCast</button>
            <button type="primary" @click="endBroadCast">endBroadCast</button>
            <button type="primary" @click="setTalkOnly">setTalkOnly</button>
            <button type="primary" @click="endTalkOnly">endTalkOnly</button> -->
            <button v-if="isHoster == 0" type="primary" hollow @click="switchVideo" :class="videoEnable ? 'on': 'off'">视频 ： {{ videoEnable ? '开' : '关' }}</button>
            <button v-if="isHoster == 0" type="error" hollow @click="switchAudio" :class="audioEnable ? 'on': 'off'">音频 ： {{ audioEnable ? '开' : '关' }}</button>
            <button type="error" @click="leaveRtcp" class="signOut">退出</button>
          </div>
        </div>
        <!--  -->
        <h3 v-show="screenSharing">{{isHoster == 1? '远程视频窗口' : '辅流视频窗口'}}</h3>
        <!--  -->
        <div class="ar-main">
          <div class="ar-video_view" ref="videoView">
            <div class="ar-video_wrap" ref="videoWrap">
              <div class="ar-video_box" v-for="(video, n) in videoList" :key="n" :id="video.id" :style="{'width': video.width, 'height': video.height}">
                <span class="full-screen" @click="setFullScreen(n)">{{video.isFull ? '退出全屏' : '点击全屏'}}</span>
                <span class="un-subscribe" @click="getUnSubscribe(video.pubId, n)">取消订阅</span>
                <span class="ar-pubId">视频ID：<input type="text" v-model="video.pubId" :id="video.pubId"><a @click="copyID(video.pubId)">复制</a></span>
                <span class="AR-code" @click="showCode(n)">{{!video.isShowCode ? '打开APP扫码' : '关闭' + 'APP扫码'}}</span>
                <div class="code" v-show="video.isShowCode">
                  <img :src="video.src">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import RtcpMixin from '@/mixins/RtcpMixin';
import QRCode from 'qrcode';

import ArRTCP from 'ar-rtcp';
import getScreenStream from 'ar-share-screen';

import config from '@/config';

export default {
  data() {
    return {
      startIndex: 0,
      endIndex: 0,
      Rtcp: null,
      broadCastId: '',
      isHoster: 0,
      logs: [],             //日志队列
      cameraList: [],       //视频驶入设备列表
      micphoneList: [],     //音频输入设备列表
      cameraDeviceId: '',
      micphoneDeviceId: '',
      videoEnable: true,
      audioEnable: true,
      videoList: [],
      rtcpId: '',
      screenSharing: false,
      $index: '',
      userid: '12345678',
      localSrc: '',
      isLocalSrc: false,
    }
  },
  mixins: [RtcpMixin],
  mounted() {
    let that = this;
    this.isHoster = this.$route.params.isHoster;

    this.initRTCP();

    //监听不同浏览器的全屏事件，并件执行相应的代码
    document.addEventListener("webkitfullscreenchange", function (e) {//
      if (document.webkitIsFullScreen) {
        that.videoList[that.$index].isFull = true;
      } else {
        if(that.videoList[that.$index]){
          that.videoList[that.$index].isFull = false;
        }
      }
    }, false);
    document.addEventListener("fullscreenchange", function (e) {
      if (document.fullscreen) {
        that.videoList[that.$index].isFull = true;
      } else {
        if(that.videoList[that.$index]){
          that.videoList[that.$index].isFull = false;
        }
      }
    }, false);
    document.addEventListener("mozfullscreenchange", function (e) {
      if (document.mozFullScreen) {
        that.videoList[that.$index].isFull = true;
      } else {
        if(that.videoList[that.$index]){
          that.videoList[that.$index].isFull = false;
        }
      }
    }, false);
    document.addEventListener("msfullscreenchange", function (e) {
      if (document.msFullscreenElement) {
        that.videoList[that.$index].isFull = true;
      } else {
        if(that.videoList[that.$index]){
          that.videoList[that.$index].isFull = false;
        }
      }
    }, false);
  },

  methods: {
    initRTCP(){
      let that = this;
      let Rtcp = new ArRTCP({
        userId: 'user_123',
        videoProfile: '',
        logLevel: 'info'
      });
      that.Rtcp = Rtcp;

      Rtcp.configServer(config.RTC_SERVER_URL);

      that.addLog('info', '方法：initEngine，初始化');
      Rtcp.initAppInfo(config.APP_ID, config.APP_TOKEN);
      //发布媒体流成功
      Rtcp.on("stream-published", (pubId) => {
        console.log('stream-published', pubId);
        that.addLog('info', '回调：stream-published，发布媒体流成功');
        QRCode.toDataURL(pubId, function (err, url) {
          that.localSrc = url;
        });
        that.pubId = that.rtcpId = pubId;
      });
      //发布媒体辅流成功
      Rtcp.on("exstream-published", (pubId) => {
        console.log('exstream-published', pubId);
        that.addLog('info', '回调：exstream-published，发布媒体辅流成功');
        //订阅发布的辅流
        // that.pubExId = pubId;
        that.Rtcp.subscribe(pubId);
      });
      //停止共享
      Rtcp.on("exstream-stoped", () => {
        console.log('exstream-stoped');
        document.getElementById('myScreen').remove();
      });
      //发布媒体流失败
      Rtcp.on("stream-publish-failed", () => {
        console.log('stream-publish-failed');
      });
      //远程视频流打开
      Rtcp.on("stream-subscribed", (pubId, mediaRender) => {
        that.addLog('info', `回调：stream-subscribed，远程人员加入`);
        let imgSrc = '';
        QRCode.toDataURL(pubId, function (err, url) {
          imgSrc = url;
        });
        that.videoList.push({
          id: "video-player_" + pubId,
          width: "100%",
          height: "100%",
          isFull: false,
          pubId: pubId,
          src: imgSrc,
          isShowCode: false,
        })
        that.$nextTick(() => {
          document.getElementById("video-player_"+pubId).appendChild(mediaRender);
          that.handleResize();
        });
      });
      //订阅辅流成功
      Rtcp.on("exstream-subscribed", (pubId, mediaRender) => {
        that.addLog('info', `回调：exstream-subscribed，远程屏幕共享打开`);
        let imgSrc = '';
        QRCode.toDataURL(pubId, function (err, url) {
          imgSrc = url;
        });
        that.videoList.push({
          id: "video-player_" + pubId,
          width: "100%",
          height: "100%",
          isFull: false,
          pubId: pubId,
          src: imgSrc,
          isShowCode: false,
        })
        that.$nextTick(() => {
          document.getElementById("video-player_"+pubId).appendChild(mediaRender);
          that.handleResize();
        });
      });
      //远程人员离开
      Rtcp.on("stream-unsubscribed", (pubId) => {
        that.addLog('info', `回调：stream-removed，远程人员离开`);
        document.getElementById("video-player_" + pubId) && document.getElementById("video-player_" + pubId).remove();
        // that.videoList.map((video, index) => {
        //   if (video.pubId === pubId) {
        //     that.videoList.splice(index, 1);
        //   }
        // });
        // that.$nextTick(() => {
        //   that.handleResize();
        // });
      });
      //远程屏幕共享关闭
      Rtcp.on("exstream-unsubscribed", (pubId) => {
        that.addLog('info', `回调：exstream-removed，远程屏幕共享关闭`);
        document.getElementById("video-player_" + pubId) && document.getElementById("video-player_" + pubId).remove();
        // that.videoList.map((video, index) => {
        //   if (video.pubId === pubId) {
        //     that.videoList.splice(index, 1);
        //   }
        // });
        // that.$nextTick(() => {
        //   that.handleResize();
        // });
      });
      // //媒体流音频大小
      // rtcp.on("audio-volume", (isRemote, pubId, audioLeval) => {
      //   console.log('audio-volume', isRemote, pubId, audioLeval);
      // });
      // //媒体流网络状态
      // rtcp.on("network-status", (isRemote, pubId, videoBytes, ARNetQuality) => {
      //   console.log('network-status: ', isRemote, pubId, videoBytes, ARNetQuality);
      // });
      if(that.isHoster == 0){
        Rtcp.getDevices()
        .then(devices => devices)
        .then(devices => { 
          if(devices.videoinput.length !== 0 ){
            that.cameraList = devices.videoinput;
            that.cameraDeviceId = that.cameraList[that.cameraList.length - 1].value;
          }
          if(devices.audiooutput.length !== 0 ){
            that.micphoneList = devices.audiooutput;
            that.micphoneDeviceId = that.micphoneList[that.micphoneList.length - 1].value;
          }

          Rtcp.setLocalVideoCapturer({
            video: {
              enabled: that.videoEnable,
              deviceId: that.cameraDeviceId
            },
            audio: {
              enabled: that.audioEnable,
              deviceId: that.micphoneDeviceId
            }
          }).then(e => {
            // var div = document.createElement('div');
            // div.id = "myVideo";
            // e.video && div.appendChild(e.video);
            // e.audio && div.appendChild(e.audio);
            // that.$refs.myVideoView.appendChild(div);
            that.$refs.myVideoView.appendChild(e.mediaRender);
            Rtcp.publish(0);
            // that.addLog('info', '方法：publish');
          }).catch(err => {
            console.log(err);
          });
        });
      }else{
        
      }
    },
    //发布辅流
    subScribe(){
      this.addLog('info', `方法：publishEx，发布屏幕辅流`);
      getScreenStream().then(e => {
        if (e === 'no-ready') {
          alert(
          '1. 请检查是否安装"anyRTC-ScreenShare"屏幕共享插件,如果没有请点击https://chrome.google.com/webstore/detail/anyrtc-screenshare/daiabbkkhgegdmhfpocaakcgbajnkgbp?hl=zh-CN下载\n' +
          '2. 安装了屏幕共享插件，但是没有启用该插件。\n' + 
          '说明：\n火狐浏览器或谷歌版本72以上无需安装插件。\n' +
          '360、QQ平台也有对应的插件下次。');
        }
        else if (e === 'no-support') {
          alert(`该浏览器不支持，请选择谷歌、火狐、QQ、360浏览器`);
        }
        else if (e === "user-cancel") {
          alert(`共享被取消`);
        }
        else {
          this.Rtcp.publishEx(e.stream);

          let screenView = document.createElement('div');
          screenView.id = "myScreen";
          e.video && screenView.appendChild(e.video);
          e.audio && screenView.appendChild(e.audio);
          this.screenSharing = true;
          // this.$nextTick(() => {
          //   this.$refs.myScreenView.appendChild(screenView);
          // });
        }
      }).catch(err => {
        console.log(err);
      });
    },
    //订阅
    getSubscribe(){
      if(this.rtcpId != ''){
        this.Rtcp.subscribe(this.rtcpId);
      }
    },
    //取消订阅
    getUnSubscribe(pubId, index){
      this.addLog('info', `方法：unSubscribe，取消订阅`);
      this.Rtcp.unSubscribe(pubId);
    },
    //取消发布辅流
    unSubScribe(id){
      this.addLog('info', `方法：unPublishEx，关闭屏幕辅流`);
      this.screenSharing = false;
      this.Rtcp.unPublishEx();
    },
    //copyID
    copyID(id){
      document.getElementById(id).select();
      document.execCommand("Copy");
    },
    showCode(n){
      this.videoList[n].isShowCode = !this.videoList[n].isShowCode;
    },
    //点击全屏
    setFullScreen (n){
      this.$index = n;
      if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {  // current working methods
          let id = this.videoList[n].id;
          let myVideo = document.getElementById(id); 
          if (myVideo.requestFullscreen) {
            myVideo.requestFullscreen();
          } else if (myVideo.msRequestFullscreen) {
            myVideo.msRequestFullscreen();
          } else if (myVideo.mozRequestFullScreen) {
            myVideo.mozRequestFullScreen();
          } else if (myVideo.webkitRequestFullscreen) {
            myVideo.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
          }
        } else { 
          if (document.exitFullscreen) {
            document.exitFullscreen();
          } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
          } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
          } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
          }
        }
    },
    //添加日志
    addLog(type, strLog) {
      this.logs.push({
        type: type,
        content: strLog
      });
      this.$nextTick(() => {
        let logView = this.$refs.logView.getBoundingClientRect();
        let logList = this.$refs.logList.getBoundingClientRect();
        if (logList.height > logView.height) {
          this.$refs.logView.scrollTop = (logList.height - logView.height);
        }
      });
    },
    //切换摄像头
    handleCameraChange() {
      let that = this;
      that.Rtcp.switchDevice({
        video: {
          enabled: that.videoEnable,
          deviceId: that.cameraDeviceId
        },
        audio: {
          enabled: that.audioEnable,
          deviceId: that.micphoneDeviceId
        }
      }).then(e => {
        document.getElementById("myVideo").remove();
        let myVideo = document.createElement('div');
        myVideo.id = "myVideo";
        e.video && myVideo.appendChild(e.video);
        e.audio && myVideo.appendChild(e.audio);
        that.$refs.myVideoView.appendChild(myVideo);
      }).catch(err => {

      });
    },
    //切换麦克风
    handleMicponeChange() {
      let that = this;
      that.Rtcp.switchDevice({
        video: {
          enabled: that.videoEnable,
          deviceId: that.cameraDeviceId
        },
        audio: {
          enabled: that.audioEnable,
          deviceId: that.micphoneDeviceId
        }
      }).then(e => {
        document.getElementById("myVideo").remove();
        let myVideo = document.createElement('div');
        myVideo.id = "myVideo";
        e.video && myVideo.appendChild(e.video);
        e.audio && myVideo.appendChild(e.audio);
        that.$refs.myVideoView.appendChild(myVideo);
      }).catch(err => {

      });
    },
    //视频开关
    switchVideo() {
      let that = this;

      that.Rtcp && that.Rtcp.setLocalVideoEnable(that.videoEnable = !that.videoEnable);
    },
    //音频开关
    switchAudio() {
      let that = this;

      that.Rtcp && that.Rtcp.setLocalAudioEnable(that.audioEnable = !that.audioEnable);
    },
    // setBroadCast() {
    //   this.Rtcp.setBroadCast(true, this.broadCastId);
    // },
    // endBroadCast() {
    //   this.Rtcp.setBroadCast(false, this.broadCastId);
    // },
    // setTalkOnly() {
    //   this.Rtcp.setTalkOnly(true, this.broadCastId);
    // },
    // endTalkOnly() {
    //   this.Rtcp.setTalkOnly(false, this.broadCastId);
    // },
    //
    leaveRtcp() {
      let that = this;
      
      if (confirm('确定离开房间吗？')) {
        if (that.Rtcp) {
          that.Rtcp.close();
          that.Rtcp = null;
        }
        that.$router.push('/');
      }
    },
  },
  beforeDestroy() {
    let that = this;
    that.Rtcp && (that.Rtcp.close(), that.Rtcp = null);
    //监听不同浏览器的全屏事件，并件执行相应的代码
    document.removeEventListener("webkitfullscreenchange", function () {
      if (document.webkitIsFullScreen) {
        that.videoList[that.$index].isFull = true;
      } else {
        if(!that.videoList[that.$index]){
          that.videoList[that.$index].isFull = false;
        }
      }
    }, false);
    document.removeEventListener("fullscreenchange", function () {
      if (document.fullscreen) {
        that.videoList[that.$index].isFull = true;
      } else {
        if(!that.videoList[that.$index]){
          that.videoList[that.$index].isFull = false;
        }
      }
    }, false);
    document.removeEventListener("mozfullscreenchange", function () {
      if (document.mozFullScreen) {
        that.videoList[that.$index].isFull = true;
      } else {
        if(!that.videoList[that.$index]){
          that.videoList[that.$index].isFull = false;
        }
      }
    }, false);
    document.removeEventListener("msfullscreenchange", function () {
      if (document.msFullscreenElement) {
        that.videoList[that.$index].isFull = true;
      } else {
        if(!that.videoList[that.$index]){
          that.videoList[that.$index].isFull = false;
        }
      }
    }, false);
  }
}
</script>

<style lang="scss">

  $videoBackground: #000;

  .ar-rtcp_side {
    box-shadow: 1px 0 20px 0 rgba(0,0,0,.1);
    z-index: 1;
  }

  .ar-rtcp_info {
    box-sizing: border-box;
    height: auto;
    padding: 25px 30px;

    .my_video {
      width: 260px;
      height: 135px;
      overflow: hidden;
      background-color: $videoBackground;
    }
    .info_item {
      margin-bottom: 20px;
      height: 34px;
      &:last-child { margin-bottom: 0; }
      line-height: 34px;
      &.isHoster1{
        input{
          padding-left: 15px;
          font-size: 12px;
          text-align: right;
          color: #333;
          background-color: transparent;
          border: none;
          outline: none;
        }
      }
      &.isHoster2{
        input{
          text-align: center;
          width: 180px;
          height: 34px;
          line-height: 34px;
          font-size: 12px;
          color: #333;
          border-radius: 4px;
          background-color: transparent;
          border: 1px solid #ddd;
          outline: none;
          box-sizing: border-box;
        }
        button{
          outline: none;
          height: 34px;
          width: 70px;
          background-color: transparent;
          border: 1px solid #DDD;
          color: #333;
          cursor: pointer;
          border-radius: 4px; 
          &:hover{
            transition: all .3s;
            border: 1px solid #33b15d;
            color: #33b15d;
          }
        }
      }
      .ar-device_select {
        outline: none;
        width: 180px;
        height: 34px;
        background:rgba(236,236,236,1);
        border-radius:4px;
        line-height: 34px;
        vertical-align: middle;
        border: none;
        box-sizing: border-box;
        padding: 0 8px;
      }
      
      .inof_item_label {
        font-size: 14px;
        color: #333;
      }

      &.flex {
        display: flex;
        justify-content: space-between;
      }
      &.video {
        text-align: center;
        height: auto;
        span {
          display: block;
          margin-top: 8px;
        }
      }
    }
  }
  .ar-rtcp_box_background{
    height: 30px; 
    background: #E5E7E9;
  }
  .ar-rtcp_log_title {
    height: 44px;
    line-height: 44px;
    text-align: center;
    font-size: 14px;
    color: #333;
    border-top: 1px solid #E5E7E9;
    box-sizing: border-box;
  }
  .ar-log_view {
    background-color: #E5E7E9;
    .ar-rtcp_log {
      padding: 0px 30px;
      overflow: hidden;
      overflow-y: auto;
      width: 100%;
      box-sizing: border-box;

      .ar-rtcp_log_item {
        margin-bottom: 10px;
        font-size: 14px;
        line-height: 18px;
        color: #666;
        word-break: break-word;

        &.error {
          color: red;
        }
      }
    }
  }

  .ar-rtcp_view {
    padding: 0 20px 20px;
    background-color: #F6F6F6;
  }

  .ar-rtcp_control {
    margin: 17px 0 7px;
    display: flex;
    justify-content: space-between;
    button{
      outline: none;
      width: 120px;
      height:34px;
      text-align: center;
      border: none;
      line-height: 34px;
      background:rgba(255,255,255,1);
      border-radius:4px;
      font-size:12px;
      margin-right: 10px;
      color:rgba(102,102,102,1);
      cursor: pointer;
      &.boxShow{
        box-shadow:0px 2px 8px 0px rgba(5,7,37,0.17);
      }
      &.on{
        border:1px solid rgba(51,177,93,1);
        color: rgba(51,177,93,1);
      }
      &.off{
        border:1px solid rgba(227,76,76,1);
        color: rgba(227,76,76,1);
      }
      &.signOut{
        background:rgba(233,74,74,1);
        color: #fff;
      }
    }
  }
  h3{
    color: #333333;
    height: 40px;
    line-height: 40px;
    font-size:16px;
    margin-bottom: 10px !important;
    font-weight:bold;
  }
  .ar-video_view {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%; 
    height: 100%;

    .ar-video_wrap {
      display: flex;
      flex-wrap: wrap;
      width: 100%; 
      height: 100%;
      overflow: hidden;
      overflow-y: auto;

      .ar-video_box {
        flex: 0 1 auto;
        box-sizing: border-box;
        overflow: hidden;
        background-color: #000;
        border-bottom: 1px solid #FFF;
        position: relative;
        &:nth-child(even) {
          border-left: 1px solid #fff;
        }
        .code{
          position: absolute;
          width: 100%;
          height: 100%;
          z-index: 20;
          background-color: rgba(0, 0, 0, 0.3);
          img{
            position: absolute;
            top: 50%;
            left: 50%;
            padding: 10px;
            transform: translate(-50%, -50%);
          }
        }
        span{
          position: absolute;
          top: 10px;
          display: inline-block;
          width:120px;
          height:32px;
          line-height:32px;
          font-size:12px;
          color:rgba(255,255,255,1);
          text-align: center;
          background: rgba(29,34,40, .8);
          border-radius:4px;
          z-index: 9;
          box-sizing: border-box;
          cursor: pointer;
          border: 1px solid #DDD;
          &.full-screen{
            right: 10px;
          }
          &.un-subscribe{
            right: 10px;
            top: 50px;
          }
          &.AR-code{
            z-index: 99;
            top: 90px;
            right: 10px;
          }
          &.ar-pubId{
            width: 270px !important;
            left: 10px;
            input{
              border: none;
              outline: none;
              background-color: transparent;
              color: #FFF;
              font-size: 12px;
            }
            a{
              padding-left: 10px;
            }
          }
        }
      }
    }
  }
  ::-webkit-scrollbar {
  width: 8px;
  height: 8px;
  }
  ::-webkit-scrollbar-track {
  background-color: transparent;
  }
  ::-webkit-scrollbar-thumb {
  border-radius: 10px;
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
  background-color: #DDD;
  }
</style>