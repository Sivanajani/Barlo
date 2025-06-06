import { useEffect, useRef } from "react";
import Quagga from "@ericblade/quagga2";

type Props = {
  onScanSuccess: (code: string) => void;
};

export default function BarcodeScanner({ onScanSuccess }: Props) {
  const scannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scannerRef.current) return;

    Quagga.init(
      {
        inputStream: {
          type: "LiveStream",
          target: scannerRef.current!,
          constraints: {
            facingMode: "environment",
            width: { min: 640 },
            height: { min: 480 },
          },
        },
        decoder: {
          readers: [
            "ean_reader",
            "ean_8_reader",
            "code_128_reader",
            "upc_reader",
            "code_39_reader",
            "upc_e_reader", 
          ],
        },
        locate: true,
        locator: {
            patchSize: "medium", // "x-small", "small", "medium", "large", "x-large"
            halfSample: true,
        },
        numOfWorkers: 0,
      },
      (err) => {
        if (err) {
          console.error("Quagga init error:", err);
          return;
        }
        Quagga.start();
      }
    );

    const onDetected = (result: any) => {
      const code = result?.codeResult?.code;
      if (code) {
        onScanSuccess(code);
        Quagga.stop();
        Quagga.offDetected(onDetected);
      }
    };

    Quagga.onDetected(onDetected);

    return () => {
      Quagga.stop();
      Quagga.offDetected(onDetected);
    };
  }, [onScanSuccess]);

  return (
    <div
      ref={scannerRef}
      style={{
        width: "100%",
        maxWidth: 400,
        height: 300,
        border: "2px solid #ccc",
        borderRadius: "8px",
      }}
    />
  );
}