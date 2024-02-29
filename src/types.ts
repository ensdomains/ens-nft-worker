import type { IRequestStrict } from 'itty-router/Router'

export type RouteParameters = {
  env: Env
  ctx: ExecutionContext
}

export type RequestWithParams = Omit<IRequestStrict, 'params'> & {
  params: {
    chainName: string
  }
}
