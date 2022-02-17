import * as vscode from 'vscode';
import { start } from './modules/index';

export function activate(context: vscode.ExtensionContext) {
    start(context);
    console.log('Congratulations, your extension "autotip" is now active!');
}


// this method is called when your extension is deactivated
export function deactivate() {
    //
}
