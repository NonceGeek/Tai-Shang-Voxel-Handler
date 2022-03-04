import { useContractReader } from "eth-hooks";
import { ethers } from "ethers";
import React, { useState } from "react";
import { Link } from "react-router-dom";

import { Button, Card, List, Input } from "antd";
import { Address, AddressInput } from "../components";

/**
 * web3 props can be passed from '../App.jsx' into your local view component for use
 * @param {*} yourLocalBalance balance on current network
 * @param {*} readContracts contracts from current chain already pre-loaded using ethers contract module. More here https://docs.ethers.io/v5/api/contract/contract/
 * @returns react component
 **/
function Home({
  isSigner,
  loadWeb3Modal,
  yourCollectibles,
  address,
  blockExplorer,
  mainnetProvider,
  tx,
  readContracts,
  writeContracts,
}) {
  // you can also use hooks locally in your component of choice
  // in this case, let's keep track of 'purpose' variable from our contract
  // const purpose = useContractReader(readContracts, "YourContract", "purpose");
  const [mintData, setMintData] = useState({});
  const [transferToAddresses, setTransferToAddresses] = useState({});
  return (
    <div>
      {/* Mint button */}
      <div style={{ maxWidth: 820, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
        <div style={{ margin: 10}}>
          <span>Vox URI</span>
          <Input
            placeholder="eg. https://5ywn6daenz6poefpjkgs3c2vdgtzsk2vevam6aozkfzzzwrmgi.arweave.net/nFF3J4VB0BP9eHt35gdffGuwCXaHfXwtJl2K6u4GyA0"
            onChange={e => {
              setMintData({...mintData, uri: e.target.value});
            }}
          />
        </div>
        <div style={{ margin: 10}}>
          <span>Github Pages URL</span>
          <Input
            placeholder="eg. https://welightproject.github.io/voxel-viewer-page/"
            onChange={e => {
              setMintData({...mintData, url: e.target.value});
            }}
          />
        </div>
        <div style={{ margin: 10}}>
          <span>Commit Hash</span>
          <Input
            placeholder="eg. e070f55ef44f41661a65048c0fd30af33e20ff7c"
            onChange={e => {
              setMintData({...mintData, commit: e.target.value});
            }}
          />
        </div>
        {isSigner ? (
          <Button
            type={"primary"}
            onClick={() => {
              tx(writeContracts.TaiShangVoxel.mint(mintData.uri, mintData.url, mintData.commit));
            }}
          >
            MINT
          </Button>
        ) : (
          <Button type={"primary"} onClick={loadWeb3Modal}>
            CONNECT WALLET
          </Button>
        )}
      </div>
      <div style={{ width: 820, margin: "auto", paddingBottom: 256 }}>
        <List
          bordered
          dataSource={yourCollectibles}
          renderItem={item => {
            const id = item.id.toNumber();
            console.log("IMAGE",item.image)
            return (
              <List.Item key={id + "_" + item.uri + "_" + item.owner}>
                <Card
                  title={
                    <div>
                      <span style={{ fontSize: 18, marginRight: 8 }}>{item.name}</span>
                    </div>
                  }
                >
                  <a href={"https://opensea.io/assets/"+(readContracts && readContracts.TaiShangVoxel && readContracts.TaiShangVoxel.address)+"/"+item.id} target="_blank">
                  {/* <img src={item.image} /> */}
                  <iframe src={item.external_url} style={{width: "200px",height: "200px"}}></iframe>
                  </a>
                  <div>{item.description}</div>
                </Card>

                <div>
                  owner:{" "}
                  <Address
                    address={item.owner}
                    ensProvider={mainnetProvider}
                    blockExplorer={blockExplorer}
                    fontSize={16}
                  />
                  <AddressInput
                    ensProvider={mainnetProvider}
                    placeholder="transfer to address"
                    value={transferToAddresses[id]}
                    onChange={newValue => {
                      const update = {};
                      update[id] = newValue;
                      setTransferToAddresses({ ...transferToAddresses, ...update });
                    }}
                  />
                  <Button
                    onClick={() => {
                      console.log("writeContracts", writeContracts);
                      tx(writeContracts.TaiShangVoxel.transferFrom(address, transferToAddresses[id], id));
                    }}
                  >
                    Transfer
                  </Button>
                </div>
              </List.Item>
            );
          }}
        />
      </div>
    </div>
  );
}

export default Home;
