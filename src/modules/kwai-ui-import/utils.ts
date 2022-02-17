const path = require('path');

import * as vscode from 'vscode';
import { readFile, getContentByReg, serchContentFormDocument, isHasContent } from '../../tools/getContent';
import { kuaiUIFilePath, ICodeLine } from './const';

/* 在工作区中去读取kwaiUIFilePath 获得kwai-ui中的所有组件 */
export const readKwaiUIComponents = (): string[] => {
    const _reg = /import(.*?)from/ig;
    // 根目录
    const workspaceFolders = vscode.workspace.workspaceFolders?.map(item => item.uri.path);
    const _fileData: {
        content: string,
        component: string[],
    } = {
        content: '',
        component: [] as string[],
    };
    for (const folder of workspaceFolders as string[]) {
        const content = readFile(path.resolve(folder, kuaiUIFilePath));
        if (content) {
            _fileData.content = content;
            break;
        }
    }
    if (!_fileData.content) { return []; }
    const matchData = getContentByReg(_fileData.content, _reg);
    _fileData.component = matchData.map(data => {
        return 'Ks' + data[1].trim();
    });
    return _fileData.component || [];
};

/* 寻找一些特殊代码的位置 */
export const searchCodeLine = (document: vscode.TextDocument) => {
    const _codeInLine: ICodeLine = {
        script: {
            reg: /<.*?script.*?>/,
            start: 0,
            end: 0,
        },
        import: {
            reg: /^import.*?/,
            start: 0,
            end: 0,
        },
        kuaiUI: {
            reg: /'@ks\/kwai-ui'/,
            start: 0,
            end: 0,
        },
        components: {
            reg: /components:.*?\{/,
            start: 0,
            end: 0,
        },
    };
    // 获取到script的位置
    const scriptPosition = serchContentFormDocument(document, _codeInLine.script.reg);
    _codeInLine.script.start = scriptPosition[0].lineIdx;
    _codeInLine.script.end = scriptPosition[scriptPosition.length - 1].lineIdx + 1;

    // 获取script中import的位置
    const importPosition = serchContentFormDocument(
        document,
        _codeInLine.import.reg,
        { from: _codeInLine.script.start, to: _codeInLine.script.end },
    );
    if (importPosition.length > 0) {
        _codeInLine.import.start = importPosition[0].lineIdx;
        _codeInLine.import.end = importPosition[importPosition.length - 1].lineIdx + 1;
    } else {
        _codeInLine.import.start = _codeInLine.script.start;
        _codeInLine.import.end = _codeInLine.script.end;
    }

    // 获取 import---@ks/kwai-ui的位置
    const kuaiUIPosition = serchContentFormDocument(
        document,
        _codeInLine.kuaiUI.reg,
        { from: _codeInLine.import.start, to: _codeInLine.import.end },
    );
    if (kuaiUIPosition.length > 0) {
        _codeInLine.kuaiUI.end = kuaiUIPosition[0].lineIdx + 1;
        // 找到最临近的import的位置
        const nearestImport = serchContentFormDocument(
            document,
            _codeInLine.import.reg,
            { from: _codeInLine.import.start, to: _codeInLine.kuaiUI.end },
        );
        _codeInLine.kuaiUI.start = nearestImport[nearestImport.length - 1].lineIdx;
    } else {
        _codeInLine.kuaiUI.end = -1;
    }

    // 获取 components的位置
    const componentsPositon = serchContentFormDocument(
        document,
        _codeInLine.components.reg,
        { from: _codeInLine.script.start, to: _codeInLine.script.end },
    );
    if (componentsPositon.length > 0) {
        _codeInLine.components.start = componentsPositon[0].lineIdx;
        // 找到最临近的}的位置
        const nearestBracket = serchContentFormDocument(
            document,
            new RegExp('}'),
            { from: _codeInLine.components.start, to: _codeInLine.script.end, global: false },
        );
        _codeInLine.components.end = nearestBracket[0].lineIdx + 1;
    } else {
        _codeInLine.components.end = -1;
    }
    return _codeInLine;
};

/* 插入新的import语句 */
export const insertImportCode = (document: vscode.TextDocument, item: vscode.CompletionItem, _codeInLine: ICodeLine) => {
    const label = item.label;
    const initLabel = (label as string).substring(2);
    const insertText = `import { ${initLabel} } from '@ks/kwai-ui';\n`;
    const matchReg = new RegExp(initLabel as string);
    item.additionalTextEdits = item.additionalTextEdits || [];
    // const insertText = text.replace(/\{item\}/ig, label);
    // 判断在什么地方插入
    if (_codeInLine.kuaiUI.end === -1) {
        // 没有@ks/kuai-ui
        item.additionalTextEdits.push(
            vscode.TextEdit.insert(
                new vscode.Position(_codeInLine.script.start + 1, 0), insertText),
        );
    } else if (!isHasContent(document, matchReg, { from: _codeInLine.kuaiUI.start, to: _codeInLine.kuaiUI.end, global: false })) {
        // 有@ks/kuai-ui 但是没有引入这个模块
        if (_codeInLine.kuaiUI.end - _codeInLine.kuaiUI.start > 1) {
            // 非一行引入模式
            item.additionalTextEdits.push(
                vscode.TextEdit.insert(
                    new vscode.Position(_codeInLine.kuaiUI.start + 1, 0), `${initLabel},\n`),
            );
        } else {
            // 一行引入模式
            const matchInfo = serchContentFormDocument(document, /\}.*?@ks\/kwai-ui/, {
                from: _codeInLine.kuaiUI.start, to: _codeInLine.kuaiUI.end, global: false,
            })[0];
            const col = matchInfo?.info.index as number;
            item.additionalTextEdits.push(
                vscode.TextEdit.insert(
                    new vscode.Position(_codeInLine.kuaiUI.start, col - 1), `, ${initLabel}`),
            );
        }
    }
};

