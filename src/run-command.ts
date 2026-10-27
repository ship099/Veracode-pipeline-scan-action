import * as core from "@actions/core"
import { execSync } from "child_process";
import path from "path";

const runnerOS = process.env.RUNNER_OS;

export async function run_cli(command: string, debug: any, failBuildOnPolicy: boolean, failBuildOnError: boolean, workflowApp: any) {
    if (runnerOS == 'Windows') {
        const appdata = process.env.APPDATA ?? "";
        const cliPathVera = path.join(appdata, 'veracode')
        const cliPath = path.join(cliPathVera, 'veracode.exe');
        core.info(`CLI Path:${cliPath}, Command:${command} `)
        try {
            let curlCommandOutput = execSync(
                `${cliPath} ${command}`,
                { stdio: 'inherit' }
            );

            if (debug == "true") {
                core.info('#### DEBUG START ####')
                core.info('run_command.ts - command output')
                core.info('command output : ' + curlCommandOutput)
                core.info('#### DEBUG END ####')
            }
        }
        catch (error: any) {
            const exitCode = error.status;
            const failBuildOnPolicyBool = String(failBuildOnPolicy).toLowerCase() === "true";
            const failBuildOnErrorBool = String(failBuildOnError).toLowerCase() === "true";
            const workflowAppBool = String(workflowApp).toLowerCase() === "true";

            if (exitCode === 3) {
                const failureMessage = `Veracode static scan completed but policy failed. Exit code: ${exitCode}`;
                if (failBuildOnPolicyBool) {
                    core.setFailed(failureMessage);
                    core.info(`Note: Build failed due to fail_build flag being set to true.`)
                } else {
                    core.warning(failureMessage);
                }
            } else {
                const failureMessage = `Veracode CLI scan failed. Exit code: ${exitCode}, Command: ${command}`;
                if (failBuildOnErrorBool) {
                    core.setFailed(failureMessage);
                    core.info(`Note: Build failed due to fail_build_error flag being set to true.`)
                } else {
                    core.error(failureMessage);
                }
            }
        }
    }
    else {
        let scanCommand = `../veracode-cli/veracode ${command}`
        core.info('Scan command :' + scanCommand)
        try {
            let curlCommandOutput = execSync(scanCommand)

            if (debug == "true") {
                core.info('#### DEBUG START ####')
                core.info('run_command.ts - command output')
                core.info('command output : ' + curlCommandOutput)
                core.info('#### DEBUG END ####')
            }
            core.info(`${curlCommandOutput}`)
        } catch (error: any) {
            console.log(error.stdout.toString())
            console.log(error.stderr.toString())
            const exitCode = error.status;
            const failBuildOnPolicyBool = String(failBuildOnPolicy).toLowerCase() === "true";
            const failBuildOnErrorBool = String(failBuildOnError).toLowerCase() === "true";
            const workflowAppBool = String(workflowApp).toLowerCase() === "true";

            if (exitCode === 3) {
                const failureMessage = `Veracode static scan completed but policy failed. Exit code: ${exitCode}`;
                if (failBuildOnPolicyBool) {
                    core.setFailed(failureMessage);
                    core.info(`Note: Build failed due to fail_build flag being set to true.`)
                } else {
                    core.warning(failureMessage);
                }
            } else {
                const failureMessage = `Veracode CLI scan failed. Exit code: ${exitCode}, Command: ${scanCommand}`;
                if (failBuildOnErrorBool) {
                    core.setFailed(failureMessage);
                    core.info(`Note: Build failed due to fail_build_error flag being set to true.`)
                } else {
                    core.error(failureMessage);
                }
            }
        }
    }
}
