import type { ReactNode } from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import Heading from "@theme/Heading";
import styles from "./styles.module.css";

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<"svg">>;
  description: ReactNode;
  link: string;
};

const FeatureList: FeatureItem[] = [
  {
    title: "WordPress Site",
    Svg: require("@site/static/img/undraw_docusaurus_mountain.svg").default,
    description: (
      <>
        Full documentation for the WordPress deployment, including setup,
        plugins, and integration details.
      </>
    ),
    link: "/wordpress-site/intro",
  },
  {
    title: "Orchestrator",
    Svg: require("@site/static/img/undraw_docusaurus_tree.svg").default,
    description: (
      <>
        Flask-based bridge that connects chat interfaces to CrewAI agents with
        observability and compliance guardrails.
      </>
    ),
    link: "/orchestrator/intro",
  },
  {
    title: "RagTool",
    Svg: require("@site/static/img/undraw_docusaurus_react.svg").default,
    description: (
      <>
        CrewAI-powered RAG service providing VAT expertise, Railway deployment
        guidance, and LangSmith monitoring.
      </>
    ),
    link: "/ragtool/intro",
  },
];

function Feature({ title, Svg, description, link }: FeatureItem) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">
          <Link to={link} className={styles.featureLink}>
            {title}
          </Link>
        </Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
