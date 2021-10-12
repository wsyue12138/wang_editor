import React from 'react';
import { Upload } from 'antd';

let isSubmit = true;

const ImageUpload = (props) => {
  const { editor, onSuccess, onError } = props;
  const uploadProps = {
    accept: 'image/gif,image/jpeg,image/jpg,image/x-png,image/png',
    headers:{token:''},
    action:'/icservice/common/uploadImg',
    data:{},
    showUploadList:false,
    beforeUpload: (file) => {
      if (!isSubmit) {
        return false;
      }
      isSubmit = false;
      if (
        file.type &&
        file.type !== 'image/jpeg' &&
        file.type !== 'image/jpg' &&
        file.type !== 'image/png' &&
        file.type !== 'image/gif'
      ) {
        onError('image', '仅支持上传jpeg,jpg,png文件!');
        isSubmit = true;
        return false;
      } else if (
        file.name.indexOf('jpg') < 0 &&
        file.name.indexOf('jpeg') < 0 &&
        file.name.indexOf('png') < 0 &&
        file.name.indexOf('gif') < 0
      ) {
        onError('image', '仅支持上传jpeg,jpg,png文件!');
        isSubmit = true;
        return false;
      }
      if (file.size && file.size > 1024 * 3 * 1024) {
        onError('image', `文件大小不得超过3M!`);
        isSubmit = true;
        return false;
      }
      editor.cmd.do(
        'insertHTML',
        `<img src='https://7niu-article.galaxyeye-tech.com/img/article/210618/1405728436827197440.jpg' style="max-width:100%" contenteditable="false" />`
      )
    },
    onChange(info) {
      if (info.file.status !== 'uploading') {
      }
      if (info.file.status === 'done') {
        const response = info.file.response;
        const { ret_code, ret_msg } = response;
        editor.enable();
        if (ret_code === 1) {
          editor.cmd.do(
            'insertHTML',
            `<img src='https://7niu-article.galaxyeye-tech.com/img/article/210618/1405728436827197440.jpg' style="max-width:100%" contenteditable="false" />`
          )
          onSuccess('image', response);
        } else {
          onError('image', response);
        }
        isSubmit = true;
      } else if (info.file.status === 'error') {
        editor.enable();
        onError('image', {});
        isSubmit = true;
      }
    },
  };

  return (
    <Upload {...uploadProps} id="image_upload">
      <div style={{ width: '0px', hegiht: '0px' }}></div>
    </Upload>
  );
};
// editor.cmd.do(
//   'insertHTML',
//   `<img src='https://7niu-article.galaxyeye-tech.com/img/article/210618/1405728436827197440.jpg' style="max-width:100%" contenteditable="false" />`
// )
//editor.disable();
export default ImageUpload;
