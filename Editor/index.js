import React,{ useEffect,useState } from 'react';
import E from 'wangeditor';
import xssfillter from 'xss';
import AudioNenu from './menu/audioMenu';
import imageMenu from './menu/imageMenu';
import videoMenu from './menu/videoMenu';
import ImageUpload from './menu/ImageUpload';
import OtherUpload from './menu/OtherUpload';
import styles from './style.less';

const menus = [
  'head',
  'bold',
  'fontSize',
  'fontName',
  'italic',
  'underline',
  'strikeThrough',
  'indent',
  'lineHeight',
  'foreColor',
  // 'backColor',
  'link',
  'list',
  'todo',
  'justify',
  'quote',
  // 'emoticon',
  'table',
  // 'code',
  'splitLine',
  'undo',
  'redo',
  'image',
  'video',
]

const WangEditor = (props) => {

  const {
    width='100%',
    //height='100%',
    initStyle={},
    placeholder='请输入内容',
    initContent,
    onChange,
    uploadSuccess,
    uploadError
  } = props;

  let [editor,setEditor] = useState(null);

  const editorInit = () => {
    const editorBox = new E('#editor');
    setEditor(editorBox);
    const editorConfig = {
      //height,
      placeholder,
      menus,
      pasteFilterStyle:false,
      onchangeTimeout:500,
      zIndex:900,
      onchange:handleOnChange
    }
    for (const key in editorConfig) {
      if (Object.hasOwnProperty.call(editorConfig, key)) {
        const element = editorConfig[key];
        editorBox.config[key] = element;
      }
    }
    editorBox.menus.extend('imageMenuKey', imageMenu);
    editorBox.menus.extend('videoMenuKey', videoMenu);
    editorBox.menus.extend('audioNenuKey', AudioNenu);
    editorBox.config.menus = editorBox.config.menus.concat('imageMenuKey');
    editorBox.config.menus = editorBox.config.menus.concat('videoMenuKey')
    editorBox.config.menus = editorBox.config.menus.concat('audioNenuKey')
    editorBox.create();
  }

  const handleOnChange = (newHtml) => {
    if(onChange){
      try {
        if(typeof onChange === "function") {
          //const _content = xssfillter(newHtml);
          onChange(newHtml);
        }
      } catch (error) {

      }
    }
  }

  const uploadSuccessFun = (type,data) => {
    if(uploadSuccess){
      try {
        if(typeof uploadSuccess === "function") {
          console.log(type,data)
          uploadSuccess(type,data);
        }
      } catch (error) {

      }
    }
  }

  const uploadErrorFun = (type,data) => {
    if(uploadError){
      try {
        if(typeof uploadError === "function") {
          uploadError(type,data);
        }
      } catch (error) {

      }
    }
  }

  useEffect(() => {
    editor && editor.txt.html(initContent);
  },[initContent])

  useEffect(() => {
    editorInit();
  },[])

  return(
    <div className={styles.editor_content} style={{...initStyle,width}}>
      <div id='editor' style={{display: 'flex',flexDirection: 'column',width:'100%',height:'100%'}}></div>
      <div className={styles.upload_content}>
        <ImageUpload
          editor={editor}
          onSuccess={uploadSuccessFun}
          onError={uploadErrorFun}
        />
        <OtherUpload
          type='video'
          editor={editor}
          onSuccess={uploadSuccessFun}
          onError={uploadErrorFun}
        />
        <OtherUpload
          type='audio'
          editor={editor}
          onSuccess={uploadSuccessFun}
          onError={uploadErrorFun}
        />
      </div>
    </div>
  )
}

export default WangEditor;
