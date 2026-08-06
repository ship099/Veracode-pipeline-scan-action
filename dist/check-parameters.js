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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkParameters = void 0;
const core = __importStar(require("@actions/core"));
const pipeline_scan_1 = require("./pipeline-scan");
const axios_1 = __importDefault(require("axios"));
const auth = __importStar(require("./auth"));
//import { calculateAuthorizationHeader } from './veracode-hmac'
function checkParameters(parameters) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        if (parameters.debug == 1) {
            core.info('---- DEBUG OUTPUT START ----');
            core.info('---- check-parameters.ts / checkParameters() ----');
            core.info('---- ' + JSON.stringify(parameters));
            core.info('---- DEBUG OUTPUT END ----');
        }
        let scanCommand = 'java -jar pipeline-scan.jar -vid ' + parameters.vid + ' -vkey ' + parameters.vkey;
        let policyCommand = "";
        if (parameters.veracode_policy_name != "") {
            core.info('Veracode Policy evaluation is required');
            core.info('Check the region to select the correct platform');
            if (parameters.vid.startsWith('vera01ei-')) {
                var apiUrl = 'api.veracode.eu';
                var cleanedID = (_b = (_a = parameters.vid) === null || _a === void 0 ? void 0 : _a.replace('vera01ei-', '')) !== null && _b !== void 0 ? _b : '';
                var cleanedKEY = (_d = (_c = parameters.vkey) === null || _c === void 0 ? void 0 : _c.replace('vera01es-', '')) !== null && _d !== void 0 ? _d : '';
                core.info('Region: EU');
            }
            else {
                var apiUrl = 'api.veracode.com';
                var cleanedID = parameters.vid;
                var cleanedKEY = parameters.vkey;
                core.info('Region: US');
            }
            core.info('Check whether a built-in or a custom policy is required');
            const uriPath = '/appsec/v1/policies';
            const queryparams = '?name=' + encodeURIComponent(parameters.veracode_policy_name);
            const path = uriPath + queryparams;
            const appUrl = apiUrl + uriPath + queryparams;
            //const headers = {'Authorization':auth.generateHeader(appUrl, 'GET', apiUrl, cleanedID, cleanedKEY)}
            core.info('---- DEBUG OUTPUT START ----');
            core.info('---- check-parameters.ts / checkParameters() - if veracode_policy_name is set - show parameters ----');
            core.info('---- Response Data ----');
            core.info('---- URI Path: ' + uriPath);
            core.info('---- Query Params: ' + queryparams);
            core.info('---- Path: ' + path);
            core.info('---- App Url: ' + appUrl);
            core.info('---- DEBUG OUTPUT END ----');
            //        try {
            const response = yield axios_1.default.request({
                method: 'GET',
                headers: {
                    'Authorization': auth.generateHeader(path, 'GET', apiUrl, cleanedID, cleanedKEY),
                },
                url: 'https://' + apiUrl + uriPath + queryparams
            });
            if (parameters.debug == 1) {
                core.info('---- DEBUG OUTPUT START ----');
                core.info('---- check-parameters.ts / checkParameters() - find the policy via API----');
                core.info('---- Response Data ----');
                core.info(JSON.stringify(response.data));
                core.info('---- DEBUG OUTPUT END ----');
            }
            if (response.data.page.total_elements != '0') {
                if (response.data._embedded.policy_versions[0].type == 'BUILTIN') {
                    core.info('Built-in Policy is required');
                    core.info('Setting policy to ' + parameters.veracode_policy_name);
                    scanCommand += ' --policy_name "' + parameters.veracode_policy_name + '"';
                }
                else if (response.data._embedded.policy_versions[0].type == 'CUSTOMER') {
                    core.info('Custom Policy is required');
                    core.info('Downloading custom policy file and setting policy to ' + parameters.veracode_policy_name);
                    policyCommand = 'java -jar pipeline-scan.jar -vid ' + parameters.vid + ' -vkey ' + parameters.vkey + ' --request_policy "' + parameters.veracode_policy_name + '"';
                    const policyDownloadOutput = yield (0, pipeline_scan_1.getPolicyFile)(policyCommand, parameters);
                    if (parameters.debug == 1) {
                        core.info('---- DEBUG OUTPUT START ----');
                        core.info('---- check-parameters.ts / checkParameters() - if veracode_policy_name is set and custom policy is required ----');
                        core.info('---- Policy Download command: ' + policyCommand);
                        core.info('---- Policy Downlaod Output: ' + policyDownloadOutput);
                        core.info('---- DEBUG OUTPUT END ----');
                    }
                    var policyFileName = parameters.veracode_policy_name.replace(/ /gi, "_");
                    core.info('Policy Filen Name: ' + policyFileName);
                    scanCommand += " --policy_file " + policyFileName + ".json";
                }
            }
            else if (response.data.page.total_elements == undefined) {
                core.info('Something went wrong with fetching the correct policy');
            }
            else {
                core.info('NO POLICY FOUND - NO POLICY WILL BE USED TO RATE FINDINGS');
            }
            /*
                    } catch (err: any) {
                        core.info('---- DEBUG OUTPUT START ----')
                        core.info('---- check-parameters.ts / checkParameters() - find policy via API catch error ----')
                        core.info('---- Response Data ----')
                        core.info(err.response)
                        core.info('---- DEBUG OUTPUT END ----')
                        console.error(err.response);
                    }
            */
        }
        //this will go away in thex version of the action, function is deprecated - start
        if (parameters.request_policy != "") {
            core.info('Policy file download required');
            policyCommand = 'java -jar pipeline-scan.jar -vid ' + parameters.vid + ' -vkey ' + parameters.vkey + ' --request_policy "' + parameters.request_policy + '"';
            const policyDownloadOutput = yield (0, pipeline_scan_1.getPolicyFile)(policyCommand, parameters);
            if (parameters.debug == 1) {
                core.info('---- DEBUG OUTPUT START ----');
                core.info('---- check-parameters.ts / checkParameters() - if request policy == true ----');
                core.info('---- Policy Download command: ' + policyCommand);
                core.info('---- Policy Downlaod Output: ' + policyDownloadOutput);
                core.info('---- DEBUG OUTPUT END ----');
            }
            var policyFileName = parameters.request_policy.replace(/ /gi, "_");
            core.info('Policy Filen Name: ' + policyFileName);
            scanCommand += " --policy_file " + policyFileName + ".json";
        }
        //this will go away in thex version of the action, function is deprecated - end
        core.info('create pipeline-scan scan command');
        Object.entries(parameters).forEach(([key, value], index) => {
            if (key != 'vid' && key != 'vkey' && key != 'run_method' && key != 'request_policy' && key != 'veracode_policy_name' && key != 'artifact_name' && key != 'esd' && value != "") {
                if (parameters.debug == 1) {
                    core.info('---- DEBUG OUTPUT START ----');
                    core.info('---- check-parameters.ts / checkParameters() - run full scan----');
                    core.info('---- Parameter: ' + key + ' value: ' + value);
                    core.info('---- DEBUG OUTPUT END ----');
                }
                if (key != "debug" && key != "store_baseline_file" && key != "store_baseline_file_branch" && key != "create_baseline_from" && key != "fail_build" && key != "esd") {
                    if (key == "include") {
                        scanCommand += " --" + key + " '" + value + "'";
                    }
                    else {
                        scanCommand += " --" + key + " " + value;
                    }
                }
                if (parameters.debug == 1) {
                    core.info('---- DEBUG OUTPUT START ----');
                    core.info('---- check-parameters.ts / checkParameters() - run full scan----');
                    core.info('---- Pipeline Scan Command: ' + scanCommand);
                    core.info('---- DEBUG OUTPUT END ----');
                }
            }
        });
        // Add ESD parameter if enabled
        if (parameters.esd == "true" || parameters.esd == true) {
            scanCommand += ' -esd true';
            if (parameters.debug == 1) {
                core.info('---- DEBUG OUTPUT START ----');
                core.info('---- check-parameters.ts / checkParameters() - ESD enabled ----');
                core.info('---- Added -esd true to scan command');
                core.info('---- DEBUG OUTPUT END ----');
            }
        }
        if (parameters.debug == 1) {
            core.info('---- DEBUG OUTPUT START ----');
            core.info('---- check-parameters.ts / checkParameters() - return value ----');
            core.info('---- Pipeline Scan Command: ' + scanCommand);
            core.info('---- DEBUG OUTPUT END ----');
        }
        return scanCommand;
    });
}
exports.checkParameters = checkParameters;
