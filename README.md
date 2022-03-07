# Tai-Shang-Voxel-Handler

focusing on handle voxel, voxel NFT and actual 3D model of voxel NFT by 3D printer.

0. Prerequisites: [Node (v16 LTS)](https://nodejs.org/en/download/) plus [Yarn](https://classic.yarnpkg.com/en/docs/install/) and [Git](https://git-scm.com/downloads)

1. clone/fork WeLightProject/Tai-Shang-Voxel-Handler:

```bash
git clone https://github.com/WeLightProject/Tai-Shang-Voxel-Handler.git
```

2. install and start your Hardhat chain:

```bash
cd Tai-Shang-Voxel-Handler
yarn install
yarn chain
```

3. in a second terminal window, start your frontend:

```bash
cd Tai-Shang-Voxel-Handler
yarn start
```

4. in a third terminal window, deploy your contract:

```bash
cd Tai-Shang-Voxel-Handler
yarn deploy
```

5. Open http://localhost:3000 to see the app.

6. Download MagicVoxel, use it to make something and save as voxel file.

![1](tutorial_pictures/1_generate%20voxel%20file.png)

7. Upload voxel file to permaweb, login with Arweave wallet first(a json file, create first if having none).

![2](tutorial_pictures/2_upload%20voxel%20file%20to%20permaweb.png)

8. [Using Github pages to serve voxel as HTML](https://mirror.xyz/0x73c7448760517E3E6e416b2c130E3c6dB2026A1d/OzUFOPfgAcZQ4MY1eu3ce87SMULiccAFeeIcCWBfuAg).

9. Mint voxel file as NFT, you will get all required data if you totally follow the above article.

![3](tutorial_pictures/3_mint%20voxel%20as%20nft.png)

10. [Run Backend](https://github.com/WeLightProject/Tai-Shang-Voxel-Handler/blob/master/backend/voxel_handler/README.md), submit the order from dApp to backend.

11. Done! Enjoy and try it!

![4](tutorial_pictures/4_final%20nft.png)
