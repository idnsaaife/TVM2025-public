import { getExprAst } from '../../lab04';
import * as ast from './funny';
import grammar, { FunnyActionDict } from './funny.ohm-bundle';
import { MatchResult, Semantics } from 'ohm-js';

const getFunnyAst = {
    ...getExprAst,

    Module(items) {
        const functions = items.children.map((x: any) => x.parse());
        
        return { type: "module", functions: functions } as ast.Module;
    },


    Function(header, body) {
        const [name, _l1, params, _r1, _returns, returnsList, usesClause] = header.children;
        const parameters = params.asIteration().children.map(x => x.parse() as ast.ParameterDef);
        const returns = returnsList.asIteration().children.map(x => x.parse()) as ast.ParameterDef[];
        const locals = usesClause.children.length
            ? usesClause.child(0).asIteration().children.map((c: any) => c.parse())
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

    // === Формула ===
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


    UsesClause(uses_str, list) {
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

    // === Операторы ===
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

    Conditional(_if, _lp, cond, _rp, thenStmt, _else, elseClause) {
        const elseStmt = elseClause.children.length ? elseClause.child(1).parse() : undefined;
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
        const argNodes = args.children.length > 0 ? args.asIteration().children.map((x: any) => x.parse()) : [];
        const nameStr = name.sourceString;
        return {
            type: "call", name: nameStr, args: argNodes
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

    console.log('Match succeeded, creating AST...');
    return semantics(match).parse();
}
