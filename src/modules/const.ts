export const BD_ACCOUNT_INFO = {
    appid: 20220213001081896,
    salt: 'easy-kuai',
    key: '97GowSLeGhwt3U11WAxE',
};

interface IExtensionStatus {
    'main':boolean,
    'kwai-ui-import': boolean,
    'translate-en2cn': boolean,
}

const EXTENSIONSTATUS = {
    main: false,
    'kwai-ui-import': false,
    'translate-en2cn': false,
};
export const getStatus = (p: keyof IExtensionStatus):boolean => {
    return EXTENSIONSTATUS[p];
};
export const setStatus = (p: keyof IExtensionStatus, value:boolean) => {
    EXTENSIONSTATUS[p] = value;
};
export const initStatus = () => {
    Object.keys(EXTENSIONSTATUS).forEach(key => {
        setStatus(key as keyof IExtensionStatus, false);
    });
};
