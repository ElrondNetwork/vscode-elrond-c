import * as vscode from 'vscode';
import { Root } from './root';
import { Feedback } from './feedback';
import _ = require('underscore');
import * as sdk from "./sdk";
import { TemplatesViewModel as TemplatesViewModel, ContractTemplate } from './templates';
import * as workspace from "./workspace";
import * as presenter from "./presenter";
import { Environment } from './environment';
import * as errors from './errors';
import { SmartContractsViewModel, SmartContract } from './contracts';
import { Uri } from 'vscode';


export async function activate(context: vscode.ExtensionContext) {
	Feedback.debug("ElrondIDE.activate()");

	Root.ExtensionContext = context;

	let templatesViewModel = new TemplatesViewModel();
	vscode.window.registerTreeDataProvider("contractTemplates", templatesViewModel);
	let contractsViewModel = new SmartContractsViewModel();
	vscode.window.registerTreeDataProvider("smartContracts", contractsViewModel);

	// Phony command, used to activate the extension
	vscode.commands.registerCommand("elrond.initWorkspace", () => { });

	vscode.commands.registerCommand("elrond.installSdk", installSdk);
	vscode.commands.registerCommand("elrond.gotoContract", gotoContract);
	vscode.commands.registerCommand("elrond.buildContract", buildContract);
	vscode.commands.registerCommand("elrond.cleanContract", cleanContract);
	vscode.commands.registerCommand("elrond.refreshTemplates", async () => await refreshViewModel(templatesViewModel));
	vscode.commands.registerCommand("elrond.newFromTemplate", newFromTemplate);
	vscode.commands.registerCommand("elrond.refreshContracts", async () => await refreshViewModel(contractsViewModel));

	initWorkspace();
}

export function deactivate() {
	Feedback.debug("ElrondIDE.deactivate()");
}

async function initWorkspace() {
	if (!workspace.guardIsOpen()) {
		return;
	}

	Environment.set();
	await workspace.setup();
	await sdk.ensureInstalled();
	await workspace.patchLaunchAndTasks();
	await ensureInstalledBuildchains();
}

async function installSdk() {
	try {
		await sdk.reinstall();
	} catch (error) {
		errors.caughtTopLevel(error);
	}
}

async function refreshViewModel(viewModel: any) {
	try {
		await viewModel.refresh();
	} catch (error) {
		errors.caughtTopLevel(error);
	}
}

async function newFromTemplate(template: ContractTemplate) {
	try {
		let parentFolder = workspace.getPath();
		let templateName = template.name;
		let contractName = await presenter.askContractName();

		await sdk.newFromTemplate(parentFolder, templateName, contractName);
		await workspace.patchLaunchAndTasks();
		await ensureInstalledBuildchains();
		vscode.commands.executeCommand("workbench.files.action.refreshFilesExplorer");
	} catch (error) {
		errors.caughtTopLevel(error);
	}
}

async function gotoContract(contract: SmartContract) {
	try {
		let uri = Uri.file(contract.getFolder());
		await vscode.commands.executeCommand("vscode.open", uri);
	} catch (error) {
		errors.caughtTopLevel(error);
	}
}

async function buildContract(contract: SmartContract) {
	try {
		await sdk.buildContract(contract.getFolder());
	} catch (error) {
		errors.caughtTopLevel(error);
	}
}

async function cleanContract(contract: SmartContract) {
	try {
		Feedback.infoModal("Not yet implemented.");
	} catch (error) {
		errors.caughtTopLevel(error);
	}
}

async function ensureInstalledBuildchains() {
	let languages = workspace.getLanguages();
	await sdk.ensureInstalledBuildchains(languages);
}