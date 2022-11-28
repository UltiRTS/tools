import * as fs from 'fs';
import * as yargs from 'yargs';
import * as crypto from 'crypto';
import {hashFolder} from './lib/hash';
import * as zl from 'zip-lib';

const parser = yargs(process.argv.slice(2)).options({
  a: {choices: ['bundle', 'hash'], alias: 'action', demandOption: true},
  m: {choices: ['mod', 'engine'], alias: 'mode'},
  d: {type: 'string', alias: 'dir'},
  to: {type: 'string'},
  // optional for bundle
  r: {type: 'string', alias: 'replay-file'},
  maps: {type: 'string'},
}).argv;

const main = async () => {
  const argv = await parser;
  console.log(argv);
  switch (argv.a) {
    case 'bundle': {
      const dir = argv.d;
      const mode = argv.m;
      const to = argv.to;

      console.log(dir, mode, to);

      if (dir === undefined || mode === undefined || to === undefined) {
        console.log('insufficient parameters');
        return;
      }

      if (!fs.existsSync(dir)) {
        console.log('folder not exists!');
        return;
      }

      const folderHash = await hashFolder(dir, mode);

      const zip = new zl.Zip();
      zip.addFolder(dir);
      await zip.archive(to);

      const fileBuffer = fs.readFileSync(to);
      const hashSum = crypto.createHash('md5');
      hashSum.update(fileBuffer);

      const hex = hashSum.digest('hex');

      console.log(hex);

      console.log(
        `${mode} has been zipped into ${to}
        folder hash: ${folderHash}
        archive hash: ${hex}`
      );

      break;
    }
    case 'hash': {
      const dir = argv.d;
      const mode = argv.m;

      if (dir === undefined || mode === undefined) {
        console.log('insufficient parameters');
        return;
      }

      if (!fs.existsSync(dir)) {
        console.log('folder not exists!');
        return;
      }

      const res = await hashFolder(dir, mode);
      console.log(`folder hash of ${dir} in mode ${mode} is:\n ${res}`);

      break;
    }
  }
};

main();
