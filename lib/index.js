/**
 * @import { Adapter } from '@sveltejs/kit';
 */
import { join } from 'node:path';
import { locateTasks } from './utils.js';
import { writeFile } from 'node:fs/promises';

/**
 * A SvelteKit adapter for Node tasks.
 * @param {Adapter} nodeAdapter - The node adapter instance.
 * @param {{ out?: string, suffix?: string }} options The adapter options.
 * @returns {Adapter} The SvelteKit adapter.
 */
export default function(nodeAdapter, options = {}) {
	const { out = 'build', suffix } = options;

	return {
		...nodeAdapter,

		name: '@sveltejs/adapter-node-tasks',
		adapt: async (builder) => {
			await nodeAdapter.adapt(builder);

			const tasks = locateTasks(suffix);
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