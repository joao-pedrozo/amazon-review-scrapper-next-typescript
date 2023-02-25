import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

const Home: NextPage = () => {
  return (
    <div>
      <button
        className="bg-red-500 p-64"
        onClick={() => fetch("/api/aliexpress-scrap")}
      >
        oi
      </button>
    </div>
  );
};

export default Home;
