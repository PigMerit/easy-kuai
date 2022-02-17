import * as vscode from 'vscode';
import kwaiImport from '../modules/kwai-ui-import/index';
import translate from '../modules/translate/index';
import { getStatus, setStatus, initStatus } from './const';


let opendExtension: vscode.Disposable[] = [];
export const start = (context: vscode.ExtensionContext) => {
    vscode.commands.executeCommand('easy-kuai.switch');
    switchExtension(context);
};


const openExtension = (context: vscode.ExtensionContext) => {
    opendExtension = [];
    opendExtension.push(...kwaiImport(context));
    opendExtension.push(...translate(context));
    vscode.commands.executeCommand('setContext', 'easy-kuai.isOpen', true);
    vscode.window.showInformationMessage('开启easy-kuai插件 希望能帮助到你');
};

const closeExtension = () => {
    opendExtension.forEach(dis => dis.dispose());
    initStatus();
    vscode.commands.executeCommand('setContext', 'easy-kuai.isOpen', false);
    vscode.window.showInformationMessage('关闭easy-kuai插件 感谢你的使用');
};

const switchExtension = (context: vscode.ExtensionContext) => {
    context.subscriptions.push(vscode.commands.registerCommand('easy-kuai.switch', () => {
        const status = getStatus('main');
        if (!status) {
            openExtension(context);
        } else {
            closeExtension();
        }
        setStatus('main', !status);
    }));
};
