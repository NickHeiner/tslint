/*
 * Copyright 2013 Palantir Technologies, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export class Rule extends Lint.Rules.AbstractRule {
    public static FAILURE_STRING = "duplicate variable: '";

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new NoDuplicateVariableWalker(sourceFile, this.getOptions()));
    }
}

class NoDuplicateVariableWalker extends Lint.BlockScopeAwareRuleWalker<{}, ScopeInfo> {
    public createScope(): any {
        return null;
    }

    public createBlockScope(): ScopeInfo {
        return new ScopeInfo();
    }

    public visitBindingElement(node: ts.BindingElement) {
        // TODO: handle node.dotdotToken?
        const isSingleVariable = node.name.kind === ts.SyntaxKind.Identifier;
        const isBlockScoped = Lint.isBlockScopedBindingElement(node);

        if (isSingleVariable && !isBlockScoped) {
            this.handleSingleVariableIdentifier(<ts.Identifier> node.name);
        }

        super.visitBindingElement(node);
    }

    public visitCatchClause(node: ts.CatchClause) {
        // don't visit the catch clause variable declaration, just visit the block
        // the catch clause variable declaration has its own special scoping rules
        this.visitBlock(node.block);
    }

    public visitMethodSignature(node: ts.SignatureDeclaration) {
        // don't call super, we don't want to walk method signatures either
    }

    public visitTypeLiteral(node: ts.TypeLiteralNode) {
        // don't call super, we don't want to walk the inside of type nodes
    }

    public visitVariableDeclaration(node: ts.VariableDeclaration) {
        const isSingleVariable = node.name.kind === ts.SyntaxKind.Identifier;

        // destructuring is handled by this.visitBindingElement()
        if (isSingleVariable && !Lint.isBlockScopedVariable(node)) {
            this.handleSingleVariableIdentifier(<ts.Identifier> node.name);
        }

        super.visitVariableDeclaration(node);
    }

    private handleSingleVariableIdentifier(variableIdentifier: ts.Identifier) {
        const variableName = variableIdentifier.text;
        const currentBlockScope = this.getCurrentBlockScope();

        if (currentBlockScope.varNames.indexOf(variableName) >= 0) {
            this.addFailureOnIdentifier(variableIdentifier);
        } else {
            currentBlockScope.varNames.push(variableName);
        }
    }

    private addFailureOnIdentifier(ident: ts.Identifier) {
        const failureString = `${Rule.FAILURE_STRING}${ident.text}'`;
        this.addFailure(this.createFailure(ident.getStart(), ident.getWidth(), failureString));
    }
}

class ScopeInfo {
    public varNames: string[] = [];
}
