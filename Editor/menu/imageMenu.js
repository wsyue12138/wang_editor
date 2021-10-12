
import E from 'wangeditor';
const { $, BtnMenu, DropListMenu, PanelMenu, DropList, Panel, Tooltip } = E;

class ImageMenu extends BtnMenu{
  constructor(editor){
    const $elem = E.$(
      `<div class="w-e-menu" data-title="上传图片"}>
                <i class="w-e-icon-image"></i>
            </div>`,
    );
    super($elem, editor);
  }

  // 菜单点击事件
  clickHandler(){
    let audio_upload = document.getElementById('image_upload');
    audio_upload.click();
  }

  tryChangeActive(e) {}

}
export default ImageMenu;
