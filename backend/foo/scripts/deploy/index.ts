import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import { deploy } from './deploy';

const argv = yargs(hideBin(process.argv))
  .options({
    project: {
      type: 'string',
      demandOption: true,
      description:
        'The Google Cloud Platform project ID to use for this invocation',
    },
    region: {
      type: 'string',
      demandOption: true,
      description:
        'The Google Cloud Platform region to use for this invocation',
    },
  })
  .parseSync();

deploy(argv.project, argv.region);
