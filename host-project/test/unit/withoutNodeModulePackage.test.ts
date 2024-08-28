import { noImportFromNodeModules } from "@included-project/noImportFromNodeModules";

describe('withoutNodeModulePackage', () => {
  it('works fine', () => {
    noImportFromNodeModules();
  });
});
