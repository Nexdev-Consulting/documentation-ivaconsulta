import React from "react";
import Layout from "@theme-original/Layout";
import AuthGate from "@site/src/components/AuthGate";

export default function LayoutWrapper(props) {
  return (
    <Layout {...props}>
      <AuthGate>{props.children}</AuthGate>
    </Layout>
  );
}

