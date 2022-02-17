
import * as vscode from 'vscode';
import { LANGUAGE, tranlateOrigin } from './const';
import { BD_ACCOUNT_INFO } from '../const';
const md5 = require('md5-node');
const request = require('request');
/* 判断是中文还是英文 */
export const getTextLanguage = (text:string):LANGUAGE => {
    const CNRegexp = new RegExp('[\u4E00-\u9FA5]+');
    const ENRegexp = new RegExp('[A-Za-z]+');
    const isHasCN = CNRegexp.test(text);
    const isHasEN = ENRegexp.test(text);
    if (isHasCN && !isHasEN) {return LANGUAGE.CHINESE;}
    if (!isHasCN && isHasEN) {return LANGUAGE.ENGLISH;}
    return LANGUAGE.UNKNOW;
};

export const tanslateCode = async (text:string, type:LANGUAGE):Promise<string> => {
    const { appid, salt, key } = BD_ACCOUNT_INFO;
    const sign = md5(appid + text + salt + key);

    const params = {
        q: text,
        from: type,
        to: type === LANGUAGE.CHINESE ? LANGUAGE.ENGLISH : LANGUAGE.CHINESE,
        appid,
        salt,
        sign,
        dict: 0,
    };
    const transResult:string[] = await new Promise((resolve, reject) => {
        // request请求的时候会自动将qs中的内容做urlencode处理
        request.get(tranlateOrigin, {
            qs: {
                ...params,
            },
        }, (err, res, body) => {
            if (err) {
                reject(err);
            }
            if (!body) {return resolve(['']);}
            const returnData = JSON.parse(body);
            const resultData = returnData?.trans_result?.map(data => decodeURI(data.dst));
            return resolve(resultData);
        });
    });

    return transResult.join('、');
};

export const translateAllSelect = async (selections: string[], editor:vscode.TextEditor, type:LANGUAGE) => {
    const translatedText: string[] = [];
    for (let i = 0; i < selections.length; i++) {
        const translateResult = await tanslateCode(selections[i], type);
        translatedText.push(translateResult);
    }
    return translatedText;
};

export const setHoverProvider = () => {
    return vscode.languages.registerHoverProvider(
        '*',
        new class implements vscode.HoverProvider {
            async provideHover(
                _document: vscode.TextDocument,
                _position: vscode.Position,
                _token: vscode.CancellationToken,
            ): Promise<vscode.Hover | null | undefined> {
                const editor = vscode.window.activeTextEditor as vscode.TextEditor;
                let allSelectionsText = editor.selections
                    .map(select => editor.document.getText(select))
                    .filter(select => !!select);
                if (!allSelectionsText || allSelectionsText.length <= 0) {
                    const wordsPostion = _document.getWordRangeAtPosition(_position);
                    allSelectionsText = [_document.getText(wordsPostion)];
                }
                const translatedText = await translateAllSelect(allSelectionsText, editor, LANGUAGE.ENGLISH);
                return new vscode.Hover(translatedText);
            }
        }(),
    );
};
