import { useEffect, useState } from "react";

type RohProdukt = {
  [key: string]: any;
};

type Produkt = {
  artikel: string;
  barcode: string;
  beschreibung: string;
  preis: string;
};

export default function BarcodeInput() {
  const [produkte, setProdukte] = useState<Produkt[]>([]);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [artikelInput, setArtikelInput] = useState("");
  const [barcodeTreffer, setBarcodeTreffer] = useState<Produkt[]>([]);
  const [artikelTreffer, setArtikelTreffer] = useState<Produkt[]>([]);

  useEffect(() => {
    fetch("/produkte.json")
      .then((res) => res.json())
      .then((data: RohProdukt[]) => {
        const umgewandelt: Produkt[] = data.map((p) => ({
          artikel: p["Artikel"],
          barcode: String(p["Barcode"]),
          beschreibung: p["Beschreibung"],
          preis: String(p["Warenwert \npro Stk. [CHF]"]),
        }));
        setProdukte(umgewandelt);
      });
  }, []);

  const handleBarcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.trim();
    setBarcodeInput(input);
    const treffer = produkte.filter((p) => p.barcode === input);
    setBarcodeTreffer(treffer);
  };

  const handleArtikelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.trim().toLowerCase();
    setArtikelInput(e.target.value);
    const treffer = produkte.filter((p) =>
      p.artikel.toLowerCase().includes(input)
    );
    setArtikelTreffer(treffer);
  };

  return (
  <div>
    <h2>Barlo – Barcode & Produktsuche</h2>

    {/* Barcode-Suche */}
    <div className="search-section">
      <label>🔢 Barcode suchen:</label>
      <input
        type="text"
        value={barcodeInput}
        onChange={handleBarcodeChange}
        placeholder="z. B. 5449000131836"
      />
      {barcodeInput && barcodeTreffer.length > 0 && (
        <ul className="product-list">
          {barcodeTreffer.map((p, i) => (
            <li key={i} className="product-item">
              <strong>{p.artikel}</strong>
              Preis: CHF {p.preis}
            </li>
          ))}
        </ul>
      )}
      {barcodeInput && barcodeTreffer.length === 0 && <p>Kein Produkt gefunden</p>}
    </div>

    {/* Artikelsuche */}
    <div className="search-section">
      <label>📝 Artikelname suchen:</label>
      <input
        type="text"
        value={artikelInput}
        onChange={handleArtikelChange}
        placeholder="z. B. Cola, Fanta, Mango…"
      />
      {artikelInput && artikelTreffer.length > 0 && (
        <ul className="product-list">
          {artikelTreffer.map((p, i) => (
            <li key={i} className="product-item">
              <strong>{p.artikel}</strong>
              Preis: CHF {p.preis}
            </li>
          ))}
        </ul>
      )}
      {artikelInput && artikelTreffer.length === 0 && <p>Kein Produkt gefunden</p>}
    </div>
  </div>
);

}
