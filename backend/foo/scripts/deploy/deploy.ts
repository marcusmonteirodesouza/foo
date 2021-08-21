import * as childProcess from 'child_process';

export function deploy(project: string) {
  const image = submitToCloudBuild(project);

  deployToCloudRun(project, image);
}

function submitToCloudBuild(project: string): string {
  const image = `gcr.io/${project}/foo`;

  const submitDockerImageCmd = `gcloud builds submit --project ${project} --tag ${image}`;

  childProcess.execSync(submitDockerImageCmd, {stdio: 'inherit'});

  return image;
}

function deployToCloudRun(project: string, image: string) {
  const deployToCloudRunCmd = `gcloud run deploy foo --project ${project} --image ${image} --region northamerica-northeast1 --allow-unauthenticated`;

  childProcess.execSync(deployToCloudRunCmd, {stdio: 'inherit'});
}
