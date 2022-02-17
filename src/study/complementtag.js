const vscode = require('vscode');
const fs = require('fs');
const os = require('os');

module.exports = function (context) {
    let rangeline = 0;
    let rangeCol = 0;

    function provideCompletionItems(document, position) {
        const obj = {};
        const readFile = (fileDir, filter) => {
            const filearr = fs.readdirSync(fileDir);
            filearr.forEach(v => {
                if (fs.statSync(fileDir + '/' + v).isDirectory()) {
                    readFile(fileDir + '/' + v, filter);
                } else {
                    const reg = new RegExp(filter, 'i');
                    if (reg.test(v) && v.substring(v.lastIndexOf('.') + 1) === 'vue' && v.length === filter.length + 4) {
                        obj.name = v.substring(0, v.lastIndexOf('.'));
                        obj.path = fileDir + '/' + v.substring(0, v.lastIndexOf('.'));
                    }
                }
            });
        };

        const getLineNumber = filter => {
            let scriptline = -1;
            for (let i = 0; i < document.lineCount; i++) {
                const str = document.lineAt(i).text;
                if (str.trim().indexOf(filter) !== -1) {
                    scriptline = i;
                    break;
                }
            }
            return scriptline;
        };

        rangeline = position.line;
        rangeCol = position.character;
        let item = document.getText(new vscode.Range(new vscode.Position(rangeline, 0), new vscode.Position(rangeline, rangeCol)));
        item = item.trim();
        item = item.substring(1, item.length - 1);
        item = item.replace(/-/g, '');

        const workspaceFolders = vscode.workspace.workspaceFolders.map(item => item.uri.path);
        const rootpath = workspaceFolders[0];

        readFile(rootpath.substring(1) + '/src', item);

        const scriptline = getLineNumber('<script>');
        console.log(vscode.window.activeTextEditor, 'vscode.window.activeTextEditor');
        vscode.window.activeTextEditor.edit(editBuilder => {
            const text = `import ${obj.name} from '${obj.path.substring(obj.path.indexOf('src'))}'`;
            editBuilder.insert(new vscode.Position(scriptline + 1, 0), text + os.EOL);
            // Find the line of the components character
            const componentsLine = getLineNumber('components');
            if (componentsLine !== -1) {
                const old = document.lineAt(componentsLine).text;
                console.log(old.trim().indexOf('{'));
                console.log('total length ' + old.trim().length - 1);
                // There are components options
                const i = document.lineAt(componentsLine).text.trim().indexOf('components');
                if (i === 0) {
                    if (old.trim().indexOf('{') === old.trim().length - 1) {
                        // Components: {format
                        const text = `${obj.name},${os.EOL}`;
                        editBuilder.insert(new vscode.Position(componentsLine + 1, 0), text);
                    } else {
                        // Components: {}, format
                        const text = old.substring(0, old.length - 2) + ',' + obj.name + '},' + os.EOL;
                        editBuilder.replace(new vscode.Range(new vscode.Position(componentsLine, 0), new vscode.Position(componentsLine + 1, 0)), text);
                    }
                }
            } else {
                // There is no components option
                const text = `components: { ${obj.name} },${os.EOL}`;
                editBuilder.replace(new vscode.Range(new vscode.Position(componentsLine, 0), new vscode.Position(componentsLine + 1, 0)), text);
            }
        });
    }


    function resolveCompletionItem(item) {
        return item;
    }

    context.subscriptions.push(vscode.languages.registerCompletionItemProvider('vue', {
        provideCompletionItems,
        resolveCompletionItem,
    }, '>'));
};
