import { useState } from "react";
import { ethers, providers } from "ethers";
import {create as ipfsHttpClient} from 'ipfs-http-client';
import { useRouter } from "next/dist/client/router";
import Web3Modal from 'web3modal';
import { nftaddress, nftmarketaddress, ipfsMoralisUploadUrl } from '../config';
import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import axios from "axios";
var uuid = require('uuid')

export default function CreateItem () {
    const [fileUrl, setFileUrl] = useState(null)
    const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' })
    const router = useRouter()
    
    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    })

    function getExt(file) {
        const name = file.name;
        const lastDot = name.lastIndexOf('.');
      
        const fileName = name.substring(0, lastDot);
        const ext = name.substring(lastDot + 1);

        return ext;    
    }

    async function uploadWithMoralis(file) {
        // convert file to base64
        let content = await toBase64(file) 
        let ext = getExt(file) 
        let path = uuid.v1()
        
        // Api post data
        const data = JSON.stringify([
            {
              "path": path + "." + ext,
              "content": content
            }
        ])

        const config = {
            method: 'post',
            url: ipfsMoralisUploadUrl,
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

    async function uploadJsonWithMoralis(string) {
        // convert json to base64
        let content = Buffer.from(string).toString("base64")
        let path = uuid.v1()
        
        // Api post data
        const data = JSON.stringify([
            {
              "path": path,
              "content": content
            }
        ])

        const config = {
            method: 'post',
            url: ipfsMoralisUploadUrl,
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

    async function onChange(e) {
        const file = e.target.files[0]
        let url = await uploadWithMoralis(file)
        url = url[0].path
        // Set file url state
        setFileUrl(url)
    }

    async function createItem() {
        const { name, description, price } = formInput
        console.log('start')

        // If don't exist return
        if(!name || !description || !price || !fileUrl) return 
        
        const data = JSON.stringify({
            name, description, image: fileUrl
        })

        try {
            let url = await uploadJsonWithMoralis(data) 
            url = url[0].path
            createSale(url)
        }
        catch(error) {
            console.log('Error uploading file: ', error)
        }
    }

    async function createSale(url) {
        console.log('creat sale')
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()

        // Create Token
        let contract = new ethers.Contract(nftaddress, NFT.abi, signer)
        let transaction = await contract.createToken(url)
        let tx = await transaction.wait()

        // Get Token Id from transaction
        console.log(tx)
        let event = tx.events[0]
        
        let value = event.args[2]
        let tokenId = value.toNumber()

        const price = ethers.utils.parseUnits(formInput.price, 'ether')

        contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
        let listingPrice = await contract.getListingPrice()
        listingPrice = listingPrice.toString()

        transaction = await contract.createMarketItem(
            nftaddress, tokenId, price, { value: listingPrice }
        )
        
        await transaction.wait()
        console.log('done')
        router.push("/")
    }
    return (
        <div>
            <input label="Asset Name"  onChange={(e)=>updateFormInput({...formInput, name: e.target.value})} /><br></br>
            <textarea label="Asset Description"  onChange={(e)=>updateFormInput({...formInput, description: e.target.value})} /><br></br>
            <input label="Asset Price (in eth)"  onChange={(e)=>updateFormInput({...formInput, price: e.target.value})} /><br></br>
            <input type="file" name="Asset" onChange={onChange} /><br></br>
            <button onClick={createItem}>Create Asset</button>
        </div>            
    )
}
