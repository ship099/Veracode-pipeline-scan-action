#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPolicyFile = exports.runScan = exports.downloadJar = void 0;
const child_process_1 = require("child_process");
const core = __importStar(require("@actions/core"));
function downloadJar() {
    core.info('Downloading pipeline-scan.jar');
    try {
        var downloadJar = `curl -sSO https://downloads.veracode.com/securityscan/pipeline-scan-LATEST.zip`;
        var getDownloadOutput = (0, child_process_1.execSync)(downloadJar).toString();
        core.info('pipeline-scan.jar downloaded');
    }
    catch (error) {
        core.info(`Status Code: ${error.status} with '${error.message}'`);
    }
    try {
        var unzipJar = 'unzip -o pipeline-scan-LATEST.zip';
        const getUnzipOutput = (0, child_process_1.execSync)(unzipJar).toString();
        core.info('pipeline_scan.jar unzipped');
    }
    catch (error) {
        console.log(`Status Code: ${error.status} with '${error.message}'`);
        core.info("Pipeline-scan-LATEST.zip could not be unzipped.");
    }
}
exports.downloadJar = downloadJar;
function runScan(scanCommand, parameters) {
    if (parameters.debug == 1) {
        core.info('---- DEBUG OUTPUT START ----');
        core.info('---- pipeline-scan.ts / runScan() ----');
        core.info('---- Pipeline-scan scan-command: ' + scanCommand);
        //core.info('Get Policy File Command Output: '+commandOutput)
        core.info('---- DEBUG OUTPUT END ----');
    }
    let commandOutput = '';
    try {
        commandOutput = (0, child_process_1.execSync)(scanCommand).toString();
    }
    catch (ex) {
        core.info("Pipeline-scan command failed.\n" + ex.stdout.toString());
        commandOutput = ex.stdout.toString();
    }
    return commandOutput;
}
exports.runScan = runScan;
function getPolicyFile(scanCommand, parameters) {
    let commandOutput = (0, child_process_1.execSync)(scanCommand);
    if (parameters.debug == 1) {
        core.info('---- DEBUG OUTPUT START ----');
        core.info('---- pipeline-scan.ts / getPolicyFile() ----');
        core.info('---- Pipeline-scan get Policy File command: ' + scanCommand);
        core.info('---- Get Policy File Command Output: ' + commandOutput);
        core.info('---- DEBUG OUTPUT END ----');
    }
    return commandOutput;
}
exports.getPolicyFile = getPolicyFile;
