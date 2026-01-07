vim.api.nvim_create_autocmd(
    {"BufNewFile", "BufRead"},
    {
        pattern = "*.p8",
        command = "set ft=pico8"
    }
)
