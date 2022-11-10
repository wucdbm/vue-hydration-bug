/// <reference types="vitest" />
import { CommonServerOptions, defineConfig, loadEnv, UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import * as path from 'path'
import * as fs from 'fs';
import * as connect from 'connect'
import { WiteWueSsrPlugin } from 'wite-wue-ssr-test'
import { EntryConfig } from './src/entry-server-types'
import { NodeTransform, RootNode, TemplateChildNode } from '@vue/compiler-core';
import pluginRewriteAll from 'vite-plugin-rewrite-all';
import { URL } from 'url';

const env = loadEnv(
    'mock', // mode
    process.cwd(), // root
    '' // prefix (defaults to "VITE_")
)

const rickAndMortyUrl = env.RICK_AND_MORTY_URL ? new URL(env.RICK_AND_MORTY_URL) : undefined

const SSL_CERT = env.SSL_CERT
const SSL_CERT_KEY = env.SSL_CERT_KEY

function createPropRemover(name: string): NodeTransform {
    return (node: RootNode | TemplateChildNode) => {
        if (node.type !== 1 /*NodeTypes.ELEMENT*/) {
            return;
        }

        node.props = node.props.filter(prop => {
            if (prop.type === 6 /* NodeTypes.ATTRIBUTE */ && prop.name.startsWith(name)) {
                return false
            }

            if (prop.type === 7 /* NodeTypes.DIRECTIVE */ && prop.arg && prop.arg.type === 4 /* NodeTypes.SIMPLE_EXPRESSION */ && prop.arg.content.startsWith(name)) {
                return false;
            }

            return true;
        });
    }
}

function getApiUrl(command: 'serve' | 'build', url: URL | undefined): string | undefined {
    if (!url) {
        return undefined
    }

    if ('serve' === command) {
        return url.pathname
    }

    return url.href
}

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
    const nodeTransforms: NodeTransform[] = []

    if (process.env.NODE_ENV === 'production') {
        nodeTransforms.push(createPropRemover('data-qa'))
    }

    let https: CommonServerOptions['https'] = undefined

    if (SSL_CERT && fs.existsSync(path.resolve(__dirname, SSL_CERT)) && SSL_CERT_KEY && fs.existsSync(path.resolve(__dirname, SSL_CERT_KEY))) {
        https = {
            cert: fs.readFileSync(path.resolve(__dirname, SSL_CERT)),
            key: fs.readFileSync(path.resolve(__dirname, SSL_CERT_KEY)),
        }
    }

    const config: UserConfig = {
        logLevel: 'info',
        plugins: [
            vue({
                template: {
                    compilerOptions: {
                        nodeTransforms
                    }
                }
            }),
            pluginRewriteAll(),
            WiteWueSsrPlugin({
                build: {
                    serverOptions: {
                        build: {
                            emptyOutDir: true,
                            sourcemap: 'inline',
                        },
                    },
                    clientOptions: {
                        build: {
                            emptyOutDir: true,
                            sourcemap: true,
                        },
                    },
                },
                serverEntryData: (request: connect.IncomingMessage): EntryConfig => {
                    if (!rickAndMortyUrl) {
                        throw new Error('Please set the "RICK_AND_MORTY_URL" environment variable')
                    }

                    return {
                        urls: {
                            rickAndMorty: rickAndMortyUrl.href,
                        },
                        headers: {
                            origin: request.headers['origin'] || '127.0.0.1'
                        }
                    }
                },
                polyfills: true,
                nodeTlsRejectUnauthorized: false,
            }),
        ],
        optimizeDeps: {
            include: ['vue', 'vue-router', 'wite-wue-ssr-test' /* '@vueuse/core' */],
        },
        build: {
            emptyOutDir: true,
        },
        ssr: {
            format: 'cjs'
        },
        legacy: {
            // We need this until PKG/Node start supporting native ESM w/o dynamic import
            buildSsrCjsExternalHeuristics: true
        },
        css: {
            postcss: {},
            preprocessorOptions: {
                scss: {
                    additionalData: `
                        @use "sass:color";
                        @import "@/styles/abstracts";
                    `,
                },
            },
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, 'src'),
            },
        },
        define: {
            // APP_IS_STAGING: isStaging,
            __VUE_OPTIONS_API__: 'false',
            __VUE_PROD_DEVTOOLS__: 'false',
            __VUE_I18N_FULL_INSTALL__: 'false',
            __VUE_I18N_LEGACY_API__: 'false',
            __VUE_I18N_PROD_DEVTOOLS__: 'false',
            __INTLIFY_PROD_DEVTOOLS__: 'false',
            RICK_AND_MORTY_URL: JSON.stringify(getApiUrl(command, rickAndMortyUrl)),
            // https://vitest.dev/guide/in-source.html
            // For the production build, you will need to set the define options in your config file,
            // letting the bundler do the dead code elimination.
            'import.meta.vitest': 'undefined',
        },
        server: {
            host: process.env.IP || '127.0.0.1',
            port: parseInt(process.env.PORT || '3000'),
            strictPort: true,
            proxy: {
                [rickAndMortyUrl?.pathname || '/graphql']: {
                    changeOrigin: true,
                    secure: false,
                    target: rickAndMortyUrl?.href || 'https://rickandmortyapi.com/graphql',
                },
            },
            hmr: {
                port: parseInt(process.env.HMR_PORT || '3000'),
            },
            https,
        },
        // @ts-ignore
        test: {
            environment: 'jsdom',
            includeSource: ['src/**/*.{js,ts}'],
            include: [
                './src/**/*.spec.ts',
            ],
            exclude: [
                './stories/naebanifailove/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
            ],
        },
    }

    // todo get this done @ plugin
    if ('serve' === command) {
        // vite preview source config
        config.build = {
            ...config.build,
            outDir: './dist/client',
        }
    }

    return config
})
