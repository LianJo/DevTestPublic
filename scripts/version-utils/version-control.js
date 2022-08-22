const TappytoonSemVer = require('./model/TappytoonSemVer');
const fs = require('fs');


/**
 * @param projectBuildType {string}
 * @param serviceRootPath {string}
 * @returns {string|Error}
 */
function getConfigFilePath(projectBuildType, serviceRootPath) {
    if (projectBuildType === 'gradle') {
        return checkFilePath(`${serviceRootPath}/build.gradle`);
    }

    if (projectBuildType === 'nodejs') {
        return checkFilePath(`${serviceRootPath}/package.json`);
    }

    throw new Error('Please, check to valid type (gradle|nodejs).');
}

/**
 * This is where the main business logic runs.
 */
function main() {
    const [
        processName,
        runFile,
        projectBuildType,
        projectRootPath,
        lastVersionString,
        bumpType,
    ] = process.argv;

    const configFilePath = getConfigFilePath(projectBuildType, projectRootPath);
    const versionString = parseVersionAtFile(configFilePath);

    const version = TappytoonSemVer.parse(versionString[0]);

    if (bumpType === 'major' || bumpType === 'minor' || bumpType === 'patch') {
        const lastVersion = TappytoonSemVer.parse(lastVersionString);
        const newVersion = version.bump(lastVersion, bumpType);

        upgradeVersionAtFile(configFilePath, newVersion);
        console.log(newVersion.toString());
    } else if (bumpType === 'release') {
        // Get a manually modified version.
        console.log(versionString[0]);
    } else {
        throw new Error('Only one of the following buildType{major|minor|patch} can be selected.');
    }
}

main();
