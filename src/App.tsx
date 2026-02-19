import { useCallback, useEffect, useRef, useState } from "react";
import "./index.css";
import type { ContentType, ExportFormat, QRFormData } from "./qr-utils";
import { buildContent, downloadQR, renderQR } from "./qr-utils";

const TABS: { type: ContentType; label: string }[] = [
  { type: "url", label: "url" },
  { type: "text", label: "text" },
  { type: "wifi", label: "wifi" },
  { type: "email", label: "email" },
  { type: "sms", label: "sms" },
  { type: "vcard", label: "contact" },
];

function App() {
  const [currentType, setCurrentType] = useState<ContentType>("url");
  const [formData, setFormData] = useState<QRFormData>({});
  const [fg, setFg] = useState("#000000");
  const [bg, setBg] = useState("#ffffff");
  const [size, setSize] = useState("256");
  const [format, setFormat] = useState<ExportFormat>("png");
  const [generated, setGenerated] = useState(false);
  const [encodedContent, setEncodedContent] = useState("");

  const qrContainerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const updateField = useCallback((key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const generate = useCallback(async () => {
    const content = buildContent(currentType, formData);
    if (!content || !qrContainerRef.current) return;

    await renderQR(qrContainerRef.current, content, fg, bg);
    setEncodedContent(content);
    setGenerated(true);
  }, [currentType, formData, fg, bg]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(generate, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [generate]);

  const handleGenerate = async () => {
    const content = buildContent(currentType, formData);
    if (!content) return;
    await downloadQR(format, content, parseInt(size), fg, bg);
  };

  return (
    <>
      <header>
        <div className="logo">just.qr</div>
        <div className="tagline">
          100% client-side · no hidden redirects · no paywalls · just the qr
          qode
        </div>
      </header>

      <div className="card">
        <div className="tabs">
          {TABS.map((tab) => (
            <button
              key={tab.type}
              className={`tab${currentType === tab.type ? " active" : ""}`}
              onClick={() => setCurrentType(tab.type)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {currentType === "url" && (
          <div>
            <div className="field">
              <label>url</label>
              <input
                type="url"
                placeholder="https://yoursite.com"
                value={formData.url || ""}
                onChange={(e) => updateField("url", e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && generate()}
              />
            </div>
          </div>
        )}

        {currentType === "text" && (
          <div>
            <div className="field">
              <label>text</label>
              <textarea
                placeholder="Any text, up to ~2KB..."
                value={formData.text || ""}
                onChange={(e) => updateField("text", e.target.value)}
              />
            </div>
          </div>
        )}

        {currentType === "wifi" && (
          <div>
            <div className="field">
              <label>network name (SSID)</label>
              <input
                type="text"
                placeholder="MyNetwork"
                value={formData.wifiSsid || ""}
                onChange={(e) => updateField("wifiSsid", e.target.value)}
              />
            </div>
            <div className="field-row">
              <div className="field">
                <label>password</label>
                <input
                  type="text"
                  placeholder="password"
                  value={formData.wifiPass || ""}
                  onChange={(e) => updateField("wifiPass", e.target.value)}
                />
              </div>
              <div className="field">
                <label>security</label>
                <select
                  value={formData.wifiSec || "WPA"}
                  onChange={(e) => updateField("wifiSec", e.target.value)}
                >
                  <option value="WPA">WPA/WPA2</option>
                  <option value="WEP">WEP</option>
                  <option value="">None</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {currentType === "email" && (
          <div>
            <div className="field">
              <label>to</label>
              <input
                type="email"
                placeholder="someone@example.com"
                value={formData.emailTo || ""}
                onChange={(e) => updateField("emailTo", e.target.value)}
              />
            </div>
            <div className="field">
              <label>subject</label>
              <input
                type="text"
                placeholder="Hello!"
                value={formData.emailSubject || ""}
                onChange={(e) => updateField("emailSubject", e.target.value)}
              />
            </div>
            <div className="field">
              <label>body</label>
              <textarea
                placeholder="Message..."
                value={formData.emailBody || ""}
                onChange={(e) => updateField("emailBody", e.target.value)}
              />
            </div>
          </div>
        )}

        {currentType === "sms" && (
          <div>
            <div className="field">
              <label>phone number</label>
              <input
                type="tel"
                placeholder="+1234567890"
                value={formData.smsNumber || ""}
                onChange={(e) => updateField("smsNumber", e.target.value)}
              />
            </div>
            <div className="field">
              <label>message (optional)</label>
              <textarea
                placeholder="Pre-filled message..."
                value={formData.smsBody || ""}
                onChange={(e) => updateField("smsBody", e.target.value)}
              />
            </div>
          </div>
        )}

        {currentType === "vcard" && (
          <div>
            <div className="field-row">
              <div className="field">
                <label>first name</label>
                <input
                  type="text"
                  placeholder="Jane"
                  value={formData.vcFirst || ""}
                  onChange={(e) => updateField("vcFirst", e.target.value)}
                />
              </div>
              <div className="field">
                <label>last name</label>
                <input
                  type="text"
                  placeholder="Doe"
                  value={formData.vcLast || ""}
                  onChange={(e) => updateField("vcLast", e.target.value)}
                />
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label>phone</label>
                <input
                  type="tel"
                  placeholder="+1234567890"
                  value={formData.vcPhone || ""}
                  onChange={(e) => updateField("vcPhone", e.target.value)}
                />
              </div>
              <div className="field">
                <label>email</label>
                <input
                  type="email"
                  placeholder="jane@example.com"
                  value={formData.vcEmail || ""}
                  onChange={(e) => updateField("vcEmail", e.target.value)}
                />
              </div>
            </div>
            <div className="field">
              <label>organization</label>
              <input
                type="text"
                placeholder="ACME Corp"
                value={formData.vcOrg || ""}
                onChange={(e) => updateField("vcOrg", e.target.value)}
              />
            </div>
            <div className="field">
              <label>website</label>
              <input
                type="url"
                placeholder="https://janedoe.com"
                value={formData.vcUrl || ""}
                onChange={(e) => updateField("vcUrl", e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="options" style={{ marginTop: "16px" }}>
          <div>
            <div className="opt-label">foreground</div>
            <input
              type="color"
              value={fg}
              onChange={(e) => setFg(e.target.value)}
            />
          </div>
          <div>
            <div className="opt-label">background</div>
            <input
              type="color"
              value={bg}
              onChange={(e) => setBg(e.target.value)}
            />
          </div>
          <div>
            <div className="opt-label">size</div>
            <select value={size} onChange={(e) => setSize(e.target.value)}>
              <option value="128">128px</option>
              <option value="256">256px</option>
              <option value="512">512px</option>
              <option value="1024">1024px</option>
            </select>
          </div>
          <div>
            <div className="opt-label">format</div>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as ExportFormat)}
            >
              <option value="png">png</option>
              <option value="svg">svg</option>
              <option value="jpg">jpg</option>
              <option value="webp">webp</option>
            </select>
          </div>
        </div>

        <button className="btn-generate" onClick={handleGenerate}>
          GENERATE QR CODE
        </button>
        <div className="live-badge">
          <span className="live-dot"></span>live preview — updates as you type
        </div>

        <div className={`output${generated ? " visible" : ""}`}>
          <div className="qr-container" ref={qrContainerRef}></div>

          <div className={`encoded-preview${encodedContent ? " visible" : ""}`}>
            {encodedContent}
          </div>

          <div className="no-redirect">
            <span>✓</span> direct link — no redirects, no tracking, no expiry.
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
