import { RealtimeAgent } from "@openai/agents/realtime";

type VoiceTool =
  | ReturnType<typeof import("./tools").createUpdateSubmissionTool>
  | ReturnType<typeof import("./tools").createValidateSubmissionTool>
  | ReturnType<typeof import("./tools").createSubmitFormTool>;

/**
 * Creates a voice agent with the provided instructions
 */
export function createVoiceAgent(
  instructions: string,
  tools: VoiceTool[] = []
): RealtimeAgent {
  return new RealtimeAgent({
    name: "Friendly Survey Assistant",
    instructions,
    tools,
  });
}
