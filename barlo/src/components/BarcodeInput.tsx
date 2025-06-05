import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

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

  // Preis formatieren als CHF mit zwei Nachkommastellen
  const formatPreis = (preis: string) =>
    new Intl.NumberFormat("de-CH", {
      style: "currency",
      currency: "CHF",
      minimumFractionDigits: 2,
    }).format(parseFloat(preis));

  // Akzentzeichen entfernen (é => e, ô => o etc.)
  const normalize = (text: string) =>
    text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Daten von Supabase laden
  useEffect(() => {
    const fetchProdukte = async () => {
      const { data, error } = await supabase
        .from("products")
        .select('"Artikel", "Barcode", "Beschreibung", "Warenwert"');

      if (error) {
        console.error("Fehler beim Laden:", error.message);
      } else if (data) {
        const umgewandelt: Produkt[] = data.map((p: any) => ({
          artikel: String(p["Artikel"] || ""),
          barcode: String(p["Barcode"] || ""),
          beschreibung: String(p["Beschreibung"] || ""),
          preis: String(p["Warenwert"] ?? "0"),
        }));

        console.log("Geladene Produkte:", umgewandelt);
        setProdukte(umgewandelt);
      }
    };

    fetchProdukte();
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

    const normalizedInput = normalize(input);
    const treffer = produkte.filter((p) =>
      normalize(p.artikel.toLowerCase()).includes(normalizedInput)
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
                <br />
                {p.beschreibung && <span>{p.beschreibung}<br /></span>}
                Preis: {formatPreis(p.preis)}
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
                <br />
                {p.beschreibung && <span>{p.beschreibung}<br /></span>}
                Preis: {formatPreis(p.preis)}
              </li>
            ))}
          </ul>
        )}
        {artikelInput && artikelTreffer.length === 0 && <p>Kein Produkt gefunden</p>}
      </div>
    </div>
  );
}