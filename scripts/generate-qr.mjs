import QRCode from "qrcode";

const url = process.argv[2];
if (!url || !/^https:\/\//i.test(url)) {
  console.error("Usage: npm run qr -- https://your-production-url.vercel.app");
  process.exit(1);
}

await QRCode.toFile("public/kzero-lead-qr.png", url, {
  errorCorrectionLevel: "H",
  width: 1400,
  margin: 4,
  color: { dark: "#101114", light: "#FFFFFF" }
});
console.log(`QR code created at public/kzero-lead-qr.png for ${url}`);
