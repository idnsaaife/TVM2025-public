import { Dict, MatchResult, Semantics } from "ohm-js";
import grammar, { AddMulActionDict } from "./addmul.ohm-bundle";

export const addMulSemantics: AddMulSemantics = grammar.createSemantics() as AddMulSemantics;


const addMulCalc = {
    // Exp(e) {
    //     return e.calculate();
    // }, 
    AddExp(x, _plus, y) {
        return x.calculate() + (y.numChildren > 0 
            ? y.children[0].calculate()
            : 0);
    }, 
    MulExp(x, _times, y) {
        return x.calculate() * (y.numChildren > 0
            ? y.children[0].calculate()
            : 1);
    },
    PriExp_paren(_open, e, _close) {
        return e.calculate();
    },
    number(_digits) {
        return parseInt(this.sourceString, 10);
    },
} satisfies AddMulActionDict<number>

addMulSemantics.addOperation<Number>("calculate()", addMulCalc);

interface AddMulDict  extends Dict {
    calculate(): number;
}

interface AddMulSemantics extends Semantics
{
    (match: MatchResult): AddMulDict;
}
