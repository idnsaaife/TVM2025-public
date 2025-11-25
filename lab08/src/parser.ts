import { getExprAst } from '../../lab04';
import * as ast from './funny';
import grammar, { FunnyActionDict } from './funny.ohm-bundle';
import { MatchResult, Semantics } from 'ohm-js';


const functionInfo = new Map<string, {
    paramCount: number,
    returnCount: number}>();

const getFunnyAst = {

    ...getExprAst,

    Module(items) {
        const functions = items.children.map((x: any) => x.parse());
        const functionParams = new Map<string, number>();
        functions.forEach((func: ast.FunctionDef) => {
            functionInfo.set(func.name, {
                paramCount: func.parameters.length,
                returnCount: func.returns.length
            });
        });

        return { type: "module", functions: functions } as ast.Module;
    },


    UsesClause(_uses, list) {
        return list.parse();
    },

    Function(header, body) {
        const [name, _l1, params, _r1, _returns, returnsList, usesClause] = header.children;
        const parameters = params.children.length > 0
            ? params.child(0).asIteration().children.map(x => x.parse() as ast.ParameterDef)
            : [];
        const returns = returnsList.asIteration().children.map(x => x.parse()) as ast.ParameterDef[];
        const locals = usesClause.children.length > 0
            ? usesClause.child(0).parse()
            : [];
        
        
        return {
            type: 'fun',
            name: name.sourceString,
            parameters,
            returns,
            locals,
            body: body.parse()
        } as ast.FunctionDef;
    },

    FunctionHeader(name, _l1, params, _r1, _returns, returnsList, usesClause) {
        return [name, _l1, params, _r1, _returns, returnsList, usesClause];
    },

    Formula(name, _l, params, _r, _arrow, pred, _semi) {
        const parameters = params.children.length ? params.child(0).parse() : [];
        return {
            type: 'formula',
            name: name.sourceString,
            parameters,
            body: { type: 'pred', source: pred.sourceString }
        } as ast.FormulaDef;
    },

    ParamList(list) {
        const params = list.asIteration().children.map((c: any) => c.parse());
        return params;
    },

    Param(name, _colon, type) {
        return {
            type: 'param',
            name: name.sourceString,
            varType: type.sourceString === 'int[]' ? 'int[]' : 'int'
        } as ast.ParameterDef;
    },

    Block(_open, stmts, _close) {
        return { type: 'block', statements: stmts.children.map(s => s.parse()) } as ast.BlockStmt;
    },

    Assignment_tuple(lhsList, _eq, rhsList, _semi) {
        return {
            type: 'assign',
            lhs: lhsList.parse(),
            rhs: rhsList.parse()
        } as ast.AssignmentStmt;
    },

    Assignment_simple(lhs, _eq, rhs, _semi) {
        return {
            type: 'assign',
            lhs: [lhs.parse()],
            rhs: [rhs.parse()]
        } as ast.AssignmentStmt;
    },

    LValueList(list) {
        return list.asIteration().children.map((c: any) => c.parse());
    },

    ExpList(list) {
        return list.asIteration().children.map((c: any) => c.parse());
    },

    LValue_var(id) {
        return { kind: 'var', name: id.sourceString } as ast.LValue;
    },

    LValue_index(arr, _lb, idx, _rb) {
        return { kind: 'index', array: arr.sourceString, index: idx.parse() } as ast.LValue;
    },

    NonemptyListOf(first, sep, rest) {
        const result = [first.parse()];
        if (rest.children.length > 0) {
            const restItems = rest.asIteration().children.map((child: any) =>
                child.child(1).parse()
            );
            result.push(...restItems);
        }
        return result;
    },

    ListOf(nonemptyList) {
        return nonemptyList.parse();
    },
    
    EmptyListOf() {
        return [];
    },

    Conditional(_if, _lp, cond, _rp, thenStmt, _else, elseClause) {
        const elseStmt = elseClause.children.length ? elseClause.child(0).parse() : undefined;
        return {
            type: 'if',
            condition: { type: 'pred', source: cond.sourceString },
            thenBranch: thenStmt.parse(),
            elseBranch: elseStmt
        } as ast.IfStmt;
    },

    While(_while, _lp, cond, _rp, invOpt, body) {
        const invariant = invOpt.children.length
            ? { type: 'pred', source: invOpt.child(1).sourceString }
            : undefined;
        return {
            type: 'while',
            condition: { type: 'pred', source: cond.sourceString },
            invariant,
            body: body.parse()
        } as ast.WhileStmt;
    },

    FunctionCall(name, _lp, args, _rp) {
        const argNodes = args.children.length > 0 ? args.parse() : [];
        const nameStr = name.sourceString;

        const func = functionInfo.get(nameStr);
        if (func && func.paramCount !== argNodes.length) {
            throw new Error(
                `Argument count mismatch for function '${nameStr}': expected ${func.paramCount}, got ${argNodes.length}`
            );
        }

        argNodes.forEach((arg: any) => {
            if (arg.type === 'call') {
                const calledFunc = functionInfo.get(arg.name);
                if (calledFunc && calledFunc.returnCount !== 1) {
                    throw new Error(
                        `Function '${arg.name}' returns ${calledFunc.returnCount} value(s), but 1 expected in argument`
                    );
                }
            }
        });

        return {
            type: "call",
            name: nameStr,
            args: argNodes
        } as ast.CallExpr;
    },

    ArrayAccess(arr, _lb, idx, _rb) {
        return { type: 'index', array: arr.sourceString, index: idx.parse() };
    },

    ReturnStmt(_return, expList, _semi) {
        return {
            type: 'returns',
            values: expList.parse()
        };
    },

    Exp(e) { return e.parse(); },
    PriExp_num(n) { return { type: 'number', value: parseInt(n.sourceString) }; },
    PriExp_id(id) { return { type: 'variable', name: id.sourceString }; },
    PriExp_paren(_l, e, _r) { return e.parse(); },
    PriExp_neg(_minus, e) { return { type: 'unary', operator: '-', operand: e.parse() }; },

} satisfies FunnyActionDict<any>;

