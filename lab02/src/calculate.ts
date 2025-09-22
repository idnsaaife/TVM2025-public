import { ReversePolishNotationActionDict } from "./rpn.ohm-bundle";

export const rpnCalc = {
    AddExp(left, right, _plus){
        return left.calculate() + right.calculate();
    },

    MulExp(left, right, _times){
        return left.calculate() * right.calculate();
    },

    number(digits){
        return parseInt(digits.sourceString, 10);
    }
} satisfies ReversePolishNotationActionDict<number>;
