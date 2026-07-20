import Link from "next/link";
import { House, Layers3 } from "lucide-react";
export default function NotFound(){return <main id="main" className="not-found"><span>404 / UNKNOWN ROUTE</span><h1>This structure does not resolve.</h1><p>The address may have changed, or the page may never have existed.</p><div className="actions"><Link className="button" href="/"><House aria-hidden="true" />Return home</Link><Link className="button button-secondary" href="/ecosystem"><Layers3 aria-hidden="true" />Explore products</Link></div></main>}
