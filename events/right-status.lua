local wezterm = require('wezterm')
local umath = require('utils.math')
local Cells = require('utils.cells')
local OptsValidator = require('utils.opts-validator')

local nf = wezterm.nerdfonts
local attr = Cells.attr

---@alias Event.RightStatusOptionsInput { date_format?: string }

---@alias Event.RightStatusOptions { date_format: string }

---Setup options for the right status bar
---@type OptsValidator
local EVENT_OPTS = OptsValidator:new({
   {
      name = 'date_format',
      type = 'string',
      default = '%a %H:%M:%S',
   },
})

local M = {}

local ICON_SEPARATOR = nf.oct_dash
local ICON_DATE = nf.fa_calendar
local ICON_CWD = nf.oct_file_directory
local ICON_GIT = nf.oct_git_branch

---@type string[]
local discharging_icons = {
   nf.md_battery_10,
   nf.md_battery_20,
   nf.md_battery_30,
   nf.md_battery_40,
   nf.md_battery_50,
   nf.md_battery_60,
   nf.md_battery_70,
   nf.md_battery_80,
   nf.md_battery_90,
   nf.md_battery,
}
---@type string[]
local charging_icons = {
   nf.md_battery_charging_10,
   nf.md_battery_charging_20,
   nf.md_battery_charging_30,
   nf.md_battery_charging_40,
   nf.md_battery_charging_50,
   nf.md_battery_charging_60,
   nf.md_battery_charging_70,
   nf.md_battery_charging_80,
   nf.md_battery_charging_90,
   nf.md_battery_charging,
}

---@type table<string, Cells.SegmentColors>
-- stylua: ignore
local colors = {
   date      = { fg = '#fab387', bg = 'rgba(0, 0, 0, 0.4)' },
   battery   = { fg = '#f9e2af', bg = 'rgba(0, 0, 0, 0.4)' },
   cwd       = { fg = '#a6e3a1', bg = 'rgba(0, 0, 0, 0.4)' },
   git       = { fg = '#cba6f7', bg = 'rgba(0, 0, 0, 0.4)' },
   separator = { fg = '#74c7ec', bg = 'rgba(0, 0, 0, 0.4)' },
}

local cells = Cells:new()

cells
   :add_segment('date_icon', ICON_DATE .. '  ', colors.date, attr(attr.intensity('Bold')))
   :add_segment('date_text', '', colors.date, attr(attr.intensity('Bold')))
   :add_segment('sep_cwd', ' ' .. ICON_SEPARATOR .. '  ', colors.separator)
   :add_segment('cwd_icon', ICON_CWD .. '  ', colors.cwd, attr(attr.intensity('Bold')))
   :add_segment('cwd_text', '', colors.cwd, attr(attr.intensity('Bold')))
   :add_segment('sep_git', ' ' .. ICON_SEPARATOR .. '  ', colors.separator)
   :add_segment('git_icon', ICON_GIT .. '  ', colors.git, attr(attr.intensity('Bold')))
   :add_segment('git_text', '', colors.git, attr(attr.intensity('Bold')))
   :add_segment('sep_battery', ' ' .. ICON_SEPARATOR .. '  ', colors.separator)
   :add_segment('battery_icon', '', colors.battery)
   :add_segment('battery_text', '', colors.battery, attr(attr.intensity('Bold')))

---@param value any
---@return boolean
local function is_valid_charge(value)
   return type(value) == 'number' and value == value and value ~= math.huge and value ~= -math.huge
end

---@return string, string
local function battery_info()
   local charge = ''
   local icon = ''

   local ok, batteries = pcall(wezterm.battery_info)
   if not ok or not batteries then
      return charge, icon
   end

   for _, b in ipairs(batteries) do
      if is_valid_charge(b.state_of_charge) then
         local idx = umath.clamp(umath.round(b.state_of_charge * 10), 1, 10)
         charge = string.format('%.0f%%', b.state_of_charge * 100)

         if b.state == 'Charging' then
            icon = charging_icons[idx] or ''
         else
            icon = discharging_icons[idx] or ''
         end

         if icon ~= '' then
            break
         end
      end
   end

   return charge, icon == '' and '' or icon .. ' '
end

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

---@param opts? Event.RightStatusOptionsInput Default: {date_format = '%a %H:%M:%S'}
M.setup = function(opts)
   local valid_opts, err = EVENT_OPTS:validate(opts or {})

   if err then
      wezterm.log_error(err)
   end

   ---@cast valid_opts Event.RightStatusOptions

   wezterm.on('update-status', function(window, pane)
      local battery_text, battery_icon = battery_info()
      local cwd, git_branch = cwd_and_branch(pane)

      cells
         :update_segment_text('date_text', wezterm.strftime(valid_opts.date_format))
         :update_segment_text('cwd_text', cwd)
         :update_segment_text('git_text', git_branch)
         :update_segment_text('battery_icon', battery_icon)
         :update_segment_text('battery_text', battery_text)

      local segments = { 'date_icon', 'date_text' }

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

      if battery_icon ~= '' or battery_text ~= '' then
         table.insert(segments, 'sep_battery')
         table.insert(segments, 'battery_icon')
         table.insert(segments, 'battery_text')
      end

      window:set_right_status(wezterm.format(cells:render(segments)))
   end)
end

return M
