import * as vscode from 'vscode';
import { LANGUAGE } from './const';
import { getStatus, setStatus } from '../const';
import { translateAllSelect, setHoverProvider } from './utils';
export default function translate(context: vscode.ExtensionContext): vscode.Disposable[] {
    /* 汉译英 */
    const translate_CN2EN = vscode.commands.registerCommand('easy-kuai.CN2EN', async () => {
        const editor = vscode.window.activeTextEditor as vscode.TextEditor;
        const allSelections = editor.selections;
        const allSelectionsText = editor.selections.map(select => editor.document.getText(select));
        if (!allSelectionsText || allSelectionsText.length <= 0) { return; }
        const translatedText = await translateAllSelect(allSelectionsText, editor, LANGUAGE.CHINESE);
        editor.edit(editBuilder => {
            if (!editBuilder) { return; }
            translatedText.forEach((insertText, idx) => {
                editBuilder.insert(new vscode.Position(allSelections[idx].anchor.line + 1, 0), `${insertText}\n`);
            });
        });
    });

    /* 英译汉 */
    let hoverProviderDisposable: vscode.Disposable | undefined;
    const translate_EN2CN = vscode.commands.registerCommand('easy-kuai.EN2CN', () => {
        const status = getStatus('translate-en2cn');
        if (status) {
            hoverProviderDisposable?.dispose();
        } else {
            hoverProviderDisposable = setHoverProvider();
        }
        setStatus('translate-en2cn', !status);
    });

    // 返回出来的具有关闭英译汉功能的函数
    const translate_Hover = {
        dispose: () => {
            hoverProviderDisposable?.dispose();
        },
    };
    context.subscriptions.push(translate_CN2EN, translate_EN2CN);
    return [translate_Hover, translate_CN2EN, translate_EN2CN];
}
