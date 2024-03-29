import { Router } from 'itty-router/Router'
import { createCors } from 'itty-router/createCors'
import { error } from 'itty-router/error'

import type { RequestWithParams, RouteParameters } from '@/types.js'

import { v1 } from '@routes/v1.js'
import { stripBodyForHeadRequest } from './utils/stripBodyForHeadRequest.js'

const { preflight, corsify } = createCors({
  origins: ['*'],
  methods: ['GET', 'HEAD', 'OPTIONS'],
})

const router = Router<RequestWithParams, [RouteParameters]>()

// Preflight
router.all('*', preflight)

// V1 Routes
router.get('/v1/:chainName/getNfts', v1.getNfts)
router.head('/v1/:chainName/getNfts', v1.getNfts)
router.options('/v1/:chainName/getNfts', () => new Response(null, { status: 204 }))

// 404 Fallback
router.all('*', () => error(404, 'Not Found'))

export default {
  fetch: async (request: Request, env: Env, ctx: ExecutionContext) =>
    router
      .handle(request, { env, ctx })
      .then(stripBodyForHeadRequest(request))
      .catch((e) => {
        console.error('Caught error')
        console.error(e)
        return error(500, 'Internal Server Error')
      })
      .then(corsify),
}
