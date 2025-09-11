import { globSync } from 'node:fs';
import { basename } from 'node:path';

/**
 * @typedef Task
 * @property {string} name The task name.
 * @property {string} path The task file path.
 */

/**
 * Locate task files in the src directory.
 * @param {string} suffix The file suffix to search for.
 * @returns {Task[]} An array of task files.
 */
export function locateTasks(suffix = '.task.{js,ts}') {
	const files = globSync(`src/**/*${suffix}`);
	const collected = new Set();

	try {
		return files.map((file) => {
			const name = /** @type {string} */ (basename(file).split('.task.')[0]);
			if (collected.has(name)) {
				throw new Error(`Duplicate task name "${name}" found at "${file}". Task names must be unique.`);
			}
			collected.add(name);

			return {
				name,
				path: file
			};
		});
	} finally {
		collected.clear();
	}
}