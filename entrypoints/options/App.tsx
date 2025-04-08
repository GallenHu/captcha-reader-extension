import { getStorage, setStorage } from "../utils/storage.utils";
import { Check, LoaderCircle } from "lucide-react";
import { showToast } from "little-toast";
import { useForm, SubmitHandler } from "react-hook-form";
import "little-toast/dist/styles.css";

interface IFormInput {
  provider: string;
  model: string;
  apiKey: string;
  baseUrl: string;
}

export default function App() {
  const { register, handleSubmit, setValue } = useForm({
    defaultValues: {
      provider: "gemini",
      model: "",
      apiKey: "",
      baseUrl: "",
    },
  });

  const onSubmit: SubmitHandler<IFormInput> = (data) => {
    setStorage("provider", data.provider);
    setStorage("model", data.model);
    setStorage("apiKey", data.apiKey);
    setStorage("baseUrl", data.baseUrl);
    showToast("Success", { duration: 2000 });
  };

  useEffect(() => {
    getStorage("provider").then((val) => val && setValue("provider", val));
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
              <option value="gemini">Gemini</option>
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

        <button className="button is-link is-light">
          {chrome.i18n.getMessage("save")}
        </button>
      </form>
    </div>
  );
}
