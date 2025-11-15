// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';


class Intricodecontroller implements vscode.TreeDataProvider<vscode.TreeItem> {
    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
		return element;
	}
	getChildren(element?: vscode.TreeItem): Thenable<vscode.TreeItem[]> {	
		if (element) {
			return Promise.resolve([]);
		}
		const add = this.createButton(
			"新增",
			"intricode.add",
			new vscode.ThemeIcon("add")
		);
		const remove = this.createButton(
			"刪除",
			"intricode.delete",
			new vscode.ThemeIcon("trash")
		);
		const search = this.createButton(
			"查詢",
			"intricode.search",
			new vscode.ThemeIcon("search")
		);
		const change = this.createButton(
			"修改",
			"intricode.change",
			new vscode.ThemeIcon("edit")
		);
		return Promise.resolve([add, remove, search, change]);
	}
	private createButton(
		label: string,
		command: string,
		icon: vscode.ThemeIcon
	): vscode.TreeItem {
		const button = new vscode.TreeItem(label);
		button.command = {
			command: command,
			title: label
		};
		button.iconPath = icon;
		return button;
	}
}

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "intricode" is now active!');

	const disposable = vscode.commands.registerCommand('intricode.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from Intricode!');
	});

    vscode.window.registerTreeDataProvider('intricode', new Intricodecontroller());

	const addDisposable = vscode.commands.registerCommand('intricode.add', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('沒找到已開啟的檔案');
			return;
		}
		
		const textToAdd = await vscode.window.showInputBox({
			prompt: '輸入要加入檔案中的文字',
			placeHolder: '要加入的文字'
		});

		if (!textToAdd) {
			return;
		}

		await editor.edit(editBuilder => {
			const position = editor.selection.active;
			editBuilder.insert(position, textToAdd);
		});

		vscode.window.showInformationMessage(`成功新增文字: "${textToAdd}"`);
	});

	const deleteDisposable = vscode.commands.registerCommand('intricode.delete', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('沒找到已開啟的檔案');
			return;
		}

		const textToDelete = await vscode.window.showInputBox({
            prompt: '輸入要刪除檔案中的文字',
            placeHolder: '要刪除的文字'
        });

		if (!textToDelete) {
            return;
        }

		const document = editor.document;
        const fullText = document.getText();
        const regex = new RegExp(textToDelete.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        const matches = [...fullText.matchAll(regex)];

		if (matches.length === 0) {
            vscode.window.showInformationMessage('查無結果');
            return;
        }

		await editor.edit(editBuilder => {
            for (const match of matches.reverse()) {
                const startPos = document.positionAt(match.index);
                const endPos = document.positionAt(match.index + match[0].length);
                editBuilder.delete(new vscode.Range(startPos, endPos));
            }
        });

		vscode.window.showInformationMessage(`刪除了 ${matches.length} "${textToDelete} 次`);
	});

	const searchDisposable = vscode.commands.registerCommand('intricode.search', async () => {
    	const editor = vscode.window.activeTextEditor;
    	if (!editor) {
        	vscode.window.showWarningMessage('請先打開一個檔案');
        	return;
    	}

    	const query = await vscode.window.showInputBox({ prompt: '輸入要查詢的文字或句子' });
    	if (!query) {
			return;
		}
    	const text = editor.document.getText();
	    const lines = text.split(/\r?\n/);
    	const results = lines
        	.map((line, idx) => ({ line: idx, text: line }))
        	.filter(l => l.text.toLowerCase().includes(query.toLowerCase()));

    	if (results.length === 0) {
        	vscode.window.showInformationMessage('查無結果');
    	} else {
        	vscode.window.showInformationMessage(
            	results.map(r => `第 ${r.line + 1} 行: ${r.text}`).join('\n')
        	);
    	}
    });

	const changeDisposable = vscode.commands.registerCommand('intricode.change', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('沒找到已開啟的檔案');
			return;
		}

		const textToFind = await vscode.window.showInputBox({
			prompt: '輸入檔案中要被修改的文字',
			placeHolder: '要被修改的文字'
		});

		if (!textToFind) {
			return;
		}

		const textToReplace = await vscode.window.showInputBox({
			prompt: '輸入取代它的文字',
			placeHolder: '取代它的文字'
		});

		if (textToReplace === undefined) {
			return;
		}

		const document = editor.document;
        const fullText = document.getText();
		const regex = new RegExp(textToFind.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
		const matches = [...fullText.matchAll(regex)];

		if (matches.length === 0) {
            vscode.window.showInformationMessage('No matching text found.');
            return;
        }

		await editor.edit(editBuilder => {
			for (const match of matches.reverse()) {
				const startPos = document.positionAt(match.index);
				const endPos = document.positionAt(match.index + match[0].length);
				editBuilder.replace(new vscode.Range(startPos, endPos), textToReplace);
			}
		});
		vscode.window.showInformationMessage(`成功將 ${matches.length} 個 "${textToFind}" 修改為 "${textToReplace}"`);
	});

	context.subscriptions.push(addDisposable, disposable, deleteDisposable, searchDisposable, changeDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
