// Title bar for the standalone office-preview window (layouts/preview-window.json).
// The layout block carries window_drag; this mod only draws the label.
import { View, div } from "gpui-kit";

export default class PreviewTitlebar extends View {
  render() {
    return div().flex().items_center().px(16).h_full().bg("#11161e")
      .child(div().text_size(12).font_bold().text_color("#8e9aaa").child("Office-2 art preview"));
  }
}
