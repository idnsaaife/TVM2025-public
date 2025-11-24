import type { Expr as BaseExpr} from '../../lab04';

export type Module = {
    type: 'module';
    functions: FunctionDef[];
};

export type FunctionDef = {
    type: 'fun';
    name: string;
    parameters: ParameterDef[];
    returns: ParameterDef[];
    locals: ParameterDef[];
    body: Statement;
};

export type FormulaDef = {
    type: 'formula';
    name: string;
    parameters: ParameterDef[];
    body: Predicate;
};

export type ParameterDef = {
    type: 'param';
    name: string;
    varType: 'int' | 'int[]';
};


export type LValue =
    | { kind: 'var'; name: string }
    | { kind: 'index'; array: string; index: Expr };

export type Statement =
    | AssignmentStmt
    | BlockStmt
    | IfStmt
    | WhileStmt
    | ReturnStmt;  

export type ReturnStmt = {
    type: 'returns';
    values: BaseExpr[];
};

export type AssignmentStmt = {
    type: 'assign';
    lhs: LValue[];        
    rhs: BaseExpr[];          
};

export type BlockStmt = {
    type: 'block';
    statements: Statement[];
};

export type IfStmt = {
    type: 'if';
    condition: Predicate;
    thenBranch: Statement;
    elseBranch?: Statement;
};

export type WhileStmt = {
    type: 'while';
    condition: Predicate;
    invariant?: Predicate;
    body: Statement;
};

export type Predicate = {
    type: 'pred';
    source: string;       
};

export type Expr =
    | BaseExpr
    | CallExpr
    | IndexExpr;

export type CallExpr = {
    type: 'call';
    name: string;      
    args: Expr[];
};

export type IndexExpr = {
    type: 'index';
    array: string;     
    index: Expr;       
};