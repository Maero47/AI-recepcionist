"use client";

import { useState } from "react";
import type { FAQ } from "@/lib/types";

const emptyFaq = (businessId: string): Omit<FAQ, "id"> => ({
  businessId,
  question: "",
  approvedAnswer: "",
  category: "general",
  active: true
});

export function FAQEditor({ businessId, initialFaqs }: { businessId: string; initialFaqs: FAQ[] }) {
  const [faqs, setFaqs] = useState<FAQ[]>(initialFaqs);
  const [newFaq, setNewFaq] = useState<Omit<FAQ, "id">>(emptyFaq(businessId));
  const [status, setStatus] = useState("");

  function updateLocal(id: string, patch: Partial<FAQ>) {
    setFaqs((current) => current.map((faq) => (faq.id === id ? { ...faq, ...patch } : faq)));
  }

  async function addFaq() {
    const response = await fetch("/api/faqs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newFaq)
    });

    if (!response.ok) {
      setStatus("Could not add FAQ.");
      return;
    }

    const data = (await response.json()) as { faq: FAQ };
    setFaqs((current) => [data.faq, ...current]);
    setNewFaq(emptyFaq(businessId));
    setStatus("FAQ added.");
  }

  async function saveFaq(faq: FAQ) {
    const response = await fetch(`/api/faqs/${faq.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        question: faq.question,
        approvedAnswer: faq.approvedAnswer,
        category: faq.category,
        active: faq.active
      })
    });

    setStatus(response.ok ? "FAQ saved." : "Could not save FAQ.");
  }

  async function removeFaq(id: string) {
    const response = await fetch(`/api/faqs/${id}`, {
      method: "DELETE"
    });

    if (response.ok) {
      setFaqs((current) => current.filter((faq) => faq.id !== id));
      setStatus("FAQ removed.");
    } else {
      setStatus("Could not remove FAQ.");
    }
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>FAQ knowledge base</h2>
          <p className="muted">{faqs.length} approved answers are available to the receptionist.</p>
        </div>
      </div>

      <div className="editor-list">
        <div className="editor-row two">
          <label className="field">
            <span>Question</span>
            <input
              className="input"
              value={newFaq.question}
              onChange={(event) => setNewFaq((current) => ({ ...current, question: event.target.value }))}
            />
          </label>
          <label className="field">
            <span>Category</span>
            <input
              className="input"
              value={newFaq.category}
              onChange={(event) => setNewFaq((current) => ({ ...current, category: event.target.value }))}
            />
          </label>
          <label className="field full">
            <span>Approved answer</span>
            <textarea
              className="textarea"
              value={newFaq.approvedAnswer}
              onChange={(event) => setNewFaq((current) => ({ ...current, approvedAnswer: event.target.value }))}
            />
          </label>
          <div className="inline-actions field full">
            <button className="button" type="button" onClick={addFaq}>
              Add FAQ
            </button>
          </div>
        </div>

        {faqs.map((faq) => (
          <div className="editor-row two" key={faq.id}>
            <label className="field">
              <span>Question</span>
              <input
                className="input"
                value={faq.question}
                onChange={(event) => updateLocal(faq.id, { question: event.target.value })}
              />
            </label>
            <label className="field">
              <span>Category</span>
              <input
                className="input"
                value={faq.category}
                onChange={(event) => updateLocal(faq.id, { category: event.target.value })}
              />
            </label>
            <label className="field full">
              <span>Approved answer</span>
              <textarea
                className="textarea"
                value={faq.approvedAnswer}
                onChange={(event) => updateLocal(faq.id, { approvedAnswer: event.target.value })}
              />
            </label>
            <label className="checkline">
              <input
                type="checkbox"
                checked={faq.active}
                onChange={(event) => updateLocal(faq.id, { active: event.target.checked })}
              />
              Active
            </label>
            <div className="inline-actions">
              <button className="button secondary" type="button" onClick={() => saveFaq(faq)}>
                Save
              </button>
              <button className="button danger" type="button" onClick={() => removeFaq(faq.id)}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      {status ? <p className="muted">{status}</p> : null}
    </section>
  );
}
