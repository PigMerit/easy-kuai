

import * as vscode from 'vscode';
import { readCssVariable } from './utils';
import { ICssVariable } from './const';
export default function cssVariable(context: vscode.ExtensionContext): vscode.Disposable[] {

    let cssConsts_cache: ICssVariable[] = [];

    const cssVarible = vscode.commands.registerCommand('easy-kuai.css-var', url => {
        const newConsts = readCssVariable(url.path);
        const cssConsts = cssConsts_cache.filter(v => {
            return !newConsts.find(v_c => v_c.color === v.color);
        });
        cssConsts_cache = newConsts.concat(cssConsts);
    });

    const cssReplace = vscode.commands.registerCommand('easy-kuai.css-replace', (line, variable) => {

        const editor = vscode.window.activeTextEditor as vscode.TextEditor;
        const text = line.text;
        const indexStart = text.indexOf(variable.color);
        const indexEnd = indexStart + variable.color.length;
        editor.edit(editBuilder => {
            if (!editBuilder) { return; }
            editBuilder.replace(
                new vscode.Range(new vscode.Position(line.lineNumber, indexStart), new vscode.Position(line.lineNumber, indexEnd)),
                `${variable.name}`,
            );
        });
    });

    context.subscriptions.push(cssVarible, cssReplace);
    function provideCodeLenses(
        document: vscode.TextDocument,
        token: vscode.CancellationToken):
        vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
        const codelens: vscode.CodeLens[] = [];
        cssConsts_cache.forEach(v_c => {
            const reg = new RegExp(v_c.color, 'g');
            const text = document.getText();
            let matches;
            while ((matches = reg.exec(text)) !== null) {
                const line = document.lineAt(document.positionAt(matches.index).line);
                // const indexOf = line.text.indexOf(matches[0]);
                const range = new vscode.Range(
                    line.lineNumber, 0, line.lineNumber, 0,
                );
                if (range) {
                    const codeLen = new vscode.CodeLens(range, {
                        title: `${v_c.name}(${v_c.path})`,
                        command: 'easy-kuai.css-replace',
                        arguments: [line, v_c],
                    });
                    codelens.push(codeLen);
                }
            }
        });
        return codelens;
    }

    function resolveCodeLens(codeLens: vscode.CodeLens, token: vscode.CancellationToken) {
        return codeLens;
    }
    const CodeLensProvider = vscode.languages.registerCodeLensProvider('vue', {
        provideCodeLenses,
        resolveCodeLens,
    });

    // 返回出来的具有关闭变量提示的函数
    const cssVariableLens = {
        dispose: () => {
            cssConsts_cache = [];
            CodeLensProvider?.dispose();
        },
    };
    return [cssVarible, cssVariableLens, cssReplace];
}
