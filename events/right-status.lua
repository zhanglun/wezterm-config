local wezterm = require('wezterm')
local Cells = require('utils.cells')
local nf = wezterm.nerdfonts
local attr = Cells.attr

local M = {}

local ICON_SEPARATOR = nf.oct_dash
local ICON_CWD = nf.oct_file_directory

---@type table<string, Cells.SegmentColors>
-- stylua: ignore
local colors = {
   cwd       = { fg = '#a6e3a1', bg = 'rgba(0, 0, 0, 0.4)' },
   separator = { fg = '#74c7ec', bg = 'rgba(0, 0, 0, 0.4)' },
}

local cells = Cells:new()

cells
   :add_segment('sep_cwd', ' ' .. ICON_SEPARATOR .. '  ', colors.separator)
   :add_segment('cwd_icon', ICON_CWD .. '  ', colors.cwd, attr(attr.intensity('Bold')))
   :add_segment('cwd_text', '', colors.cwd, attr(attr.intensity('Bold')))
   :add_segment('right_pad', '  ', { fg = '#000000', bg = 'rgba(0, 0, 0, 0)' })

---@param pane any
---@return string
local function cwd(pane)
   local cwd_uri = pane:get_current_working_dir()
   if not cwd_uri then
      return ''
   end

   local path = cwd_uri.file_path or ''
   -- Remove trailing slash added by WezTerm on some platforms
   if path:sub(-1) == '/' then
      path = path:sub(1, -2)
   end

   local home = os.getenv('HOME') or ''
   local display = (home ~= '' and path:sub(1, #home) == home)
      and '~' .. path:sub(#home + 1)
      or path

   return display
end

M.setup = function()
   wezterm.on('update-status', function(window, pane)
      local current_cwd = cwd(pane)

      cells:update_segment_text('cwd_text', current_cwd)

      local segments = {}

      if current_cwd ~= '' then
         table.insert(segments, 'sep_cwd')
         table.insert(segments, 'cwd_icon')
         table.insert(segments, 'cwd_text')
      end

      table.insert(segments, 'right_pad')
      window:set_right_status(wezterm.format(cells:render(segments)))
   end)
end

return M
