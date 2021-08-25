import childProcess from 'child_process';

const serviceName = 'foo';

export function deploy(project: string, region: string): void {
  const image = submitToCloudBuild(project);

  deployToCloudRun(project, region, image);
}

function submitToCloudBuild(project: string): string {
  const image = `gcr.io/${project}/${serviceName}`;

  const submitDockerImageCmd = `gcloud builds submit --project ${project} --tag ${image}`;

  childProcess.execSync(submitDockerImageCmd, { stdio: 'inherit' });

  return image;
}

function deployToCloudRun(project: string, region: string, image: string) {
  const googleCloudProjectEnvVar = `GOOGLE_CLOUD_PROJECT=${project}`;

  const envVars = [googleCloudProjectEnvVar].join(',');

  const deployToCloudRunCmd = `gcloud run deploy ${serviceName} --project ${project} --image ${image} --region ${region} --set-env-vars=${envVars}`;

  childProcess.execSync(deployToCloudRunCmd, { stdio: 'inherit' });
}
