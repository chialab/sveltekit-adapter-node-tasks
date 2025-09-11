import nodeAdapter from '@sveltejs/adapter-node';
import { locateTasks } from './utils.js';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * A SvelteKit adapter for Node tasks.
 * @param {import('@sveltejs/adapter-node').AdapterOptions & { suffix?: string }} options The adapter options.
 * @returns {import('@sveltejs/kit').Adapter} The SvelteKit adapter.
 */
export default function(options = {}) {
	const { out = 'build' } = options;
	const adapter = nodeAdapter(options);

	return {
		...adapter,

		name: '@sveltejs/adapter-node-tasks',
		adapt: async (builder) => {
			await adapter.adapt(builder);

			const tasks = locateTasks(options.suffix);
			for (const task of tasks) {
				await writeFile(
					join(out, `${task.name}.task.js`),
					`import { run_task } from './server/index.js';

run_task('${task.name}');
`
				);
			}
		}
	};
}