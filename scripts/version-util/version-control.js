const fs = require('fs');


function parseVersionAtFile(filePath) {
    const versionRegex = /(?<=(["']?version["']?[\s=:]+["']))((?!version)[\w.\-]+)?(?=["'])/g;
    const fileContext = fs.readFileSync(filePath, 'utf8');

    return fileContext.match(versionRegex);
}


function upgradeVersionAtFile(filePath, upgradeVersion) {
    const versionRegex = /(?<=(["']?version["']?[\s=:]+["']))((?!version)[\w.\-]+)?(?=["'])/g;
    const fileContext = fs.readFileSync(filePath, 'utf8');
    const upgradeContext = fileContext.replace(versionRegex, upgradeVersion.toString());

    fs.writeFileSync(filePath, upgradeContext);
}

function checkFilePath(filePath) {
    if (fs.existsSync(filePath)) {
        return filePath;
    } else {
        return new Error('File path does not exist, check to path.');
    }
}


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
        return checkFilePath(`${serviceRootPath}/version.json`);
    }

    throw new Error('Please, check to valid type (gradle|nodejs).');
}

function bumping(bumpType, currentVersionString) {
    console.log(currentVersionString);
    console.log(bumpType);
    
    const splitVersions = currentVersionString.split('.');
    
    if (bumpType === 'major') {
        const vMajor = Number(splitVersions[0]) + 1;
        return `${vMajor}.${splitVersions[1]}.${splitVersions[2]}`;
    } else if(bumpType === 'minor') {
        const vMinor = Number(splitVersions[1]) + 1;
        return `${splitVersions[0]}.${vMinor}.${splitVersions[2]}`;
    } else if(bumpType === 'patch') {
        const vPatch = Number(splitVersions[2]) + 1;
        return `${splitVersions[0]}.${splitVersions[1]}.${vPatch}`;
    } else {
        return currentVersionString;
    }
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

    const newVersion = bumping(bumpType, versionString[0]);
    
    if (bumpType === 'release') {
        upgradeVersionAtFile(configFilePath, newVersion);
    }
    
    console.log(newVersion);
}

main();
