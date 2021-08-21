// eslint-disable-next-line node/no-unpublished-import
import yargs from 'yargs/yargs';
// eslint-disable-next-line node/no-unpublished-import
import {hideBin} from 'yargs/helpers';
import {deploy} from './deploy';

const argv = yargs(hideBin(process.argv))
  .options({
    project: {
      type: 'string',
      demandOption: true,
      description:
        'The Google Cloud Platform project ID to use for this invocation',
    },
  })
  .parseSync();

deploy(argv.project);
