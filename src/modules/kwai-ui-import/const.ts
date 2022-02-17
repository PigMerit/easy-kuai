export const kuaiUIFilePath = './node_modules/@ks/kwai-ui/src/index.js';

interface ICodePosition {
    reg: RegExp
    start: number
    end: number
}

export type ICodeLine = {
    [k in 'script' | 'import' | 'kuaiUI' | 'components']: ICodePosition
};