export const semantics = grammar.Funny.createSemantics();
semantics.addOperation('parse()', getFunnyAst);

export interface FunnySemanticsExt extends Semantics {
    (match: MatchResult): { parse(): ast.Module };
}

export function parseFunny(source: string): ast.Module {
    console.log('=== PARSING SOURCE ===');
    console.log(source);

    const match = grammar.Funny.match(source, 'Module');
    
    console.log('Match result:', match.succeeded());
    if (match.failed()) {
        console.log('Match failed at:', match.message);
        throw new SyntaxError(match.message);
    }
    const module = semantics(match).parse();
    console.log('Match succeeded, creating AST...');
    validateFunctionCalls(module);
    return module;
}

function validateFunctionCalls(module: ast.Module) {
    function checkExpr(expr: any): void {
        if (!expr) return;

        if (expr.type === 'call') {
            const func = functionInfo.get(expr.name);

            if (!func) {
                throw new Error(`Call to undeclared function '${expr.name}'`);
            }

            if (func.paramCount !== expr.args.length) {
                throw new Error(
                    `Argument count mismatch for function '${expr.name}': expected ${func.paramCount}, got ${expr.args.length}`
                );
            }

            expr.args.forEach((arg: any) => {
                checkExpr(arg);
                if (arg.type === 'call') {
                    const argFunc = functionInfo.get(arg.name);
                    if (argFunc && argFunc.returnCount !== 1) {
                        throw new Error(
                            `Function '${arg.name}' returns ${argFunc.returnCount} value(s), but 1 expected`
                        );
                    }
                }
            });
        } else if (expr.type === 'index') {
            checkExpr(expr.index);
        } else if (expr.type === 'binary') {
            checkExpr(expr.left);
            checkExpr(expr.right);
        } else if (expr.type === 'unary') {
            checkExpr(expr.operand);
        }
    }

    function checkStmt(stmt: any): void {
        if (!stmt) return;

        if (stmt.type === 'assign') {
            stmt.lhs.forEach((lval: any) => {
                if (lval.kind === 'index') {
                    checkExpr(lval.index);
                }
            });
            stmt.rhs.forEach((expr: any) => checkExpr(expr));
        } else if (stmt.type === 'block') {
            stmt.statements.forEach((s: any) => checkStmt(s));
        } else if (stmt.type === 'if') {
            checkStmt(stmt.thenBranch);
            if (stmt.elseBranch) checkStmt(stmt.elseBranch);
        } else if (stmt.type === 'while') {
            checkStmt(stmt.body);
        } else if (stmt.type === 'returns') {
            stmt.values.forEach((v: any) => checkExpr(v));
        }
    }

    module.functions.forEach(func => {
        checkStmt(func.body);
    });
}