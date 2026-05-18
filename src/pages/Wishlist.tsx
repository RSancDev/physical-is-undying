import { ExternalLink, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { buildBluRaySearchUrl } from "../providers/bluRayDotCom";
import { useCollection } from "../hooks/useCollection";

export function Wishlist() {
  const { items, save } = useCollection();
  const wishlist = items.filter((item) => item.wishlist);
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Wishlist</h1>
          <p className="text-sm text-vault-muted">Wanted physical 4K releases with target price, edition, notes, and retailer links.</p>
        </div>
        <Link className="btn btn-primary" to="/add">Add wanted release</Link>
      </div>
      {wishlist.length === 0 ? (
        <div className="surface p-6 text-vault-muted">No wishlist releases yet.</div>
      ) : (
        <div className="space-y-3">
          {wishlist.map((item) => (
            <article key={item.id} className="surface grid gap-4 p-4 md:grid-cols-[1fr_auto]">
              <div>
                <Link to={`/release/${item.id}`} className="text-lg font-semibold hover:text-vault-cyan">{item.title}</Link>
                <p className="text-sm text-vault-muted">{[item.preferredEdition ?? item.editionName, item.packaging, item.releaseDate, item.targetPrice ? `$${item.targetPrice}` : undefined].filter(Boolean).join(" · ")}</p>
                <p className="mt-2 text-sm text-vault-muted">{item.notes}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button className="btn btn-primary" onClick={() => void save({ ...item, owned: true, wishlist: false, purchaseDate: new Date().toISOString().slice(0, 10) })}><ShoppingBag size={16} /> Purchased</button>
                <a className="btn" href={buildBluRaySearchUrl(item.title, item.year)} target="_blank" rel="noreferrer"><ExternalLink size={16} /> Blu-ray.com</a>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
