local wezterm = require('wezterm')
local platform = require('utils.platform')

-- local font_family = 'Maple Mono NF'
local font_family = 'UbuntuSansMono Nerd Font'
-- local font_family = 'CartographCF Nerd Font'

local font_size = platform.is_mac and 15 or 15

local font
if platform.is_linux then
   -- Keep a CJK fallback for systems without LXGW WenKai Mono.
   font = wezterm.font_with_fallback({
      { family = 'LXGW WenKai Mono' },
      { family = 'Ubuntu Sans Mono' },
      { family = 'Noto Sans Mono CJK SC' },
   })
else
   font = wezterm.font_with_fallback({
      { family = 'LXGW WenKai Mono' },
      { family = font_family, weight = 'Medium' },
   })
end

---@type Config
return {
   font = font,
   font_size = font_size,

   --ref: https://wezfurlong.org/wezterm/config/lua/config/freetype_pcf_long_family_names.html#why-doesnt-wezterm-use-the-distro-freetype-or-match-its-configuration
   freetype_load_target = 'Normal', ---@type 'Normal'|'Light'|'Mono'|'HorizontalLcd'
   freetype_render_target = 'Normal', ---@type 'Normal'|'Light'|'Mono'|'HorizontalLcd'
}
