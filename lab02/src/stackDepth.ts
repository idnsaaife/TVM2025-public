import { ReversePolishNotationActionDict } from "./rpn.ohm-bundle";

export const rpnStackDepth = {
    AddExp(left, right, _plus) {
        const l = left.stackDepth;
        const r = right.stackDepth;
        const out = l.out + r.out - 1;
        const max = Math.max(l.max, l.out + r.max, out);
        return { max, out };
    },
    MulExp(left, right, _times) {
        const l = left.stackDepth;
        const r = right.stackDepth;
        const out = l.out + r.out - 1;
        const max = Math.max(l.max, l.out + r.max, out);
        return { max, out };
    },
    number(_digits) {
        return { max: 1, out: 1 };
      }
} satisfies ReversePolishNotationActionDict<StackDepth>;
export type StackDepth = {max: number, out: number};
