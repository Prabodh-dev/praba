import { useState, useCallback, useRef } from "react";
import * as webllm from "@mlc-ai/web-llm";

export const MODELS = [
  {
    id: "TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC",
    name: "praba-1",
    description: "Base model",
    size: "600MB",
    available: true,
  },
  {
    id: "upcoming-1.1",
    name: "praba-1.1",
    description: "Fine-tuned on custom data",
    size: "600MB",
    available: false,
  },
  {
    id: "upcoming-2",
    name: "praba-2",
    description: "Smarter base + vision support",
    size: "~1.5GB",
    available: false,
  },
  {
    id: "upcoming-3",
    name: "praba-3",
    description: "Custom trained from scratch",
    size: "~2GB",
    available: false,
  },
];

const SYSTEM_PROMPT = `You are Praba, a helpful AI assistant running fully offline on the user's device.
Always respond in clear, properly spaced sentences.
Never run words together. Use proper punctuation and spacing.
Be concise and accurate.`;

export function useEngine() {
  const engineRef = useRef(null);

  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [loadStatus, setLoadStatus] = useState("idle");
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadText, setLoadText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const abortRef = useRef(false);

  const loadEngine = useCallback(async (model = MODELS[0]) => {
    try {
      if (engineRef.current) {
        await engineRef.current.unload?.();
        engineRef.current = null;
      }
      setLoadStatus("loading");
      setLoadProgress(0);
      setLoadText("Preparing model…");
      setSelectedModel(model);

      engineRef.current = await webllm.CreateMLCEngine(model.id, {
        initProgressCallback: (report) => {
          const pct = Math.round((report.progress || 0) * 100);
          setLoadText(
            pct < 100 ? `Loading ${model.name}… ${pct}%` : "Almost ready…",
          );
          setLoadProgress(pct);
        },
      });

      setLoadStatus("ready");
      setLoadProgress(100);
    } catch {
      setLoadStatus("error");
      setLoadText("Unable to load the model. Please try again.");
    }
  }, []);

  const generate = useCallback(async (messages, onToken) => {
    if (!engineRef.current) return;
    abortRef.current = false;
    setIsGenerating(true);

    try {
      const stream = await engineRef.current.chat.completions.create({
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        temperature: 0.7,
        max_tokens: 512,
        stream: true,
      });

      for await (const chunk of stream) {
        if (abortRef.current) break;
        const token = chunk.choices[0]?.delta?.content || "";
        if (token) onToken(token);
      }
    } catch {
      if (!abortRef.current)
        onToken("\nSomething went wrong. Please try again.");
    }

    setIsGenerating(false);
  }, []);

  const stop = useCallback(() => {
    abortRef.current = true;
    setIsGenerating(false);
  }, []);

  return {
    loadEngine,
    loadStatus,
    loadProgress,
    loadText,
    isGenerating,
    generate,
    stop,
    selectedModel,
    models: MODELS,
  };
}
