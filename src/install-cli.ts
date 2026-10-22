import * as core from "@actions/core"
import { execSync } from "child_process";
import path from "path";

const runnerOS = process.env.RUNNER_OS;

export function install_cli(parameters: any) {
  try {
    if (runnerOS == 'Windows') {
      const appdata = process.env.APPDATA ?? "";
      const cliPathVera = path.join(appdata, 'veracode')
      const installCommand = `curl -sSO https://downloads.veracode.com/securityscan/veracode-cli-windows.exe && move veracode-cli-windows.exe "${cliPathVera}\\veracode.exe"`;
      core.info(`Installing Veracode CLI on Windows: ${cliPathVera}`)
      execSync(installCommand)
      core.info('Veracode CLI installed successfully')
    } else {
      const installCommand = `curl -sSO https://downloads.veracode.com/securityscan/veracode-cli && chmod +x veracode && mkdir -p ../veracode-cli && mv veracode ../veracode-cli/`;
      core.info(`Installing Veracode CLI on ${runnerOS}`)
      execSync(installCommand)
      core.info('Veracode CLI installed successfully')
    }
  } catch (error: any) {
    core.warning(`Failed to install Veracode CLI: ${error.message}`)
  }
}
