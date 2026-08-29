local wezterm = require('wezterm')
local Cells = require('utils.cells')
local nf = wezterm.nerdfonts
local attr = Cells.attr

local M = {}

local ICON_SEPARATOR = nf.oct_dash
local ICON_CWD = nf.oct_file_directory
local ICON_GIT = nf.oct_git_branch

---@type table<string, Cells.SegmentColors>
-- stylua: ignore
local colors = {
   cwd       = { fg = '#a6e3a1', bg = 'rgba(0, 0, 0, 0.4)' },
   git       = { fg = '#cba6f7', bg = 'rgba(0, 0, 0, 0.4)' },
   separator = { fg = '#74c7ec', bg = 'rgba(0, 0, 0, 0.4)' },
}

local cells = Cells:new()

cells
   :add_segment('sep_cwd', ' ' .. ICON_SEPARATOR .. '  ', colors.separator)
   :add_segment('cwd_icon', ICON_CWD .. '  ', colors.cwd, attr(attr.intensity('Bold')))
   :add_segment('cwd_text', '', colors.cwd, attr(attr.intensity('Bold')))
   :add_segment('sep_git', ' ' .. ICON_SEPARATOR .. '  ', colors.separator)
   :add_segment('git_icon', ICON_GIT .. '  ', colors.git, attr(attr.intensity('Bold')))
   :add_segment('git_text', '', colors.git, attr(attr.intensity('Bold')))
   :add_segment('right_pad', '  ', { fg = '#000000', bg = 'rgba(0, 0, 0, 0)' })

-- Cache git branch per pane to avoid spawning a process on every tick
---@type table<number, {path: string, branch: string}>
local pane_git_cache = {}

---@param pane any
---@return string cwd, string git_branch
local function cwd_and_branch(pane)
   local cwd_uri = pane:get_current_working_dir()
   if not cwd_uri then
      return '', ''
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

   local pane_id = pane:pane_id()
   local cache = pane_git_cache[pane_id] or {}

   -- Only re-run git when the directory actually changed
   local branch = cache.branch or ''
   if cache.path ~= path then
      local ok, result = pcall(function()
         local success, stdout, _ = wezterm.run_child_process({
            'git', '-C', path, 'branch', '--show-current',
         })
         return success and stdout:match('^(.-)%s*$') or ''
      end)
      branch = ok and result or ''
      pane_git_cache[pane_id] = { path = path, branch = branch }
   end

   return display, branch
end

M.setup = function()
   wezterm.on('update-status', function(window, pane)
      local cwd, git_branch = cwd_and_branch(pane)

      cells
         :update_segment_text('cwd_text', cwd)
         :update_segment_text('git_text', git_branch)

      local segments = {}

      if cwd ~= '' then
         table.insert(segments, 'sep_cwd')
         table.insert(segments, 'cwd_icon')
         table.insert(segments, 'cwd_text')
      end

      if git_branch ~= '' then
         table.insert(segments, 'sep_git')
         table.insert(segments, 'git_icon')
         table.insert(segments, 'git_text')
      end

      table.insert(segments, 'right_pad')
      window:set_right_status(wezterm.format(cells:render(segments)))
   end)
end

return M
