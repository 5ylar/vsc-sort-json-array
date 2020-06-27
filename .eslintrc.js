module.exports = {
  "root": true,
  "parser": '@typescript-eslint/parser',
  "env": {
    "node": true,
    "es6": true
  },
  "parserOptions": {
     "ecmaVersion": 2017,
     "sourceType": "module",
     "project": "./tsconfig.json"
  },
  "plugins": [
    '@typescript-eslint'
  ],
  "ignorePatterns": ["**/generated/**", ".eslintrc.js"],
  "extends": [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'google'
  ],
  "rules": {
    // CI pipeline runs on windows with CRLF
    "linebreak-style": ["off"],
    "no-undef": ["error"],
    "max-len": ["error", {"code": 160}],
    "require-jsdoc": ["off"],
    "no-console": ["off"],
    // We disallow number, because 0 and undefined have different meanings.
    // The problem with nullableObject is that it also applies to generics. If the generic turns out to be a number, we are in trouble.
    "@typescript-eslint/strict-boolean-expressions": ["error", {"allowString": true, "allowNumber": false, "allowNullableObject": false}]
  },
  "overrides": [{
    "env": {
      "mocha": true
    },
    "files": ["*.test.ts"],
    "extends": ["plugin:mocha/recommended"],
    "rules": {
      "mocha/no-setup-in-describe": ["off"],
      "mocha/no-hooks-for-single-case": ["off"]
    }
  }]
}
