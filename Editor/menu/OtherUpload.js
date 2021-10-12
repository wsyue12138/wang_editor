import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { fetch } from 'dva';
import { Upload,Modal,Progress,Button } from 'antd';
import SparkMD5 from 'spark-md5';

class OtherUpload extends Component {
  constructor(props) {
    super(props);
    this.fileList = [];
    this.current_num = 0;
    this.currentFile = null;
    this.playUrl = '';
    this.timer = null;
    this.nextNum = 1;
    this.state = {
      currentFile: null,
      visible: false,
      percent:0,
      closable:false,
      speedStatus:undefined
    };
  }

  //设置uplod参数
  setUploadOptions = () => {
    const { type } = this.props;
    const uploadProps = {
      accept: type === 'video' ? 'video/mp4' : 'audio/mpeg',
      headers: { token: '' },
      action: '',
      data: {},
      showUploadList: false,
      beforeUpload: this.beforeUpload,
    };
    return uploadProps;
  };

  //上传前置判断
  beforeUpload = (file) => {
    const { onError, type } = this.props;
    const { name } = file;
    this.currentFile = file;
    const fileType = type === 'video' ? 'video/mp4' : 'audio/mpeg';
    const fileSuffix = type === 'video' ? 'mp4' : 'mp3';
    const typeName = type === 'video' ? 'mp4格式视频文件' : 'mp3格式音频文件';
    const fileNameArr = file.name.split('.');
    if (!name) {
      onError(type, `仅支持上传${typeName}！`);
      return false;
    }
    if (file.type !== fileType) {
      onError(type, `仅支持上传${typeName}！`);
      return false;
    }
    if (fileNameArr[fileNameArr.length - 1] !== fileSuffix) {
      onError(type, `仅支持上传${typeName}！`);
      return false;
    }
    // if (file.size && file.size > 1024 * 10 * 1000) {
    //   onError('image', `文件大小不得超过10M!`);
    //   isSubmit = true;
    //   return false;
    // }
    this.uploadInit().then((res) => {
      if(res){
        this.filePartialinit(res,name,file.size);
      }else{
        onError(type,'上传失败，请稍后再试！');
      }
    });
    return false;
  };

  //文件切片
  fileSplit = (package_size) => {
    const share = this.currentFile.size / package_size;
    let cur = 0;
    const partList = [];
    for (let i = 0; i < share; i++) {
      const obj = this.currentFile.slice(cur, cur + package_size);
      partList.push(obj);
      cur += package_size;
    }
    return partList;
  };

  //文件md5加密
  uploadInit = () => {
    return new Promise((resolve, reject) => {
      const blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
      const spark = new SparkMD5.ArrayBuffer();
      let fileReader = new FileReader();
      let num = 0;
      let chunkSize;
      if(this.currentFile.size > 10 * 1024 * 1024){
        chunkSize = 10 * 1024 * 1024;
      }else{
        chunkSize = this.currentFile.size;
      }
      fileReader.onload = function (e) {
        if(num === 0){
          num++;
          spark.append(e.target.result);
          const hash = spark.end(true);
          const initObj = window.btoa(hash);
          resolve(initObj);
          return false;
        }
      }
      fileReader.onerror = function () {
        resolve(null);
        return false;
      };
      fileReader.readAsArrayBuffer(blobSlice.call(this.currentFile, 0, chunkSize));
    });
  }

  //请求封装
  request = (url,body,isform) => {
    const { token } = this.props;
    const defaultOptions = {
      credentials: 'include',
      method: 'POST'
    }
    if(isform){
      defaultOptions.headers = {
        'X-Requested-With': 'XMLHttpRequest',
        'token':token
      }
      defaultOptions.body = body;
    }else{
      defaultOptions.headers = {
        'Accept': 'application/json',
        'token':token
      }
      defaultOptions.body = JSON.stringify(body);
    }
    return fetch(url, defaultOptions)
      .then(response => response)
      .then(response => {
        if(response.status == 200) { // 截断接口报错
          return response.json();
        } else {
          //此处可做错误监听
          return {
            success: false
          }
        }
      })
      .then(response => {
        return response;
      })
      .catch(response => {
        return response;
      })
  }

