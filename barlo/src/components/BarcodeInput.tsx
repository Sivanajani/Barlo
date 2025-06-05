import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

// MUI Icons
import BarcodeIcon from "@mui/icons-material/QrCodeScanner";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";

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
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editedProdukt, setEditedProdukt] = useState<Partial<Produkt>>({});

  const formatPreis = (preis: string) =>
    new Intl.NumberFormat("de-CH", {
      style: "currency",
      currency: "CHF",
      minimumFractionDigits: 2,
    }).format(parseFloat(preis));

  const normalize = (text: string) =>
    text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

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

  const handleEdit = (index: number, quelle: "artikel" | "barcode") => {
    setEditIndex(index);
    const produkt = quelle === "artikel" ? artikelTreffer[index] : barcodeTreffer[index];
    setEditedProdukt(produkt);
  };

  const handleInputChange = (field: keyof Produkt, value: string) => {
    setEditedProdukt((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (index: number, quelle: "artikel" | "barcode") => {
    const produkt = quelle === "artikel" ? artikelTreffer[index] : barcodeTreffer[index];
    const updateData = {
      Artikel: editedProdukt.artikel,
      Barcode: editedProdukt.barcode,
      Beschreibung: editedProdukt.beschreibung,
      Warenwert: editedProdukt.preis,
    };

    const { error } = await supabase
      .from("products")
      .update(updateData)
      .eq("Barcode", produkt.barcode);

    if (error) {
      console.error("Fehler beim Speichern:", error.message);
      return;
    }

    const neueProdukte = produkte.map((p) =>
      p.barcode === produkt.barcode ? { ...p, ...editedProdukt } as Produkt : p
    );
    setProdukte(neueProdukte);

    if (quelle === "artikel") {
      const neueTreffer = artikelTreffer.map((p, i) =>
        i === index ? { ...p, ...editedProdukt } as Produkt : p
      );
      setArtikelTreffer(neueTreffer);
    } else {
      const neueTreffer = barcodeTreffer.map((p, i) =>
        i === index ? { ...p, ...editedProdukt } as Produkt : p
      );
      setBarcodeTreffer(neueTreffer);
    }

    setEditIndex(null);
    setEditedProdukt({});
  };

  const renderProdukt = (p: Produkt, i: number, quelle: "artikel" | "barcode") =>
    editIndex === i ? (
      <Stack direction="row" spacing={1} flexWrap="wrap">
        <TextField
          placeholder="Artikel"
          variant="standard"
          value={editedProdukt.artikel || ""}
          onChange={(e) => handleInputChange("artikel", e.target.value)}
          size="small"
        />
        <TextField
          placeholder="Beschreibung"
          variant="standard"
          value={editedProdukt.beschreibung || ""}
          onChange={(e) => handleInputChange("beschreibung", e.target.value)}
          size="small"
        />
        <TextField
          placeholder="Preis (CHF)"
          variant="standard"
          value={editedProdukt.preis || ""}
          onChange={(e) => handleInputChange("preis", e.target.value)}
          size="small"
        />
        <TextField
          placeholder="Barcode"
          variant="standard"
          value={editedProdukt.barcode || ""}
          onChange={(e) => handleInputChange("barcode", e.target.value)}
          size="small"
        />
        <IconButton onClick={() => handleSave(i, quelle)} color="primary">
          <SaveIcon />
        </IconButton>
      </Stack>
    ) : (
      <>
        <strong>{p.artikel}</strong><br />
        {p.beschreibung && <span>{p.beschreibung}<br /></span>}
        Preis: {formatPreis(p.preis)}
        <IconButton onClick={() => handleEdit(i, quelle)} size="small">
          <EditIcon />
        </IconButton>
      </>
    );

  return (
    <div>
      <h2>Barlo – Barcode & Produktsuche</h2>

      {/* Barcode-Suche */}
      <div className="search-section">
        <label>
          <BarcodeIcon style={{ verticalAlign: "middle", marginRight: "0.3rem" }} />
          Barcode suchen:
        </label>
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
                {renderProdukt(p, i, "barcode")}
              </li>
            ))}
          </ul>
        )}
        {barcodeInput && barcodeTreffer.length === 0 && <p>Kein Produkt gefunden</p>}
      </div>

      {/* Artikelsuche */}
      <div className="search-section">
        <label>
          <TextFieldsIcon style={{ verticalAlign: "middle", marginRight: "0.3rem" }} />
          Artikelname suchen:
        </label>
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
                {renderProdukt(p, i, "artikel")}
              </li>
            ))}
          </ul>
        )}
        {artikelInput && artikelTreffer.length === 0 && <p>Kein Produkt gefunden</p>}
      </div>
    </div>
  );
}