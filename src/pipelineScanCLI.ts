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
    const cliPath = process.env.RUNNER_OS === 'Windows' ? '../veracode-cli/veracode.exe' : '../veracode-cli/veracode';
    const command = `${cliPath} policy get "${policyName}"`;

    core.info(`Downloading policy: ${policyName}`);
    if (debug == "true") {
      core.info(`Policy download command: ${command}`);
    }

    execSync(command);

    const cwd = process.cwd();
    const files = fs.readdirSync(cwd);

    // Look for policy files (the CLI creates a file/directory with the exact policy name)
    const policyFiles = files.filter((f: string) => f.includes(policyName) || f.includes('Veracode'));
    if (policyFiles.length > 0) {
      const policyFile = policyFiles[0];
      core.info(`Policy downloaded: ${policyFile}`);
      return policyFile;
    }

    throw new Error(`Policy file not found after download`);
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
        pipelineScanCommand += ` --policy-file "${downloadedPolicyFile}"`;
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
        const cliFilteredFile = 'filtered-results.json';
        const filteredFile = parameters.filtered_json_output_file;
        const jsonOutputFile = parameters.json_output_file || 'results.json';

        core.info(`Target filtered results file: ${filteredFile}`);

        // Try to copy CLI's filtered-results.json first
        if (await fs.stat(cliFilteredFile).catch(() => null)) {
          core.info(`Found CLI filtered results file: ${cliFilteredFile}`);
          const resultsData = await fs.readFile(cliFilteredFile, 'utf-8');
          await fs.writeFile(filteredFile, resultsData);
          core.info(`Copied ${cliFilteredFile} to ${filteredFile}`);
        } else {
          // Fallback: copy json_output_file if filtered file doesn't exist
          core.info(`CLI filtered results not found, copying from ${jsonOutputFile}`);
          if (await fs.stat(jsonOutputFile).catch(() => null)) {
            const resultsData = await fs.readFile(jsonOutputFile, 'utf-8');
            await fs.writeFile(filteredFile, resultsData);
            core.info(`Copied ${jsonOutputFile} to ${filteredFile}`);
          } else {
            core.warning(`Neither ${cliFilteredFile} nor ${jsonOutputFile} found`);
          }
        }

        // Verify the file was created
        if (await fs.stat(filteredFile).catch(() => null)) {
          const stats = await fs.stat(filteredFile);
          core.info(`Filtered results file created successfully: ${filteredFile} (${stats.size} bytes)`);
        } else {
          core.warning(`Failed to create filtered results file: ${filteredFile}`);
        }
      } catch (error: any) {
        core.warning(`Failed to create filtered results file: ${error.message}`);
      }
    }
  } catch(error:any) {
    console.log(`Status Code: ${error.status} with '${error.message}'`);
    core.info("Pipeline-scan unable to Scan.")
  }
}
