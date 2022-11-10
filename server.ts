'use strict'
/* eslint-disable no-console */

import * as path from 'path'
import * as fs from 'fs'
import * as http from 'http'
import type { AppEntryPoint } from 'wite-wue-ssr-test'
import { createPreloadHeaders } from 'wite-wue-ssr-test';
import { Request, Response } from 'express'
import { getType } from 'mime'
import type { ApiUrls, EntryConfig, ServerSideResponseData } from './src/entry-server-types'
import { PublicConfig } from './src/entry-server-types';

// https://github.com/yahoo/serialize-javascript ??
const UNSAFE_CHARS_REGEXP = /[<>'/\u2028\u2029]/g;
const ESCAPED_CHARS = {
    '\'': '\\\'',
    '<': '\\u003C',
    '>': '\\u003E',
    '/': '\\u002F',
    '\u2028': '\\u2028',
    '\u2029': '\\u2029',
};

function escapeUnsafeChars(unsafeChar: any): any {
    // @ts-ignore
    return ESCAPED_CHARS[unsafeChar];
}

function serializeState(state: any) {
    try {
        // Wrap the serialized JSON in quotes so that it's parsed by the browser as a string for better performance.
        return JSON.stringify(JSON.stringify(state || {})).replace(UNSAFE_CHARS_REGEXP, escapeUnsafeChars);
    } catch (error) {
        console.error('[SSR] On state serialization -', error, state);
        return '{}';
    }
}

global.fetch = require('node-fetch')
const express = require('express')
const chalk = require('chalk')

const manifest: Record<string, string[]> = require('./dist/client/ssr-manifest.json')

const appServer: { default: AppEntryPoint<EntryConfig, ServerSideResponseData> } = require('./dist/server/entry-server.js')
const renderPage = appServer.default

const port = Number(JSON.parse(process.env.PORT || '3000'))
const ip = process.env.IP || '127.0.0.1'
const address = `http://${ip}:${port}`

const rickAndMortyUrl = process.env.RICK_AND_MORTY_URL
const rickAndMortyUrlInternal = process.env.RICK_AND_MORTY_URL_INTERNAL || rickAndMortyUrl

const urls: ApiUrls = {
    rickAndMorty: rickAndMortyUrl
}

const internalUrls: ApiUrls = {
    rickAndMorty: rickAndMortyUrlInternal,
}

const app = express()
app.disable('x-powered-by');

const indexHtmlPath = path.join(__dirname, './dist/client/index.html')
const config: PublicConfig = {
    urls,
}
const publicAppConfig = serializeState(config);
let indexHtml = fs.readFileSync(indexHtmlPath).toString()
indexHtml = indexHtml.replace('</body>', `<script>window.__APP_CONFIG__=${publicAppConfig};</script>\n</body>`)

const assets = fs.readdirSync(path.join(__dirname, './dist/client'))
for (const asset of assets || []) {
    if ('index.html' === asset) {
        // index.html's route will be added separately
        continue;
    }

    const assetRoute = `/${asset}`
    const assetPath = path.join(__dirname, `./dist/client/${asset}`)
    console.log(`Add route ${chalk.cyan(assetRoute)} at path ${chalk.blue(assetPath)}`)

    const setHeaders = (a: http.ServerResponse, path: string) => {
        const mimeType = getType(path)

        if (null === mimeType) {
            return {}
        }

        return {
            'Content-Type': mimeType,
        }
    }

    app.use(
        assetRoute,
        express.static(assetPath, {
            setHeaders,
            maxAge: 31536000,
        })
    )
}

app.get('/index.html', async (req: Request, response: Response) => {
    response.writeHead(200, {
        'Content-Type': 'text/html',
    })

    return response.end(indexHtml)
})

app.get('*', async (request: Request, response: Response) => {
    console.log('Received request: ' + (request.headers.host + request.originalUrl));

    try {
        const rendered = await renderPage(
            request,
            {
                urls: internalUrls,
            },
            indexHtml,
            manifest,
            {
                preLoaders: {
                    js: {
                        link: (path) => `<link rel="modulepreload" crossorigin href="${path}">`,
                        header: (path) => `<${path}>; rel=preload; as=script; crossorigin`,
                    },
                    woff: {
                        link: (path) => `<link rel="preload" href="${path}" as="font" type="font/woff" crossorigin>`,
                        header: (path) => `<${path}>; rel=preload; as=font; crossorigin`,
                    },
                    woff2: {
                        link: (path) => `<link rel="preload" href="${path}" as="font" type="font/woff2" crossorigin>`,
                        header: (path) => `<${path}>; rel=preload; as=font; crossorigin`,
                    },
                },
            }
        )

        const redirectLocation = rendered.redirectLocation

        if (redirectLocation.url) {
            const statusCode = redirectLocation.status || 302
            response.writeHead(statusCode, {
                Location: redirectLocation.url,
            })

            return response.end()
        }

        let transformed = rendered.html

        if (rendered.ssrContext.teleports) {
            Object.entries(rendered.ssrContext.teleports).forEach((v) => {
                if (v[0].indexOf('#teleport-') !== 0) {
                    return;
                }

                const id = v[0].substring(1)

                transformed = transformed.replace(`<div id="${id}"></div>`, `<div id="${id}">${v[1]}</div>`)
            })
        }

        const dependencies = [...rendered.dependencies, ...rendered.coreDependencies]

        if (dependencies.length) {
            const linkHeaders = createPreloadHeaders(dependencies, rendered.preLoaders)
            response.setHeader('Link', linkHeaders.join(', '))
        }

        response.writeHead(rendered.status || 200, {
            'Content-Type': 'text/html',
            'Cache-Control': 'no-cache'
        })

        return response.end(transformed)
    } catch (e) {
        console.error(e)

        response.writeHead(200, {
            'Content-Type': 'text/html',
            'Cache-Control': 'no-cache'
        })

        return response.end(indexHtml)
    }
})

app.listen(port, () => {
    console.log(`${chalk.bgCyan('Server started')} ${chalk.cyan(address)}`)
});
