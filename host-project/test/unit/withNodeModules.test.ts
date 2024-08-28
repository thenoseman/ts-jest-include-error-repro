import { withImportFromNodeModules } from "@included-project/withImportFromNodeModules";

describe('withImportFromNodeModules', () => {
  it('SyntaxError: Unexpected token "export" ...', () => {
    withImportFromNodeModules();
  });
});
