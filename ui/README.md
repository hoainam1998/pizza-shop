# Description

The pizza shop ui.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/)

## Technical
[Typescript](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html) +
[Webpack](https://webpack.js.org/concepts/) +
[Vue3](https://vuejs.org/guide/introduction.html) +
[VueRouter](https://router.vuejs.org/guide/) +
[Axios](https://axios.rest/pages/getting-started/first-steps) +
[Socket](https://socket.io/docs/v4/tutorial/introduction) +
[Docker Desktop](https://docs.docker.com/desktop/setup/install/windows-install/) +
SCSS +
HTML

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development
```bash
# for admin role
npm run admin

# for client role
npm run sale
```

### Build
```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
### Docker
```bash
# build sale container
npm run docker-sale

# build admin container
npm run docker-admin
```
## CI 
[../.github/workflows/client.yml](../.github/workflows/client.yml)