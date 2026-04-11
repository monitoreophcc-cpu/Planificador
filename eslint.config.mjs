import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'

const config = [
  {
    ignores: [
      '**/.next/**',
      'docs/callcenter-analytics-app-main/**',
    ],
  },
  ...nextCoreWebVitals,
  {
    rules: {
      '@microsoft/sdl/no-inline-styles': 'off',
      'jsx-a11y/accessible-emoji': 'off',
      'import/no-anonymous-default-export': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/static-components': 'off',
    },
  },
]

export default config
