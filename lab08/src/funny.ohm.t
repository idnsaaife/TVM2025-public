Funny <: Arithmetic {
  ident := ~keyword letter alnum*

  keyword = "returns" | "uses" | "if" | "while" | "else" | "invariant" | "return" | "true" | "false" | "not" | "and" | "or" | "forall" | "exists" | "length"
  Module = Function*

  // === Функция ===
  Function = FunctionHeader Statement

  FunctionHeader = ident "(" ParamList ")" "returns" ParamListNonEmpty UsesClause?

  ParamList    = ListOf<Param, ",">
  ParamListNonEmpty = NonemptyListOf<Param, ",">
  UsesClause   = "uses" ParamList

  Param = ident ":" Type
  Type = "int[]" -- array
       | "int"   -- int

  // === Формула ===
  Formula = ident "(" ParamList? ")" "=>" Predicate ";"

  // === Операторы ===
  Statement = Assignment
            | Block
            | Conditional
            | While
            | ReturnStmt

  Assignment = LValueList "=" ExpList ";"   -- tuple
            | LValue "=" Exp ";"           -- simple

  LValueList = ListOf<LValue, ",">
  ExpList   = ListOf<Exp, ",">

  LValue = ident "[" Exp "]" -- index
         | ident              -- var

  Block = "{" Statement* "}"

  Conditional = "if" "(" Condition ")" Statement ("else" Statement)?

  While = "while" "(" Condition ")" InvariantOpt? Statement
  InvariantOpt = "invariant" Predicate

  ReturnStmt = "return" ExpList ";"

  // === Выражения ===
  PriExp 
        += FunctionCall
          | ArrayAccess
          | LengthCall                     

  FunctionCall = ident "(" ArgList ")"
  ArgList      = ListOf<Exp, ",">
  LengthCall   = "length" "(" Exp ")"
  ArrayAccess  = ident "[" Exp "]"

  // === Условия ===
  Condition = ImplyCond

  ImplyCond = OrCond ("->" ImplyCond)?
  OrCond    = AndCond ("or" AndCond)*
  AndCond   = NotCond ("and" NotCond)*
  NotCond   = "not"* AtomCond

  AtomCond = "true"              -- true
           | "false"             -- false
           | Comparison          -- comparison
           | "(" Condition ")"   -- paren

  Comparison = Exp relOp Exp
  relOp = "==" | "!=" | ">=" | "<=" | ">" | "<"

  // === Предикаты ===
  Predicate = ImplyPred

  ImplyPred = OrPred ("->" ImplyPred)?
  OrPred    = AndPred ("or" AndPred)*
  AndPred   = NotPred ("and" NotPred)*
  NotPred   = "not"* AtomPred

  AtomPred = Quantifier          -- quantifier
           | FormulaRef          -- formula_ref
           | "true"              -- true
           | "false"             -- false
           | Comparison          -- comparison
           | "(" Predicate ")"   -- paren

  Quantifier = ("forall" | "exists") "(" Param "|" Predicate ")"
  FormulaRef = ident "(" ArgList? ")"

  space := " " | "\t" | "\n" | "\r" | comment
  comment = "//" (~("\n" | "\r") any)*
}