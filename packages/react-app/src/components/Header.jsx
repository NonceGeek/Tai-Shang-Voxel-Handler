import { PageHeader } from "antd";
import React from "react";

// displays a page header

export default function Header() {
  return (
    <a href="https://github.com/WeLightProject/Tai-Shang-Voxel-Handler" target="_blank" rel="noopener noreferrer">
      <PageHeader
        title="TaiShang Voxel Handler"
        subTitle="handle voxel to html page, NFT and actual Model by 3D printer!"
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
