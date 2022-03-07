import { Button, Col, Menu, Row, message } from "antd";
import "antd/dist/antd.css";
import {
  useBalance,
  useContractLoader,
  useContractReader,
  useGasPrice,
  useOnBlock,
  useUserProviderAndSigner,
} from "eth-hooks";
import { useExchangeEthPrice } from "eth-hooks/dapps/dex";
import React, { useCallback, useEffect, useState } from "react";
import { Link, Route, Switch, useLocation } from "react-router-dom";
import "./App.css";
import {
  Account,
  Contract,
  Faucet,
  GasGauge,
  Header,
  Ramp,
  ThemeSwitch,
  NetworkDisplay,
  FaucetHint,
  NetworkSwitch,
} from "./components";
import { NETWORKS, ALCHEMY_KEY } from "./constants";
import externalContracts from "./contracts/external_contracts";
// contracts
import deployedContracts from "./contracts/hardhat_contracts.json";
import { Transactor, Web3ModalSetup } from "./helpers";
import { Home, ExampleUI, Hints, Subgraph } from "./views";
import { useStaticJsonRPC } from "./hooks";

const { ethers } = require("ethers");

const axios = require('axios');

/*
    Welcome to 🏗 scaffold-eth !

    Code:
    https://github.com/scaffold-eth/scaffold-eth

    Support:
    https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA
    or DM @austingriffith on twitter or telegram

    You should get your own Alchemy.com & Infura.io ID and put it in `constants.js`
    (this is your connection to the main Ethereum network for ENS etc.)


    🌏 EXTERNAL CONTRACTS:
    You can also bring in contract artifacts in `constants.js`
    (and then use the `useExternalContractLoader()` hook!)
*/

/// 📡 What chain are your contracts deployed to?
const initialNetwork = NETWORKS.polygon; // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)

// 😬 Sorry for all the console logging
const DEBUG = true;
const NETWORKCHECK = true;
const USE_BURNER_WALLET = true; // toggle burner wallet feature
const USE_NETWORK_SELECTOR = false;

const web3Modal = Web3ModalSetup();

// backend for voxel_handler
const serverUrl = "https://bewater.leeduckgo.com/voxel_handler/api/v1/place_order"; // elixir backend
// const serverUrl = "http://localhost:4000/voxel_handler/api/v1/place_order"; // elixir backend
// 🛰 providers
const providers = [
  "https://eth-mainnet.gateway.pokt.network/v1/lb/611156b4a585a20035148406",
  `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`,
  "https://rpc.scaffoldeth.io:48544",
];

