import { JestConfigWithTsJest, pathsToModuleNameMapper } from 'ts-jest';

import tsConfig from './tsconfig.json';

const config: JestConfigWithTsJest = {
  testRegex: '/test/unit/.*\\.test\\.ts$',
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: {
    ...pathsToModuleNameMapper(tsConfig.compilerOptions.paths, {
      prefix: '<rootDir>',
    })
  },
  // This does the trick!
  transform: {
    '^.+\\.(ts|js)$': ['ts-jest', { isolatedModules: true }]
  },
  transformIgnorePatterns: ['/node_modules/(?!(normalize))'],
};

export default config;
