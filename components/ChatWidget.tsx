"use client";

import { FormEvent, useState } from "react";
import type { ChatTurn } from "@/lib/types";

interface ChatApiResponse {
  reply: {
    message: string;
    escalation: {
      shouldEscalate: boolean;
      reason: string | null;
    };
    matchedFaqId: string | null;
  };
  lead: { id: string } | null;
}

export function ChatWidget({ businessId }: { businessId: string }) {
  const [visitorName, setVisitorName] = useState("Demo visitor");
  const [visitorPhone, setVisitorPhone] = useState("+44 7700 900000");
  const [visitorEmail, setVisitorEmail] = useState("");
  const [message, setMessage] = useState("How much is a full detail and can I book Friday?");
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!message.trim()) {
      return;
    }

    const visitorTurn: ChatTurn = {
      role: "visitor",
      content: message,
      createdAt: new Date().toISOString()
    };

    setTurns((current) => [...current, visitorTurn]);
    setSending(true);
    setStatus("");

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        businessId,
        message,
        visitorName,
        visitorPhone,
        visitorEmail
      })
    });

    setSending(false);

    if (!response.ok) {
      setStatus("Chat request failed.");
      return;
    }

    const data = (await response.json()) as ChatApiResponse;
    setTurns((current) => [
      ...current,
      {
        role: "assistant",
        content: data.reply.message,
        createdAt: new Date().toISOString()
      }
    ]);
    setStatus(data.lead ? `Lead created: ${data.lead.id}` : data.reply.escalation.reason ?? "Answered from approved knowledge.");
    setMessage("");
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Test assistant</h2>
          <p className="muted">Ask a website-chat question and create a lead when contact details are present.</p>
        </div>
      </div>

      <div className="chat-widget">
        <div className="chat-log" aria-live="polite">
          {turns.length === 0 ? <p className="muted">No test messages yet.</p> : null}
          {turns.map((turn, index) => (
            <div className={`message ${turn.role === "assistant" ? "assistant" : ""}`} key={`${turn.createdAt}-${index}`}>
              {turn.content}
            </div>
          ))}
        </div>

        <form className="stack" onSubmit={submit}>
          <div className="form-grid">
            <label className="field">
              <span>Name</span>
              <input className="input" value={visitorName} onChange={(event) => setVisitorName(event.target.value)} />
            </label>
            <label className="field">
              <span>Phone</span>
              <input className="input" value={visitorPhone} onChange={(event) => setVisitorPhone(event.target.value)} />
            </label>
            <label className="field full">
              <span>Email</span>
              <input className="input" value={visitorEmail} onChange={(event) => setVisitorEmail(event.target.value)} />
            </label>
            <label className="field full">
              <span>Message</span>
              <textarea className="textarea" value={message} onChange={(event) => setMessage(event.target.value)} />
            </label>
          </div>
          <div className="inline-actions">
            <button className="button" type="submit" disabled={sending}>
              {sending ? "Sending..." : "Send test"}
            </button>
          </div>
        </form>
        {status ? <p className="muted">{status}</p> : null}
      </div>
    </section>
  );
}
