import type { RequestWithParams } from '@/types.js'
import { expect, test } from 'vitest'
import { getNfts } from './getNfts.js'

const testOwner = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const requestUrl = new URL(
  `http://localhost/v1/mainnet/getNfts?owner=${testOwner}&filters[]=SPAM&pageSize=1`,
)
const realResponse = `
{
  "blockHash": "0xbc7ad50690037f1200d1106954624a69e84937483ec1e4b8cc333a768bbaa0db",
  "ownedNfts": [
    {
      "balance": "1",
      "contract": {
        "address": "0x3c90502f0cb0ad0a48c51357e65ff15247a1d88e",
      },
      "contractMetadata": {
        "contractDeployer": "0x2408c2688da95f53eceda9a6c3b80526a9b26187",
        "deployedBlockNumber": 16856470,
        "name": "I Got Plenty - J Moe & J@z-Z-E",
        "openSea": {
          "collectionName": "I Got Plenty - J Moe & J@z-Z-E",
          "collectionSlug": "i-got-plenty-j-moe-j-z-z-e",
          "description": "Walking into a new society filled with many options can be exciting & exhausting at the same time. This song is about the experience of the lives of 2 artist growing up in Houston, and accumulating a multitude of memories and accomplishments with new obstacles to conquer.",
          "floorPrice": 0,
          "imageUrl": "https://i.seadn.io/gcs/files/6d582efeef5d4226c57d5596d6337fe2.jpg?w=500&auto=format",
          "lastIngestedAt": "2024-02-26T17:32:55.000Z",
          "safelistRequestStatus": "not_requested",
        },
        "symbol": "GOT",
        "tokenType": "ERC721",
        "totalSupply": "37",
      },
      "description": "Walking into a new society filled with many options can be exciting & exhausting at the same time. This song is about the experience of the lives of 2 artist growing up in Houston, and accumulating a multitude of memories and accomplishments with new obstacles to conquer.",
      "id": {
        "tokenId": "0x0000000000000000000000000000000000000000000000000000000000000014",
        "tokenMetadata": {
          "tokenType": "ERC721",
        },
      },
      "media": [
        {
          "bytes": 1005043,
          "format": "jpeg",
          "gateway": "https://nft-cdn.alchemy.com/eth-mainnet/b90179a8559a1164d0658540718092dc",
          "raw": "ipfs://bafybeiev62o3wbvkmoyywq45rtbmts3nxg5ruxcwzyghas2go3x2sfzwzu/5589E00D-4F56-4558-BC80-44D520312493.jpeg",
          "thumbnail": "https://res.cloudinary.com/alchemyapi/image/upload/thumbnailv2/eth-mainnet/b90179a8559a1164d0658540718092dc",
        },
      ],
      "metadata": {
        "animation_url": "ipfs://bafybeifh7ngqj6zhy5c3fbfr6wq5lmxbjn5fqflxjtyhtzhlnwaghmt2om/I%20Got%20Plenty%205.9.19%20(1).wav",
        "description": "Walking into a new society filled with many options can be exciting & exhausting at the same time. This song is about the experience of the lives of 2 artist growing up in Houston, and accumulating a multitude of memories and accomplishments with new obstacles to conquer.",
        "image": "ipfs://bafybeiev62o3wbvkmoyywq45rtbmts3nxg5ruxcwzyghas2go3x2sfzwzu/5589E00D-4F56-4558-BC80-44D520312493.jpeg",
        "name": "I Got Plenty - J Moe & J@z-Z-E",
      },
      "timeLastUpdated": "2024-02-15T01:22:48.112Z",
      "title": "I Got Plenty - J Moe & J@z-Z-E",
      "tokenUri": {
        "gateway": "https://alchemy.mypinata.cloud/ipfs/bafyreigayuz22izutf5vc5nu3ot7r6m5zewhtpxc3ezd7hrce2yay7zix4/metadata.json?20",
        "raw": "ipfs://bafyreigayuz22izutf5vc5nu3ot7r6m5zewhtpxc3ezd7hrce2yay7zix4/metadata.json?20",
      },
    },
  ],
  "pageKey": "MHgzYzkwNTAyZjBjYjBhZDBhNDhjNTEzNTdlNjVmZjE1MjQ3YTFkODhlOjB4MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAxNDpmYWxzZQ==",
  "totalCount": 17,
}
`

const createTestRequest = () => {
  const query: Record<string, string | string[]> = {}
  const params = {
    chainName: 'mainnet',
  }
  const route = '/v1/:chainName/getNfts'
  const baseRequest = new Request(requestUrl)
  for (const [k, v] of requestUrl.searchParams)
    query[k] = query[k] ? ([] as string[]).concat(query[k], v) : v

  return Object.assign(baseRequest, {
    params,
    query,
    route,
  }) as RequestWithParams
}

test('fetches NFTs for chain', async () => {
  const fetchMock = getMiniflareFetchMock()
  fetchMock.disableNetConnect()
  const origin = fetchMock.get('https://eth-mainnet.g.alchemy.com')
  origin
    .intercept({ method: 'GET', path: `/nft/v2/MOCK_KEY/getNFTs/${requestUrl.search}` })
    .reply(200, realResponse, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

  const request = createTestRequest()
  const response = await getNfts(request, {
    env: { ALCHEMY_API_KEY: 'MOCK_KEY' },
    ctx: {} as ExecutionContext,
  })
  expect(response.status).toBe(200)
  expect(response.headers.get('Content-Type')).toMatchInlineSnapshot(`"application/json"`)
  expect(await response.text()).toBe(realResponse)
})

test('redacts API key from response', async () => {
  const fetchMock = getMiniflareFetchMock()
  fetchMock.disableNetConnect()
  const origin = fetchMock.get('https://eth-mainnet.g.alchemy.com')
  const errorWithApiKey = JSON.stringify({
    error: 'Something bad happened',
    apiKey: 'MOCK_KEY',
  })
  origin
    .intercept({ method: 'GET', path: `/nft/v2/MOCK_KEY/getNFTs/${requestUrl.search}` })
    .reply(500, errorWithApiKey, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

  const request = createTestRequest()
  const response = await getNfts(request, {
    env: { ALCHEMY_API_KEY: 'MOCK_KEY' },
    ctx: {} as ExecutionContext,
  })
  expect(response.status).toBe(500)
  expect(await response.text()).not.toContain('MOCK_KEY')
})
