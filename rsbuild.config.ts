import { defineConfig } from "@rsbuild/core";
import { pluginReact } from '@rsbuild/plugin-react'
import { pluginLess } from '@rsbuild/plugin-less'
import tailwindcss from 'tailwindcss'

export default defineConfig({
	source: {
		entry: {
			index: "./src/main.tsx"
		},
	},
	server: {
		port: 5173
	},
	html: {
		template: "./index.html",
	},
	tools: {
		postcss: (_config, { addPlugins }) => {
			// 批量添加插件
			addPlugins(tailwindcss);
		},
	},
	plugins: [
		pluginReact(),
		pluginLess({
			lessLoaderOptions: {
				lessOptions: {
					plugins: [],
					javascriptEnabled: true,
					modifyVars: {
						'primary-color': '#0078FD',
						'btn-border-radius-base': '4px',
						'text-base-color': 'rgba(0, 0, 0, 0.65)',
						'footer-height': '92px',
						'gray-1': '#d8d8d8',
						'gray-2': '#f0f2f5',
						white: '#fff',
					},
				},
			},
		}),
	],
})
