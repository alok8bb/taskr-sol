"use client";

import React, { useEffect } from "react";

export default function ClientSideStyles() {
    useEffect(() => {
        require("@solana/wallet-adapter-react-ui/styles.css");
    }, []);

    return null;
}
