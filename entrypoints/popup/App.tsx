import { useState, useEffect } from "react";
import reactLogo from "@/assets/react.svg";
import wxtLogo from "/wxt.svg";
import "./App.css";
import { getStorage, setStorage } from "../utils/storage.utils";
import { Check, LoaderCircle } from "lucide-react";
import { MESSAGE_ACTION } from "../constants/message";
import browser, { addMessageListener } from "../utils/browser.utils";

function App() {
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState("");
  const [provider, setProvider] = useState("");
  const [showOk, setShowOk] = useState(false);
  const [predicted, setPredicted] = useState<string[]>([]);
  const [showPredicted, setShowPredicted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setStorage("model", model);
    setStorage("provider", provider);

    setShowOk(true);

    setTimeout(() => {
      setShowOk(false);
    }, 3000);
  };

  const handleChangeProvider = (value: string) => {
    setProvider(value);
  };

  useEffect(() => {
    addMessageListener((request, sender, sendResponse) => {
      switch (request.action) {
        case MESSAGE_ACTION.START_LOADING:
          setLoading(true);
          break;
        case MESSAGE_ACTION.STOP_LOADING:
          setLoading(false);
          break;
        case MESSAGE_ACTION.PREDICTED:
          setPredicted(request.data);
          setShowPredicted(true);
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
      <div>
        <div>预测结果</div>

        <ul>
          {predicted.map((item) => (
            <li key={item}>{item}</li>
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

  const renderConfigure = () => {
    return (
      <div style={{ textAlign: "center" }}>
        <div>{chrome.i18n.getMessage("currentModel")}: </div>

        <div style={{ fontWeight: 500, fontSize: "16px" }}>
          <span>{model || chrome.i18n.getMessage("notSet")}</span>

          {provider ? (
            <span style={{ marginLeft: "5px" }}>
              (<span>{provider}</span>)
            </span>
          ) : null}
        </div>

        <div style={{ color: "#aaa", fontSize: "12px", marginTop: "10px" }}>
          Right-click the CAPTCHA image to start.
        </div>

        <div style={{ marginTop: "20px" }}>
          <button className="button" onClick={goOptionsPage}>
            {chrome.i18n.getMessage("settings")}
          </button>
        </div>
      </div>
    );
  };

  return loading
    ? renderLoading()
    : showPredicted
    ? renderPredicted()
    : renderConfigure();
}

export default App;
