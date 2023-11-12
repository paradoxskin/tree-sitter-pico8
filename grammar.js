module.exports = grammar({
    name: 'pico8',


    rules: {
        p8file: $ => seq(
            $.title,
            $.lua,
            $.gfx,
            optional($.map),
            optional($.sfx),
            optional($.music),
        ),
        title: () => "pico-8 cartridge // http://www.pico-8.com\nversion 41",
        lua: $ => seq(
            "__lua__",
            repeat(choice(
                $.statement
            ))
        ),
        gfx: $ => seq(
            "__gfx__",
            repeat(choice(
                $.color0, $.color1, $.color2, $.color3,
                $.color4, $.color5, $.color6, $.color7,
                $.color8, $.color9, $.colora, $.colorb,
                $.colorc, $.colord, $.colore, $.colorf,
            ))
        ),
        map: () => seq("__map__", repeat(/[0-9a-f]/)),
        sfx: () => seq("__sfx__", repeat(/[0-9a-f]/)),
        music: () => seq("__music__", repeat(/[0-9a-f]/)),

        line_comment_lua: () => /--.*/,
        line_comment_normal: () => /\/\/.*/,
        block_comment: () => /--\[\[[\w\s]*\]\]/,
        comment: $ => choice(
            $.line_comment_lua,
            $.line_comment_normal,
            $.block_comment
        ),

        // expression
        variable: () => /[a-zA-Z_][0-9a-zA-Z_]*/,
        still_variable: $ => choice(
            $.variable,
            prec.left(13, seq($.still_variable, '.', $.variable)),
            prec.left(13, seq($.still_variable, ':', $.variable)), // fn_call actly
            prec.left(13, seq($.still_variable, '[', field('key', $.expression), ']')), //table
        ),
        base: $ => choice(
            $.number,
            $.string,
            $.bool,
            $.nil
        ),
        number: () => choice(
            /\d+(\.\d*)?/,
            /\.\d+/,
            /0x[\dabcdef]*(\.[\dabcdef]*)?/,
            /0h[01]*(\.[01]*)?/
        ),
        nil: () => "nil",
        bool: () => choice('true', 'false'),
        string: () => choice(
            /"[^"\\]*(\\.[^"\\]*)*"/,
            /'[^'\\]*(\\.[^'\\]*)*'/
        ),
        expression: $ => choice(
            $.fn_define,
            $.still_variable,
            $.base,
            $.binary_expression,
            $.unary_expression,
            $.table,
            $.fn_call
        ),
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
            ].map(
                ([op, pri]) => prec.left(pri, seq($.expression, op, $.expression))
            ),
            ...[
                ['..', 8],
                ['^', 12],
            ].map(
                ([op, pri]) => prec.right(pri, seq($.expression, op, $.expression))
            ),
        ),
        unary_expression: $ => choice(
            ...[
                ['-', 11], ['~', 11], ['not', 11], ['@', 11], ['%', 11], ['$', 11], ['#', 11]
            ].map(
                ([op, pri]) => prec.right(pri, seq(op, $.expression))
            ),
            prec.left(14, seq('(', $.expression, ')')), // bucket
        ),
        assign_expression: $ => seq(
            optional("local"),
            field('var', $.still_variable),
            choice(
                '=',
                '+=', '-=', '*=', '/=', '\\=', '%=', '^=',
                '|=', '&=', '^^=',
                '<<=', '>>=', '>>>=', '<<>=', '>><=',
                '..='
            ),
            field('value', $.expression)
        ),
        return_expression: $ => seq(
            "return",
            $.expression
        ),
        table: $ => seq(
            '{',
            repeat(seq(choice($.expression, $.assign_expression), ',')),
            optional(choice($.expression, $.assign_expression)),
            '}'
        ),
        statement: $ => choice(
            $.fn_define,
            $.fn_call,
            $.assign_expression,
            $.for_statement,
            $.while_statement,
            $.if_statement,
            $.repeat_statement,
            $.goto,
            $.label,
        ),
        fn_define: $ => seq(
            'function',
            optional(field('def_name', choice($.variable, '_init', '_update', '_draw'))),
            '(', repeat(seq(field('def_param', $.variable), ',')), optional(field('def_param', $.variable)), ')',
            field('def_body', repeat(choice(
                $.statement,
                $.return_expression
            ))),
            'end'
        ),
        fn_call: $ => prec.left(13, seq(choice(field('fn_name', $.expression), field('builtin', $.builtin)), '(', repeat(seq(field('fn_param', $.expression), ',')), optional(field('fn_param', $.expression)), ')')),
        break: () => 'break',
        goto: $ => seq(
            'goto',
            /\w+/
        ),
        label: () => /::\w+::/,
        for_statement: $ => seq(
            'for',
            choice(
                seq(
                    field('iterator', $.variable),
                    '=',
                    field('start', $.expression),
                    ',',
                    field('end', $.expression),
                    optional(seq(',', field('step', $.expression)))
                ),
                seq(
                    field('iter_index', $.variable),
                    ',',
                    field('iter_value', $.variable),
                    'in',
                    choice('pairs', 'ipairs'),
                    '(', field('table_name', $.expression), ')',
                ),
                seq(
                    field('iterator', $.variable),
                    'in',
                    'all',
                    '(', field('table_name', $.expression), ')',
                ),
            ),
            'do',
            field('for_body', repeat(choice($.statement, $.break))),
            'end',
        ),
        while_statement: $ => seq(
            'while',
            choice(
                seq( // line while
                    '(', field('condition', $.expression), ')',
                    field('while_body', repeat(choice($.statement, $.break))),
                    '\n'
                ),
                seq( // block while
                    field('condition', $.expression),
                    'do',
                    field('while_body', repeat(choice($.statement, $.break))),
                    'end'
                ),
            )
        ),
        if_statement: $ => seq(
            'if',
            choice(
                seq( // block if
                    field('condition', $.expression),
                    'then',
                    field('if_body', repeat($.statement)),
                    optional( // elseif
                        seq(
                            'elseif',
                            field('elseif_condition', $.expression),
                            'then',
                            field('elseif_body', repeat($.statement)),
                        )
                    ),
                    optional(
                        seq(
                            'else',
                            field('else_body', repeat($.statement)),
                        )
                    ),
                    'end'
                ),
                seq( // line if
                    '(', field('condition', $.expression), ')',
                    repeat($.statement),
                    optional(seq(
                            'else',
                            repeat1($.statement)
                    )),
                    '\n'
                )
            )
        ),
        repeat_statement: $ => seq(
            'repeat',
            field('repeat_body', repeat(choice($.statement, $.break))),
            'until',
            field('condition', $.expression)
        ),
        builtin: () => choice(
            'load', 'sspr', 'save', 'ls', 'run', 'stop',
            'assert', 'reset', 'flip', 'printh', 'time', 't',
            'stat', 'extcmd', 'clip', 'pset', 'pget', 'sget',
            'sset', 'fget', 'fset', 'print', 'cursor', 'color',
            'cls', 'camera', 'circ', 'circfill', 'oval', 'ovalfill',
            'line', 'rect', 'rectfill', 'pal', 'palt', 'spr',
            'fillp', 'add', 'del', 'deli', 'count', 'all',
            'foreach', 'pairs', 'btn', 'btnp', 'sfx', 'music',
            'mget', 'mset', 'map', 'tline', 'peek', 'poke',
            'memcpy', 'reload', 'cstore', 'memset', 'max', 'min',
            'mid', 'flr', 'ceil', 'cos', 'sin', 'sqrt',
            'abs', 'rnd', 'srand', 'menuitem', 'tostr', 'tonum',
            'chr', 'ord', 'sub', 'split', 'type', 'cartdata',
            'dget', 'dset', 'setmetatable', 'getmetatable', 'rawset', 'rawget',
            'rawlen', 'cocreate', 'coresume', 'costatus', 'yield', '_init',
            '_update', '_draw', 'ipairs', 'pack', 'unpac', 'next',
            'peek2', 'peek4', 'poke2', 'poke4', 'serial', 'atan2',
            'band', 'bnot', 'bor', 'bxor', 'lshr', 'rotl',
            'rotr', 'sgn', 'shl', 'shr', 'rawequal', 'select',
            'trace',
        ),
        color0: () => '0',
        color1: () => '1',
        color2: () => '2',
        color3: () => '3',
        color4: () => '4',
        color5: () => '5',
        color6: () => '6',
        color7: () => '7',
        color8: () => '8',
        color9: () => '9',
        colora: () => 'a',
        colorb: () => 'b',
        colorc: () => 'c',
        colord: () => 'd',
        colore: () => 'e',
        colorf: () => 'f',
    },

    extras: $ => [
        /\s/,
        $.line_comment_lua,
        $.line_comment_normal,
        $.block_comment
    ],
    conflicts: $ => [
        [$.statement, $.expression],
    ]
});
