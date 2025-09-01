import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

serve(async (req: Request) => {
  console.log(`${req.method} ${req.url}`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.headers.get("upgrade") !== "websocket") {
    return new Response("Expected websocket", { status: 426 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  let openaiWs: WebSocket | null = null;
  
  socket.addEventListener("open", () => {
    console.log("Client WebSocket connected");
    
    // Connect to OpenAI Realtime API
    const openaiUrl = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01";
    openaiWs = new WebSocket(openaiUrl, [], {
      headers: {
        "Authorization": `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        "OpenAI-Beta": "realtime=v1"
      }
    });

    openaiWs.onopen = () => {
      console.log("Connected to OpenAI Realtime API");
    };

    openaiWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("OpenAI message:", data.type);
      
      // Log errors with full details
      if (data.type === 'error') {
        console.error("OpenAI Error Details:", JSON.stringify(data, null, 2));
        socket.send(JSON.stringify({
          type: 'error',
          message: data.error?.message || 'Unknown OpenAI error',
          details: data
        }));
        return;
      }
      
      // Send session update after receiving session.created
      if (data.type === 'session.created') {
        console.log("Sending session update...");
        const sessionUpdate = {
          type: 'session.update',
          session: {
            modalities: ["text", "audio"],
            instructions: `أنت مساعد ذكي للشرطة. مهامك:
            1. مساعدة الضباط في كتابة التقارير
            2. الإجابة على استفسارات حول النظام
            3. تقديم معلومات قانونية أساسية
            4. مساعدة في تحليل الحوادث
            
            تحدث بالعربية بشكل أساسي ويمكنك فهم الإنجليزية أيضاً.
            كن مهنياً ومفيداً ومختصراً في إجاباتك.`,
            voice: "alloy",
            input_audio_format: "pcm16",
            output_audio_format: "pcm16",
            input_audio_transcription: {
              model: "whisper-1"
            },
            turn_detection: {
              type: "server_vad",
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 1000
            },
            tools: [
              {
                type: "function",
                name: "create_incident_report",
                description: "إنشاء تقرير حادث جديد بناءً على المعلومات المقدمة",
                parameters: {
                  type: "object",
                  properties: {
                    title: { type: "string", description: "عنوان الحادث" },
                    description: { type: "string", description: "وصف تفصيلي للحادث" },
                    incident_type: { type: "string", description: "نوع الحادث" },
                    location: { type: "string", description: "موقع الحادث" }
                  },
                  required: ["title", "description", "incident_type"]
                }
              },
              {
                type: "function", 
                name: "search_citizen",
                description: "البحث عن مواطن في النظام باستخدام الهوية أو الاسم",
                parameters: {
                  type: "object",
                  properties: {
                    query: { type: "string", description: "رقم الهوية أو الاسم للبحث عنه" }
                  },
                  required: ["query"]
                }
              }
            ],
            tool_choice: "auto",
            temperature: 0.7,
            max_response_output_tokens: "inf"
          }
        };
        
        openaiWs?.send(JSON.stringify(sessionUpdate));
      }
      
      // Forward messages to client
      socket.send(event.data);
    };

    openaiWs.onerror = (error) => {
      console.error("OpenAI WebSocket error:", error);
    };

    openaiWs.onclose = () => {
      console.log("OpenAI WebSocket closed");
    };
  });

  socket.addEventListener("message", (event) => {
    console.log("Client message received");
    // Forward messages to OpenAI
    if (openaiWs && openaiWs.readyState === WebSocket.OPEN) {
      openaiWs.send(event.data);
    }
  });

  socket.addEventListener("close", () => {
    console.log("Client WebSocket closed");
    if (openaiWs) {
      openaiWs.close();
    }
  });

  return response;
});