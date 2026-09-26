import { useEffect, useState } from "react";
import QRCode from "qrcode";

export default function TicketQRCode({ value, size = 140, className = "" }) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    if (!value) {
      // QR generation is asynchronous; reset the previous image when the ticket changes.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSrc("");
      return;
    }

    QRCode.toDataURL(value, {
      width: size,
      margin: 2,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    })
      .then((url) => setSrc(url))
      .catch((error) => {
        console.error("QR generation failed", error);
        setSrc("");
      });
  }, [value, size]);

  return src ? (
    <img
      src={src}
      width={size}
      height={size}
      className={className}
      alt="Ticket QR code"
    />
  ) : (
    <div
      className={`${className} flex items-center justify-center rounded-3xl border border-slate-200 bg-slate-50 text-center text-xs text-slate-500`}
      style={{ width: size, height: size }}
    >
      Generating QR...
    </div>
  );
}
