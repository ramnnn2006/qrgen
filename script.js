const controls = {
  qrType: document.getElementById("qr-type"),
  contentInputs: document.getElementById("content-inputs"),
  dotsStyle: document.getElementById("dots-style"),
  cornersSquareStyle: document.getElementById("corners-square-style"),
  cornersDotStyle: document.getElementById("corners-dot-style"),
  color1: document.getElementById("color-1"),
  color2: document.getElementById("color-2"),
  bgColor: document.getElementById("bg-color"),
  gradientType: document.getElementById("gradient-type"),
  logoUpload: document.getElementById("logo-upload"),
  imageMargin: document.getElementById("image-margin"),
  errorMessage: document.getElementById("error-message"),
};

const qrCode = new QRCodeStyling({
  width: 290,
  height: 290,
  data: "https://youtu.be/dQw4w9WgXcQ?si",
  margin: 10,
  type: "svg",
  dotsOptions: { color: "#000000", type: "square" },
  backgroundOptions: { color: "#ffffff" },
  imageOptions: { crossOrigin: "anonymous", margin: 10 },
  cornersSquareOptions: { type: "square" },
  cornersDotOptions: { type: "square" },
});

qrCode.append(document.getElementById("canvas-container"));

const tabs = document.querySelectorAll(".tab-button");
const panels = {
  content: document.getElementById("content-panel"),
  style: document.getElementById("style-panel"),
  logo: document.getElementById("logo-panel"),
};

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    Object.values(panels).forEach((p) => p.classList.add("hidden"));
    panels[tab.dataset.tab].classList.remove("hidden");
  });
});

const contentTemplates = {
  text: `<div class="control-group"><label>URL / Text</label><input type="text" id="text-input" placeholder="https://example.com"></div>`,
  wifi: `
        <div class="control-group"><label>SSID</label><input type="text" id="wifi-ssid" placeholder="Network Name"></div>
        <div class="control-group"><label>Password</label><input type="text" id="wifi-pass" placeholder="Password"></div>
        <div class="control-group"><label>Encryption</label><select id="wifi-encryption"><option value="WPA">WPA/WPA2</option><option value="WEP">WEP</option><option value="nopass">None</option></select></div>
    `,
  vcard: `
        <div class="control-group"><label>Full Name</label><input type="text" id="vcard-name" placeholder="Name"></div>
        <div class="control-group"><label>Phone</label><input type="tel" id="vcard-phone" placeholder="Phone"></div>
        <div class="control-group"><label>Email</label><input type="email" id="vcard-email" placeholder="Email"></div>
        <div class="control-group"><label>Org</label><input type="text" id="vcard-org" placeholder="Organization"></div>
    `,
  email: `
        <div class="control-group"><label>To</label><input type="email" id="email-to" placeholder="email@example.com"></div>
        <div class="control-group"><label>Subject</label><input type="text" id="email-subject" placeholder="Subject"></div>
        <div class="control-group"><label>Message</label><textarea id="email-body" placeholder="Message..." rows="3"></textarea></div>
    `,
};

const renderContentInputs = () => {
  const type = controls.qrType.value;
  controls.contentInputs.innerHTML = contentTemplates[type];
  document
    .querySelectorAll(
      "#content-inputs input, #content-inputs select, #content-inputs textarea",
    )
    .forEach((el) => {
      el.addEventListener("input", updateQRCode);
    });
};

const getQRCodeData = () => {
  const type = controls.qrType.value;
  switch (type) {
    case "wifi":
      const ssid = document.getElementById("wifi-ssid").value;
      const pass = document.getElementById("wifi-pass").value;
      const enc = document.getElementById("wifi-encryption").value;
      return `WIFI:T:${enc};S:${ssid};P:${pass};;`;
    case "vcard":
      const name = document.getElementById("vcard-name").value;
      const phone = document.getElementById("vcard-phone").value;
      const email = document.getElementById("vcard-email").value;
      const org = document.getElementById("vcard-org").value;
      return `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nORG:${org}\nTEL:${phone}\nEMAIL:${email}\nEND:VCARD`;
    case "email":
      const to = document.getElementById("email-to").value;
      const subject = document.getElementById("email-subject").value;
      const body = document.getElementById("email-body").value;
      return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    case "text":
    default:
      const inputEl = document.getElementById("text-input");
      const text = inputEl ? inputEl.value : "";
      return text.trim() === "" ? "https://youtu.be/dQw4w9WgXcQ?si" : text.trim();
  }
};

const updateQRCode = () => {
  try {
    const gradientOptions =
      controls.gradientType.value !== "none"
        ? {
            type: controls.gradientType.value,
            colorStops: [
              { offset: 0, color: controls.color1.value },
              { offset: 1, color: controls.color2.value },
            ],
          }
        : null;

    const newOptions = {
      data: getQRCodeData(),
      dotsOptions: {
        type: controls.dotsStyle.value,
        ...(gradientOptions
          ? { gradient: gradientOptions }
          : { color: controls.color1.value }),
      },
      cornersSquareOptions: { type: controls.cornersSquareStyle.value },
      cornersDotOptions: { type: controls.cornersDotStyle.value },
      backgroundOptions: { color: controls.bgColor.value },
      imageOptions: { margin: parseInt(controls.imageMargin.value) || 0 },
    };

    qrCode.update(newOptions);
    controls.errorMessage.textContent = "";
  } catch (error) {
    console.error(error);
    controls.errorMessage.textContent = "Data is too long for a QR Code.";
  }
};

controls.qrType.addEventListener("change", () => {
  renderContentInputs();
  updateQRCode();
});

document
  .querySelectorAll("#style-panel select, #style-panel input")
  .forEach((el) => {
    el.addEventListener("input", updateQRCode);
  });

document.querySelectorAll("#logo-panel input").forEach((el) => {
  if (el.id !== "logo-upload") el.addEventListener("input", updateQRCode);
});

controls.logoUpload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => qrCode.update({ image: reader.result });
    reader.readAsDataURL(file);
  } else {
    qrCode.update({ image: null });
  }
});

document
  .getElementById("download-png")
  .addEventListener("click", () =>
    qrCode.download({ name: "qrcode", extension: "png" }),
  );
document
  .getElementById("download-jpeg")
  .addEventListener("click", () =>
    qrCode.download({ name: "qrcode", extension: "jpeg" }),
  );
document
  .getElementById("download-svg")
  .addEventListener("click", () =>
    qrCode.download({ name: "qrcode", extension: "svg" }),
  );

renderContentInputs();
updateQRCode();
