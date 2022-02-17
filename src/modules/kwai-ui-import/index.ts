

import * as vscode from 'vscode';
import { readKwaiUIComponents, searchCodeLine, insertImportCode, insertComponentsCode } from './utils';
import { getStatus } from '../const';

export default function kwaiImport(context: vscode.ExtensionContext): vscode.Disposable[] {

    // 读取kwai-ui 所有组件
    const kwaiUIcomponents = readKwaiUIComponents();
    function provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
        const codeInLine = searchCodeLine(document);
        if (kwaiUIcomponents.length < 1) {return [];}
        return kwaiUIcomponents.map(v => {
            const item = new vscode.CompletionItem(v, vscode.CompletionItemKind.Field);
            insertImportCode(document, item, codeInLine);
            insertComponentsCode(document, item, codeInLine);
            item.insertText = '';
            return item;
        });

    }
    function resolveCompletionItem(item) {
        return item;
    }
    const autoCompletion = vscode.languages.registerCompletionItemProvider('vue', {
        provideCompletionItems,
        resolveCompletionItem,
    }, '>');
    context.subscriptions.push(autoCompletion);
    return [autoCompletion];
}
