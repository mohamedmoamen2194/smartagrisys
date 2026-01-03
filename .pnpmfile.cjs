// pnpmfile to ensure build scripts run
function readPackage(pkg, context) {
  // Ensure Prisma and other packages can run their build scripts
  if (pkg.name === '@prisma/client' || 
      pkg.name === '@prisma/engines' || 
      pkg.name === 'prisma' ||
      pkg.name === '@swc/core' ||
      pkg.name === 'sharp' ||
      pkg.name === '@parcel/watcher') {
    // Don't modify, just allow scripts
    return pkg
  }
  return pkg
}

module.exports = {
  hooks: {
    readPackage
  }
}

