module.exports = grammar({
    name: 'pico8',

    rules: {
        p8file: $ => seq(
            $._title,
            $.lua,
            $.gfx,
            optional($._map),
            optional($._sfx),
            optional($._music),
        ),
        _title: () => "pico-8 cartridge // http://www.pico-8.com\nversion 41",
        lua: $ => seq(
            "__lua__",
            repeat(choice(
                $.comment,
                $.statement,
                /\s+\n/
            )),
        ),
        gfx: () => seq(
            "__gfx__",
            repeat('\n')
        ),
        _map: () => seq(
            "__map__",
            /.*[^_]*/
        ),
        _sfx: () => seq(
            "__sfx__",
            /.*[^_]*/
        ),
        _music: () => seq(
            "__music__",
            /.*[^_]*/
        ),

        comment: $ => choice(
            /--.*/,
            /\/\/.*/,
            /--\[\[[\w\s]*\]\]/,
            $.tag
        ),
        tag: $ => seq(
            '\n-->8\n--',
            $.tag_name
        ),
        tag_name: () => /.*/,

        // TODO
        statement: $ => choice(
            $.do_stm,
            $.fn_define,
            $.return_stm,
            $.while_stm
        ),
        do_stm: $ => seq(
            'do',
            repeat(choice(
                $.statement,
                $.comment
            )),
            'end'
        ),
        // bug:
        // function -- comment
        // ()
        // end
        fn_define: $ => seq(
            'function',
            optional($.fn_name),
            '(',
            repeat(choice(',', $._param)),
            ')',
            repeat(choice(
                $.statement,
                $.comment
            )),
            'end'
        ),
        fn_name: () => /[a-zA-Z]\w*/,
        _param: $ => alias($.variable, $.param),
        return_stm: $ => seq(
            optional('return'),
            $.expression
        ),

        while_stm: $ => seq(
            'while',
            $.expression,
            repeat($.comment),
            $.statement,
        ),

        // TODO
        expression: $ => choice(
            $.variable,
            $.binary_expression,
            $.unary_expression,
        ),
        variable: () => /[a-zA-Z]\w*/,

        binary_expression: $ => choice(
            ...[
                ['or', 1],
                ['and', 2],
                ['==', 3], ['!=', 3], ['~=', 3], ['<', 3], ['<=', 3], ['>', 3], ['>=', 3],
                ['|', 4],
                ['~', 5], ['^^', 5],
                ['&', 6],
                ['<<', 7], ['>>', 7], ['>>>', 7], ['<<>', 7], ['>><', 7],
                ['+', 9], ['-', 9],
                ['*', 10], ['/', 10], ['%', 10], ['\\', 10],
                ['.', 13] // table.xx
            ].map(
                ([op, pri]) => prec.left(pri, seq($.expression, op, $.expression))
            ),
            ...[
                ['..', 8],
                ['^', 12],
            ].map(
                ([op, pri]) => prec.right(pri, seq($.expression, op, $.expression))
            )
        ),
        unary_expression: $ => choice(
            ...[
                ['-', 11], ['~', 11], ['not', 11], ['@', 11], ['%', 11], ['$', 11],
            ].map(
                ([op, pri]) => prec.right(pri, seq(op, $.expression))
            )
        ),
        assign_op: () => choice(
            '=',
            '+=', '-=', '*=', '/=', '\\=', '%=', '^=',
            '|=', '&=', '^^=',
            '<<=', '>>=', '>>>=', '<<>=', '>><=',
            '..=',
        ),

        //value: $ => choice(
        //    $.number,
        //    $.bool,
        //    $.string,
        //    $.nil,
        //    $.fn_definition,
        //    $.table,
        //    $.buttin_fn,
        //),
        //number: () => choice(
        //    /\d+(\.\d*)?/,
        //    /\.\d+/,
        //    /0x[\dabcdef]*(\.[\dabcdef]*)?/,
        //    /0h[01]*(\.[01]*)?/
        //),
        //bool: () => choice('true', 'false'),
        //string: () => choice(
        //    /"[^"\\]*(\\.[^"\\]*)*"/,
        //    /'[^'\\]*(\\.[^'\\]*)*'/
        //),
        //nil: () => 'nil',
        //table: $ => seq(
        //    '{', optional(seq(choice($.field, $.value), repeat(seq(',', choice($.field, $.value))))), '}'
        //),
        //field: $ => seq(
        //    $.variable,
        //    '=',
        //    $.value
        //),
        //fn_definition: $ => seq(
        //    'function',
        //    optional(alias($.variable, 'fn_name')),
        //    '(', optional(seq($.variable, repeat(seq(',', $.variable)))), ')',
        //    repeat($.statement),
        //    'end'),
        ////TODO
        //statement: $ => choice(
        //    $.fn_definition,
        //),

        //keyworld: () => choice(
        //    'local',
        //    'return',
        //    'function',
        //    'if',
        //    'then',
        //    'elseif',
        //    'else',
        //    'end',
        //    'for',
        //    'in',
        //    'while',
        //    'do'
        //),
        //buttin_fn: () => choice(
        //    'load',
        //    'sspr',
        //    'save',
        //    'ls',
        //    'run',
        //    'stop',
        //    'assert',
        //    'reset',
        //    'flip',
        //    'printh',
        //    'time',
        //    't',
        //    'stat',
        //    'extcmd',
        //    'clip',
        //    'pset',
        //    'pget',
        //    'sget',
        //    'sset',
        //    'fget',
        //    'fset',
        //    'print',
        //    'cursor',
        //    'color',
        //    'cls',
        //    'camera',
        //    'circ',
        //    'circfill',
        //    'oval',
        //    'ovalfill',
        //    'line',
        //    'rect',
        //    'rectfill',
        //    'pal',
        //    'palt',
        //    'spr',
        //    'fillp',
        //    'add',
        //    'del',
        //    'deli',
        //    'count',
        //    'all',
        //    'foreach',
        //    'pairs',
        //    'btn',
        //    'btnp',
        //    'sfx',
        //    'music',
        //    'mget',
        //    'mset',
        //    'map',
        //    'tline',
        //    'peek',
        //    'poke',
        //    'memcpy',
        //    'reload',
        //    'cstore',
        //    'memset',
        //    'max',
        //    'min',
        //    'mid',
        //    'flr',
        //    'ceil',
        //    'cos',
        //    'sin',
        //    'sqrt',
        //    'abs',
        //    'rnd',
        //    'srand',
        //    'menuitem',
        //    'tostr',
        //    'tonum',
        //    'chr',
        //    'ord',
        //    'sub',
        //    'split',
        //    'type',
        //    'cartdata',
        //    'dget',
        //    'dset',
        //    'setmetatable',
        //    'getmetatable',
        //    'rawset',
        //    'rawget',
        //    'rawlen',
        //    'cocreate',
        //    'coresume',
        //    'costatus',
        //    'yield',
        //    '_init',
        //    '_update',
        //    '_draw',
        //    'ipairs',
        //    'pack',
        //    'unpac',
        //    'next',
        //    'peek2',
        //    'peek4',
        //    'poke2',
        //    'poke4',
        //    'serial',
        //    'atan2',
        //    'band',
        //    'bnot',
        //    'bor',
        //    'bxor',
        //    'lshr',
        //    'rotl',
        //    'rotr',
        //    'sgn',
        //    'shl',
        //    'shr',
        //    'rawequal',
        //    'select',
        //    'trace',
        //),
    }
});
