const fs = require('fs');
import * as vscode from 'vscode';
export const readFile = (filePath:string) => {
    try {
        return fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
    } catch (e) {
        console.error(e);
        return null;
    }
};

export const getContentByReg = (content: string, reg: RegExp) => {
    console.log(content, reg, '2222222');
    if (!content || !reg) {return [];}
    return [...content.matchAll(reg)];
};


interface ISearchParams {
    from?: number
    to?: number
    global?: boolean
}

interface IReturnSearchInfos {
    lineIdx: number
    info: RegExpMatchArray
}
export const serchContentFormText = (text: string, serchReg: RegExp): RegExpMatchArray => {
    // debugger;
    return text.match(serchReg) || [] as RegExpMatchArray;
};

export const serchContentFormDocument = (document: vscode.TextDocument, serchReg: RegExp, searchParams?: ISearchParams) :IReturnSearchInfos[] => {

    const lineCount = document.lineCount;
    const { from = 0, to = lineCount, global = true } = searchParams || { from: 0, to: lineCount, global: true };
    const returnSearchInfos: IReturnSearchInfos[] = [];
    for (let i = from; i < to; i++) {
        const text = document.lineAt(i).text;
        const serchInfo = serchContentFormText(text, serchReg);
        if (serchInfo.length > 0) {
            returnSearchInfos.push({
                lineIdx: i,
                info: serchInfo,
            });
            if (!global) {
                return returnSearchInfos;
            }
        }
    }
    return returnSearchInfos;
};

export const isHasContent = (document: vscode.TextDocument, serchReg: RegExp, searchParams?: ISearchParams): boolean => {
    return serchContentFormDocument(document, serchReg, searchParams).length > 0;
};
// console.log(typeof readFile('./getContent.ts'))
console.log(__dirname, '__dirname');
