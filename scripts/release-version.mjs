function compareVersions(a, b) {
  const left = a.split('.').map(Number);
  const right = b.split('.').map(Number);
  for (let index = 0; index < 3; index += 1) {
    if (left[index] !== right[index]) return left[index] - right[index];
  }
  return 0;
}

export function planVersionUpdate(packageVersion, brandVersion, targetVersion) {
  if (compareVersions(targetVersion, packageVersion) <= 0) {
    throw new Error(`${targetVersion} is not newer than the current version ${packageVersion}`);
  }

  if (brandVersion !== packageVersion && brandVersion !== targetVersion) {
    throw new Error(`Version mismatch: package.json=${packageVersion}, brand.config.json=${brandVersion}, target=${targetVersion}`);
  }

  return {
    packageVersion,
    brandVersion,
    updatePackage: packageVersion !== targetVersion,
    updateBrand: brandVersion !== targetVersion
  };
}
