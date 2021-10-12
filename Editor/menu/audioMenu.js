
import E from 'wangeditor';
const { $, BtnMenu, DropListMenu, PanelMenu, DropList, Panel, Tooltip } = E;

class AudioMenu extends BtnMenu{
  constructor(editor){
    const $elem = E.$(
      `<div class="w-e-menu" data-title="上传音频"}>
                <span class="editor_audio">🎵</span>
            </div>`,//这里的input用于吊起上传音频
    );
    super($elem, editor);
  }

  // 菜单点击事件
  clickHandler(){
    let audio_upload = document.getElementById('audio_upload');
    audio_upload.click();
  }

  tryChangeActive(e) {}

}
export default AudioMenu;
