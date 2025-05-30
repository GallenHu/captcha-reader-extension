import { useState, useEffect } from "react";
import reactLogo from "@/assets/react.svg";
import wxtLogo from "/wxt.svg";
import "./App.css";
import { getStorage, setStorage } from "../utils/storage.utils";
import { Check, LoaderCircle } from "lucide-react";
import { MESSAGE_ACTION } from "../constants/message";
import browser, { addMessageListener } from "../utils/browser.utils";
import CopyButton from "./CopyButton";

function App() {
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState("");
  const [provider, setProvider] = useState("");
  const [predicted, setPredicted] = useState<string[]>([]);
  const [showPredicted, setShowPredicted] = useState(false);
  const [showErr, setShowErr] = useState("");

  useEffect(() => {
    addMessageListener((request, sender, sendResponse) => {
      switch (request.action) {
        case MESSAGE_ACTION.START_LOADING:
          setLoading(true);
          break;
        case MESSAGE_ACTION.STOP_LOADING:
          setLoading(false);
          break;
        case MESSAGE_ACTION.SHOW_PREDICTED:
          setPredicted(request.data);
          setShowPredicted(true);
          break;
        case MESSAGE_ACTION.SHOW_ERROR:
          setShowErr(String(request.data));
          break;
        default:
          break;
      }
    });

    getStorage("model").then((value) => {
      setModel(value);
    });

    getStorage("provider").then((value) => {
      setProvider(value);
    });
  }, []);

  const renderLoading = () => {
    return <LoaderCircle className="animate-spin" />;
  };

  const renderPredicted = () => {
    return (
      <div style={{ textAlign: "left", width: "150px" }}>
        <div style={{ marginBottom: "10px" }}>
          {chrome.i18n.getMessage("predictedResults")}:
        </div>

        <ul style={{ padding: 0 }}>
          {predicted.map((item) => (
            <li key={item} style={{ marginBottom: "6px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>{item}</span>

                <CopyButton copyText={item} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const goOptionsPage = () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL("options.html"));
    }
  };

  const renderSettingButton = () => {
    return (
      <button className="button" onClick={goOptionsPage}>
        {chrome.i18n.getMessage("settings")}
      </button>
    );
  };

  const renderErrorMsg = () => {
    return (
      <div style={{ textAlign: "center" }}>
        <div>Error: {showErr}</div>
        <div style={{ marginTop: "20px" }}>{renderSettingButton()}</div>
      </div>
    );
  };

  const renderConfigure = () => {
    return (
      <div style={{ textAlign: "center" }}>
        <div>
          <span style={{ marginRight: "5px" }}>
            {chrome.i18n.getMessage("currentModel")}:
          </span>

          <span style={{ fontWeight: 500, fontSize: "16px" }}>
            {model || chrome.i18n.getMessage("notSet")}
          </span>

          {provider ? (
            <span style={{ marginLeft: "5px" }}>
              (<span>{provider}</span>)
            </span>
          ) : null}
        </div>

        {model && (
          <div style={{ color: "#aaa", fontSize: "12px", marginTop: "10px" }}>
            Right-click the CAPTCHA image to start.
          </div>
        )}

        <div style={{ marginTop: "20px" }}>{renderSettingButton()}</div>
      </div>
    );
  };

  return showErr
    ? renderErrorMsg()
    : loading
    ? renderLoading()
    : showPredicted
    ? renderPredicted()
    : renderConfigure();
}

export default App;
