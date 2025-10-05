import { FormSchema } from "@/types/form-builder-types";
import { RealtimeSession } from "@openai/agents/realtime";
import { useRef, useState, useCallback, useEffect } from "react";
import {
  generateSchemaDescription,
  generateSchemaInstructions,
} from "@/lib/voice-agent/schema-template";
import {
  createUpdateSubmissionTool,
  createValidateSubmissionTool,
  createSubmitFormTool,
} from "@/lib/voice-agent/tools";
import { createVoiceAgent } from "@/lib/voice-agent/agent-factory";
import { type Message } from "@/lib/voice-agent/history-processor";

export type { Message };

export function useVoiceAgent(
  schema: FormSchema,
  handleSubmit: () => Promise<void>
) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [submission, setSubmission] = useState<Record<string, string | number>>(
    {}
  );
  const submissionRef = useRef<Record<string, string | number>>({});
  const sessionRef = useRef<RealtimeSession | null>(null);
  const processedToolCallsRef = useRef<Set<string>>(new Set());

  // Define disconnect first so it can be used in connect
  const disconnect = useCallback(() => {
    console.log("🔌 [useVoiceAgent] Disconnect called");
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
      setIsConnected(false);
      setMessages([]);
      // Clear processed tool calls for fresh session
      processedToolCallsRef.current.clear();
    }
  }, []);

  const connect = useCallback(async () => {
    console.log("🚀 [useVoiceAgent] Connect called");
    try {
      setIsConnecting(true);
      setError(null);

      // Fetch token
      console.log("📡 [useVoiceAgent] Fetching token...");
      const response = await fetch("/api/openai/token");
      const data = await response.json();
      const token = data.value;

      // Generate schema instructions
      const schemaDescription = generateSchemaDescription(schema);
      const schemaInstructions = generateSchemaInstructions(schemaDescription);

      // Create tools
      const updateSubmissionTool = createUpdateSubmissionTool(setSubmission);
      const validateSubmissionTool = createValidateSubmissionTool(
        schema,
        () => submissionRef.current
      );
      const submitFormTool = createSubmitFormTool(handleSubmit, disconnect);

      // Create agent
      console.log("🔧 [useVoiceAgent] Creating agent with schema...");
      console.log("📋 [useVoiceAgent] Schema:", schemaInstructions);
      const agent = createVoiceAgent(schemaInstructions, [
        updateSubmissionTool,
        validateSubmissionTool,
        submitFormTool,
      ]);
      const session = new RealtimeSession(agent, {
        model: "gpt-4o-mini-realtime-preview",
        config: {
          voice: "alloy", // Specify a consistent voice
          turnDetection: {
            type: "server_vad",
            threshold: 0.5,
            prefixPaddingMs: 300,
            silenceDurationMs: 500,
          },
          inputAudioTranscription: {
            model: "gpt-4o-mini-transcribe",
          },
        },
      });
      sessionRef.current = session;

      // Listen to history updates for messages and tool calls
      session.on("history_updated", (history) => {
        console.log("� [useVoiceAgent] History updated");
        console.log(history);
        if (!Array.isArray(history)) return;
        const newMessages: Message[] = [];

        history.forEach((item: unknown) => {
          const historyItem = item as {
            type?: string;
            role?: string;
            status?: string;
            name?: string;
            arguments?: string;
            content?: Array<{
              type?: string;
              transcript?: string;
              text?: string;
            }>;
          };

          // Handle function calls (tool calls) - Process them manually
          if (
            historyItem.type === "function_call" &&
            historyItem.name &&
            historyItem.arguments
          ) {
            console.log(
              `[useVoiceAgent] Tool call detected: ${historyItem.name}`
            );
            console.log(
              `[useVoiceAgent] Tool arguments:`,
              historyItem.arguments
            );

            try {
              // Handle update_submission
              if (historyItem.name === "update_submission") {
                const args = JSON.parse(historyItem.arguments) as {
                  key: string;
                  value: string;
                };

                // Create a unique identifier for this tool call
                const toolCallId = `${historyItem.name}_${args.key}_${args.value}`;

                // Skip if we've already processed this exact tool call
                if (processedToolCallsRef.current.has(toolCallId)) {
                  console.log(
                    `[useVoiceAgent] Skipping duplicate tool call: ${toolCallId}`
                  );
                  return;
                }

                // Mark as processed
                processedToolCallsRef.current.add(toolCallId);

                console.log(
                  `[useVoiceAgent] Updating submission: ${args.key} = ${args.value}`
                );

                // Convert value to number if it's a numeric string (for likert scales)
                const processedValue =
                  !isNaN(Number(args.value)) && args.value.trim() !== ""
                    ? Number(args.value)
                    : args.value;

                // Update the submission state
                setSubmission((prev) => {
                  const updated = {
                    ...prev,
                    [args.key]: processedValue,
                  };
                  // Also update the ref so validate/submit tools have current data
                  submissionRef.current = updated;
                  return updated;
                });

                console.log(
                  "[useVoiceAgent] Submission updated:",
                  args.key,
                  "=",
                  processedValue
                );
              }
              // validate_submission and submit_form are now handled by their invoke methods
            } catch (err) {
              console.error("[useVoiceAgent] Error processing tool call:", err);
            }
          }

          // Handle regular messages
          if (
            historyItem.type === "message" &&
            historyItem.role &&
            historyItem.content
          ) {
            // Extract text from content array
            let textContent = "";

            for (const contentItem of historyItem.content) {
              if (contentItem.transcript) {
                textContent = contentItem.transcript;
                break;
              } else if (contentItem.text) {
                textContent = contentItem.text;
                break;
              }
            }

            if (textContent) {
              newMessages.push({
                role: historyItem.role,
                content: textContent,
              });
            }
          }
        });

        setMessages(newMessages);
      });

      // Error handler
      session.on("error", (err) => {
        console.error("❌ [useVoiceAgent] Session error:", err);
        setError(err instanceof Error ? err.message : "Session error");
      });

      // Connect
      console.log("🔌 [useVoiceAgent] Connecting...");
      await session.connect({ apiKey: token });
      console.log("✓ [useVoiceAgent] Connected!");

      setIsConnected(true);
      setIsConnecting(false);
    } catch (err) {
      console.error("❌ [useVoiceAgent] Error:", err);
      setError(err instanceof Error ? err.message : "Connection failed");
      setIsConnecting(false);
    }
  }, [schema, handleSubmit, disconnect]);

  useEffect(() => {
    return () => {
      if (sessionRef.current) {
        sessionRef.current = null;
      }
    };
  }, []);

  return {
    isConnected,
    isConnecting,
    error,
    messages,
    submission,
    setSubmission,
    connect,
    disconnect,
  };
}
