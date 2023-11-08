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
                $.expression,
                $.assign_expression,
                $.return_expression
            ))
        ),
        gfx: $ => seq(
            "__gfx__",
        ),
        _map: () => seq("__map__"),
        _sfx: () => seq("__sfx__"),
        _music: () => seq("__music__"),

        line_comment_lua: () => /--.*/,
        line_comment_normal: () => /\/\/.*/,
        block_comment: () => /--\[\[[\w\s]*\]\]/,
        comment: $ => choice(
            $.line_comment_lua,
            $.line_comment_normal,
            $.block_comment
        ),

        // expression
        variable: () => /[a-zA-Z][0-9a-zA-Z_]*/,
        still_variable: $ => choice(
            $.variable,
            prec.left(13, seq($.still_variable, '.', $.variable)),
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
        fn_call: $ => prec.left(13, seq(field('fn_name', $.expression), '(', repeat(seq(field('fn_param', $.expression), ',')), optional(field('fn_param', $.expression)), ')')),
        unary_expression: $ => choice(
            ...[
                ['-', 11], ['~', 11], ['not', 11], ['@', 11], ['%', 11], ['$', 11],
            ].map(
                ([op, pri]) => prec.right(pri, seq(op, $.expression))
            ),
            prec.left(14, seq('(', $.expression, ')')), // bucket
        ),
        assign_expression: $ => seq(
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
            $.assign_expression,
        ),
        fn_define: $ => seq(
            'function',
            optional(field('def_name', $.variable)),
            '(', repeat(seq(field('def_param', $.variable), ',')), optional(field('def_param', $.variable)), ')',
            field('def_body', repeat(choice(
                $.statement,
                $.return_expression
            ))),
            'end'
        ),

        
    },

    extras: $ => [
        /\s/,
        $.line_comment_lua,
        $.line_comment_normal,
        $.block_comment
    ],
    word: $ => $.variable,
    conflicts: $ => [
    ]
});
