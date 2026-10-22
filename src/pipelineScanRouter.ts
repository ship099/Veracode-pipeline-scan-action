#!/usr/bin/env node
import * as core from "@actions/core"
import { pipelineScanCLI } from "./pipelineScanCLI";
import { downloadJar, runScan } from "./pipeline-scan";
import { checkParameters } from "./check-parameters";

export async function pipelineScan(parameters:any) {
  try {
    const workflowAppBool = String(parameters.workflow_app).toLowerCase() === "true";

    if (parameters.debug == "true") {
      core.info('---- DEBUG OUTPUT START ----')
      core.info('---- pipelineScan.ts / route selection ----')
      core.info('---- workflow_app: ' + parameters.workflow_app)
      core.info('---- Using: ' + (workflowAppBool ? 'CLI' : 'JAR') + ' approach')
      core.info('---- DEBUG OUTPUT END ----')
    }

    if (workflowAppBool) {
      core.info('Using CLI approach for pipeline scan')
      await pipelineScanCLI(parameters)
    } else {
      core.info('Using JAR approach for pipeline scan')
      downloadJar()
      let scanCommandValue = await checkParameters(parameters)

      if (parameters.debug == "true") {
        core.info('---- DEBUG OUTPUT START ----')
        core.info('---- pipelineScan.ts / JAR approach ----')
        core.info('---- Pipeline Scan Command: ' + scanCommandValue)
        core.info('---- DEBUG OUTPUT END ----')
      }

      core.info('Running the Pipeline Scan')
      let scanCommandOutput = await runScan(scanCommandValue, parameters)

      core.info('Pipeline Scan Output')
      core.info(scanCommandOutput)
    }
  } catch(error:any) {
    console.log(`Status Code: ${error.status} with '${error.message}'`);
    core.info("Pipeline-scan unable to Scan.")
  }
}
