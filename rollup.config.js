import { createDefaultConfig } from '@open-wc/building-rollup';

const config = createDefaultConfig({ input: './index.html' });

export default {
  ...config,
  output: {
        ...config.output,
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js'
  },
};
