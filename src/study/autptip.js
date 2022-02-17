const vscode = require('vscode');
const fs = require('fs');
module.exports = function (context) {
    let rangeline = 0;
    let rangeCol = 0;

    /**
   *Only single folder is supported!
   * @param {*} document
   * @param {*} position
   */
    function provideCompletionItems(document, position) {
        const arr = [];
        // Recursive search for component name
        const readFile = (fileDir, filter) => {
            const filearr = fs.readdirSync(fileDir);
            filearr.forEach(v => {
                if (fs.statSync(fileDir + '/' + v).isDirectory()) {
                    readFile(fileDir + '/' + v, filter);
                } else if (v.indexOf(filter) !== -1 && v.substring(v.lastIndexOf('.') + 1) === 'vue') {
                    arr.push(v.substring(0, v.lastIndexOf('.')));
                }
            });
        };

        // Find the line where the cursor is
        const line = document.lineAt(position);
        const lineText = line.text.substring(0, position.character);
        rangeline = position.line;
        rangeCol = position.character;
        const workspaceFolders = vscode.workspace.workspaceFolders.map(item => item.uri.path);
        // Root found
        const rootpath = workspaceFolders[0];
        // Recursively looking for Vue file in SRC directory
        readFile(rootpath.substring(1) + '/src', lineText.substring(lineText.indexOf('<') + 1));
        // Return all Vue files
        return arr.map(v => {
            return new vscode.CompletionItem(v, vscode.CompletionItemKind.Field);
        });
    }


    function resolveCompletionItem(item) {
    // Process the Vue file name into the form of xxx xxx
        let content = item.label[0].toLowerCase() + item.label.substring(1);
        content = content.replace(/[A-Z]/g, text => {
            return `-${text.toLowerCase()}`;
        });
        item.insertText = content;
        return item;
    }

    context.subscriptions.push(vscode.languages.registerCompletionItemProvider('vue', {
        provideCompletionItems,
        resolveCompletionItem,
    }, '<')); // trigger the suggested key
};
