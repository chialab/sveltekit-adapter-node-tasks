import { dirname, relative } from 'node:path';
import { locateTasks } from './utils.js';

/**
 * SvelteKit Vite plugin for collecting Node tasks.
 * @param {{ suffix?: string }} [options] The plugin options.
 * @returns {import('vite').Plugin}
 */
export default function({ suffix } = {}) {
	return {
		name: 'sveltekit-node-tasks',

		async transform(code, id) {
			if (!id.endsWith('@sveltejs/kit/src/runtime/server/index.js')) {
				return;
			}

			return `${code}

export async function run_task(task) {
	const { filter_env } = await import('../../utils/env.js');

	set_private_env(filter_env(process.env, options.env_private_prefix, options.env_public_prefix));
	set_public_env(filter_env(process.env, options.env_public_prefix, options.env_private_prefix));

	const tasks = {
		${locateTasks(suffix).map((task) => `'${task.name}': () => import('${relative(dirname(id), task.path)}')`).join(',\n\t')}
	};
	if (!tasks[task]) {
		throw new Error('Task "' + task + '" not found');
	}
	return tasks[task]().then((mod) => {
		if (!mod.task) {
			throw new Error('Task "' + task + '" has no exported "task" function');
		}
		return mod.task();
	});
}
`;
		}
	};
}