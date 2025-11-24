import { MatchResult } from 'ohm-js';
import { arithGrammar, ArithmeticActionDict, ArithmeticSemantics, SyntaxError } from '../../lab03';
import { Expr } from './ast';


export const getExprAst: ArithmeticActionDict<Expr> = {
    Exp(e) {
        return e.parse();
    },

    AddExp(left, ops, rights) {
        let expr: Expr = left.parse();

        for (let i = 0; i < ops.numChildren; i++) {
            const op = ops.child(i).sourceString as "+" | "-";
            const right = rights.child(i).parse();
            expr = { type: "binary", operator: op, left: expr, right }
        }
        return expr;
    },

    MulExp(left, ops, rights) {
        let expr: Expr = left.parse();

        for (let i = 0; i < ops.numChildren; i++) {
            const op = ops.child(i).sourceString as "*" | "/";
            const right = rights.child(i).parse();
            expr = { type: "binary", operator: op, left: expr, right }
        }
        return expr;
    },

    PriExp_neg(_minus, e) {
        return { type: "unary", operator: "-", operand: e.parse() };
    },

    PriExp_paren(_l, e, _r) {
        return { type: "paren", expression: e.parse() };
    },

    PriExp_num(n) {
        return { type: "number", value: parseInt(n.sourceString, 10) };
    },

    PriExp_id(id) {
        return { type: "variable", name: id.sourceString };
    },

    number(_digits) {
        return { type: "number", value: parseInt(this.sourceString, 10) };
    },

    ident(_f, _r) {
        return { type: "variable", name: this.sourceString };
    },
}




export const semantics = arithGrammar.createSemantics();
semantics.addOperation("parse()", getExprAst);

export interface ArithSemanticsExt extends ArithmeticSemantics
{
    (match: MatchResult): ArithActionsExt
}

export interface ArithActionsExt 
{
    parse(): Expr
}
export function parseExpr(source: string): Expr
{
    const match = arithGrammar.match(source);
    if (match.failed()) throw new SyntaxError(match.message);
    return semantics(match).parse();
}


    
