import { ethers } from 'ethers';
import { useState, useEffect } from 'react'
import axios from 'axios';
import Web3Modal from 'web3modal'
import { nftaddress, nftmarketaddress } from '../config';
import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'

export default function MyAssets() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  const [runningTokens, setRunningTokens] = useState([])

  useEffect(() => {
    loadNFTs()
  }, [])
  async function loadNFTs() {
    const web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
    })

    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
      
    const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
    const data = await marketContract.fetchMyNFTs()
    let tokenUris =[]
    const items = await Promise.all(data.map(async i => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId)
      tokenUris.push(tokenUri)
      const meta = await axios.get(tokenUri)
      
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        description: meta.data.description,
        plays: meta.data.plays
      }
      
      return item
    }))
    setNfts(items)
    setLoadingState('loaded') 
    setRunningTokens(tokenUris)
    
  }

async function updateJsonWithMoralis(string, path) {
    // convert json to base64
    let content = Buffer.from(string).toString("base64")
    
    // Api post data
    const data = JSON.stringify([
        {
          "path": path,
          "content": content
        }
    ])

    const config = {
        method: 'post',
        url: 'https://deep-index.moralis.io/api/v2/ipfs/uploadFolder',
        headers: { 
          'Content-Type': 'application/json'
        },
        data : data
    };

    try {
        let res = await axios(config)
        
        if(res.status = 200) {
            console.log(res.status)
        }

        return res.data
    }
    catch(err) {
        console.log(err)
        return "none"
    }
}

async function onPlay(i) {
    console.log(nfts[i])
    // Play song here


    // Update ipfs 
    const data = JSON.stringify({
        name:nfts[i].name, description:nfts[i].description, image: nfts[i].image, plays: 5
    })
    
    try {
        console.log(runningTokens[i])
        let url = await updateJsonWithMoralis(data, runningTokens[i].split(/https:\/\/ipfs.moralis.io:2053\/ipfs\/[A-Z, a-z, 0-9]*\//)[1]) 
        url = url[0].path
        console.log(url)
        //createSale(url)
    }
    catch(error) {
        console.log('Error uploading file: ', error)
    }

    //console.log(runningTokens[i])
  }

  if (loadingState === 'loaded' && !nfts.length) return (<h1 className="py-10 px-20 text-3xl">No assets owned</h1>)
  return (
    <div className="flex justify-center">
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            nfts.map((nft, i) => (
              <div key={i} className="border shadow rounded-xl overflow-hidden">
                <img src={nft.image} className="rounded" />
                <div className="p-4 bg-black">
                  <p className="text-2xl font-bold text-white">{nft.description}</p>
                  <p className="text-2xl font-bold text-white">Plays {nft.plays}</p>
                  <p className="text-2xl font-bold text-white">Price - {nft.price} Eth</p>
                  <button onClick={()=>onPlay(i)}>Play</button>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}