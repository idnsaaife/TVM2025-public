
export type Expr =
    | NumberExpr
    | VariableExpr
    | BinaryExpr
    | UnaryExpr
    | ParenExpr;

export interface NumberExpr {
    type: "number";
    value: number;
}

export interface VariableExpr {
    type: "variable";
    name: string;
}

export interface BinaryExpr {
    type: "binary";
    operator: "+" | "-" | "*" | "/";
    left: Expr;
    right: Expr;
}

export interface UnaryExpr {
    type: "unary";
    operator: "-";
    operand: Expr;
}

export interface ParenExpr {
    type: "paren";
    expression: Expr;
}