/* 插入新的components语句 */
export const insertComponentsCode = (document: vscode.TextDocument, item: vscode.CompletionItem, _codeInLine: ICodeLine) => {
    const label = item.label;
    const initLabel = (label as string).substring(2);
    const insertText = `${label}: ${initLabel}`;
    const matchReg = new RegExp(label as string);
    item.additionalTextEdits = item.additionalTextEdits || [];
    // const insertText = text.replace(/\{item\}/ig, label);
    // 判断在什么地方插入
    if (_codeInLine.components.end === -1) {
        // 没有components
        const [namePosition, decoratorPosition, compositionPosition] = [/name:/, /@Component/, /export\sdefault/].map(reg => {
            return serchContentFormDocument(
                document,
                reg,
                {
                    from: _codeInLine.script.start,
                    to: _codeInLine.script.end,
                    global: false,
                },
            );
        });
        if (namePosition.length > 0) {
            item.additionalTextEdits.push(
                vscode.TextEdit.insert(
                    new vscode.Position(namePosition[0].lineIdx + 1, 0),
                    `components: {${insertText}}`,
                ),
            );
        } else if (decoratorPosition.length > 0) {
            item.additionalTextEdits.push(
                vscode.TextEdit.insert(
                    new vscode.Position(decoratorPosition[0].lineIdx + 1, 0),
                    `components: {${insertText}}`,
                ),
            );
        } else {
            item.additionalTextEdits.push(
                vscode.TextEdit.insert(
                    new vscode.Position(compositionPosition[0]?.lineIdx || 0 + 1, 0),
                    `components: {${insertText}}`,
                ),
            );
        }
    } else if (!isHasContent(document, matchReg, { from: _codeInLine.components.start, to: _codeInLine.components.end, global: false })) {
        // 有components 但是没有引入这个模块
        if (_codeInLine.components.end - _codeInLine.components.start > 1) {
            // 非一行引入模式
            item.additionalTextEdits.push(
                vscode.TextEdit.insert(
                    new vscode.Position(_codeInLine.components.start + 1, 0), `${insertText},\n`),
            );
        } else {
            // 一行引入模式
            const matchInfo = serchContentFormDocument(document, /\}/, {
                from: _codeInLine.components.start, to: _codeInLine.components.end, global: false,
            })[0];
            const col = matchInfo?.info.index as number;
            item.additionalTextEdits.push(
                vscode.TextEdit.insert(
                    new vscode.Position(_codeInLine.components.start, col - 1), `, ${insertText}`),
            );
        }
    }
};
