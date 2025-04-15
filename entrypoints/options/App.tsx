import { getStorage, setStorage } from "../utils/storage.utils";
import { showToast } from "little-toast";
import { useForm, SubmitHandler } from "react-hook-form";
import "little-toast/dist/styles.css";
import { STORAGE_KEY } from "../constants/storage";

interface IFormInput {
  provider: string;
  model: string;
  apiKey: string;
  baseUrl: string;
}

export default function App() {
  const { register, handleSubmit, setValue, getValues } = useForm({
    defaultValues: {
      provider: "openai",
      model: "gpt-4o-mini",
      apiKey: "",
      baseUrl: "https://api.openai.com/v1",
    },
  });

  const onSubmit: SubmitHandler<IFormInput> = (data) => {
    setStorage("provider", data.provider);
    setStorage(STORAGE_KEY.MODEL, data.model);
    setStorage(STORAGE_KEY.API_KEY, data.apiKey);
    setStorage(STORAGE_KEY.BASE_URL, data.baseUrl);
    showToast("🎉 OK", { duration: 2000 });
  };

  const testConnection = async (e: Event) => {
    e.preventDefault();

    const values = getValues();
    const { model, apiKey, baseUrl } = values;

    if (!model || !apiKey || !baseUrl) {
      return;
    }

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: "Hello" }],
      }),
    });
    const resJson = await res.json();
    if (resJson.error) {
      showToast(resJson.error.message);
    } else {
      onSubmit(values);
    }
  };

  useEffect(() => {
    // getStorage("provider").then((val) => val && setValue("provider", val));
    getStorage("model").then((val) => val && setValue("model", val));
    getStorage("apiKey").then((val) => val && setValue("apiKey", val));
    getStorage("baseUrl").then((val) => val && setValue("baseUrl", val));
  }, []);

  return (
    <div style={{ width: "500px", margin: "50px auto 0" }}>
      <form className="box" onSubmit={handleSubmit(onSubmit)}>
        <div className="field">
          <label className="label is-small">
            {chrome.i18n.getMessage("provider")}:
          </label>
          <div className="control select is-small">
            <select id="provider" {...register("provider")}>
              <option value="openai">OpenAI</option>
            </select>
          </div>
        </div>

        <div className="field">
          <label className="label is-small">
            {chrome.i18n.getMessage("model")}:
          </label>
          <div className="control">
            <input
              type="text"
              id="model"
              autoComplete="off"
              {...register("model", { required: true, maxLength: 100 })}
              className="input is-small"
            />
          </div>
        </div>

        <div className="field">
          <label className="label is-small">
            {chrome.i18n.getMessage("apiKey")}:
          </label>
          <div className="control">
            <input
              type="password"
              id="apiKey"
              autoComplete="off"
              {...register("apiKey", { required: true, maxLength: 100 })}
              className="input is-small"
            />
          </div>
        </div>

        <div className="field">
          <label className="label is-small">
            {chrome.i18n.getMessage("baseUrl")}:
          </label>
          <div className="control">
            <input
              type="text"
              id="baseUrl"
              autoComplete="off"
              {...register("baseUrl", { required: true, maxLength: 200 })}
              className="input is-small"
            />
          </div>
        </div>

        <div>
          <button
            className="button is-small"
            style={{ marginRight: "10px" }}
            onClick={() => testConnection}
          >
            {chrome.i18n.getMessage("testConnection")}
          </button>

          <button type="submit" className="button is-small is-link is-light">
            {chrome.i18n.getMessage("save")}
          </button>

          <a
            href="https://ai.google.dev/gemini-api/docs/openai"
            target="_blank"
            style={{
              float: "right",
              fontSize: "12px",
              marginTop: "8px",
            }}
          >
            How to use Gemini API?
          </a>
        </div>

        <div></div>
      </form>
    </div>
  );
}