  //初始化文件
  filePartialinit = (checkSum,filename,fileSize) => {
    const { onError,type } = this.props;
    const payload = {appid:"2.00002",source: "dev_env",checkSum,filename,size:fileSize};
    this.request('/ArticleService/partialinit',payload,false).then((res) => {
      const { result,package_size,next_part,etag,max_part,url } = res;
      if(result === 1){
        this.playUrl = 'http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4'//url;
        this.fileUpload({package_size,next_part,etag,max_part});
      }else{
        onError(type, '上传失败，请稍后再试');
      }
    })
    .catch(res => {
      onError(type, '上传失败，请稍后再试');
    })
  }

  //切片上传
  fileUpload = (options) => {
    const { package_size,next_part,etag,max_part } = options;
    this.fileList = this.fileSplit(package_size);
    if(this.fileList.length){
      this.etag = etag;
      this.next_part = next_part;
      const visible = max_part !== next_part;
      this.setState({visible},() => {
        this.fileLoop();
      });
    }
  };

  //上传请求
  fileLoop = () => {
    const _len = this.fileList.length;
    if(this.next_part < _len){
      let formData = new FormData();
      formData.append('appid', "2.00002");
      formData.append('etag', this.etag);
      formData.append('part', this.next_part);
      formData.append('file', this.fileList[this.next_part]);
      this.request('/ArticleService/partialupload',formData,true).then((res) => {
        const { result,max_part,next_part } = res;
          if(result === 1){
            clearTimeout(this.timer);
            this.next_part++;
            this.nextNum = 1;
            const percent = this.setPercent(next_part,max_part);
            this.setState({percent},() => {
              this.fileLoop();
            });
          }else{
            this.reconnection();
          }
      })
      .catch(res => {
        this.reconnection();
      })
    }else{
      const { type } = this.props;
      this.setState({closable:true,speedStatus:'success'},() => {
        if(type === 'video'){
          this.addVideo();
        }else{
          this.addAudio();
        }
      })
    }
  }

  //设置百分数
  setPercent = (current,total) => {
    const num = total <= 0 ? 0 : (Math.round(current / total * 10000) / 100);
    return num > 100 ? 100 : num;
  }

  //失败重连
  reconnection = () => {
    const { onError,type } = this.props;
    clearTimeout(this.timer);
    if(this.nextNum < 6){
      this.nextNum++;
      this.timer = setTimeout(this.fileLoop,300);
    }else{
      this.setState({closable:true,speedStatus:'exception'},() => {
        onError(type, '上传失败，请稍后再试');
      })
    }
  }

  //插入视频
  addVideo = () => {
    const { editor } = this.props;
    editor.cmd.do(
      'insertHTML',
      '<video src="' + this.playUrl + '"  controls style="max-width:100%" ></video>'
    )
  }

  //插入音频
  addAudio = () => {
    const { editor } = this.props;
    editor.cmd.do(
      'insertHTML',
      '<audio src="' + this.playUrl + '"  controls style="width:100%" ></audio>'
    )
  }

  //重试
  handleReset = () => {
    this.setState({speedStatus:undefined,closable:false},() => {
      this.fileLoop();
    })
  }

  //关闭弹窗
  handleClose = () => {
    this.setState({visible:false,percent:0,closable:false,speedStatus:undefined},() => {
      this.fileList = [];
      this.current_num = 0;
      this.currentFile = null;
      this.playUrl = '';
      this.nextNum = 1;
    })
  }

  //进度弹窗
  speedModal = () => {
    const { visible,closable,speedStatus,percent } = this.state;
    return(
      <Modal
        title="文件上传进度"
        visible={visible}
        footer={null}
        maskClosable={false}
        destroyOnClose={true}
        closable={closable}
        centered={true}
        onCancel={this.handleClose}
      >
        <Progress
          strokeColor={{
            '0%': '#108ee9',
            '100%': '#87d068',
          }}
          percent={percent}
          status={speedStatus}
        />
        {
          speedStatus === 'exception' && (
            <div style={{width:'100%',textAlign:'center'}} onClick={this.handleReset}>
              <Button type="primary">重试</Button>
            </div>
          )
        }
      </Modal>
    )
  }

  render() {
    const { type } = this.props;
    const uploadProps = this.setUploadOptions();
    return (
      <Fragment>
        <Upload {...uploadProps} id={`${type}_upload`}>
          <div style={{ width: '0px', hegiht: '0px' }}></div>
        </Upload>
        {this.speedModal()}
      </Fragment>
    );
  }
}
//editor.disable();
export default OtherUpload;
