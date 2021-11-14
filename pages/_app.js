import Link from "next/link"
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <Link href="/">
        <a>Home</a>
      </Link>
      <Link href="/create-item">
        <a> Upload Nft</a>
      </Link>
      <Link href="/my-assets">
        <a> My Assets</a>
      </Link>
      <Link href="/my-creations">
        <a> My Creations</a>
      </Link>
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp
