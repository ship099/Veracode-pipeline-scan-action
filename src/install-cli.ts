import * as core from "@actions/core"
import { execSync } from "child_process";

const runnerOS = process.env.RUNNER_OS;

export async function install_cli(parameters: any) {
  try {
    if (runnerOS == 'Windows') {
      const psCommand = `Set-ExecutionPolicy AllSigned -Scope Process -Force; iex ((New-Object System.Net.WebClient).DownloadString('https://tools.veracode.com/veracode-cli/install.ps1'))`
      core.info('Installing Veracode CLI on Windows')
      execSync(`powershell.exe -NoProfile -Command "${psCommand}"`, { stdio: 'inherit' })
      core.info('Veracode CLI installed successfully')
    } else {
      const installCommand = `cd ..; mkdir -p veracode-cli; cd veracode-cli; curl -fsS https://tools.veracode.com/veracode-cli/install | sh`
      core.info(`Installing Veracode CLI on ${runnerOS}`)
      execSync(installCommand, { stdio: 'inherit' })
      core.info('Veracode CLI installed successfully')
    }
  } catch (error: any) {
    core.warning(`Failed to install Veracode CLI: ${error.message}`)
  }
}
