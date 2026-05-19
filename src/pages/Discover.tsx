import { TitleSearchPanel } from "../components/TitleSearchPanel";
import { useCollection } from "../hooks/useCollection";

export function Discover() {
  const { items, save } = useCollection();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Discover</h1>
        <p className="text-sm text-vault-muted">
          Search for physical 4K Blu-ray releases, then verify candidates through configured providers, Blu-ray.com, or 4KFilmDb reference links.
        </p>
      </div>
      <TitleSearchPanel
        items={items}
        onSaveItem={save}
        emptyCopy="Search for physical 4K Blu-ray releases. Results from TMDb or reference sites are not release proof and require manual confirmation before adding."
      />
    </div>
  );
}
