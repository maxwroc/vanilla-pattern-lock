# typescript-project-boilerplate
Startup setup for new typescript project

## What is here?

* Card code written in TypeScript
* Bundling all the files to single output
* Map file generated, poiting to repo url (with version etc), this way debugging is possible without having source code locally
* Two bundle types: debug and crunched one

## How to use it?
1. Clone this repo to your box

    `git clone https://github.com/maxwroc/typescript-project-boilerplate.git your-project-name`

2. Create empty repo on your git server and copy it's url

3. Change the remote url

    `git remote set-url origin [your target repo url]`

4. Push the code and you are ready to go

    `git push origin master`

5. Build

    Run `npm install` once before first build.

   * `npm run build` produces debug version of the code (just bundled but no crunched)
   * `npm run release` produces crunched bundle

    The output files are located in `dist` directory.

