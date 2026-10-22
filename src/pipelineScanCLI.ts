#!/usr/bin/env node
import * as core from "@actions/core"
import { env } from "process";
import { execSync } from "child_process";
import { run_cli } from "./run-command";
import { install_cli } from "./install-cli";

function downloadPolicy(policyName: string, debug: any): string | null {
  try {
    const path = require('path');
    const fs = require('fs');
    const policyFileName = policyName.replace(/ /g, "_");
    const cliPath = process.env.RUNNER_OS === 'Windows' ? '../veracode-cli/veracode.exe' : '../veracode-cli/veracode';
    const command = `${cliPath} policy get "${policyName}"`;

    core.info(`Downloading policy: ${policyName}`);
    core.info(`Expected policy filename: ${policyFileName}`);
    if (debug == "true") {
      core.info(`Policy download command: ${command}`);
    }

    execSync(command);

    const policyFile = policyFileName;
    const policyFileAbsolute = path.resolve(policyFile);
    const cwd = process.cwd();

    core.info(`Current working directory: ${cwd}`);

    // List files in current directory to see what was created
    const files = fs.readdirSync(cwd);
    core.info(`Files in directory: ${files.join(', ')}`);

    // Look for policy files
    const policyFiles = files.filter((f: string) => f.includes('policy') || f.includes('Veracode'));
    if (policyFiles.length > 0) {
      core.info(`Found potential policy files: ${policyFiles.join(', ')}`);
      return policyFiles[0];
    }

    if (!fs.existsSync(policyFile)) {
      throw new Error(`Policy file not found after download: ${policyFileAbsolute}`);
    }

    core.info(`Policy downloaded: ${policyFileAbsolute}`);
    return policyFile;
  } catch (error: any) {
    core.warning(`Failed to download policy: ${error.message}`);
    return null;
  }
}

export async function pipelineScanCLI(parameters:any) {
  try {
    install_cli(parameters)

    env.VERACODE_API_KEY_ID = parameters.vid
    env.VERACODE_API_KEY_SECRET = parameters.vkey
    env.IS_REPO_TOOLS = 'true'
    if (parameters.trace_id) {
      env.VERACODE_TRACE_ID = parameters.trace_id
    }

    let pipelineScanCommand = `static scan ${parameters.file} --verbose`;

    if (parameters.veracode_policy_name) {
      core.info('Downloading policy from veracode_policy_name parameter');
      const downloadedPolicyFile = downloadPolicy(parameters.veracode_policy_name, parameters.debug);
      if (downloadedPolicyFile) {
        pipelineScanCommand += ` --policy-file ${downloadedPolicyFile}`;
      }
    }

    if (parameters.json_output_file) {
      pipelineScanCommand += ` --results-file ${parameters.json_output_file}`;
    }

    if (parameters.summary_output_file) {
      pipelineScanCommand += ` --summary-output ${parameters.summary_output_file}`;
    }

    await run_cli(pipelineScanCommand, parameters.debug, parameters.fail_build, parameters.fail_build_error, parameters.workflow_app);

    if (parameters.filtered_json_output_file) {
      try {
        const fs = await import('fs/promises');
        const resultsFile = parameters.json_output_file || 'results.json';
        const filteredFile = parameters.filtered_json_output_file;

        core.info(`Creating filtered results file: ${filteredFile}`);
        const resultsData = await fs.readFile(resultsFile, 'utf-8');
        await fs.writeFile(filteredFile, resultsData);
        core.info(`Filtered results file created: ${filteredFile}`);
      } catch (error: any) {
        core.warning(`Failed to create filtered results file: ${error.message}`);
      }
    }
  } catch(error:any) {
    console.log(`Status Code: ${error.status} with '${error.message}'`);
    core.info("Pipeline-scan unable to Scan.")
  }
}
