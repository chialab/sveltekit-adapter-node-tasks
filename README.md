# SvelteKit Adapter for Node Tasks

> [!WARNING]
> This adapter is currently in an experimental stage. Use it at your own risk.

## Why

One of the things we appreciate most about [SvelteKit](https://svelte.dev/) is its excellent developer experience.
In particular, its handling of development and production environments (along with their respective variables and configurations) and the clear separation between server and client files make for a clean and well-structured codebase.

However, SvelteKit is designed primarily for deploying web applications. In more complex projects, it’s often necessary to run background tasks—such as sending emails, generating reports, or processing files.
This adapter makes it possible to add custom entry points to the build that can be executed as standalone Node scripts, while still reusing the same codebase and configurations as the SvelteKit app. This way, there’s no need to redefine environment variables, and everything remains consistent within the SvelteKit conventions.

## Usage

This adapter lets you define files named `<something>.task.js` (or .ts) inside the `src` folder. These files are included in the application build and generate separate entry points within the output directory.

Tasks should expose a `task` function that will be invoked by the generated entrypoint.

### Example

**cacheAll.task.ts**
```ts
import { cache } from '$lib/server/cache';
import { fetchImages } from '$lib/clients';
import { convertImage } from '$lib/server/convertions';

export const task = () => {
  const images = await fetchImages();
  for (const image of images) {
    cache.remember(image, () => convertImage(image));
  }

  setTimeout(() => task(), 10 * 60 * 1000); // runs every 10 minutes
}
```

Then build the application

```
npm run build
```

Run the `cacheAll` task:

```
node build/cacheAll.task.js
```

### Config

This adapter exposes a Vite plugin for collecting tasks during the build, and a wrapper of official [Node adapter](https://www.npmjs.com/package/@sveltejs/adapter-node) in order to generate task entrypoints.

**vite.config.ts**
```ts
import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import sveltekitTasks from '@chialab/sveltekit-adapter-node-tasks/vite';

export default defineConfig({
	plugins: [sveltekit(), sveltekitTasks()],
});
```

**svelte.config.js**
```js
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import nodeAdapter from '@sveltejs/adapter-node';
import adapter from '@chialab/sveltekit-adapter-node-tasks';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter(nodeAdapter())
	}
};

export default config;
```

### Options

This adapter inherits all options from the Node adapter. Both plugin and adapter accept a `suffix` option to configure the file naming convention.


## License

**SvelteKit Adapter for Node Tasks** are released under the [MIT](https://github.com/chialab/sveltekit-adapter-node-tasks/blob/main/LICENSE) license.
