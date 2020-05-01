'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import TextEditor = vscode.TextEditor;
import { sortCustom } from './sortCustom';
import { sortAscending, sortDescending } from './sortOrder';
import { searchEnclosingArray } from './searchEnclosingArray';
import parseArray from './parseArray';
import serializeArray from './serializeArray';

export interface SelectionRange {

	/**
	 * The [range](#Range) of this selection range.
	 */
    range: vscode.Range;

	/**
	 * The parent selection range containing this range. Therefore `parent.range` must contain `this.range`.
	 */
    parent?: SelectionRange;

}


function getFileExtension (filename: string): string {
    const fileSegments = filename.split('.');
    return fileSegments.length > 0 ? fileSegments.pop()! : 'json';
}

// Return value was implemented to improve testability.
function sort(sortFn: (window: typeof vscode.window, workspace: typeof vscode.workspace, array: any[]) => Promise<any[]>): () => Promise<any[]> {
    return () => {
        return new Promise(async (resolve, reject) => {
            const fail = (error: string | Error | string[]) => {
                let errors: string[];
                if (typeof error === 'string') {
                    errors = [error];
                } else if (error instanceof Error) {
                    errors = [error.message];
                } else {
                    errors = error;
                }
                errors.forEach(window.showErrorMessage);
                reject(new Error(errors.join(', ')));
            };
            const window = vscode.window;
            const workspace = vscode.workspace;
            // The code you place here will be executed every time your command is executed
            if (!window.activeTextEditor) {
                fail('No text editor is active');
            } else {
                const editor = window.activeTextEditor as TextEditor;
                const document = editor.document;
                let selection: vscode.Range = editor.selection;
                const cursorPosition = (selection as vscode.Selection).active;
                if (selection.isEmpty) {
                    selection = await searchEnclosingArray(document, editor.selection);
                }
                if (selection.isEmpty) {
                    fail('No active selection and no enclosing array could be found!');
                }

                let text = document.getText(selection);
                const fileExtension = getFileExtension(editor.document.fileName);

                try {
                    let parsedJson = parseArray(text, fileExtension);
                    if (parsedJson.constructor === Array) {
                        const parsedArray = (parsedJson as any[]);
                        sortFn(window, workspace, parsedArray)
                            .then(sortedArray => {
                                const workspaceEdit = new vscode.WorkspaceEdit();
                                const serializedArray = serializeArray(sortedArray, fileExtension,
                                    typeof editor.options.tabSize === 'number' ? editor.options.tabSize : undefined);
                                workspaceEdit.replace(editor.document.uri, selection, serializedArray);
                                workspace.applyEdit(workspaceEdit)
                                    .then(wasSuccess => {
                                        if (wasSuccess) {
                                            // Restore cursor position
                                            editor.selection = new vscode.Selection(cursorPosition, cursorPosition);
                                            window.showInformationMessage('Sucessfully sorted array!');
                                            resolve(sortedArray);
                                        }
                                    });
                            })
                            .catch(error => {
                                fail(error);
                            });
                    } else {
                        fail(`Selection is a ${parsedJson.constructor} not an array.`);
                    }

                } catch (error) {
                    fail(`Cannot parse selection as JSON. Reason: ${error}`);
                }

            }
        });
    };
}

export interface ExtensionApi {
    getGlobalStoragePath: () => string;
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    const ascendingSort = vscode.commands.registerCommand('extension.sortJsonArrayAscending', sort(sortAscending));
    const descendingSort = vscode.commands.registerCommand('extension.sortJsonArrayDescending', sort(sortDescending));
    const customSort = vscode.commands.registerCommand('extension.sortJsonArrayCustom', sort(sortCustom(context)));

    context.subscriptions.push(ascendingSort);
    context.subscriptions.push(descendingSort);
    context.subscriptions.push(customSort);

    return {
        getGlobalStoragePath() {
            return context.globalStoragePath;
        }
    };
}

// this method is called when your extension is deactivated
export function deactivate() {
}