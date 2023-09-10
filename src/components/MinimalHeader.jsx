import React from "react";
import {Menu} from "antd";

function MinimalHeader() {
  const items = [
    {
      label: (
        <a href="https://github.com/orgs/TempoGeoPoliticalMap/projects/1" target="_blank" rel="noreferrer">
          DEV
        </a>
      ),
      key: "dev"
    },
    {
      label: (
        <a href="https://github.com/TempoGeoPoliticalMap" target="_blank" rel="noreferrer">
          GIT
        </a>
      ),
      key: "git"
    },
    {
      label: (
        <a href="https://docs.tgpm.world" target="_blank" rel="noreferrer">
          DOCS
        </a>
      ),
      key: "docs"
    },
    {
      label: (
        <a href="https://api.tgpm.world" target="_blank" rel="noreferrer">
          API
        </a>
      ),
      key: "api"
    }
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8 w-full max-w-9xl mx-auto font-semibold">
      <Menu mode="horizontal" style={{justifyContent: "flex-end"}} items={items} />
    </div>
  );
}

export default MinimalHeader;
