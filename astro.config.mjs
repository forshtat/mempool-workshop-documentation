// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLlmsTxt from 'starlight-llms-txt';

// https://astro.build/config
export default defineConfig({
	site: 'https://docs.altmempool.wtf',
	integrations: [
		starlight({
			title: 'Alternative Mempools',
			description: 'Documentation for Alternative Mempools for EIP-8141 Frame Transactions.',
			plugins: [starlightLlmsTxt()],
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/forshtat/mempool-workshop-documentation' }],
			sidebar: [
				{
					label: 'Guides',
					items: [
						// Each item here is one entry in the navigation menu.
						{ label: 'Example Guide', slug: 'guides/example' },
					],
				},
				{
					label: 'Reference',
					items: [{ autogenerate: { directory: 'reference' } }],
				},
			],
		}),
	],
});
