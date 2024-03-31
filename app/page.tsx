'use client'
import Image from "next/image";
import styles from "./page.module.css";
import * as webauthn from '@passwordless-id/webauthn'
import { ethers } from "ethers";
import axios from "axios";

export default function Home() {


  


  const schema = {
    transfer: [
      {
        name: "encryptedState",
        type: "string",
      }
    ],
  }

  const domain = {
    name: "Stackr MVP v0",
    version: "1",
    chainId: 35,
    verifyingContract: "0x5DdE8843507558af10A8aeFF9208e51014Ffb9f5",
    salt: "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  }

  const getBody = async ( wallet: ethers.Wallet, state: string) => {
    const walletAddress = wallet.address;
    const payload = {
            encryptedState: state,
          };
  
  
    console.log(domain)
  
    const signature = await wallet.signTypedData(
      domain,
      schema,
      payload
    );
  
    const body = JSON.stringify({
      msgSender: walletAddress,
      signature,
      payload,
    });
  
    return body;
  };

  async function handlePayment() {
   try{ const challenge = "a7c61ef9-dc23-4806-b486-2428938a547e"
   const registration = await webauthn.client.register("Arnaud", challenge, {
     authenticatorType: "auto",
     userVerification: "required",
     debug: false
   })

   console.log(registration)

    const wallet = new ethers.Wallet(ethers.keccak256(ethers.toUtf8Bytes(registration.credential.id)))


    const encState = await axios.get('http://localhost:3000/?to=0&from=1&amount=5')

    console.log(encState.data);

    const body = await getBody(wallet, encState.data)

    const res = await fetch(`http://localhost:3002/transfer`, {
    method: "POST",
    body,
    headers: {
      "Content-Type": "application/json",
    },
  });

    console.log(res)

    }catch(e){
      console.log(e)
    }
  }

  return (
    <main className={styles.main}>
      <button onClick={() => handlePayment()}>Continue withh Payment</button>
    </main>
  );
}
