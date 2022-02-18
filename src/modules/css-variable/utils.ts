import { readFile, getContentByReg } from '../../tools/getContent';
import { ICssVariable } from './const';
/* 读取css标量 */
export const readCssVariable = (path:string): ICssVariable[] => {
    const _reg = /(@.*?):.*?(#.*?);/ig;
    const content = readFile(path);
    if (!content) {return [];}
    const matchData = getContentByReg(content, _reg);
    return matchData.map(data => {
        return {
            name: data[1],
            color: data[2],
            path: path.split('/').slice(-3).join('/'),
        };
    });
};
