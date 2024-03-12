import type { RequestWithParams, RouteParameters } from '@/types.js'

const createAlchemyUrl = ({
  chainName,
  alchemyKey,
  requestParams,
}: { chainName: string; alchemyKey: string; requestParams: URLSearchParams }) =>
  `https://eth-${chainName}.g.alchemy.com/nft/v2/${alchemyKey}/getNFTs/?${requestParams.toString()}`

export const getNfts = async (request: RequestWithParams, { env }: RouteParameters) => {
  const requestUrl = new URL(request.url)
  const requestParams = new URLSearchParams(requestUrl.search)

  const alchemyUrl = createAlchemyUrl({
    chainName: request.params.chainName,
    alchemyKey: env.ALCHEMY_API_KEY,
    requestParams,
  })

  const alchemyResponse = await fetch(alchemyUrl, {
    method: request.method,
    redirect: 'follow',
  })

  const alchemyData = await alchemyResponse.text()

  const cleanData = alchemyData.replace(env.ALCHEMY_API_KEY, 'REDACTED')

  return new Response(cleanData, {
    status: alchemyResponse.status,
    headers: alchemyResponse.headers,
  })
}
