import { defineConfig } from 'vite'
import * as path from 'path'
import react from '@vitejs/plugin-react-swc'
import legacy from '@vitejs/plugin-legacy'

// https://vitejs.dev/config/
export default defineConfig({
	base: '/',
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './', 'src'),
		}
	},
  plugins: [
		react(),
		legacy({
			targets: ['defaults', 'not IE 11'],
		}),
	],
})
