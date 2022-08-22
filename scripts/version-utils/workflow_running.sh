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
    type=$1
    tag_name=$2

    if [[ $type == "release" ]]; then
        git tag -a "${tag_name}" -m "ci: Release Tagging '${tag_name}' to master"
        git push origin "${tag_name}"
    fi
}

bump_type=$(getBumpType)

if [[ $last_tag == */* ]]; then
    split_tag=($(echo $last_tag | tr "/" "\n"))
else
    split_tag=($project_name "0.0.0")
fi
last_version=${split_tag[1]}

if [[ $project_root_path == *jvm-services* ]]; then
    new_version=$(node ./scripts/version-util/version-control.js gradle $project_root_path $last_version $bump_type)
    pushTag $bump_type "${project_name}/${new_version}"
    echo $new_version
elif [[ $project_root_path == *nodejs* ]]; then
    new_version=$(node ./scripts/version-util/version-control.js nodejs $project_root_path $last_version $bump_type)
    pushTag $bump_type "${project_name}/${new_version}"
    echo $new_version
fi
