#!/bin/bash
while [ "${1:-}" != "" ]; do
    case "$1" in
        -p | --pr-title)
            shift
            pr_title=$1;;
        -r | --root-path)
            shift
            project_root_path=$1;;
        -n | --project-name)
            shift
            project_name=$1;;
        -t | --tag)
            shift
            last_tag=$1;;
    esac
    shift
done

function getBumpType {
    if [[ $pr_title == fix:* || $pr_title == chore:* ]]; then
        echo "patch"
    elif [[ $pr_title == feat:* ]]; then
        echo "minor"
    elif [[ $pr_title == feat!:* ]]; then
        echo "major"
    elif [[ $pr_title == release:* ]]; then
        echo "release"
    else
        echo "patch"
    fi
}

function pushTag {
    local type=$1
    local tag_name=$2

    git tag -a "${tag_name}" -m "ci: Pre-Release Version Tagging '${tag_name}' to master"
    git push origin master "${tag_name}"
}

function createGithubRelease {
    local tag=$1

    if [[ $type == "release" ]]; then
        # gh release create {tag} --target master --notes ""
        echo ""
    fi
}

function getVersionByTag {
    local tag=$1
    local project=$2

    if [[ $last_tag == */* ]]; then
        split_tag=($(echo $tag | tr "/" "\n"))
    else
        split_tag=($project "0.0.0")
    fi
    echo "${split_tag[1]}"
}

bump_type=$(getBumpType)
last_version=$(getVersionByTag $last_tag $project_name)

if [[ $project_root_path == *jvm-services* ]]; then
    new_version=$(node ./scripts/version-util/version-control.js gradle $project_root_path $last_version $bump_type)
    pushTag $bump_type "${project_name}/${new_version}"
    createGithubRelease "${project_name}/${new_version}"
    echo $new_version
elif [[ $project_root_path == *nodejs* ]]; then
    new_version=$(node ./scripts/version-util/version-control.js nodejs $project_root_path $last_version $bump_type)
    pushTag $bump_type "${project_name}/${new_version}"
    createGithubRelease "${project_name}/${new_version}"
    echo $new_version
fi
