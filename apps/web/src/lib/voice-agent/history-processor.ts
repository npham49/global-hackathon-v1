export interface Message {
  role: string;
  content: string;
}

interface HistoryItem {
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
}

/**
 * Processes history updates and extracts messages
 */
export function processHistoryMessages(history: unknown[]): Message[] {
  const newMessages: Message[] = [];

  history.forEach((item: unknown) => {
    const historyItem = item as HistoryItem;

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

  return newMessages;
}

/**
 * Processes function calls from history and updates submission
 */
export function processToolCalls(
  history: unknown[],
  setSubmission: React.Dispatch<
    React.SetStateAction<Record<string, string | number>>
  >
): void {
  history.forEach((item: unknown) => {
    const historyItem = item as HistoryItem;

    // Handle function calls (tool calls)
    if (
      historyItem.type === "function_call" &&
      historyItem.name === "update_submission" &&
      historyItem.arguments
    ) {
      try {
        const args = JSON.parse(historyItem.arguments) as {
          key: string;
          value: string;
        };
        console.log(
          `🔧 [History] Tool call - Updating submission: ${args.key} = ${args.value}`
        );

        // Convert value to number if it's a numeric string (for likert scales)
        const processedValue =
          !isNaN(Number(args.value)) && args.value.trim() !== ""
            ? Number(args.value)
            : args.value;

        // Update the submission state
        setSubmission((prev) => ({
          ...prev,
          [args.key]: processedValue,
        }));

        console.log(
          "✓ [History] Submission updated:",
          args.key,
          "=",
          processedValue
        );
      } catch (err) {
        console.error("❌ [History] Error processing tool call:", err);
      }
    }
  });
}
