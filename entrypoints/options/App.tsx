import { getStorage, setStorage } from "../utils/storage.utils";
import { showToast } from "little-toast";
import { useForm, SubmitHandler } from "react-hook-form";
import "little-toast/dist/styles.css";
import { STORAGE_KEY } from "../constants/storage";

interface IFormInput {
  provider: string;
  model: string;
  api_key: string;
  base_url: string;
}

export default function App() {
  const { register, handleSubmit, setValue, getValues } = useForm<IFormInput>({
    defaultValues: {
      [STORAGE_KEY.PROVIDER]: "openai",
      [STORAGE_KEY.MODEL]: "gpt-4o-mini",
      [STORAGE_KEY.API_KEY]: "",
      [STORAGE_KEY.BASE_URL]: "https://api.openai.com/v1",
    },
  });

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    await setStorage(STORAGE_KEY.PROVIDER, data.provider);
    await setStorage(STORAGE_KEY.MODEL, data.model);
    await setStorage(STORAGE_KEY.API_KEY, data.api_key);
    await setStorage(STORAGE_KEY.BASE_URL, data.base_url);
    showToast("🎉 OK", { duration: 2000 });
  };

  const testConnection = async (e: Event) => {
    e.preventDefault();

    const values = getValues();
    const { model, api_key, base_url } = values;

    if (!model || !api_key || !base_url) {
      return;
    }

    const res = await fetch(`${base_url}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${api_key}`,
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

    getStorage(STORAGE_KEY.MODEL).then((modelVal) => {
      modelVal && setValue(STORAGE_KEY.MODEL, modelVal);
    });
    getStorage(STORAGE_KEY.API_KEY).then((keyVal) => {
      setValue(STORAGE_KEY.API_KEY, keyVal);
    });
    getStorage(STORAGE_KEY.BASE_URL).then((urlVal) => {
      urlVal && setValue(STORAGE_KEY.BASE_URL, urlVal);
    });
  }, []);

  return (
    <div style={{ width: "500px", margin: "50px auto 0" }}>
      <form className="box" onSubmit={handleSubmit(onSubmit)}>
        <div className="field">
          <label className="label is-small">
            {chrome.i18n.getMessage("provider")}:
          </label>
          <div className="control select is-small">
            <select id="provider" {...register(STORAGE_KEY.PROVIDER)}>
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
              {...register(STORAGE_KEY.MODEL, { required: true, maxLength: 100 })}
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
              {...register(STORAGE_KEY.API_KEY, { required: true, maxLength: 100 })}
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
              {...register(STORAGE_KEY.BASE_URL, { required: true, maxLength: 200 })}
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
