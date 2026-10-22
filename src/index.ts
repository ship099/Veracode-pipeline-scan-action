import * as core from '@actions/core'
import { pipelineScan } from './pipelineScanRouter';

// get input params
let parameters:any = {}



const vid = core.getInput('vid', {required: true} );
parameters['vid'] = vid

const vkey = core.getInput('vkey', {required: true} );
parameters['vkey'] = vkey

const file = core.getInput('file', {required: true} );
parameters['file'] = file

/*
const run_method = core.getInput('run_method', {required: true} );
parameters['run_method'] = run_method
*/

const veracode_policy_name = core.getInput('veracode_policy_name', {required: false});
parameters['veracode_policy_name'] = veracode_policy_name

const request_policy = core.getInput('request_policy', {required: false} );
parameters['request_policy'] = request_policy

const fail_on_severity = core.getInput('fail_on_severity', {required: false} );
parameters['fail_on_severity'] = fail_on_severity

const fail_on_cwe = core.getInput('fail_on_cwe', {required: false} );
parameters['fail_on_cwe'] = fail_on_cwe

const baseline_file = core.getInput('baseline_file', {required: false} );
parameters['baseline_file'] = baseline_file

const policy_name = core.getInput('policy_name', {required: false} );
parameters['policy_name'] = policy_name

const policy_file = core.getInput('policy_file', {required: false} );
parameters['policy_file'] = policy_file

const timeout = core.getInput('timeout', {required: false} );
parameters['timeout'] = timeout

const issue_details = core.getInput('issue_details', {required: false} );
parameters['issue_details'] = issue_details

const summary_display = core.getInput('summary_display', {required: false} );
parameters['summary_display'] = summary_display

const json_display = core.getInput('json_display', {required: false} );
parameters['json_display'] = json_display

const verbose = core.getInput('verbose', {required: false} );
parameters['verbose'] = verbose

const summary_output = core.getInput('summary_output', {required: false} );
parameters['summary_output'] = summary_output

const summary_output_file = core.getInput('summary_output_file', {required: false} );
parameters['summary_output_file'] = summary_output_file

const json_output = core.getInput('json_output', {required: false} );
parameters['json_output'] = json_output

const include = core.getInput('include', {required: false} );
parameters['include'] = include

const json_output_file = core.getInput('json_output_file', {required: false} );
parameters['json_output_file'] = json_output_file

const filtered_json_output_file = core.getInput('filtered_json_output_file', {required: false} );
parameters['filtered_json_output_file'] = filtered_json_output_file

const project_name = core.getInput('project_name', {required: false} );
parameters['project_name'] = project_name

const project_url = core.getInput('project_url', {required: false} );
parameters['project_url'] = project_url

const project_ref = core.getInput('project_ref', {required: false} );
parameters['project_ref'] = project_ref

const app_id = core.getInput('app_id', {required: false} );
parameters['app_id'] = app_id

const development_stage = core.getInput('development_stage', {required: false} );
parameters['development_stage'] = development_stage

const debug = core.getInput('debug', {required: false} );
parameters['debug'] = debug

const store_baseline_file = core.getInput('store_baseline_file', {required: false} );
parameters['store_baseline_file'] = store_baseline_file
//true or false

const store_baseline_file_branch = core.getInput('store_baseline_file_branch', {required: false} );
parameters['store_baseline_file_branch'] = store_baseline_file_branch

const create_baseline_from = core.getInput('create_baseline_from', {required: false} );
parameters['create_baseline_from'] = create_baseline_from
//standard or filtered 

const fail_build = core.getInput('fail_build', {required: false} );
parameters['fail_build'] = fail_build
//true or false 

const fail_build_error = core.getInput('fail_build_error', {required: false} ) ? core.getInput('fail_build_error', {required: false} ) : "false";
parameters['fail_build_error'] = fail_build_error
//true or false 

const artifact_name = core.getInput('artifact_name', {required: false} );
parameters['artifact_name'] = artifact_name
//string 

const workflow_app = core.getInput('workflow_app', {required: false} );
parameters['workflow_app'] = workflow_app

const platformType = core.getInput('platformType', {required: false} );

const esd = core.getInput('esd', {required: false} );
parameters['esd'] = esd
//true or false

const trace_id = core.getInput('trace_id', {required: false} );
parameters['trace_id'] = trace_id

async function run (parameters:any){
    await pipelineScan(parameters)
}

run(parameters)