import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

const Home: NextPage = () => {
  return (
    <div>
      <button
        className="bg-red-500 p-16"
        onClick={() => fetch("/api/aliexpress-scrap")}
      >
        Aliexpress
      </button>
      <button
        className="bg-red-500 p-16"
        onClick={() => fetch("/api/amazon-scrap")}
      >
        Amazon
      </button>
    </div>
  );
};

export default Home;
