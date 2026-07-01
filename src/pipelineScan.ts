#!/usr/bin/env node
import * as core from "@actions/core"
import * as artifact from '@actions/artifact'
import * as github from "@actions/github"
import { execSync } from "child_process";
import { env } from "process";
import * as fs from 'fs';
import { run_cli } from "./run-command";
import { install_cli } from "./install-cli";


export async function pipelineScan(parameters:any) {
try{
  //install the cli
  install_cli(parameters)

  env.VERACODE_API_KEY_ID= parameters.vid
  env.VERACODE_API_KEY_SECRET= parameters.vkey
  let pipelineScanCommand = `static scan ${parameters.artifact_name} --verbose`;
run_cli(pipelineScanCommand, parameters.debug,parameters.fail_build);
}catch(error:any){
    console.log(`Status Code: ${error.status} with '${error.message}'`);
    core.info("Pipeline-scan unable to Scan.")
}
}