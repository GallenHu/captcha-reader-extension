export default function CopyButton({ copyText }: { copyText: string }) {
  const [isCopied, setIsCopied] = useState(false);

  async function copyTextToClipboard(text: string) {
    if ("clipboard" in navigator) {
      await navigator.clipboard.writeText(text);
    } else {
      document.execCommand("copy", true, text);
    }

    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  }

  return (
    <button
      style={{ padding: "6px 10px" }}
      onClick={() => copyTextToClipboard(copyText)}
    >
      <span>{isCopied ? "Copied!" : "Copy"}</span>
    </button>
  );
}
