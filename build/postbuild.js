import { constants, access, copyFile } from 'fs';
import { basename, join } from 'path';

const compiledFilePath = process.env.npm_package_main;
access(compiledFilePath, constants.F_OK, err => {
    // check if file exists
    if (!err) {
        // copy js file to docs dir
        copyFile(compiledFilePath, join('docs', basename(compiledFilePath)), () => {});
        // copy map file to docs dir
        copyFile(compiledFilePath + '.map', join('docs', basename(compiledFilePath) + '.map'), () => {});
    }
})