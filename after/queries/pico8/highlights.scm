
(while_statement
  [ "while" ] @keyword
  [
   "do" "end"
  ] @repeat
)

(while_statement
  [ "while" ] @keyword
)

(for_statement
  [ "for" ] @keyword
  [
   "all"
   "pairs" "ipairs"
  ] @function.builtin
  [
   "do" "end"
  ] @repeat
)

(for_statement
  [ "for" ] @keyword
  [
   "do" "end"
  ] @repeat
)

(repeat_statement
  [
   "repeat"
   "until"
  ] @keyword
)

(fn_define
  "function" @keyword.function
  "end" @keyword.function
)
["return"] @keyword.return

(if_statement
  [
   "if" "then"
   "elseif"
   "else"
   "end"
  ] @conditional
)

[
 (nil)
 (line_comment_lua)
 (line_comment_normal)
 (block_comment)
 (title)
 (map)
 (sfx)
 (music)
] @comment

 [ "__lua__" "__gfx__" ] @type

[
 "goto"
 "in"
 "local"
] @keyword

(string) @string
(number) @number
(bool) @boolean

[ "and" "not" "or" ] @keyword.operator

[
 "==" "!=" "~=" "<" "<=" ">" ">="
 "|" "~" "^^" "&"
 "<<" ">>" ">>>" "<<>" ">><"
 "+" "-" "*" "/" "%" "\\"
 ".." "^"
 "=" "+=" "-=" "*=" "/=" "\\=" "%=" "^=" "|=" "&=" "^^="
 "<<=" ">>=" ">>>=" "<<>=" ">><="
 "..="
 "."
] @operator

[
 "(" ")"
 "[" "]"
 "{" "}"
] @punctuation.bracket

[
 "_init"
 "_update"
 "_draw"
] @function.builtin

(fn_call
  (builtin) @function.builtin
)

(color0) @color0
(color1) @color1
(color2) @color2
(color3) @color3
(color4) @color4
(color5) @color5
(color6) @color6
(color7) @color7
(color8) @color8
(color9) @color9
(colora) @colora
(colorb) @colorb
(colorc) @colorc
(colord) @colord
(colore) @colore
(colorf) @colorf
