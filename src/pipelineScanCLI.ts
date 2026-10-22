#!/usr/bin/env node
import * as core from "@actions/core"
import { env } from "process";
import { execSync } from "child_process";
import { run_cli } from "./run-command";
import { install_cli } from "./install-cli";

function downloadPolicy(policyName: string, debug: any): string | null {
  try {
    const policyFileName = policyName.replace(/ /g, "_");
    const cliPath = process.env.RUNNER_OS === 'Windows' ? '../veracode-cli/veracode.exe' : '../veracode-cli/veracode';
    const command = `${cliPath} policy get "${policyName}"`;

    core.info(`Downloading policy: ${policyName}`);
    if (debug == "true") {
      core.info(`Policy download command: ${command}`);
    }

    execSync(command);
    core.info(`Policy file downloaded: ${policyFileName}.json`);
    return `${policyFileName}.json`;
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

    if (parameters.results_file || parameters.json_output_file) {
      const resultsFile = parameters.results_file || parameters.json_output_file;
      pipelineScanCommand += ` --results-file ${resultsFile}`;
    }

    if (parameters.summary_output_file) {
      pipelineScanCommand += ` --summary-output ${parameters.summary_output_file}`;
    }

    if (parameters.baseline_file) {
      pipelineScanCommand += ` --baseline-file ${parameters.baseline_file}`;
    }

    if (parameters.fail_on_severity) {
      pipelineScanCommand += ` --fail-on-severity "${parameters.fail_on_severity}"`;
    }

    if (parameters.fail_on_cwe) {
      pipelineScanCommand += ` --fail-on-cwe "${parameters.fail_on_cwe}"`;
    }

    if (parameters.include) {
      pipelineScanCommand += ` --include "${parameters.include}"`;
    }

    if (parameters.app_id) {
      pipelineScanCommand += ` --app-id ${parameters.app_id}`;
    }

    if (parameters.development_stage) {
      pipelineScanCommand += ` --development-stage ${parameters.development_stage}`;
    }

    if (parameters.project_name) {
      pipelineScanCommand += ` --project-name "${parameters.project_name}"`;
    }

    if (parameters.project_ref) {
      pipelineScanCommand += ` --project-ref ${parameters.project_ref}`;
    }

    if (parameters.project_url) {
      pipelineScanCommand += ` --project-url ${parameters.project_url}`;
    }

    if (parameters.timeout) {
      pipelineScanCommand += ` --timeout ${parameters.timeout}`;
    }

    if (parameters.issue_details === "true" || parameters.issue_details === true) {
      pipelineScanCommand += ` --issue-details`;
    }

    if (parameters.json_display === "true" || parameters.json_display === true) {
      pipelineScanCommand += ` --json-display`;
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
