
import E from 'wangeditor';
const { $, BtnMenu, DropListMenu, PanelMenu, DropList, Panel, Tooltip } = E;

class VideoMenu extends BtnMenu{
  constructor(editor){
    const $elem = E.$(
      `<div class="w-e-menu" data-title="上传视频"}>
            <i class="w-e-icon-play"></i>
            </div>`,
    );
    super($elem, editor);
  }

  // 菜单点击事件
  clickHandler(){
    let audio_upload = document.getElementById('video_upload');
    audio_upload.click();
  }

  tryChangeActive(e) {}

}
export default VideoMenu;
