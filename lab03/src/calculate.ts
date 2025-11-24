import { MatchResult } from "ohm-js";
import grammar, { ArithmeticActionDict, ArithmeticSemantics } from "./arith.ohm-bundle";

export const arithSemantics: ArithSemantics = grammar.createSemantics() as ArithSemantics;


const arithCalc = {
    AddExp(left: any, ops: any, rights: any) {
        let result = left.calculate(this.args.params);
        for (let i = 0; i < ops.numChildren; i++) {
            const op = ops.child(i).sourceString;
            const right = rights.child(i).calculate(this.args.params);
            if (op === "+") {
                result += right;
            } else {
                result -= right;
            }
        }
        return result;
    },

    MulExp(left: any, ops: any, rights: any) {
        let result = left.calculate(this.args.params);
        for (let i = 0; i < ops.numChildren; i++) {
            const op = ops.child(i).sourceString;
            const right = rights.child(i).calculate(this.args.params);
            if (op === "*") {
                result *= right;
            } else {
                if (right === 0) throw new Error('Division by zero');
                result /= right;
            }
        }
        return result;
    },

    PriExp_neg(_minus, e) { return -e.calculate(this.args.params); },
    PriExp_paren(_l, e, _r) { return e.calculate(this.args.params); },
    PriExp_num(n: any) { return parseInt(n.sourceString, 10); },
    PriExp_id(id) {
        const name = id.sourceString;
        if (!(name in this.args.params)) return NaN;
        return this.args.params[name];
    },

    number(_digits) { return parseInt(this.sourceString, 10); },
    ident(_f, _r) { return 0; },
} satisfies ArithmeticActionDict<number | undefined>;



arithSemantics.addOperation<Number>("calculate(params)", arithCalc);


export interface ArithActions {
    calculate(params: {[name:string]:number}): number;
}

export interface ArithSemantics extends ArithmeticSemantics
{
    (match: MatchResult): ArithActions;
}