function App(props) {
  // specify all the chains your app is available on. Eg: ['localhost', 'mainnet', ...otherNetworks ]
  // reference './constants.js' for other networks
  const networkOptions = [initialNetwork.name, "mainnet", "rinkeby"];

  const [injectedProvider, setInjectedProvider] = useState();
  const [address, setAddress] = useState();
  const [selectedNetwork, setSelectedNetwork] = useState(networkOptions[0]);
  const location = useLocation();

  const targetNetwork = NETWORKS[selectedNetwork];

  // 🔭 block explorer URL
  const blockExplorer = targetNetwork.blockExplorer;

  // load all your providers
  const localProvider = useStaticJsonRPC([
    process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : targetNetwork.rpcUrl,
  ]);
  const mainnetProvider = useStaticJsonRPC(providers);

  if (DEBUG) console.log(`Using ${selectedNetwork} network`);

  // 🛰 providers
  if (DEBUG) console.log("📡 Connecting to Mainnet Ethereum");

  const logoutOfWeb3Modal = async () => {
    await web3Modal.clearCachedProvider();
    if (injectedProvider && injectedProvider.provider && typeof injectedProvider.provider.disconnect == "function") {
      await injectedProvider.provider.disconnect();
    }
    setTimeout(() => {
      window.location.reload();
    }, 1);
  };

  /* 💵 This hook will get the price of ETH from 🦄 Uniswap: */
  const price = useExchangeEthPrice(targetNetwork, mainnetProvider);

  /* 🔥 This hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = useGasPrice(targetNetwork, "fast");
  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const userProviderAndSigner = useUserProviderAndSigner(injectedProvider, localProvider, USE_BURNER_WALLET);
  const userSigner = userProviderAndSigner.signer;

  useEffect(() => {
    async function getAddress() {
      if (userSigner) {
        const newAddress = await userSigner.getAddress();
        setAddress(newAddress);
      }
    }
    getAddress();
  }, [userSigner]);

  // You can warn the user if you would like them to be on a specific network
  const localChainId = localProvider && localProvider._network && localProvider._network.chainId;
  const selectedChainId =
    userSigner && userSigner.provider && userSigner.provider._network && userSigner.provider._network.chainId;

  // For more hooks, check out 🔗eth-hooks at: https://www.npmjs.com/package/eth-hooks

  // The transactor wraps transactions and provides notificiations
  const tx = Transactor(userSigner, gasPrice);

  // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
  const yourLocalBalance = useBalance(localProvider, address);

  // Just plug in different 🛰 providers to get your balance on different chains:
  const yourMainnetBalance = useBalance(mainnetProvider, address);

  // const contractConfig = useContractConfig();

  const contractConfig = { deployedContracts: deployedContracts || {}, externalContracts: externalContracts || {} };

  // Load in your local 📝 contract and read a value from it:
  const readContracts = useContractLoader(localProvider, contractConfig);

  // If you want to make 🔐 write transactions to your contracts, use the userSigner:
  const writeContracts = useContractLoader(userSigner, contractConfig, localChainId);

  // EXTERNAL CONTRACT EXAMPLE:
  //
  // If you want to bring in the mainnet DAI contract it would look like:
  const mainnetContracts = useContractLoader(mainnetProvider, contractConfig);

  // If you want to call a function on a new block
  useOnBlock(mainnetProvider, () => {
    console.log(`⛓ A new mainnet block is here: ${mainnetProvider._lastBlockNumber}`);
  });

  // Then read your DAI balance like:
  const myMainnetDAIBalance = useContractReader(mainnetContracts, "DAI", "balanceOf", [
    "0x34aA3F359A9D614239015126635CE7732c18fDF3",
  ]);

  // keep track of a variable from the contract in the local React state:
  const purpose = useContractReader(readContracts, "YourContract", "purpose");

  /*
  const addressFromENS = useResolveName(mainnetProvider, "austingriffith.eth");
  console.log("🏷 Resolved austingriffith.eth as:",addressFromENS)
  */
  // keep track of a variable from the contract in the local React state:
  const balance = useContractReader(readContracts, "TaiShangVoxel", "balanceOf", [address]);
  console.log("🤗 balance:", balance);

  // 📟 Listen for broadcast events
  // const transferEvents = useEventListener(readContracts, "TaiShangVoxel", "Transfer", localProvider, 1);
  // console.log("📟 Transfer events:", transferEvents);
  //
  // 🧠 This effect will update yourCollectibles by polling when your balance changes
  //
  const yourBalance = balance && balance.toNumber && balance.toNumber();
  const [yourCollectibles, setYourCollectibles] = useState();

  useEffect(() => {
    const updateYourCollectibles = async () => {
      const collectibleUpdate = [];
      for (let tokenIndex = 0; tokenIndex < balance; tokenIndex++) {
        try {
          console.log("GEtting token index", tokenIndex);
          const tokenId = await readContracts.TaiShangVoxel.tokenOfOwnerByIndex(address, tokenIndex);
          console.log("tokenId", tokenId);
          const tokenURI = await readContracts.TaiShangVoxel.tokenURI(tokenId);
          const jsonManifestString = atob(tokenURI.substring(29))
          console.log("tokenURI", tokenURI);
          console.log("jsonManifestString", jsonManifestString);
/*
          const ipfsHash = tokenURI.replace("https://ipfs.io/ipfs/", "");
          console.log("ipfsHash", ipfsHash);
          const jsonManifestBuffer = await getFromIPFS(ipfsHash);
        */
          try {
            const jsonManifest = JSON.parse(jsonManifestString);
            console.log("jsonManifest", jsonManifest);
            collectibleUpdate.push({ id: tokenId, uri: tokenURI, owner: address, ...jsonManifest });
          } catch (e) {
            console.log(e);
          }

        } catch (e) {
          console.log(e);
        }
      }
      setYourCollectibles(collectibleUpdate.reverse());
    };
    updateYourCollectibles();
  }, [address, yourBalance]);

  //
  // 🧫 DEBUG 👨🏻‍🔬
  //
  useEffect(() => {
    if (
      DEBUG &&
      mainnetProvider &&
      address &&
      selectedChainId &&
      yourLocalBalance &&
      yourMainnetBalance &&
      readContracts &&
      writeContracts &&
      mainnetContracts
    ) {
      console.log("_____________________________________ 🏗 scaffold-eth _____________________________________");
      console.log("🌎 mainnetProvider", mainnetProvider);
      console.log("🏠 localChainId", localChainId);
      console.log("👩‍💼 selected address:", address);
      console.log("🕵🏻‍♂️ selectedChainId:", selectedChainId);
      console.log("💵 yourLocalBalance", yourLocalBalance ? ethers.utils.formatEther(yourLocalBalance) : "...");
      console.log("💵 yourMainnetBalance", yourMainnetBalance ? ethers.utils.formatEther(yourMainnetBalance) : "...");
      console.log("📝 readContracts", readContracts);
      console.log("🌍 DAI contract on mainnet:", mainnetContracts);
      console.log("💵 yourMainnetDAIBalance", myMainnetDAIBalance);
      console.log("🔐 writeContracts", writeContracts);
    }
  }, [
    mainnetProvider,
    address,
    selectedChainId,
    yourLocalBalance,
    yourMainnetBalance,
    readContracts,
    writeContracts,
    mainnetContracts,
    localChainId,
    myMainnetDAIBalance,
  ]);

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new ethers.providers.Web3Provider(provider));

    provider.on("chainChanged", chainId => {
      console.log(`chain changed to ${chainId}! updating providers`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    provider.on("accountsChanged", () => {
      console.log(`account changed!`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    // Subscribe to session disconnection
    provider.on("disconnect", (code, reason) => {
      console.log(code, reason);
      logoutOfWeb3Modal();
    });
    // eslint-disable-next-line
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  const faucetAvailable = localProvider && localProvider.connection && targetNetwork.name.indexOf("local") !== -1;

  const isSigner = injectedProvider && injectedProvider.getSigner && injectedProvider.getSigner()._isSigner

  const [ loading, setLoading ] = useState()

  const [ result, setResult ] = useState()

  let display = ""
  let [msgToSign, setMsgToSign] = useState()
  const [extraData, setExtraData] = useState('leeduckgo; 0x01; +86 13323232323; Beijing, China')

  const handleSignDataChange = (e) => {
    setExtraData(e.target.value)
  }
  if(result){
    let possibleTxId = result.substr(-66)
    console.log("possibleTxId",possibleTxId)
    let extraLink = ""
    if(possibleTxId.indexOf("0x")==0){
      extraLink = <a href={blockExplorer+"tx/"+possibleTxId} target="_blank">view transaction on etherscan</a>
    }else{
      possibleTxId=""
    }
    display = (
      <div style={{marginTop:32}}>
        {result.replace(possibleTxId,"")} {extraLink}
      </div>
    )

  } else if(isSigner){
    display = (
      <div>
        <div>
        <p>Add your information(name, nft token ID of which you want to print to 3D Model, tel and addr):</p>
        <textarea
            type="text"
            value={extraData}
            onChange={handleSignDataChange}
            style={{ width: '25%', minHeight: '10px', marginTop: '5px' }}
          ></textarea>
        </div>
      <Button loading={loading} style={{marginTop:32}} type="primary" onClick={async ()=>{

        setLoading(true)
        try{
          msgToSign = await axios.get(serverUrl)
          setMsgToSign(msgToSign)
          console.log("msgToSign", msgToSign)
          // TODO: change "DongciDaciDongciDaciDongciDaciDongciDaciDongciDaci" to an text area above the btn
          let message = msgToSign.data + ";" + extraData;
          if(message && message.length > 32){//<--- traffic escape hatch?
            let currentLoader = setTimeout(()=>{setLoading(false)},4000)
            // let message = msgToSign.data.replace("**ADDRESS**",address)
            
            let sig = await injectedProvider.send("personal_sign", [ message, address ]);
            clearTimeout(currentLoader);
            currentLoader = setTimeout(()=>{setLoading(false)},4000);
            console.log("sig",sig)
            const res = await axios.post(serverUrl, {
              address: address,
              message: message,
              signature: sig,
              unique_id: msgToSign.data,
            })
            clearTimeout(currentLoader)
            setLoading(false)
            console.log("RESULT:",res)
            if(res.data){
              setResult(res.data)
            }
          }else{
            setLoading(false)
            setResult("😅 Sorry, the server is overloaded. Please try again later. ⏳")
          }
        }catch(e){
          message.error(' Sorry, the server is overloaded. 🧯🚒🔥');
          console.log("FAILED TO GET...")
          console.log("hhhh"+e)
        }



      }}>
        <span style={{marginRight:8}}>🔏</span>  sign order info and submit
      </Button>
      </div>
    )
  }

  return (
    <div className="App">
      {/* ✏️ Edit the header and change the title to your project name */}
      <Header />
      <NetworkDisplay
        NETWORKCHECK={NETWORKCHECK}
        localChainId={localChainId}
        selectedChainId={selectedChainId}
        targetNetwork={targetNetwork}
        logoutOfWeb3Modal={logoutOfWeb3Modal}
        USE_NETWORK_SELECTOR={USE_NETWORK_SELECTOR}
      />
      <Menu style={{ textAlign: "center", marginTop: 40 }} selectedKeys={[location.pathname]} mode="horizontal">
        <Menu.Item key="/Tai-Shang-Voxel-Handler">
          <Link to="/Tai-Shang-Voxel-Handler">App Home</Link>
        </Menu.Item>
        <Menu.Item key="/Tai-Shang-Voxel-Handler/debug">
          <Link to="/Tai-Shang-Voxel-Handler/debug">Debug Contracts</Link>
        </Menu.Item>
        <Menu.Item key="/Tai-Shang-Voxel-Handler/play_with_voxel">
          <Link to="/Tai-Shang-Voxel-Handler/play_with_voxel">Play With Voxel</Link>
        </Menu.Item>
        {/* <Menu.Item key="/hints">
          <Link to="/hints">Hints</Link>
        </Menu.Item>
        <Menu.Item key="/exampleui">
          <Link to="/exampleui">ExampleUI</Link>
        </Menu.Item>
        <Menu.Item key="/mainnetdai">
          <Link to="/mainnetdai">Mainnet DAI</Link>
        </Menu.Item>
        <Menu.Item key="/subgraph">
          <Link to="/subgraph">Subgraph</Link>
        </Menu.Item> */}
      </Menu>

      <Switch>
        <Route exact path="/Tai-Shang-Voxel-Handler/">
          {/* pass in any web3 props to this Home component. For example, yourLocalBalance */}
          <Home
            isSigner={userSigner}
            yourCollectibles={yourCollectibles}
            loadWeb3Modal={loadWeb3Modal}
            address={address}
            blockExplorer={blockExplorer}
            mainnetProvider={mainnetProvider}
            tx={tx}
            writeContracts={writeContracts}
            readContracts={readContracts}
            />
        </Route>
        <Route exact path="/Tai-Shang-Voxel-Handler/debug">
          {/*
                🎛 this scaffolding is full of commonly used components
                this <Contract/> component will automatically parse your ABI
                and give you a form to interact with it locally
            */}

          <Contract
            name="TaiShangVoxel"
            price={price}
            signer={userSigner}
            provider={localProvider}
            address={address}
            blockExplorer={blockExplorer}
            contractConfig={contractConfig}
          />
        </Route>
        <Route exact path="/Tai-Shang-Voxel-Handler/play_with_voxel">
          <p></p>
          <p></p>
          <p>
            {/*
              todo: style good
            */}
            <img src="/magic-voxel.jpeg" style={{ zoom: '5%' }} alt="MagicVoxel"/>
            Create Voxels! &nbsp;
            <a href="https://www.youtube.com/watch?v=J5fK79E_RXE" target="_blank" rel="noreferrer">
              Tutorial
            </a>
            &nbsp;/&nbsp;
            <a href="https://ephtracy.github.io/#ss-carousel_ss" target="_blank" rel="noreferrer">
              Download MagicVoxel
            </a>
          </p>
          <p></p>
          <p>↓</p>
          <p></p>
          <a href="https://arweave.net/7izfDARufPcQr0qNLYtVGaeZK1UlQM8B_2VFznNosMs" target="_blank" rel="noreferrer">
            Upload Voxel File to Arweave by Permaweb Dropper on Arweave
          </a>
          <p></p>
          <p>↓</p>
          <p></p>
          <a href="https://mirror.xyz/0x73c7448760517E3E6e416b2c130E3c6dB2026A1d/OzUFOPfgAcZQ4MY1eu3ce87SMULiccAFeeIcCWBfuAg" target="_blank" rel="noreferrer">
            Voxel to HTML by Github-pages Using Template
          </a>
          <p></p>
          <p>↓</p>
          <p></p>
          <a href="/" target="" rel="noreferrer">
            Mint Voxel as an NFT!
          </a>
          <p></p>
          <p>↓</p>
          <p></p>
          <p>
            Make Voxel NFT from Virtual to Actual One by 3D Print! 
          </p>
          <br></br>
          {display}
        </Route>
      </Switch>

      <ThemeSwitch />

      {/* 👨‍💼 Your account is in the top right with a wallet at connect options */}
      <div style={{ position: "fixed", textAlign: "right", right: 0, top: 0, padding: 10 }}>
        <div style={{ display: "flex", flex: 1, alignItems: "center" }}>
          {USE_NETWORK_SELECTOR && (
            <div style={{ marginRight: 20 }}>
              <NetworkSwitch
                networkOptions={networkOptions}
                selectedNetwork={selectedNetwork}
                setSelectedNetwork={setSelectedNetwork}
              />
            </div>
          )}
          <Account
            useBurner={USE_BURNER_WALLET}
            address={address}
            localProvider={localProvider}
            userSigner={userSigner}
            mainnetProvider={mainnetProvider}
            price={price}
            web3Modal={web3Modal}
            loadWeb3Modal={loadWeb3Modal}
            logoutOfWeb3Modal={logoutOfWeb3Modal}
            blockExplorer={blockExplorer}
          />
        </div>
        {yourLocalBalance.lte(ethers.BigNumber.from("0")) && (
          <FaucetHint localProvider={localProvider} targetNetwork={targetNetwork} address={address} />
        )}
      </div>

      {/* 🗺 Extra UI like gas price, eth price, faucet, and support: */}
      <div style={{ position: "fixed", textAlign: "left", left: 0, bottom: 20, padding: 10 }}>
        <Row align="middle" gutter={[4, 4]}>
          <Col span={8}>
            <Ramp price={price} address={address} networks={NETWORKS} />
          </Col>

          <Col span={8} style={{ textAlign: "center", opacity: 0.8 }}>
            <GasGauge gasPrice={gasPrice} />
          </Col>
          <Col span={8} style={{ textAlign: "center", opacity: 1 }}>
            <Button
              onClick={() => {
                window.open("https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA");
              }}
              size="large"
              shape="round"
            >
              <span style={{ marginRight: 8 }} role="img" aria-label="support">
                💬
              </span>
              Support
            </Button>
          </Col>
        </Row>

        <Row align="middle" gutter={[4, 4]}>
          <Col span={24}>
            {
              /*  if the local provider has a signer, let's show the faucet:  */
              faucetAvailable ? (
                <Faucet localProvider={localProvider} price={price} ensProvider={mainnetProvider} />
              ) : (
                ""
              )
            }
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default App;
