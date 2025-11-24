import { Expr } from "./ast";

function precedence(expr: Expr): number {
    switch (expr.type) {
        case "number":
        case "variable":
            return 4;
        case "unary":
            return 3;
        case "binary":
            return (expr.operator === "/") || (expr.operator === "*") ? 2 : 1;
        case "paren":
            return precedence(expr.expression);
        default:
            return 0;
    }
}

function needParen(expr: Expr, bigExpr: Expr | null, isRight: boolean): boolean {
    if (!bigExpr) return false;

    const exprPrec = precedence(expr);
    const bigExprPrec = precedence(bigExpr);

    if (exprPrec < bigExprPrec) {
        return true;
    }

    if (exprPrec > bigExprPrec) {
        return false;
    }

    if (bigExpr.type === "binary") {
        const op = bigExpr.operator;
        if (op === '/' || op === '-') {
            return isRight;
        }
    }
    return false;
}

export function printExpr(e: Expr, isRight = false): string {
    switch (e.type) {
        case "number":
            return e.value.toString();
        case "variable":
            return e.name;
        case "unary":
            return "-" + printExpr(e.operand);
        case "binary": {
            const left = e.left;
            const right = e.right;

            const leftStr = needParen(left, e, false)
                ? `(${printExpr(left, false)})`
                : printExpr(left, false);

            const rightStr = needParen(right, e, true)
                ? `(${printExpr(right, true)})`
                : printExpr(right,  true);

            return `${leftStr} ${e.operator} ${rightStr}`;
        }
        case "paren":
            return printExpr(e.expression, isRight);
        default:
            throw new SyntaxError("Unknown Expr type");
    }
}
